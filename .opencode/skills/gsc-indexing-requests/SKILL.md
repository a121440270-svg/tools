---
name: "gsc-indexing-requests"
description: "Batch-request indexing for new URLs in Google Search Console via the URL Inspection tool, with correct property context, opaque-id handling, rolling 24h quota detection, and resumable state. Triggers: 请求编入索引, GSC 提交 URL, 批量提交索引, request indexing, url inspection, 配额, quota, 索引提交脚本, 新页提交 Google."
---

# GSC 请求编入索引（批量 + 断点续跑）

新页上线后，用 URL 检查工具的「请求编入索引」加速发现。**配额很紧（滚动 24h ~10 条）**，所以必须按优先级排队 + 断点续跑。

## 何时用

- 新页面部署完成、sitemap 已确认被读取之后
- 需要给一批 URL 排序提交（真工具页 > 内容页 > 约束落地页）

## 前置

- 域属性：`resource_id=sc-domain:example.com`（URL 前缀属性可能未验证）
- 已登录的 Chrome 调试实例（见 `chrome-cdp-automation`）
- 记录 state 文件（`done` / `failed` / `quotaHit`）

## 单 URL 流程（必须严格按序）

```
1. Page.navigate  https://search.google.com/search-console?resource_id=sc-domain%3A<domain>
2. 等顶部搜索框出现：input[aria-label^="检查 <domain> 中的任何网址"]
3. 原生 setter 填 URL + dispatch input/change
4. dispatch keydown/keypress/keyup Enter
5. 轮询最多 ~75s 等「请求编入索引」按钮（实测 4~10s 出现）
6. 点击按钮 → 在 [role=dialog] 里点确认（匹配 请求编入索引|确认|知道了，排除 取消）
7. 轮询等正文出现「已请求编入索引」= 成功
8. 若出现 /配额|quota|已达上限|已超出/ = 配额命中，立即停止并持久化
```

批量版脚本：`scripts/request-indexing-batch.mjs`（`node ... <TAB_ID> <MAX> --domain=example.com --urls=file.json`）。

## 坑 → 根因 → 规避

| 坑 | 根因 | 规避 |
|---|---|---|
| 每个 URL 都失败：`request button not found`，面板 `loading: true` 20s+ | 从**别的属性**页面操作（例如 tab 停在另一个站点的效果页），检查面板永远加载不出来 | 每个 URL 前都 `Page.navigate` 回**目标属性**的 overview，再填搜索框 |
| 手拼 `/search-console/inspect?resource_id=...&id=<url>` 返回 Google 原始 404 | `id` 是 SPA 生成的**不透明令牌**，不是 URL | 只能走顶部搜索框；不要构造内部路由 |
| 打开属性 URL 得到「您无权访问此资源」 | 用了 URL 前缀属性 `https://example.com/`，该账号未验证 | 改用 `sc-domain:example.com` |
| 昨天没提交满，今天一提交就配额命中 | 配额是**滚动 24h 窗口 ~10 条**，不是午夜重置 | 按优先级排序 + state 断点续跑，命中即停 |
| 续跑时把上次的 `failed` 也当失败 | 上次失败可能是环境问题（属性上下文错） | 续跑前清空 `failed`，只信 `done` |
| 面板一直在转圈 | 标签页在后台被节流 | `Page.bringToFront` |
| 点确认后没反应 | 确认按钮文案是「请求编入索引」，不是「确定」 | 在 `[role=dialog]` 内匹配 `请求编入索引|确认|知道了`，排除 `取消` |
| 提交成功但 state 没记 | 异常退出 | 每个 URL 处理完立即 `writeFileSync` state |

## 配额与优先级

- 观测值：11-11 用 6 条后，11-12 只成功 3 条即被拒（跨天未重置）→ 滚动窗口
- 优先级建议：
  1. 真工具页（有独立功能、能承接流量）
  2. 核心内容/教程页
  3. 约束落地页（数量多，靠 sitemap + 内链自然发现即可）
- 命中配额后：**不要重试同一个 URL**（会继续被拒），直接停，等窗口释放

## 验收

- [ ] state 里 `done` 数量 = 本次实际成功数
- [ ] 每个成功 URL 的返回是 `{"requested":true,"confirmed":true}`
- [ ] `quotaHit=true` 时已停止，且未把该 URL 记成 done
- [ ] 剩余 URL 可在下一窗口直接续跑（脚本自动跳过 done）
