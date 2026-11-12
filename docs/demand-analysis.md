# 需求挖掘与流量增长行动清单（数据驱动版）

> 数据源：GSC 16 个月（2025-08 ~ 2026-11，2026-11-12 现场复核：254 条可见查询 / 120 个有曝光页面；站点总量 496 点击 / 7,900 曝光）+ Google 自动补全（client=chrome, hl=en, gl=us）
> 原始数据：`C:\Users\Administrator\AppData\Local\Temp\opencode\{gsc-queries,gsc-pages,autocomplete}.json`
> 生成日期：2026-11-11
> **执行状态更新：2026-11-11（第二轮）** — P0 全部完成、P1 全部完成，见各表「✅」标记与文末「执行记录」。

## 〇、执行状态总览

| 轮次 | 内容 | 状态 |
|---|---|---|
| 第一轮（用户，2026-11-11 部署 Worker `7818e145`，详见 `docs/seo-remediation.md`） | font-compress 标题重写、case-converter FAQ、i18n 欠账清偿（ja 15 组 / ar 3 组）、sitemap 重提交、6 页请求索引、www 301、裸域 DNS 修复 | ✅ 已上线 |
| 第二轮（本清单，2026-11-11） | P0 #2-#8 标题/CTR/内链修复 + P1 全部 17 个新页面 + D1 博客标题 + i18n 6 语言全量补齐 + 导航/内容接线 | ✅ 代码完成（见「五、执行记录」） |

## 一、现状诊断（一句话）

**整站在 Google 眼里是一个「单页站」**：16 个月全部曝光 7,900 次、点击 496 次（2026-11-12 现场复核，顶部卡片口径），其中 `/font-compress` 一个页面占 5,294 曝光 / 458 点击（页面表口径，92% 的全站点击）。其余 100+ 工具页几乎完全隐身。

> **数据口径更正（2026-11-12）**：本文初稿写的「2,937 曝光 / 189 点击」是**查询表可见行的合计**，不是站点总量。GSC 会把长尾查询匿名化，查询表永远加不出站点总量；站点真实总量是 **7,900 曝光 / 496 点击**（页面表点击合计 496，与卡片一致）。方向性结论（单页站、font-compress 独大）不变，只是基数更大。证据：`gsc-verify.json`、`gsc-proof-verify.png`。

### 为什么 font-compress 能赢

| 因素 | 说明 |
|---|---|
| 需求真实 | font compressor / compress ttf / ttf compressor 等查询 16 个月持续有量（自动补全确认：compress ttf file 1250、font compressor online 1250） |
| 标题精确匹配 | 《Font Compressor — Compress TTF, OTF, WOFF & WOFF2 Online》，查询词完整出现在标题 |
| 年龄 | 2025-07 上线，16 个月积累 |
| 独占语义 | 「字体文件压缩」是个小而准的利基，大站不做 |

**结论：不是「工具站没流量」，是「只有这一个页面切中了真实需求」。方法论 = 把 font-compress 的成功要素复制到其它已验证的需求上。**

### 其余页面隐身的三类原因

1. **太新（不是需求问题，是时间问题）**：所有 `compress-*-to-*kb`、`remove-exif`、`gps-remover`、`heic-to-jpg`、metadata 系列都是 2026-10-29 上线（2 周），索引请求 11-09 才提交。判断「模式失败」为时过早。
2. **老但错配（排名 2-4 页）**：case-converter（11 个月，排名 29-61）、hash-text（排名 50）、json-csv（排名 18）、token-generator（排名 31）、image-to-webp（排名 23）——标题措辞与真实查询不对齐 + 全站权重弱。
3. **有需求没供给（页面缺失）**：见下文 P1。

## 二、方法论（可重复的月度循环）

```
每月跑一遍：
1. GSC 拉上月查询表 → 按意图聚类 → 找三类信号
   a) 排名 4-15 的查询 → 标题/H2 微调就能吃到的量
   b) 排名 16-30 的查询 → 内链 + on-page 强化
   c) 曝示>30 且排名>30 的查询 → 需要专门页面或指南页
2. 自动补全下钻（curl client=chrome, hl=en, gl=us）
   动词(compress/convert/remove/reduce/resize/increase)
   × 对象(png/jpg/ttf/woff2/font/image/photo)
   × 约束(to 100kb / to 1mb / to specific size / online / free / bulk)
   → 每个「动词+对象+约束」= 一个独立着陆页（已被 font-compress 和 compress-*-to-* 验证）
3. 动词变体覆盖：同意图不同动词是不同查询空间
   （compress X to 100kb vs reduce X size to 100kb vs resize X to 100kb）
   → 主页面 1 个，标题/H2/FAQ 覆盖前 2-3 种措辞
4. 内链：从唯一有权重的页面（font-compress）链接到所有新兄弟页
5. 索引：新页全部提交请求索引，站点地图确认收录，8 周内不下结论
```

关键认知：**GSC 只显示「Google 已经愿意展示给我们」的查询；自动补全暴露「我们完全隐身」的需求空间。** 两者都要看。

## 三、优先级行动清单

### P0 —— 本周（零新页面，修排名/CTR，吃现成的量）

| # | 动作 | 依据 | 状态 |
|---|---|---|---|
| 1 | 剩余 10-29 新页全部提交请求索引（compress-png/jpg-to-* 系列 12 页、image-compress-to-* 7 页、remove-exif、gps-remover、heic-to-jpg、metadata 系列、exif-guide）；确认 sitemap 含全部新页 | 自动补全已确认这些是真实大需求：compress png to 1mb (1000)、compress image to 100kb (1250)、heic to jpg converter (1250)、remove exif data (1250) | 🟢 第二轮已部署（Worker `4902d14a`）；sitemap_index.xml 抓取失败已修复（11-12 重新提交后「成功」，en.xml 刷新为 318 网页）；请求索引已提交 3 个，剩余 14 个续跑（配额滚动 24h） |
| 2 | case-converter 标题改为精确匹配：《Uppercase to Lowercase Converter — Free Online Case Converter》+ H2 覆盖 title case / camelCase 变体 | uppercase to lowercase converter (1250)、case converter tool (601)；现页面 152 曝示但排名 41.5，/uppercase 旧路由已 301 过来 | ✅ caseTool.title 六语言更新，页面已接线 |
| 3 | hash-text 标题：《Hash Text Generator — MD5, SHA-1, SHA-256 Online》 | hash text online (700)、hash text generator (600)；现排名 50.4 | ✅ hashTool.seoTitle 新键六语言 + 页面接线 |
| 4 | json-csv-convert 标题：《JSON to CSV Converter — Online & Free》(含 CSV→JSON H2) | json to csv converter (1250)、online (601)；现排名 18（第 2 页，改标题有上首页机会） | ✅ jsoncsv.seo_title 六语言（页面本就用该键） |
| 5 | token-generator 标题：《Random Token Generator — Secure, Online, Free》 | GSC: random token generator 83 曝示排名 82 | ✅ tokenTool.seoTitle 新键六语言 + 页面接线 |
| 6 | /png-to-webp、/jpg-to-webp 动态路由页确保收录且标题精确（PNG to WebP Converter — Free & Bulk） | png to webp converter (1250)、webp to png converter (601)；image-to-webp 现排名 23 | ✅ 路由参数感知标题（webp.seo_title_f 六语言，PNG/JPG 标签从路由解析），webp-to-[target] 去掉后缀拼接 |
| 7 | mybatis 博客文 CTR 修复：标题重写更抓眼球（如《MyBatis 多线程 SqlSession 的坑：一次 ClassCastException 的完整排查》） | 该文 911 曝示排名第 8.4 却只有 1 次点击；查询 mybatis multi-threaded sqlsession usage 排名 5.9 零点击——**排名已在首页，纯粹是标题点击率问题** | ✅ D1 直接 UPDATE（en: 《MyBatis SqlSession Thread Safety: The Trap and the Fix》 / zh: 《MyBatis SqlSession 多线程线程安全问题：原因与解决方案》），博客实时渲染已生效 |
| 8 | font-compress 页脚/侧栏加「相关字体工具」内链块：→ ttf-to-woff2、font-subsetter、compress-woff2（P1 新页）+ compress-ttf 系列 | 唯一有权重的页面，新页需要它传递相关性 | ✅ 三个新页链接已加到 font-compress 相关工具块最前 |

### P1 —— 未来 2-4 周（补已验证需求的缺口页面，用 font-compress 的成功模板）

按自动补全 relevance 分数（≈相对搜索量）排序：

| # | 新页面 | 需求证据 (relevance) | 备注 | 状态 |
|---|---|---|---|---|
| 1 | **/ttf-to-woff2**（TTF→WOFF2 转换器，附 WOFF2→TTF） | ttf to woff2 converter **(1250)**, converter free (601), online (600) | **最大单一缺口**，紧邻唯一权重页 | ✅ 真工具页（fonteditor-core 双向转换，fontConvert.* 六语言，FAQ schema，已进侧边栏导航） |
| 2 | **/compress-woff2** + /compress-woff | compress woff2 (601), file online (600), compress woff2 font (556) | 复制 compress-ttf 模板 | ✅ 落地页 ×2（compressFontTarget.* 六语言，CTA→/font-compress，compress-woff2 已进导航） |
| 3 | **/font-subsetter**（字体子集化器） | font subsetter **(1250)**, subsetter online (600), subset generator (559) | font-compress 已有子集功能，独立页面收割「subsetter」措辞 | ✅ 落地页（fontSubset.* 六语言，CTA→/font-compress，已进导航） |
| 4 | 约束意图尺寸变体：compress-png-to-{1mb,2mb,5mb}、compress-jpg-to-{2mb,5mb,50kb,150kb}、compress-image-to-{250kb,2mb,5mb} | compress png to 1mb (1000)、compress image to 250kb (800)、compress jpg to 2mb (559) | 复制 compress-png-to-200kb 模板，一次批量生成 | ✅ 10 页批量生成（imageTarget.* 键 + tool-content 长文，交叉内链已核对无死链） |
| 5 | reduce 措辞变体页或并入现有页的 H2：reduce-image-size-to-{250kb,5mb,2mb} | reduce image size to 250kb **(1250)**、to 5mb (1251)、to 2mb (950) | 「reduce」动词是独立查询空间，现有页面只覆盖「compress」 | ✅ 3 页（reduceImage.* 新段六语言，独立查询空间） |
| 6 | metadata-analyzer 重定位为《Photo Metadata Viewer — EXIF, GPS & Hidden Info》 | photo metadata viewer **(1250)**、remover (900)、editor (601) | 同簇再做 photo metadata remover/edit 措辞覆盖 | ✅ imageTools.metadataAnalyzer.seoTitle 六语言（组件本就用该键） |
| 7 | photo resizer 措辞覆盖：image-resizer 加《Photo Resizer in KB / MB》H2 + FAQ | photo resizer in kb (557)、in mb (559)、reduce photo size in kb (1050) | 大部分是现有页面的标题/FAQ 强化 | ✅ image-resizer 加 seo-title/keywords + 「Resize by file size」feature 卡 |
| 8 | text-dedup 标题精确化：《Remove Duplicate Lines Online — Text Deduplicator》 | remove duplicate lines online (700)、text dedupe (1250) | 页面已有，需查索引年龄与内链 | ✅ textDedup.seoTitle 六语言（页面本就用该键） |

### P2 —— 之后再议

- **/video-to-gif**（video to gif converter 1250）——需求巨大但需要新客户端功能（ffmpeg.wasm），工程量大
- id-photo——需求大（id photo for you 1251，品牌词）但 YMYL 属性强、竞争激烈，需要按国家的规格内容深度
- de/fr/ja/ar 多语言——目前非英文页几乎零曝示（合计 <80/月），**先不投入新语种页面**，英文跑通再说
- GA4 工具使用事件埋点——验证「排名→点击→真实使用」转化，找出用户用完会回头的工具（留存信号），反过来指导页面优先级
- blog——有曝示无点击（IndexedDB 文 274 曝示 0 点击），保持作为内链支撑，不做主要增长赌注

## 四、预期与检验

- P0 全部完成后：曝光应从 ~180/月 → 400-600/月（uppercase/json-csv/token/mybatis CTR 修复 + 新页开始索引）
- P1 落地 + 8 周后：constraint-intent 页群是主要增量来源；ttf-to-woff2 是最有把握的单页（紧邻 font-compress 权重 + 1250 需求）
- 每月按「二、方法论」跑一遍循环；**任何页面 8 周内不下结论**

## 五、执行记录（第二轮，2026-11-11）

### 交付物清单

**新页面 17 个**（全部 prerender + sitemap 自动收录，i18n 六语言同步）：

- `/ttf-to-woff2`（真工具：fonteditor-core 双向转换 TTF/OTF/WOFF↔WOFF2/TTF，WebAssembly 本地运行）
- `/font-subsetter`、`/compress-woff2`、`/compress-woff`（落地页，CTA→/font-compress）
- `compress-png-to-{1mb,2mb,5mb}`、`compress-jpg-to-{50kb,150kb,2mb,5mb}`、`compress-image-to-{250kb,2mb,5mb}`（10 页约束意图）
- `reduce-image-size-to-{250kb,2mb,5mb}`（3 页 reduce 动词空间）

**修改文件**：i18n 6 locale（新段 reduceImage/compressFontTarget/fontSubset/fontConvert + 新键 hashTool.seoTitle / tokenTool.seoTitle / webp.seo_title_f + menu.ttfToWoff2/fontSubsetter/compressWoff2）；hash-text / token-generator / [format]-to-webp（格式感知标题）/ webp-to-[target]（去后缀）/ image-resizer（seo + feature 卡）/ font-compress（3 新内链）；layouts/default.vue（导航 +3）；data/tool-content.ts（compressTargets 12→25 条 + 4 font 长文）。

**数据修复**：D1 `article_l` mybatis 文（article_id=18）en/zh 标题 UPDATE，博客实时渲染立即生效。

### 教训与模式（复用于下一轮）

1. **i18n 必须 6 语言同一批交付**——本轮所有新段/新键一次性翻译，验证脚本（段落齐全 + 占位符与 EN 一致）全绿。
2. **动态路由页标题必须路由感知**——[format]-to-webp 曾让 /png-to-webp 与 /jpg-to-webp 共享标题（重复内容）。
3. **生成页面的交叉内链要跑死链核对**——compress-jpg-to-2mb 曾指向不存在的 /compress-jpg-to-1mb（image-compress-to-* 与 compress-image-to-* 是两个家族）。
4. **约束页模板已沉淀**：`pages/compress-png-to-200kb.vue`（eyebrow + 精确 H1 + CTA 带 query 预填 + FAQ schema + 兄弟页交叉内链 + toolContentSection 长文）。
5. **需求挖掘流程已沉淀为 skill**：`.opencode/skills/demand-mining/SKILL.md`（GSC DOM 刮取 + autocomplete relevance + 供给交叉 + P0/P1/P2 产出）。落地阶段的坑另拆成 5 个 skill：`seo-constraint-pages`（页面工厂 + 接线/死链/标题自检）、`nuxt-cloudflare-deploy-verify`（构建/部署/生产验证）、`gsc-sitemap-ops`（sitemap 真实读取状态 + 陈旧条目清理）、`gsc-indexing-requests`（请求索引 + 滚动配额断点续跑）、`chrome-cdp-automation`（CDP 基座与通用坑）。
6. **sitemap 提交必须验证「上次读取时间/状态」，不能只看提交成功**——本轮发现 `sitemap_index.xml` 自 2025-08 起一直「无法抓取」，导致 `en.xml` 停在 2025-09-02 的 7 个 URL 旧版本，新页从未通过 sitemap 被发现。重新提交后当日即变为「成功」，`en.xml` 同步刷新为 318 个网页。**教训：GSC 站点地图页的「状态」列才是有效信号；「已提交」日期更新不代表被抓取。**
7. **GSC 是域属性 `sc-domain:onlitools.com`**（URL 前缀属性 `https://onlitools.com/` 在该账号未验证）。URL 检查必须在该属性上下文操作；直接构造 `/inspect?id=<url>` 会 404（`id` 是 SPA 生成的不透明令牌，只能走顶部搜索框）。
8. **请求编入索引配额是滚动 24h ~10 条**（跨天不立即重置）——11-11 用掉 6 条后，11-12 只成功 3 条即命中配额。批量脚本需断点续跑。
9. **GSC 无法删除站点地图条目**（当前版本行内 ⋮ 只有「查看网页索引编制/查看视频网页索引编制」，完整菜单 DOM 仅 2 项）。「清理」陈旧条目的唯一可行做法：让该 URL 解析到有效 sitemap（301 → 200 的 sitemap 即可），再在站点地图页重新提交同一 URL 触发重读——当日即转「成功」，红色错误消失。404/410 不会让条目从报表消失（2021 年的条目挂了 3 年仍在）。

### 待办（部署后）

- [x] `npm run build` 通过（444 条路由预渲染，342→444）后 `npm run deploy`（Worker 版本 `4902d14a`，586 个新资源上传，17 新页 × 6 语言全部上线；抽查生产 URL 全部 200）
- [x] sitemap 验证：`sitemap_index.xml` → en/zh-CN/ja/de/fr/ar 各 318 条（ja/de/fr/ar 各 74 条静态页，博客仅 en/zh），17 个新路由全部收录；各语言子图 74 条含全部新页（runtime cache 600s，部署后已重新生成）
- [x] **sitemap 抓取修复**：重新提交 `sitemap_index.xml` + `en.xml` 后，GSC 当日显示「成功」，`en.xml` 已发现 318 个网页（原 7 个）
- [ ] GSC 新页请求索引：11-12 已提交 3 个（ttf-to-woff2 / font-subsetter / compress-woff2），配额命中；剩余 14 个待续跑（state 文件 `gsc-req-batch-state.json`，`done` 已记录 3 条）
- [x] **陈旧 sitemap 条目已清理（转为健康）**：GSC 当前版本**没有删除站点地图的入口**（行内 ⋮ 只有「查看网页索引编制/查看视频网页索引编制」，菜单完整 DOM 已确认仅 2 项）。改为让两个 URL 解析到有效 sitemap 后重新提交，当日即转「成功」：
  - `__sitemap__/zh.xml` → 301 → `zh-CN.xml`（200）→ 11-12 成功，318 网页
  - `www.onlitools.com/sitemap.xml` → 301 → `onlitools.com/sitemap.xml` → 301 → `sitemap_index.xml`（200）→ 11-12 成功（站点地图索引）
  - 结果：站点地图页红色错误清零，`sitemap_index.xml` 汇总发现 875 个网页
- [ ] 8 周后复查：新路由曝光、改标题页的 CTR 变化（对照「四、预期与检验」）

## 附：16 个月查询数据摘要（Top 意图簇）

| 簇 | 曝示 | 点击 | 查询数 | 平均排名 |
|---|---|---|---|---|
| font compress/subset | 2,165 | 187 | 36 | 16.5 |
| json/csv/text dev | 209 | 1 | 59 | 58.3 |
| image convert webp/heic | 41 | 0 | 23 | 50.6 |
| exif/metadata/gps | 11 | 0 | 10 | 86.2 |
| image resize/crop | 5 | 0 | 2 | 50.0 |
| id photo | 3 | 0 | 3 | 75.0 |

（注：查询表点击合计 189 与页面表 496 不等是 GSC 隐私阈值裁剪所致，方向性结论不受影响。2026-11-12 现场复核：查询表 254 行合计 190 点击 / 2,993 曝光，页面表 120 行合计 496 点击 / 8,282 曝光，卡片 496 点击 / 7,900 曝光。）
