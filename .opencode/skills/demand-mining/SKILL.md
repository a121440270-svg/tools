---
name: "demand-mining"
description: "Use when diagnosing why a site's traffic misses real user needs, mining search demand (Google Search Console + autocomplete + Google Trends + Keyword Planner), sizing demand and judging SERP competition, finding new page opportunities, or turning demand data into a prioritized P0/P1/P2 page backlog. Triggers: 需求分析, 挖掘需求, 流量根因, 找用户真正的需求, 关键词计划, 谷歌趋势, Google Trends, Keyword Planner, 竞争度, SERP 竞争, keyword research from GSC, demand mining, demand analysis, new page opportunities, title CTR fix, autocomplete research."
---

# Demand Mining (GSC × autocomplete × supply → P0/P1/P2 backlog)

Diagnose "没切中用户真正的需求" with data, not guesses: pull 16 months of Google Search Console queries + pages, probe Google autocomplete for demand Google's own suggest API ranks highly, inventory the site's actual page supply, then cross them into a prioritized action list.

The deliverable is a document like `docs/demand-analysis.md` with P0/P1/P2 items — not a chat answer.

## Related skills (落地阶段用它)

- `seo-constraint-pages` — 把 P1 清单变成页面（骨架 / 接线清单 / 标题与死链自检）
- `nuxt-cloudflare-deploy-verify` — 构建 → 部署 → 生产验证（预渲染数、title/canonical、sitemap 缓存）
- `gsc-sitemap-ops` — 确认 sitemap 真的被 Google 读取；修「无法抓取」；清理陈旧条目
- `gsc-indexing-requests` — 请求编入索引（滚动 24h 配额 + 断点续跑）
- `chrome-cdp-automation` — 操作 GSC/后台的 CDP 基座（节流、受控输入、异步渲染、代理挂了的兜底）

## When to use

- "流量为什么上不去 / 没切中用户真正的需求"
- "帮我分析这个站该做哪些新页面"
- "标题是不是没匹配搜索意图"
- Before any new-page sprint on an established site (not for a brand new site with zero GSC data)

## Preconditions (Windows environment specifics)

- All external network via SOCKS5 proxy `socks5h://127.0.0.1:4080` (flaky — retry 2-3 times per request; `dash/api.cloudflare.com` and localhost bypass it)
- **不要在这个 SOCKS 代理下用 `uv` / `pip` 装包**（实测：uv 报 `SOCKS error: failed parsing server response`，pip/schannel 报 `CRYPT_E_REVOCATION_OFFLINE`）。做数据采集一律走 `curl.exe --ssl-no-revoke` 或纯 Node 脚本（`node:fs` + `child_process` 调 curl），不要为了 pytrends/requests 去折腾 Python 环境
- Browser automation = system Chrome debug instance over CDP port 9222 with **already-logged-in tabs** (GSC needs a signed-in session; do not try to automate the login)
- Chrome 127+ 是 App-Bound Encryption：**复制 User Data 目录不会带走登录态**（cookie 解不开，广告/后台仍要求登录）。需要登录态时，让用户在调试实例里手动登录，或让用户导出 CSV；**绝不自动化登录流程**
- PowerShell 5.1 has no `&&`; `node -e` loses quotes — always write temp `.mjs` scripts under `C:\Users\Administrator\AppData\Local\Temp\opencode\` instead
- CDP driver library: keep one `cdp-lib.mjs` with `connect(tab.webSocketDebuggerUrl)`, `makeRpc(ws)`, `withTimeout`, `listTabs`, `sleep` helpers

## Pipeline

### 1. GSC performance mining (DOM scraping — CSV export is unusable)

GSC's export button downloads via a blob link that synthetic clicks cannot trigger (no user activation), so **read the table DOM directly**:

1. Drive the already-open GSC tab to the report URL with state in the query string — no UI clicking needed for setup:
   `https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Aexample.com&num_of_months=16&breakdown=query`
2. Set 500 rows per page first: open the rows-per-page trigger (`[role=button]` matching `/每页行数|Rows per page/i`), then click the `[role=option]` whose text is exactly `500`.
3. Dump all rows: the table is `table.i3WFpf`; each `tr` with ≥5 `td` cells = [query|clicks|impressions|ctr|position]. Click the paginator next button until the row count stops growing.
4. Repeat with `&breakdown=page` for the page report.
5. Save as `gsc-queries.json` / `gsc-pages.json` (rows with cells).

Gotchas:
- Export button is `[role=button][aria-label="导出"]` — a closure DIV, not a native button. Menu items have icon characters prefixed, so **non-anchored regex** matching + take the shortest match. Even when the menu opens, CSV download still fails — don't burn turns on it.
- Row counts per page: GSC caps at 1,000 rows per report; 16 months of data usually fits in 2-3 pages of 500.
- Numbers arrive with thousands separators — strip commas before parsing.

### 2. Autocomplete demand probe (curl, with relevance scores)

Google's suggest endpoint returns a per-suggestion relevance score most people miss:

```
https://www.google.com/complete/search?client=chrome&hl=en&gl=us&q=<seed>
```

Response `json[1]` = suggestions; `json[4]["google:suggestrelevance"]` = parallel relevance array (roughly 0-1300; higher = stronger demand signal).

- Run via `curl.exe -sS --max-time 12 --proxy socks5h://127.0.0.1:4080 <url>` with 3 retries per seed (proxy handshake fails intermittently; `schannel` errors are transient).
- Alternative that avoids the proxy entirely: `fetch('/complete/search?...')` **inside the google.com CDP tab** (same-origin). Slower but more reliable.
- Seed list = derive from step 1's query clusters, not imagination: top head terms per cluster + verb variants ("compress X", "reduce X", "X to Y", "convert X"). ~50 seeds is enough.
- Sleep ~350ms between requests; save `{ seed: [{s, rel}] }` to `autocomplete.json`.

Reading the results: `rel ≥ 550` = real demand Google's own ranking acknowledges; `rel ≥ 1000` = strong. Position in list matters too (top-3 suggestions of a seed are the head queries).

> **⚠ relevance ≠ volume.** 实测：`passport photo sheet maker` rel=1250，但 Google Trends 美国 12 个月均值只有 **1**（峰值 15）。autocomplete 只证明「这句话有人搜、Google 愿意补全」，**量级必须用 Trends / Keyword Planner 复核**，否则会把微需求当大需求立项。

### 2b. 量级与竞争：Google Trends + Keyword Planner + SERP（缺一不可）

需求验证 = **趋势（真伪/方向）× 关键词计划（量级）× SERP（能不能赢）**。只有 autocomplete 就下结论是最常见的翻车方式。

#### Google Trends（趋势：涨/平/跌 + 相对量级）

脚本：`scripts/trends.mjs`（Node + 系统 `curl.exe`，不依赖任何包）

```bash
node scripts/trends.mjs groups.json out.json US "today 12-m"
# groups.json = [["kw1","kw2","kw3","kw4","kw5"], ...]   单组最多 5 个词
```

要点：
- 用 `curl.exe -sS --ssl-no-revoke --proxy socks5h://127.0.0.1:4080 -A <Chrome UA> -b/-c cookie.txt`；**`--ssl-no-revoke` 必需**，否则 schannel 报 `CRYPT_E_REVOCATION_OFFLINE`
- 两步 API：`/trends/api/explore?req=<urlencoded>` → 拿 `widgets[].token/request` → `/trends/api/widgetdata/{endpoint}?req=&token=`
  - endpoint 映射（容易踩坑）：`TIMESERIES → multiline`、`RELATED_QUERIES/TOPICS → relatedsearches`、`GEO_MAP → comparedgeo`。**不要直接拼 `widgetdata/TIMESERIES`**
- 响应前缀是 `)]}',\n`（**5 字符 + 逗号**），去掉 `)]}'` 后还要 `replace(/^[,\s]+/,'')` 再 `JSON.parse`
- 429 很常见：指数退避（8s × 尝试次数），单次 8 次重试基本能过；组间 sleep 4s
- 解读：组内最高点=100，算 avg / 近 12 周 / 前后半段 delta；`today 5-y` 看长期方向（如 `passport photo maker` 5 年 10→23 上升，`photo collage maker` 61→54 缓降）
- 长尾短语在 Trends 里显示 0-2 不代表没量，但**意味着不值得为它单独做产品线**，只能当附属页

#### Keyword Planner（量级：月均搜索量 / 竞争度 / 出价）

需要已登录的 Google Ads 账号，**没有 API key 时只能走 UI 或让用户导出 CSV**：
- UI 路径：Google Ads → 工具与设置 → 规划 → 关键词规划师 → 获取搜索量和预测数据 / 发现新关键词；导出 CSV 列：`Keyword / Avg. monthly searches / Competition / Top of page bid`
- 自动化前提：CDP 9222 里有**已登录**的 Ads 标签页（chrome-cdp-automation）。账号没有 Ads 权限时页面会跳 `accounts.google.com`，这就是没登录——停止，让用户手动登录或导出，不要尝试代登录
- 本机实测：Chrome 127+ App-Bound Encryption 导致复制 profile 后 cookie 失效（跳登录页），所以「复制 User Data 起调试实例」这条路走不通
- 拿不到 KP 时必须在结论里**显式标注「量级未用 KP 校准」**，用 Trends 相对值 + autocomplete 分布定性，不要编造月搜索量

#### SERP 竞争度（能不能赢）

用 CDP 打开真实 Google SERP（Chrome 走代理），比 curl 稳：

```
https://www.google.com/search?q=<query>&hl=en&gl=us&num=20&pws=0
```

提取 `#search a h3`（标题）+ 最近的 `cite`（域名），逐条分类：

| 类型 | 含义 | 判断 |
|---|---|---|
| 专用工具站（exact-match 标题/域名） | 已经有人专门做这件事 | 竞争高，新站难插队 |
| 大品牌（Canva/Adobe/Google/Walmart） | 品牌权重碾压 | 只能打更细的长尾 |
| 官方文档 / 论坛 / Reddit | 信息型意图 | 工具页排不进去，说明意图不匹配 |
| 独立小站（个人工具） | 可复制的对手 | **有缝可钻** |
| AI Overview 出现 | Google 直接回答 | 点击率结构性下降 |

判定经验：top10 里 **≥7 个专用工具站**（如 `passport photo sheet maker`：cutout.pro / 123passportphoto / passportgrid / photogov / pasandtech / photoaid / docset.in / pi7）= 高竞争，低权重站别碰；top10 里出现 `homiwork.com`、`merge-images.stackasian.com` 这类独立小站（如 `print multiple photos on one page`）= 有缝，但要先确认量级。

#### 决策矩阵（三件套合起来）

| 趋势 | 量级 | SERP | 结论 |
|---|---|---|---|
| 上升/平稳 | 大（KP ≥ 1k） | 大品牌为主但无 exact-match 工具 | 可做，用约束/场景长尾切 |
| 平稳 | 中 | 独立小站能排 | **优先做**（最像 `font-compress` 的成功条件） |
| 下降 | 小 | 专用工具站扎堆 | 不做独立产品线，最多做现有工具的附属功能页 |
| 任意 | Trends ≈ 0-2 | 任意 | 只做长尾/FAQ 覆盖，不立项 |

### 3. Supply inventory

Walk `pages/**/*.vue` → route list (`/` + file path minus extension, `[param]` routes noted). For a site you don't control, fetch the sitemap(s) instead. Supply-side questions:
- Does a page exist whose H1/title **exactly matches** the demand phrase?
- Do multiple routes share the same title? (= duplicate content, Google picks one, others dropped)
- Are locale variants complete for each page? (missing i18n → falls back to English → duplicate → not indexed. This exact debt cost us indexed pages before.)

### 4. Cross-analysis

Cluster queries by intent with regexes over the query text, then for each cluster report: total impressions, total clicks, query count, impression-weighted avg position. Then three gap matrices:

- **A. Demand-side ranking**: top queries by impressions — which are we visible for (impr > 200) but not clicked (CTR < 1%)? That is a *title/intent mismatch*, not a missing page.
- **B. Autocomplete vs supply**: for each suggestion with `rel ≥ 500`, does a page exist whose title contains the exact constraint ("to 1mb", "to woff2", "subsetter")? Missing = new page candidate.
- **C. Page-level waste**: pages with high impressions + rank > 7 + low CTR → title rewrite; pages with impressions > 500 and rank > 15 → the page exists but targets the wrong phrase.

### 5. Prioritized output (docs/demand-analysis.md)

Structure each item as: evidence (the query + impr + pos + rel numbers) → action → page/route. Priority heuristics that worked:

- **P0 — fix what already ranks**: title rewrites on pages with impressions (cheapest: change `seoTitle` i18n keys + `useToolSeo` call). A page at rank 8 with 900 impressions and 1 click is a *title* problem.
- **P1 — constraint-intent landing pages**: the "verb + format + target size" pattern (`compress png to 1mb`, `reduce image size to 250kb`, `compress ttf to woff2`). One page per exact phrase family; each page: eyebrow + H1 with the exact phrase, CTA linking to the real tool with the constraint pre-filled via query param, FAQ (3 Q&As), cross-links between sibling constraint pages, `faqItems` schema. Template: see `pages/compress-png-to-200kb.vue`.
- **P1 — real tool page when the demand is a distinct job** (`ttf-to-woff2` converter ≠ font compressor) — build the actual tool, not just a landing page.
- **P2 — weak/ambiguous demand or crowded SERPs** — note and defer.

Non-negotiables for every new page:
1. i18n in **all 6 locales in the same changeset** — never ship EN-only.
2. Unique title/H1 per route (check for accidental sharing, e.g. dynamic routes `[format]-to-webp` must derive the format from the route param).
3. Add to nav sidebar (`layouts/default.vue`) + related-tools blocks on sibling pages + `data/tool-content.ts` long-form entry.
4. Internal links: cross-link sibling constraint pages; add the new tool links to the cluster hub page.

## Verification loop (摘要，细节见相关 skill)

分析只是上半场，**跟进才是产出**：

1. 构建：预渲染路由数按新增页面数增长（→ `nuxt-cloudflare-deploy-verify`）
2. 部署后验证 title/canonical，而不是只看 200
3. **确认 sitemap 真的被读取**：看 `状态` + `上次读取时间` + `已发现的网页`，不是「已提交日期」（→ `gsc-sitemap-ops`）
   - 真实案例：索引文件「无法抓取」→ `en.xml` 冻结 14 个月只有 7 个 URL，站点实际 318 个
4. 请求编入索引：滚动 24h ~10 条，按优先级 + state 断点续跑（→ `gsc-indexing-requests`）
5. 2 周后重跑步骤 1+4：新路由曝光 + 改标题页 CTR = 成功指标

> 操作 GSC 的 UI 自动化坑（域属性、opaque id、搜索框事件序列、后台节流、配额检测）全部在
> `chrome-cdp-automation` + `gsc-indexing-requests`，这里不再重复。
