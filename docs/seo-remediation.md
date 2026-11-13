# SEO 整改清单（onlitools.com）

> 生成日期：2026-11-11 · 基于 GSC（3 个月数据）+ GA4（28 天数据）诊断。
> 代码侧优化已完成并于 2026-11-11 **部署上线**（Worker 版本 `7818e145`）；Cloudflare
> 控制台项（www 301 / Bulk Redirects / WAF 排查 / **裸域 DNS 事故修复**）当日全部
> 完成；GSC sitemap 已重新提交；6 条重点页已全部请求编入索引（GSC 确认进入
> 优先抓取队列）。剩余 GA4 自定义报告与内容项见下文。

## 背景数据（诊断结论）

| 指标 | 数值 |
|---|---|
| GSC 3 个月点击 | 122 次（日均 ~1.3，逐月下滑） |
| GSC 3 个月曝光 | 2,370 |
| 平均 CTR / 排名 | 5.1% / 20.1 |
| 未编入索引 | 156 个（其中「已发现-未索引」122 个） |
| GA4 28 天活跃用户 | 322（其中 281 个 Direct，多为机器人） |
| 真实 Google 自然用户 | 17（7 天 -94%） |
| 流量依赖 | 89% 的点击来自 `/font-compress` 单页 |

## 已完成的代码侧优化（已于 2026-11-11 部署上线）✅

> **部署记录**：2026-11-11 `npm run build`（342 条路由预渲染）+ `wrangler deploy`，
> Worker 版本 `7818e145-9334-40d4-b0cb-0d47a18efba5`，上传 455 个新资产。
> 部署后验证：`/compress-png-to-200kb`、`/compress-png-to-500kb` 由 404 变 200；
> `/font-compress`、`/ja`、`/ar`、`/sitemap_index.xml` 均 200；ar 首页标题为
> 阿拉伯语、ja 页正常；`__sitemap__/en.xml` 含 301 个 URL（新页面已收录），
> sitemap 由新部署重新生成（2026-11-11T08:04Z）。代码改动保持未提交状态。
> 另：wrangler OAuth token 过期，已用 refresh_token 手动续期并同步回
> `tools.toml`（与 `npm run login` 脚本等效）。

1. **修复站内死链**：`/compress-png-to-200kb`、`/compress-png-to-500kb` 之前被
   `/compress-png-to-100kb` 和 `/compress-jpg-to-500kb` 链接但页面不存在（GSC 里
   「来源：网站」404 的来源）。已创建这两个页面（含 FAQ、schema、i18n、预渲染、
   sitemap 自动收录），同时覆盖 "compress png to 200kb/500kb" 搜索需求。
2. **移除重复页面**：`/case-converter` 曾通过 `definePageMeta.alias` 同时响应
   `/uppercase` 和 `/upper-case`。别名页会自我 canonical，Google 视为重复内容。
   已移除别名；`/uppercase` 继续走 nuxt.config 里的 301。
3. **canonical host 中间件**：`server/middleware/redirect-canonical-host.ts` 将
   Worker 处理到的 `www.onlitools.com` / http 请求 301 到 `https://onlitools.com`。
   ⚠️ 注意：静态资产由 Cloudflare 直接服务、不进 Worker，所以**边界规则（下述）
   才是主修复**，中间件只是动态路由的兜底。
4. **`/font-compress` 标题重写（6 语言）**：从「Compress Fonts for Web Online — …」
   改为关键词前置的「Font Compressor — Compress TTF, OTF, WOFF & WOFF2 Online」，
   匹配实际有排名的查询（font compressor / ttf compressor / compress ttf file，
   合计约 300 次曝光）。description 同步加入具体收益描述。
5. **`/case-converter` 内容补强（6 语言）**：新增 FAQ 内容区块 + FAQPage schema +
   featureList。对应有真实搜索需求的查询簇（to uppercase / uppercase to lowercase
   online 等，遗留曝光 146+）。
6. **`/font-compress` 增加相关工具内链**：链接到 font-inspector / font-unicode-checker
   / font-css-generator（字体簇其余页面已回链，现双向闭环）。
7. **首页补全站页脚**：首页此前 `layout: false` 完全独立、没有任何指向
   About/Blog/Alternatives/Privacy/Terms/Contact 的链接（首页是全站内链权重最高的
   页面）。已在首页模板内加了一行卡片风格页脚（6 语言 + RTL），复用现有 i18n 键。
8. **i18n 运行时缺键补齐**：静态审计 107 个文件 / 877 个键引用，补齐 11 个仅在
   运行时（toast/alert 路径）使用的键，prerender + 静态审计双双 0 缺失。

## 第二轮新增修复（i18n 欠账 + canonical 折叠，2026-11-11 下午）

9. **i18n 翻译欠账（本轮最重要发现，未索引的主因）**：逐 locale 审计发现
   **ja 有 15 个 i18n 组、ar 有 3 个组整组是英文原文**，de/fr/zh 另有部分键泄漏
   ——即 `/ja`、`/ar` 首页与大量工具页对 Google 而言是英文重复页，直接解释了
   它们「已发现-未索引」（122 条中大量 /ja /ar 页）和「重复-Google 选定的
   canonical」（`/ja/webp-to-png`）的状态。已人工翻译全部落盘（约 35k 字符源文）：
   - **ja**：`webp` / `idPhoto` / `agnesImage` / `agnesVideo` / `home` / `blog` /
     `jsoncsv` / `imageConvert` / `prompts` / `webpTo` / `footer` 整组，加
     `dateFormat` 37 键、`font` 9 键、`imageTools` 60 键（`/ja` 首页、
     `/ja/json-csv-convert`、`/ja/webp-to-*` 等全部生效）
   - **ar**：`caseTool` / `home` / `font` 整组，加 `imageTools` 60 键
   - **de/fr**：首页 font 工具卡 10 键、`font` 9 键、`imageTools` 60 键
   - 死键不翻：`about` / `uppercase` / `ttf` / `compress` 组已无页面引用
     （`/uppercase` 走 nuxt.config 301）；`footer.rights`（All rights reserved.）
     与 `imageTools.base64.dataUrl`（Data URL）按惯例保留英文。
   - 经键存在性 + 占位符一致性 + 防英文回写三重校验，构建产物抽查通过。
10. **法律页与 alternatives 页 canonical 折叠**：`privacy` / `terms` / `about` /
    `contact` + `alternatives`（index / toolmole）共 6 个页面正文是内联
    `isZh ? zh : en` 模式，de/fr/ja/ar 版本与英文页**逐字相同**（GSC
    「重复」报告里 `/de/privacy`、`/fr/privacy` 的根因）。方案（未做全文翻译）：
    - 未翻译 locale（de/fr/ja/ar）的 **canonical 折叠到 EN 版**，hreflang 收窄为
      `en` + `zh` + `zh-CN` + `x-default`；en/zh 保持自指 canonical。
    - 实现：`useToolSeo` 新增 `translatedLocales` 选项（alternatives 两页传
      `['en','zh']`，由页面全权输出链接）；布局对 `/privacy|terms|about|contact`
      生成收窄链接簇、对 `/alternatives` 跳过自身 link 输出避免双写。
    - 备选（未采用）：法律页全文翻译 4 页 × 4 语言约 35k+ 字符，法律文本翻译
      质量风险大；若未来翻好，删掉 `translatedLocales`/legalLinkCluster 即恢复
      自指。
11. **SearchAction 本地化**：首页 schema 的 `SearchAction.target` 原来硬编码
    `https://onlitools.com/?q=`，现在按 locale 指向对应语言首页
    （`/de?q=`、`/ja?q=` 等；首页搜索框本就读取 `?q=`）。
12. **og:url 去重**：布局此前会把 localeHead 注入的 og:url（自指 URL）与
    useToolSeo 的 og:url 双写（法律页折叠后会出现两条**不同值**的 og:url）。
    已在布局过滤 localeHead 的 og:url，全站每页仅保留一条与 canonical 一致的
    og:url。

## 需要控制台操作的剩余项（按优先级）

### P0 — Cloudflare 控制台 ✅ 已全部完成（2026-11-11）

1. ✅ **www→裸域 301 Redirect Rule 已部署**（账号 A121440270，zone onlitools.com）：
   - 规则名 `www-to-apex-301`（Rules → Redirect Rules，Wildcard 模式）：
     Request URL `*://www.onlitools.com/*` → Target
     `https://onlitools.com/${2}`（`${1}`=协议、`${2}`=路径），状态码 301，
     Preserve query string ON。scheme 通配符同时覆盖 http/https。
   - ✅ **Always Use HTTPS 已确认开启**（SSL/TLS → Edge Certificates；TLS 1.3、
     Opportunistic Encryption、Automatic HTTPS Rewrites 也均开启）。
   - 验证通过（2026-11-11）：`https://www.onlitools.com/`、
     `https://www.onlitools.com/font-compress?x=1&y=2`（路径+查询串保留）、
     `http://www.onlitools.com/` 均 301 → `https://onlitools.com/...`。

2. ✅ **WAF / Bot 误伤 Googlebot 已排查：无误伤**：
   - Security → Events（新路径 Analytics → Security Events），过滤器
     `User agent contains Googlebot` + 时间范围 Last 30 days，仅 2 条 Block
     记录（2026-10-25 美国 34.105.36.11、2026-10-17 德国 34.179.222.58，
     均为 Managed rules 拦截）。两个 IP 都在 Google Cloud 段（34.x），不是
     Google 官方爬虫网段（66.249.64.0/19）——是伪造 Googlebot UA 的扫描器，
     拦截正确，无需加 Skip 规则。
   - 实测 Googlebot UA 请求 `/`、`/font-compress`、`/sitemap_index.xml` 均 200。

### P0 — DNS 事故：裸域 A 记录丢失（2026-11-11 发现并已修复）✅

3. ✅ **apex DNS 记录丢失导致全站对 Google 及真实用户不可达，已恢复**：
   - **发现路径**：在 GSC 对 `/font-compress` 请求编入索引时，live test 报
     「网页抓取 失败：**DNS 错误：未知主机**」。顺着查：Google DoH
     （dns.google）解析 `onlitools.com` A 记录返回 **NODATA**（仅 SOA 权威应答），
     而 `www.onlitools.com` 正常返回 Cloudflare 边缘 IP。
   - **根因**：Cloudflare DNS 面板该 zone 仅 9 条记录（www CNAME / zx、zx1
     Tunnel / 3 条 MX / DKIM、SPF、google-site-verification TXT），**裸域
     `onlitools.com` 没有任何 A/AAAA/CNAME 记录**。面板自己的警告也写着
     "Visitors cannot reach onlitools.com — Add an A, AAAA, or CNAME record"。
     审计日志显示 **2026-11-11 12:32:34 有一条 `Batch DNS Records` 批量创建
     操作**（账号本人触发）——现存的 9 条记录正好像一次批量导入的结果，
     apex A 记录应在这次操作中丢失（12:32 前 GSC sitemap 还读取成功，15:03
     live test 已 DNS 失败，时间线吻合）。
   - **影响**：裸域解析失败 → Googlebot 与用户均无法访问
     `https://onlitools.com/*` 全部页面；www 301 到裸域同样失败（此前验证
     用的 `curl --resolve` 绕过了 DNS，未暴露该问题）。
   - **修复**（2026-11-11 15:4x，Cloudflare 控制台）：DNS → Records → Add
     record：`onlitools.com` **A → 192.0.2.1，Proxied**（占位 IP；流量由既有
     Worker routes `onlitools.com/*` → tools 接管，边缘不会真回源）。
   - **验证**：记录列表 10 条含 `onlitools.com A 192.0.2.1 Proxied`；
     Cloudflare 边缘 IP 直连 `/`、`/font-compress`、`/sitemap_index.xml`
     均 200。CF 权威即时生效，Google 下次抓取即可解析。
   - **遗留**：GSC live test 当天触发过多被频控（「出了点问题，请过几个小时
     再试」），未能在 GSC 内即时复核抓取恢复；建议数小时后用网址检查复查
     任一页面（应显示抓取成功）。**→ 已于当日下午解除**：频控数小时后消失，
     后续对 6 条 URL 的 live test 全部正常运行、抓取成功（见下文第 5 条），
     DNS 修复对 Google 生效得到实测确认。
   - **已确认**：站长本人确认 12:32 的删除是**误删**——原记录就是
     `192.0.2.1` 这种占位 IP，看起来像没用的垃圾记录所以被清理。本次恢复的
     `A @ 192.0.2.1 Proxied` 即为正确形态，**请勿再删除**（删掉 = 全站下线）。

### P0 — Google Search Console（10 分钟）

4. ✅ **提交 sitemap**（2026-11-11 已完成）：已在 GSC 重新提交
   `https://onlitools.com/sitemap_index.xml`，页面提示「已成功提交站点地图」，
   该行提交日期已更新为 2026-11-11（上次读取 2025-08-27，等 Google 重读刷新）。
   线上 index 含全部 6 个语言子 sitemap（en/ja/zh-CN/de/fr/ar）。
   旧失效条目清理：新版 GSC UI 的站点地图行菜单已无「删除/重新提交」入口
   （仅剩查看索引编制），`__sitemap__/zh.xml`（无法抓取）与
   `www.onlitools.com/sitemap.xml`（1 项错误）留置无害——前者文件已不存在
   会自然衰减，后者 www 已 301 到裸域。
5. ✅ **重点页请求编入索引**（2026-11-11 部署后已全部完成）：6 条 URL 全部
   走「网址检查 → 请求编入索引」流程，GSC 均返回确认
   「**已请求编入索引 — 已将网址添加到优先抓取队列中**」：
   - `https://onlitools.com/compress-png-to-200kb`（新，此前 404 → 部署后 200）
   - `https://onlitools.com/compress-png-to-500kb`（新，此前 404 → 部署后 200）
   - `https://onlitools.com/font-compress`（改版后重新抓取）
   - `https://onlitools.com/case-converter`（改版后重新抓取）
   - `https://onlitools.com/ja`、`https://onlitools.com/ar`（翻译补齐后
     重新抓取；其他 /ja /ar /de /fr 工具页靠 sitemap 自然重抓）
   - 备注：当日上午 GSC 曾频控（多次 live test 后报「出了点问题」），下午
     解除后全部完成；期间一次「提交索引编制请求时出现问题」为瞬时错误，
     重试即成功。附带的 6 次 live test 抓取全部成功，确认 DNS 修复生效。
6. ✅ **404 清单已提取并在 Cloudflare 建 Bulk Redirects**（GSC 网页索引编制 →
   未找到 404，15 条，2026-11-11 抓取；2026-11-11 已部署）：
   列表名 `onlitools_legacy_301`（3 条，均 301 + Preserve query string），
   规则名 `onlitools_legacy_301_rule`（已启用）。

   | 来源 URL（404） | 301 目标 | 理由 |
   |---|---|---|
   | `https://onlitools.com/en/date-format` | `https://onlitools.com/date-format` | 旧 `/en/` 前缀结构，同一工具 |
   | `https://onlitools.com/agnes-ai` | `https://onlitools.com/image-generator` | 旧路径，工具现为 image/video-generator |
   | `https://onlitools.com/pt` | `https://onlitools.com/` | 旧葡萄牙语首页（`pt` 不在 i18n 语言列表，恒 404；www 变体先被 `www-to-apex-301` 折叠到裸域再命中本条） |
   | `https://www.onlitools.com/tools/pomodoro-online` | （不做 301） | 工具已删且无对应页，404 自然衰减 |
   | `https://onlitools.com/share-note` | （不做 301） | 同上 |

   验证通过（2026-11-11）：`/en/date-format` → `/date-format`、`/agnes-ai` →
   `/image-generator`、`/pt` → `/` 均 301 且查询串保留
   （`/agnes-ai?ref=x` → `/image-generator?ref=x`）；
   `https://www.onlitools.com/pt` 全链 301 → `https://onlitools.com/`（200）。

   **以下 10 条是垃圾/随机路径（疑似历史被注入或旧短链），保持 404 让其自然衰减，
   不要 301 到首页**（避免被判定 soft-404）：
   `/_nuxt/`（旧构建资产，正常更替）、`/sup.ve` ×2、`/wqk?bgn`、`/uimzf` ×2、
   `/uimzf-etai` ×2、`/qhqzf`、`/3nF/27yVr/fms.yuz.ve?l`。
   其中 http/www 变体会先被上面的 canonical host Redirect Rule 折叠成 https 域名。

### P1 — GA4（5 分钟）

7. ✅ **过滤机器人流量**（2026-11-11 已确认）：GA4 自 2023 年起「机器人过滤」
   为媒体资源级**默认开启且不可关闭**（数据流详情页已无该开关），无需操作。
   实查：数据流 `onlitools`（G-NP4XQJQRNQ）健康（48 小时内在接收流量）、
   增强型衡量开启；数据过滤器仅有默认 `Internal Traffic`（测试态，未激活），
   无自定义机器人规则干扰。另建自定义报告排除 `新加坡 + Direct` 组合的事
   仍待做（当前 28 天 322 用户里 ~159 个来自新加坡 Direct，严重失真），属
   后续分析项。另：数据流详情页提示「电子邮件地址 有效网址查询参数键无效」
   （隐去数据区红字），如需启用 URL 参数隐去可后续修正，不影响机器人过滤。

### P2 — 内容与外链（持续）

8. **博客选题转向**：当前博客写后端主题（MyBatis、fetch keepalive），与工具站
   不匹配。GSC 里躺着 0 点击的真实需求，按此选题：
   - How to remove EXIF data from photos（链 remove-exif / gps-remover）
   - WebP vs JPG: when to convert（链 webp-to-jpg / image-to-webp）
   - What image metadata reveals about you（链 image-metadata）
   - How to make an ID photo online（链 id-photo）
   - Compress an image to 100KB for form uploads（链 image-compress-to-100kb）
   （`articles/remove-exif/` 目录里有现成的写作模板可复用。）
9. **外链**：es.wikipedia.org 已带来 15 个 referral（找到是哪条词条，考虑补充
   相关词条）；再到 AlternativeTo、Product Hunt、GitHub awesome 列表提交工具。
10. **每周监控**：GSC 已索引数（136 → 目标 250+）、字体簇点击、`toolmole` 品牌
   词排名（304 曝光 / 第 8.9 位 → 冲前 5）。

---

## 第二轮：302 条未编入索引的根因与修复（2026-11-13）

> 数据快照：GSC 2026-11-09（上次更新日期）；共 302 条未编入索引，8 个原因。
> 借助 `chrome-gsc` profile（huiqinliu1005）逐组导出全部 302 条 URL 后逐条用
> curl 复检线上状态，才定位到下面 4 个真实问题（其余为正常衰减或垃圾路径）。

### 诊断结论

| GSC 原因 | 条数 | 真实根因 | 处置 |
|---|---|---|---|
| 已抓取-尚未编入索引 | 137 | 其中约 100 条是 de/fr/ja/ar 博客文章页渲染空页（见下） | 301 到英文正文 |
| 已发现-尚未编入索引 | 105 | de/fr/zh 工具页，sitemap 与内链都已有，等 Google 排期 | 无需改动 |
| 重复网页（Google 选的规范不同） | 22 | 16 条是 de/fr/ja/ar 博客空页自指 canonical + 6 语言 hreflang | 同上 + hreflang 收紧 |
| 未找到 404 | 17 | `/api/upload`、`/api/user-info`、`/_nuxt/`、`/sup.ve` 等 | robots 屏蔽 `/api/`，其余保持 404 |
| 服务器错误 5xx | 9 | Worker CPU 超限（Cloudflare error 1102），不是持续故障 | 删除大对象日志（见下） |
| 备用网页（有适当的规范标记） | 6 | www/http 首页变体、`/blog/`、`/prompts` 等 | 已被 301 / canonical 覆盖 |
| 网页会自动重定向 | 5 | `/de/`…`/ar/` 由 Nitro 归一化返回 307 | 中间件改 301 |
| 被 noindex 排除 | 1 | `/zh/prompts/public`（私有页，正常） | 无需改动 |

### 根因 1：博客只有 en/zh 两种译文，其他语言渲染空白 200 页

`article_l` 表里博客只有 `en` / `zh` 两行（`server/api/__sitemap__/articles.ts`
也只输出这两种）。但 `pages/blog/[id].vue` 对任意 `/{locale}/blog/{slug}-{id}`
都返回 **200**：`articlel` 为 `null` → 标题退化成 `Blog`、正文约 900–1500 字符、
canonical 自指、hreflang 声称 6 种语言。Google 判为软 404 / 重复 / 抓取后不索引。

修复：

- `pages/blog/[id].vue`：取文章时带 `translations=1`；当前语言没有译文时 **301**
  到英文文章（用英文自己的 slug）；同语言但 URL slug 与库里的 slug 不一致时也 301
  到规范 URL（消除 `/{locale}/blog/任意slug-{id}` 这类重复）。
- `composables/useToolSeo.ts` 新增 `alternates` 选项，博客据此按**各自语言的
  slug** 输出 hreflang（此前 en 页把 zh 指向 `/{en-slug}-96`，与 sitemap 里的
  `/{zh-slug}-96` 撞成两条 zh URL）。
- `pages/blog/index.vue`：`translatedLocales: ['en','zh']`，de/fr/ja/ar 的博客列表
  页 canonical 折回英文 `/blog`，不再自称有翻译。
- `server/dao/articleDao.ts` + `server/api/articles/[id].ts`：新增
  `findArticleTranslationSlugs()` 与 `?translations=1` 参数（只回 `lang_code`+`slug`，
  不额外传正文）。

### 根因 2：博客页随机 503 = Cloudflare Workers CPU 超限（error 1102）

复检时约 1/5 的博客 URL 返回 `503`，响应体只有 `error code: 1102`（CPU 超时）；
同一 URL 连续请求可复现 `200 → 503 → 200`。免费版 Worker 单请求 CPU 上限 10ms，
而文章页 SSR 里额外做了这些工作：

- `server/api/articles/[id].ts`、`article.get.ts`、`articlel.get.ts` 里的
  `console.log('结果:', tools)` —— 把**整篇 markdown（50–80KB）**序列化进
  Workers Logs，日志成本算在同一个请求的 CPU 预算里；
- `server/db/orm.ts` 每条 SQL 都 `console.log('SQL:', formatSqlWithParams(...))`，
  `INSERT` 分支还会把正文整段拼进日志字符串。

修复：删除文章接口里的 payload 日志；`orm.ts` 的 SQL 日志改为 `SQL_DEBUG=1`
时才输出（且不再无条件调用 `formatSqlWithParams`）。这是对「服务器错误 5xx」
以及一部分「已抓取-未索引」的直接修复。

### 根因 3：语言根路径 307

`/de/`、`/zh/`、`/ja/`、`/fr/`、`/ar/` 返回 **307**（GSC 归入「网页会自动重定向」）。
根因是 **Workers Static Assets** 的 `html_handling = "drop-trailing-slash"`：
命中预渲染文件的尾斜杠请求由资产层直接 307，根本不会进入 Worker。因此分两步修：

1. 新增 `server/middleware/redirect-trailing-slash.ts`：Worker 路由内的尾斜杠一律
   **301**，并把 `/en/**`（`prefix_except_default` 下不存在的路由）301 到去掉前缀的
   路径（原 `/en/date-format` 是 404，现 301 到 `/date-format`）。
2. `wrangler.toml` 的 assets 增加
   `run_worker_first = ["/de/","/fr/","/ja/","/ar/","/zh/"]`，只把这 5 条路径交给
   Worker，让第 1 步的中间件能改写成 301；其余静态资源仍由资产层直接返回，不增加
   Worker CPU 开销。

### 根因 4：robots.txt 未屏蔽 `/api/`

GSC 抓到了 `/api/upload`、`/api/user-info`（404）。`public/robots.txt` 增加
`Disallow: /api/`，避免继续浪费抓取预算。

### 根因 5：de/fr/ja/ar 的博客列表是空的

`/de/blog` 返回 200，但**一条文章链接都没有**：`/api/articlepage` 的 `total` 统计全部
文章（245），`list` 却按 `lang_code` 过滤（de 没有译文）→ 直接返回 0 条。页面因此
渲染成 "Insgesamt 0 Einträge"，既是薄内容，也让 crawler 在该语言下拿不到任何文章内链。

修复：`pages/blog/index.vue` 取列表时使用「内容语言」而不是路由语言（`zh` 用 `zh`，
其余一律 `en`），de/fr/ja/ar 的列表即复用英文文章；配合 `articleLink()` 直接输出
`/blog/...`，链接不会再指向会 301 的 `/{locale}/blog/...`。

### 根因 6：博客页同时存在两套 hreflang，其中一套指向不存在的译文

`layouts/default.vue` 会用 `useLocaleHead()` 输出一套「6 语言 + x-default」的
hreflang，而 `useToolSeo()` 又输出自己那套。结果博客页的 `<head>` 里有 **11 条**
hreflang：8 条来自 layout（含 `/ja/blog/...`、`/de/blog/...` 以及把 zh 指到**英文
slug** 的 URL），3 条来自 `useToolSeo`（正确的 en / zh-CN / x-default）。两套互相
冲突，正是 GSC「重复网页，Google 选择的规范网页与用户指定的不同」与「备用网页」
两组的一部分来源。

修复：`layouts/default.vue` 里把 `/blog`（列表与文章）和 `/alternatives` 一样处理——
`links = []`，canonical 与 hreflang 完全交给页面的 `useToolSeo`（它已经输出
`og:url`，不依赖 layout）。工具页两套 hreflang 的 href 完全一致，属于无害重复，
本轮不动。

### 部署与验证

已部署并线上复检（2026-11-13）：

- Worker 版本：`e16b887e-9ffe-43d8-b7cf-0f0eac095f14`（首轮修复），
  `c0b6d4ec-1668-4643-9269-5bb5eeeb31c8`（补齐尾斜杠 301 与博客列表 canonical），
  `5eb16b35-9b6f-453d-93ad-00bf1b8ecfb7`（博客列表改用内容语言），
  `a2713f3a-cee2-4d5d-85a3-a0bd66580397`（博客页去掉重复 hreflang）。
- 复检结果（`curl` 直连，14/14 通过）：

  | 请求 | 结果 |
  |---|---|
  | `/de/` `/zh/` `/fr/` `/ja/` `/ar/` | **301** → 去斜杠（原 307） |
  | `/en/date-format` | **301** → `/date-format`，查询串保留 |
  | `/blog/` | **301** → `/blog` |
  | `/de/blog/{slug}-{id}`、`/ar/...`、`/ja/...`、`/fr/blog/133` | **301** → 英文文章规范 URL |
  | `/de/blog`、`/fr/blog` | canonical 折回 `https://onlitools.com/blog` |
  | `/de/blog`、`/fr/blog`、`/ja/blog`、`/ar/blog` | 200，列表渲染 **12 条英文文章链接**（原为 "Insgesamt 0 Einträge"） |
  | `/blog`、`/zh/blog` | 自指 canonical，hreflang 只有 en / zh-CN / x-default |
  | 英文文章页 | 200，186 KB，canonical 自指，hreflang 由 11 条降为 3 条（en / zh-CN / x-default） |
  | 中文文章页 | 200，canonical 自指 |
  | 任意错误 slug（`/blog/wrong-slug-96`） | **301** → 规范 slug |
  | `/blog/96`（文章的裸 id） | **301** → 规范 slug（slug 非空时） |
  | 空 slug 文章 `/blog/133`、`/zh/blog/133`、`/blog/7` | 200（canonical 即裸 id） |
  | `robots.txt` | 已含 `Disallow: /api/` |
  | 3 篇重文章各连打 6 次（共 18 次） | 18×200，未再出现 1102 |

  补充说明：`/de/` 这类**预渲染静态路由的尾斜杠**由 Workers Static Assets
  在 Worker 之前返回 307（`html_handling = "drop-trailing-slash"`），中间件根本
  收不到请求。因此 `wrangler.toml` 加 `run_worker_first = ["/de/","/fr/","/ja/","/ar/","/zh/"]`，
  只把这 5 条路径交给 Worker，中间件即可返 301，其余静态资源仍不经过 Worker。

- 仍未复核：GSC 侧的「验证修正情况」与批量「请求编入索引」。执行时本地 SOCKS5
  代理（`127.0.0.1:4080`）对境外 TLS 站点握手失败（境外节点不可用），
  `search.google.com` 无法访问；站点本身可直连复检。代理恢复后继续提交验证。

### GSC 操作记录（2026-11-13）

用 `chrome-gsc` profile（huiqinliu1005，端口 9333）在「网页索引编制」里执行：

- **「未找到 (404)」17 条**：已点「验证修正情况」，GSC 显示
  `验证已开始 / 开始日期：2026-11-13`（修复手段是 robots 屏蔽 `/api/` +
  其余垃圾路径继续 404，不再同时提交 301）。
- **「服务器错误 (5xx)」9 条**：同上，`验证已开始 / 2026-11-13`。
- **「请求编入索引」**（URL 检查 → 请求编入索引，配额逐条消耗）：

  | URL | 结果 |
  |---|---|
  | `/blog/css-vw-clamp-fluid-layout-responsive-design-23` | 已加入优先抓取队列 |
  | `/zh/blog/javascript-strict-equality-object-is-65` | 已加入优先抓取队列 |
  | `/zh/blog/qian-duan-mo-kuai-hua-ji-qiao-215` | 已加入优先抓取队列 |
  | `/blog/vue-4-vapor-mode-performance-evolution-28` | 已加入优先抓取队列 |

- 抽查时发现一批「已抓取-尚未编入索引」条目其实**已经在索引里**
  （`/zh/blog/promise-all-vs-promise-allsettled-javascript-async-200`、
  `/blog/vue3-mixins-to-composition-api-39`、
  `/zh/blog/huge-json-qian-duan-xing-neng-you-hua-115`、
  `/blog/indexeddb-vs-localstorage-modern-browser-storage-22`），
  说明这份 302 条清单含不少滞后数据，不必逐条清理。

- 顺带确认：清单里带旧拼音 slug 的 URL（例如
  `/blog/promise-all-vs-promise-allsettled-javascript-async-200`、
  `/zh/blog/8-practical-tips-to-improve-css-code-quality-246`）现在全部
  **301** 到新英文/中文 slug（库里的 slug 已改过），目标页 200，
  这正是「重复网页」与「已抓取未索引」两组的一部分来源。

- 未能完成的部分：本地 SOCKS5 代理（`127.0.0.1:4080`）对境外站点 TLS
  握手间歇性失败（国内站点正常），`search.google.com` 会短时间不可用；
  剩余几条「请求编入索引」留待代理稳定后补交，不影响已部署的修复。

- 代理恢复后补查两条待提交的中文页（`/zh/blog/css-clamp-liuti-buju-yu-paiban-83`、
  `/zh/blog/javascript-yi-xing-dai-ma-ji-qiao-212`）：URL 检查结果均为
  **「网页已编入索引」**，无需再消耗配额，再次印证这份 302 条清单以滞后数据为主。
