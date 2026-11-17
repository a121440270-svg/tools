---
name: "chrome-cdp-automation"
description: "Drive an already-logged-in Chrome debug instance over CDP (port 9222) to automate web UIs that have no API — Google Search Console, Cloudflare dashboards, admin panels. Covers tab discovery, SPA polling, controlled-input filling, async-render waits, and using CDP Network events to probe real HTTP status/redirect chains when the SOCKS proxy is down. Triggers: 浏览器自动化, CDP, chrome 调试端口, 9222, 操作后台, 已登录页面自动化, drive logged-in browser, GSC automation, tab throttling, 页面一直 loading."
---

# Chrome CDP 自动化（操作已登录网页的通用基座）

没有 API、但浏览器里已经登录的后台（GSC、Cloudflare、各类 admin），用 CDP 驱动真实 Chrome。
本文只讲**基座与通用坑**；GSC 业务细节见 `gsc-sitemap-ops` / `gsc-indexing-requests`。

## 前置

- Chrome 以调试模式运行：`--remote-debugging-port=9222`，里面已有登录好的标签页（**不要自动化登录流程**）
- 所有 HTTP 走 SOCKS5 `socks5h://127.0.0.1:4080`（本地 127.0.0.1 / localhost **不走代理**）
- Windows PowerShell 5.1：没有 `&&`；`node -e "..."` 的引号会被剥 → **一律写临时 `.mjs` 文件再 `node file.mjs`**
- 把 `scripts/cdp-lib.mjs` 复制到临时目录，所有脚本 `import { connect, makeRpc, ... } from './cdp-lib.mjs'`

## 最小骨架

```js
import { connect, makeRpc, sleep, withTimeout, listTabs } from './cdp-lib.mjs'

const TAB_ID = process.argv[2]            // 传 tab id，避免脚本自己挑错标签
const tabs = await listTabs()
const tab = tabs.find((t) => t.id === TAB_ID)
const ws = await connect(tab.webSocketDebuggerUrl)
const rpc = makeRpc(ws)
await rpc('Page.enable'); await rpc('Runtime.enable')
await rpc('Page.bringToFront')            // 关键：防后台节流

const evalJs = async (expression, timeoutMs = 60000) => {
  const { result, exceptionDetails } = await withTimeout(
    rpc('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }),
    timeoutMs, 'eval')
  if (exceptionDetails) throw new Error('eval: ' + String(exceptionDetails.exception?.description).slice(0, 300))
  return result.value
}
```

查标签页：`curl.exe -sS http://127.0.0.1:9222/json`（**不要**走代理）。

## 坑 → 根因 → 规避

| 坑（现象） | 根因 | 规避 |
|---|---|---|
| 脚本跑了 20s 还 `loading: true`，按钮永远找不到 | 标签页在后台，Chrome 节流 timer/渲染 | 操作前 `Page.bringToFront`；把该 tab 设为前台 |
| 换了个页面操作，同样的代码就不工作了 | SPA 的**上下文/属性**不同（如从 A 站点属性页操作 B 站点的检查面板） | 每次流程前**显式 `Page.navigate` 到目标上下文**，等目标控件出现再操作 |
| 手拼的深链接返回站点自己的 404 | 路由里的 `id` 是 SPA 生成的**不透明令牌**，不是 URL | 只走 UI（搜索框/点击），不要构造内部路由 URL |
| `el.click()` 没反应 | 导航/菜单是自定义元素（Material/Angular `span`），只监听真实鼠标事件 | 优先找原生 `input` / `button`；不行就 `dispatchEvent` 完整序列（pointerdown/mousedown/mouseup/click），或改用键盘（Enter/ArrowDown） |
| 输入框填了值但页面没反应（值为空/被重置） | React/Vue 受控组件只认原生 setter | `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el, v)` + `input` + `change` 事件 |
| 表格/面板读出来是空数组 | SPA 先渲染骨架，数据异步到达 | **轮询**（`for` + `sleep(2000~3000)`，上限 15~25 次），不要固定 `sleep(5s)` 后读一次 |
| 分页写着"共 2 行"，但 DOM 里只有表头、找不到任何数据行 | 页面 `document.visibilityState === 'hidden'`（窗口最小化/标签在后台），**虚拟滚动表格在不可见时不渲染行** | 先 `Emulation.setFocusEmulationEnabled {enabled:true}` + `Page.setWebLifecycleState {state:'active'}` + `Page.bringToFront`，再 navigate；之后读 `visibilityState` 确认已是 `visible` |
| 想知道后台真实状态，但 UI 文案不可靠/渲染报错 | — | 直接读它自己调的 RPC：`Network.enable` 后抓 `Network.responseReceived` 里目标接口（如 `.../services/_/rpc/XxxService/Method`），用 `Network.getResponseBody` 取原始 JSON（常带 `)]}'` 前缀，需剥掉）。注意 **`getResponseBody` 只在请求后短时间内可用**，要在导航后立刻取，别等跑完多个页面 |
| 用整页 `body.innerText` 正则判断操作是否成功，经常误判 | 页面别处本来就有"已提交/无法抓取"等字样 | 判断**具体控件状态**（行数据、`[role=alert]`、按钮文案）而不是整页文本 |
| 想删东西，点了行内菜单发现没有该项 | 点到的是"展开"箭头而不是 `⋮` | 先 **dump 菜单完整 `outerHTML`** 确认条目，再做破坏性操作 |
| 代理挂了/不稳定（curl 返回 000 / schannel 握手失败；或页面 `chrome-error://chromewebdata/`、`ERR_CONNECTION_CLOSED`/`net::ERR_CONNECTION_CLOSED`，但偶尔可达） | 走 SOCKS5 的链路抖动，或 Chrome 启动参数/会话与目标站点握手不稳；浏览器网络栈与命令行代理表现可能不同 | **多次重试**：对同一 URL 循环 `Page.navigate` + 轮询（每次间隔逐步加大，如 7–12s，尝试 5–10 次），每次用 `location.href`/`body.innerText` 判定是否仍是 error 页；同时 `Network.enable` 记录 `loadingFailed`/`responseReceived` 观察失败原因。若持续失败，先确认代理 `127.0.0.1:4080` 可连、让用户在该 Chrome 中手动刷新确认可达，再继续自动化；不要在失败页上误判业务内容。 |
| 脚本里 `newTab` 失败 | Chrome 新版要求 `PUT /json/new` | `fetch('http://127.0.0.1:9222/json/new?' + params, { method: 'PUT' })` |
| PowerShell 输出中文乱码 | 控制台代码页 ≠ UTF-8 | 把响应写文件后 `[System.IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)` 再正则；或直接看 title/canonical 等 ASCII 字段 |

## 探测真实 HTTP 状态（代理不可用时的兜底）

```js
await rpc('Network.enable')
const events = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.method === 'Network.requestWillBeSent') events.push({ t: 'req', url: m.params.request.url })
  if (m.method === 'Network.responseReceived')
    events.push({ t: 'res', url: m.params.response.url, status: m.params.response.status, mime: m.params.response.mimeType })
})
await rpc('Page.navigate', { url })
await sleep(4000)
// events 里就是完整 301→301→200 链，比 curl 更接近 Googlebot/浏览器视角
```

## 安全约定

- 破坏性操作（删除、发布、改配置）前：**先只读 dump DOM**，确认目标控件与文案，再执行一次。
- 批量脚本必须**幂等 + 断点续跑**（state 文件记录 done/failed），失败不要污染下一轮。
- 不要自动化登录、不要碰账号安全设置。
