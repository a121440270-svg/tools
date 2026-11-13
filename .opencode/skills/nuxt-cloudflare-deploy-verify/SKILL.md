---
name: "nuxt-cloudflare-deploy-verify"
description: "Build, deploy and verify a Nuxt (SSR + prerender) site on Cloudflare Workers: prerender route-count sanity check, Worker deploy, production HTML verification (status/title/canonical), sitemap freshness and runtime cache, D1-backed content that updates without redeploy. Triggers: nuxt 部署, cloudflare worker 部署, npm run deploy, 预渲染, prerenderRoutes, 生产验证, 部署后检查, verify deploy, sitemap cache, D1 实时生效."
---

# Nuxt + Cloudflare Workers：构建 / 部署 / 生产验证

## 何时用

- 新增页面或改标题后要上线
- 部署完要证明「线上真的变了」（不是只看构建成功）

## 流程

1. **构建**：`npm run build`
   - 看预渲染路由数：应该按新增页面数增长（本项目 342 → 444）。数量没涨 = 路由没进 `prerenderRoutes`
2. **部署**：`npm run deploy`
   - 记录 Worker 版本 ID 和新上传资源数（用于回滚/核对）
3. **生产验证（必做）**：抽 3~5 个页面（含 2 个非默认语言）检查
   - HTTP 200
   - `<title>` 与预期一致（改标题的任务，**标题就是验收标准**）
   - `rel="canonical"` 自指且语言正确
4. **sitemap 验证**：子图 `<loc>` 数量 + 新路由命中（详见 `gsc-sitemap-ops`）
5. **GSC 重提交**（如 sitemap 有变）

## 坑 → 根因 → 规避

| 坑 | 根因 | 规避 |
|---|---|---|
| 新页面上线了但 sitemap 里没有 | `@nuxtjs/sitemap` 在 Worker 运行时模式下会丢掉 prerender 页 | 显式 `sitemap.urls = prerenderRoutes` |
| 部署后立刻查 sitemap 还是旧版 | 运行时 sitemap 缓存 600s | 看响应头 `x-sitemap-generated` / `x-sitemap-cache-duration`，等过期或接受延迟 |
| curl 返回 `000` 就以为页面坏了 | SOCKS5 代理抖动（schannel 握手失败） | 每个 URL 重试 2~3 次；仍失败就用 Chrome CDP 的 `Network` 事件验证 |
| PowerShell 里中文标题显示乱码 | 控制台代码页非 UTF-8 | 先落盘再 `[IO.File]::ReadAllText($f,[Text.Encoding]::UTF8)`；判断对错优先看 ASCII 字段 |
| 改了博客标题但线上没变 | 博客是 D1 实时渲染（`ssr:false`） | D1 `UPDATE` 立即生效，无需重新部署；但**要验证**而不是假设 |
| 部署成功但线上是旧版 | 部署到了别的环境/域名 | 用带版本的 Worker 版本号 + 生产 URL 双重确认 |
| 构建通过但页面 404 | 路由文件没被扫到 / 命名不符合约定 | 构建后 grep 预渲染清单里的目标路由 |

## 验收清单

- [ ] `npm run build` 路由数按预期增长，零错误
- [ ] 部署版本号已记录
- [ ] 抽查页面 200 + title 精确 + canonical 自指（含 1~2 个非默认语言）
- [ ] sitemap 子图数量 = 预期，新路由 100% 命中
- [ ] GSC 站点地图 `状态=成功` 且 `上次读取时间` 是当天（见 `gsc-sitemap-ops`）
- [ ] 剩余 URL 的请求索引已排队或已在 state 文件里断点续跑
