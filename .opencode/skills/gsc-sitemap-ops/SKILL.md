---
name: "gsc-sitemap-ops"
description: "Operate the Google Search Console Sitemaps report: verify whether Google is actually reading sitemaps (status / last read / discovered URLs), fix a sitemap index stuck at 无法抓取, resubmit sitemaps to force a re-read, and clean up stale/legacy sitemap entries (GSC has no delete button). Triggers: GSC 站点地图, sitemap 无法抓取, sitemap 提交, 索引冻结, en.xml 只有几个 URL, 清理 sitemap, 重新提交 sitemap, sitemap not fetched, resubmit sitemap, stale sitemap entry."
---

# GSC 站点地图运维

站点地图「已提交」不等于「已被读取」。本 skill 解决：**怎么确认 Google 真的读了、读到了多少、读不到时怎么修、陈旧条目怎么清。**

## 何时用

- 部署了新页，想确认 Google 通过 sitemap 看到了
- GSC 站点地图页出现「无法抓取」/「1 项错误」
- 索引量远低于页面数，怀疑 sitemap 冻结
- 站点地图列表里有历史遗留条目要「清理」

## 前置

- GSC 用**域属性**：`resource_id=sc-domain:example.com`
  - URL 前缀属性（`https://example.com/`）在该账号可能未验证，打开会返回「您无权访问此资源」
- 用已登录的 Chrome 调试实例（见 `chrome-cdp-automation`），先 `Page.bringToFront`
- 站点地图页 URL：`https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3A<domain>`

## 流程 A：核验（每次部署后必做）

1. 打开站点地图页，**轮询等表格渲染**（SPA 骨架先出现，此时 `tr` 为空是正常的）。
2. 读每行 7 列，缺一列都不能下结论：

| 站点地图 | 类型 | 已提交的网址数 | **上次读取时间** | **状态** | **已发现的网页** |
|---|---|---|---|---|---|

3. 判定规则：
   - `状态=成功` + `上次读取时间` 是最近几天 → 健康
   - `状态=无法抓取` / `1 项错误` → 走流程 B
   - `状态=成功` 但 `上次读取时间` 是几个月前 + `已发现的网页` 很小 → **冻结**（Google 没再读，数字是旧的）
4. 交叉验证子图：索引文件的 `已发现的网页` 应 ≈ 各子图之和；如果索引是 0 而子图有数字 → 索引没被抓过。
5. 独立验证 URL 本身可抓（见流程 C），排除「GSC 显示问题 vs 站点问题」。

> 判断「已发现的网页」是否过时：把 GSC 的数字和线上 sitemap 的实际 `<loc>` 数量比。GSC 是**上次读取时**的计数，可能落后数周。

## 流程 B：修复 + 重新提交

1. 先在站点地图页顶部输入框（`input[aria-label="输入站点地图网址"]`）填入**同一个 URL** 再点「提交」——**重复提交同一 URL 就是触发重读的官方手段**。
2. 提交后**立刻重读表格**，看 `上次读取时间` 是否变成今天、`状态` 是否变「成功」。实测索引文件当日即可转成功。
3. 若索引仍失败：
   - 直接提交各语言子图（`__sitemap__/en.xml` 等），绕过索引
   - 检查 robots.txt 是否含 `Sitemap:` 且 Googlebot 未被 Disallow
   - 检查 sitemap 是否 200、`content-type` 是 `text/xml`、生成时间新鲜（Nuxt sitemap 运行时会有 `x-sitemap-generated` 头 / 600s 缓存）

## 流程 C：验证 URL 真实响应（代理不可靠时用浏览器）

用 CDP `Network` 事件拿完整重定向链，比 curl 更接近 Googlebot 视角：

```
https://www.example.com/sitemap.xml  -> 301 -> https://example.com/sitemap.xml
                                     -> 301 -> https://example.com/sitemap_index.xml -> 200 text/xml
```

脚本：`scripts/read-sitemaps.mjs`（读表）、`scripts/submit-sitemaps.mjs`（重提交）。

## 流程 D：「清理」陈旧条目（GSC 删不掉）

**事实（已用完整菜单 DOM 验证）**：当前 GSC 站点地图行内 `⋮` 只有「查看网页索引编制 / 查看视频网页索引编制」，**没有删除项**；404/410 也不会让条目消失（2021 年的条目 2026 年还在列表里）。

唯一可行的「清理」= **让条目变健康**：

1. 让该 URL 解析到一个**有效的 sitemap**（301 → 200 的 sitemap 是允许的，Google 接受）
   - 例：`/__sitemap__/zh.xml` → 301 → `/__sitemap__/zh-CN.xml`
   - 例：`www.example.com/sitemap.xml` → 301 → `example.com/sitemap.xml` → 301 → `/sitemap_index.xml`
2. 在站点地图页**重新提交同一个 URL**
3. 当日即变「成功」，红色错误消失（实测两条都是当天转成功）

> 301 是跨主机（www→apex）也能被接受，但会记成「站点地图索引」且「已发现网页 0」——无害，页面实际由索引汇总。

## 坑 → 根因 → 规避

| 坑 | 根因 | 规避 |
|---|---|---|
| 以为「已提交日期」更新就是成功 | 提交和抓取是两件事 | 只看 `状态` + `上次读取时间` + `已发现的网页` |
| 索引「无法抓取」但子图各自「成功」 | 索引挂了，子图就永远停在最后一次成功读取 | 修索引（重提交）优先于修子图 |
| 子图里的 URL 数远小于页面数 | Google 停在几个月前的旧版本（真实案例：`en.xml` 14 个月只有 7 个 URL） | 重提交索引 + 重提交该子图，然后看数字是否刷新 |
| 立刻读表格得到空数组 | SPA 异步渲染 | 轮询 15×3s 直到 `tr` ≥ 3 |
| 用 body 文本判断「提交成功」 | 表格里本来就有「已提交」「无法抓取」字样 | 重读表格行 + 看 `[role=alert]` 文案 |
| 点了 ⋮ 却弹出「查看网页索引编制」 | 点到了行尾展开箭头 | 行内唯一按钮是最后一个单元格的 `div[role=button]`；先 dump 菜单 `outerHTML` |
| `zh.xml` 301 以为是 CDN/模块行为 | 是仓库里的 `server/routes/__sitemap__/zh.xml.ts` | 改行为要去改那个文件，不是改 sitemap 配置 |
| 提交后一直显示旧状态 | 表格是缓存/需要刷新 | `Page.reload` 或重新 `Page.navigate` 后轮询 |

## 验收清单

- [ ] 索引文件 `状态=成功` 且 `上次读取时间` 是今天
- [ ] `已发现的网页` ≈ 线上各子图 `<loc>` 之和
- [ ] 每个语言子图 `已发现的网页` ≈ 该语言实际页面数
- [ ] 新增路由在子图里能 grep 到（数量对不上就是没进去）
- [ ] 站点地图页无红色错误
