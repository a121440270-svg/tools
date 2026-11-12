# 需求分析：图片合并（merge / combine images）

> 数据源：Google 自动补全 49 个 seed（en-US，2026-11-12）+ Google SERP 10 个查询（2026-11-12）+ GSC 16 个月现场复核（2026-11-12 15:55）+ 12 个竞品页逐个实测（2026-11-12）
> 原始数据：`C:\Users\Administrator\AppData\Local\Temp\opencode\{ac-merge.json,serp-merge-2026-11-12.json,serp-proof-1.png,gsc-verify.json,gsc-proof-verify.png,comp\teardown-cdp.json,comp\teardown-context.json}`
> 站点：onlitools.com　生成日期：2026-11-12

## 〇、数据来源与可复现（回应「你查了吗」）

| 数据 | 采集方式 | 时间 | 证据 |
|---|---|---|---|
| Google 自动补全 | `curl --proxy socks5h://127.0.0.1:4080 https://www.google.com/complete/search?client=chrome&hl=en&gl=us&q=<seed>`，49 个 seed，3 次重试 | 2026-11-12 12:2x | `ac-merge.json`（659 条去重建议） |
| Google SERP | CDP 连到**已登录的 Chrome** 的 google.com 标签页，同源 `fetch('/search?q=…&hl=en&gl=us&num=20')`，`DOMParser` 解析 `a h3`；10 个查询，HTTP 200，单页 ~900KB | 2026-11-12 12:31–12:32 | `serp-merge-2026-11-12.json`（含 status/bytes/ms）+ `serp-proof-1.png`（SERP 截图） |
| GSC 16 个月 | **现场重拉**：CDP 驱动已登录 Chrome 打开 `search-console/performance/...&num_of_months=16&breakdown=query`，DOM 读表；并对照 `breakdown=page` 校验总量 | 2026-11-12 15:55 | `gsc-verify.json`（254 行查询）+ `gsc-proof-verify.png`（后台截图） |
| 竞品产品拆解 | CDP 打开 12 个排名靠前的工具页，读渲染后正文 + `input[type=file]`/`canvas`/JSON-LD/hreflang/广告位/体积上限；`webfetch` 补抓被代理挡住的 piknova | 2026-11-12 15:1x–16:0x | `comp/teardown-cdp.json`、`comp/teardown-context.json` |

说明：GSC 只返回「已经给过我们曝光」的词，0 条 merge 是**现场拉取的事实**。另：查询表因匿名化只覆盖站点总量的一部分，绝对值以页面表/顶部卡片为准（见 2.1）。


## 一、结论

**能做，而且是目前证据最强的新工具方向**（核心短语 relevance 已到 1250/1252 上限，与 `ttf to woff2` 同级或更高）。但要做的是**一个真工具 + 2~3 个约束变体页**，不是一页 landing。

三个判断：

| # | 判断 | 依据 |
|---|---|---|
| 1 | 需求真实且巨大 | 49 个 seed 返回 **659 条去重建议**；`merge images`(1251)、`combine images into one`(1250)、`merge multiple images into one`(1250)、`merge two images into one`(1250) 全部顶格 |
| 2 | 供给完全空白 | 现场复核的 254 条 GSC 可见查询中 **0 条**含 merge/combine/join/collage/合并/拼接；120 个有曝光的页面无合并工具；这属于「有需求没供给」，不是「排名不好」 |
| 3 | 竞争可打，但要打窄 | 86 条 SERP 里 51% 是薄工具站；但逐个打开实测后，piknova / bulkpictools / mytools 这 3 个新站已经把「本地处理 + 无水印 + 多布局 + 间距控制」做成标配。头部排名仍被 2 张上限的 pinetools 占着，说明老站靠年龄/外链，新站靠内容深度——我们两样都不占优势，只能从**截图/长图 + 不重采样 + 体积可控**这个窄口切（见 2.5） |

**先做 `/merge-images` 一个真工具页，索引后 2~4 周再决定变体页**——理由见第六节。

## 二、证据

### 2.1 GSC：我方现状 = 完全隐身

2026-11-12 15:55 现场重拉（`num_of_months=16`，zh-CN 后台）：

| 指标 | 数值 | 口径 |
|---|---|---|
| 全站点击 / 曝光 | **496 / 7,900** | 顶部卡片（权威） |
| 平均点击率 / 平均排名 | 6.3% / 15.2 | 顶部卡片 |
| 查询表可见行数 | 254 | 查询表（被匿名化的长尾不在表内） |
| 查询表行合计 | 190 点击 / 2,993 曝光 | **低于站点总量，属正常**（GSC 匿名化） |
| 含 merge / combine / join / collage / stitch / 合并 / 拼接 的查询 | **0 / 254** | 精确过滤 |
| font-compress 单页 | 458 点击 / 5,294 曝光（92% 的全站点击） | `breakdown=page`，共 120 个页面 |
| 页面表行合计 | 496 点击 / 8,282 曝光 | 点击与卡片完全一致，曝光略高 |

> **口径提醒**：查询表合计（190/2,993）≠ 站点总量（496/7,900）。GSC 会把长尾查询匿名为「其他」，查询表永远加不出站点总量。判断站点规模用卡片/页面表，判断「有没有某个词」用查询表——两者不要混用。

GSC 只显示「Google 已经愿意展示给我们」的词。0 条不代表没需求，只代表**连一次曝光都没拿到**——这正是自动补全要补的盲区。反过来说，254 条里一条 merge 都没有，也说明这个簇对我们完全是空白市场。

### 2.2 自动补全：需求规模与意图拆解

49 个 seed → 659 条去重建议，按意图分簇（簇之间有意重叠，一条建议可命中多簇）：

| 簇 | 去重建议数 | 最高 relevance | 代表查询 | 判断 |
|---|---|---|---|---|
| A 合成一张图 | 96 | 1252 | combine photos into one (1252)、merge two images into one (1250)、merge multiple images into one (1250)、merge 3 images into 1 (1250) | **核心，必做** |
| B 并排 / 横竖 / 网格 | 78 | 1252 | merge images side by side online (750)、merge images horizontally online (601)、merge images vertically online (601)、combine images online grid (561) | **核心功能，做变体页** |
| C 转 PDF | 208 | 1251 | combine images into pdf (1251)、merge jpg to pdf (1251)、merge images to pdf (1250) | 独立工具（不同 job），**本轮不做** |
| D 工具名（joiner/merger/combiner/stitcher） | 164 | 1252 | merge images (1251)、image joiner online (601)、photo merger online free (1250)、image stitcher online (601) | 同义词，写进 H2/FAQ |
| E collage 拼图 | 33 | 1050 | collage maker free (1050)、photo collage maker free (800) | 需要模板体系，P2 |
| F 截图拼接 | 11 | 1250 | merge screenshots into pdf (1250)、merge screenshots into one image (600) | **低成本高转化**，做预设 |
| G overlay 叠加 | 19 | 1251 | overlay images online (1251)、overlay images with transparency (601) | 作为工具的一个模式，不单独开页 |
| H 无损 / 高质量 | 13 | 601 | image merge without losing quality (601)、merge images online without losing quality (600) | 差异化卖点（PNG 无损输出） |
| I AI 合成 | 32 | 750 | combine two images ai (750)、image merger ai (601) | 不做，非本工具语义 |
| J 教程 / 他平台 | 99 | 1252 | how to merge two images in canva (1251)、merge two photos iphone (1250)、how to merge images in photoshop (1250) | P2 博客文，导向工具 |

**关键读数**：A/B/D/F 四簇合计 300+ 条建议、最高分全部 ≥1250，且都是「动词 + 对象 + 布局」的工具型意图——与 `compress png to 1mb` 同一套可复制模式。J 簇（99 条）说明大量用户是在「找方法」而不是「找工具」，一篇 how-to 长文可以低成本截流。

### 2.3 SERP：86 条结果里 51% 是薄工具站，24% 是品牌

2026-11-12 12:31 实测（google.com，en-US，10 个查询 × 前 10 名 = 86 条自然结果）：

| 类型 | 数量 | 占比 | 代表 |
|---|---|---|---|
| 单功能薄工具站 | 44 | 51% | pinetools、imagecombiner、imagy、piknova、onlineconverter、mytools、bulkpictools |
| 大品牌 | 21 | 24% | canva、adobe、aspose、fotor、smallpdf |
| 独立小站 | 17 | 20% | mergeimages.net、codeshack.io、photojoiner、imageonline.co、tinywow |
| 论坛 / 教程 / PDF 工具 | 4 | 5% | reddit、forum.image.sc |

- **86/86 条标题都含 merge / combine / join / stitch** → 精确匹配标题是入场券，不是优势。
- 出现最多的域名：pinetools **9/10**、canva 8/10、imagecombiner 6、piknova 6、imagy 5、onlineconverter 5。
- **没有 Wikipedia / YouTube / Reddit 霸屏**（Reddit 仅 2 条），SERP 是「工具 vs 工具」，不是「内容 vs 内容」。

逐词难度：

| 查询 | 前 3 名 | 品牌数 | 难度 | 判断 |
|---|---|---|---|---|
| merge images | pinetools / imagecombiner / aspose | 2 | 6/10 | 可打，拼产品力 |
| merge images into one | imagecombiner / imagy / pinetools | 4 | 7/10 | head term，长期战 |
| combine images into one | imagecombiner / imagy / pinetools | 3 | 6/10 | 同上 |
| **merge images side by side** | pinetools / mytools / aspose | 2 | **5/10** | **主攻**（前二无品牌） |
| **merge images vertically** | pinetools / codeshack / imageonline | **0** | **3/10** | **最易切入** |
| merge screenshots into one image | imagecombiner / imagy / canva | 2 | 5/10 | 主攻（场景词） |
| merge images without losing quality | imagecombiner / imagy / imagelr | 2 | 6/10 | 用 H2/FAQ 覆盖 |
| merge two images into one free | imagy / canva / pinetools | 1 | 6/10 | 同页覆盖 |
| image joiner | old.photojoiner / pinetools / pi7 | 3 | 6/10 | 同义词覆盖 |
| photo joiner | photojoiner / mergeimages / microsoft | 2 | 7/10 | 有品牌站，放后面 |

判断（SERP 层面）：
- 品牌只占 24%，且多数排在第 3 名之后 → **前二可抢**。
- 最容易的入口：`vertically`（0 品牌）和 `side by side`（前二无品牌）。
- **注意**：`merge images into one` 的 SERP 会混入 PDF 语义（smallpdf），标题必须写清 "into one image"，避免被判成 PDF 意图。

> ⚠️ **本节只回答「谁在排名」。产品力谁强、我们能不能赢，见 2.5 的逐站实测——结论比这里更保守。**

### 2.4 中文需求（只作参考，不单独开 zh 页）

`图片合并` → 图片合并pdf (1250)、图片合并成一张 (602)、图片合并成图 (601)、图片合并在线 (600)、图片合并工具 (559)；`图片拼接` → 图片拼接在线 (750)、图片拼接工具 (602)。

中文需求同样成立，但站点非英文页目前合计曝光 <80/月（见 `docs/demand-analysis.md` 的 P2 结论）。**不新建中文专属页**，跟随六语言 i18n 一起覆盖即可。

### 2.5 在位者产品拆解（逐个打开实测，不是看标题猜）

2026-11-12 15:1x–16:0x，用 CDP 打开 12 个排名靠前的工具页，读取渲染后的正文、`input[type=file]`、`canvas`、JSON-LD、hreflang、广告位、体积上限等信号（原始数据 `comp/teardown-cdp.json`、`comp/teardown-context.json`）。

| 站点 | 代际 | 处理位置 | 布局 | 关键控制项 | 限制 | 水印/登录 | 内容深度 | 威胁 |
|---|---|---|---|---|---|---|---|---|
| **piknova.com** | 新（Next.js） | **本地**（明示不上传） | 横 / 竖 / 网格 / collage | 间距、边框、背景、透明、拖拽排序、4 种尺寸策略（缩小最大 / 放大最小 / 裁剪最大 / 不调整） | 输出最长边 4000px | 无 / 无 | 20+ FAQ + llms.txt + 竞品对比表 | ★★★★★ |
| **bulkpictools.com** | 新 | **本地** | 横 / 竖 / 网格 | 间距、背景、JPG/PNG/WebP 输出 | **文件数不限**，支持 **HEIC** | 无 / 无 | 2,084 词、**12 个 hreflang**、8 种 schema、竞品对比表 | ★★★★★ |
| **mytools.com** | 新 | **本地** | 横 / 竖 / 网格 | 间距、背景、顺序、实时预览 | 20 张 × 25MB | 无 / 无 | 807 词、9 hreflang、WebApplication + FAQPage | ★★★★ |
| **imagecombiner.com** | 中 | 本地 | 多布局 + 逐图编辑 | 布局、排序 | 未标明 | 有广告位 | 1,028 词、10 hreflang | ★★★☆ |
| **codeshack.io** | 中 | 本地 canvas | 横 / 竖 | 图片尺寸 | 未标明 | 无 / 无 | 667 词、FAQ、无 hreflang | ★★☆ |
| **pinetools.com** | 老 | 本地 canvas | 横 / 竖 | 边框粗细/颜色、尺寸策略 | **仅 2 张** | 广告 / 无 | **427 词**、无 FAQ、无 schema、无 hreflang | ★★★（排名最强，产品最弱） |
| **onlineconverter.com** | 老 | **服务器上传** | 横 / 竖 | 间距、背景 | 2/3/4 张，200MB | 无 / 无 | 615 词、无 schema | ★★ |
| **pi7.org** | 老 | 服务器 | 横 / 竖 | 基础 | 2 张 | 有登录引导 | 650 词 | ★★ |
| **imgonline.com.ua** | 极老 | 服务器 | 横 / 竖 | 基础 | 2 张 | 无 | **369 词** | ★ |
| **aspose.app** | 品牌 API | 服务端 | 横 / 竖 / 网格 | 边框、背景 | 免费层限制 | 引导付费 | 1,496 词、**53 hreflang**、5 种 schema | ★★★（品牌强，产品非最强） |
| **smallpdf.com** | PDF 品牌 | 服务端 | 无（转 PDF） | — | 免费每天 20 张 | 试用墙 | 1,325 词 | ★★（语义错位） |
| **canva.com** | 设计工具 | 服务端 | 模板 / 网格 | 模板、滤镜 | 登录 | 登录 | 1,167 词、22 hreflang | ★★★（品牌截流，意图不精确） |

**三个必须承认的事实：**

1. **排名 ≠ 产品力。** pinetools 在 10 个查询里出现 9 次，但它只支持 **2 张图**、427 个词、没有 FAQ、没有结构化数据、没有 hreflang。它靠的是年龄和外链。
2. **「本地处理 + 无水印 + 多布局 + 间距控制」已经不是差异化，是入场门槛。** piknova / bulkpictools / mytools 全都做到了，而且做得比我们原计划更细（尺寸策略、HEIC、无限张数、实时预览）。
3. **但这个 SERP 确实在换血。** piknova、bulkpictools、mytools 都是新站，靠「内容深度 + 结构化数据 + hreflang + 对比表」挤进前 10。这说明新站能进，只是必须用同一套工程化打法，不能只靠一个能用的工具。

**实测后仍然空着的位（12 个站点无人同时做到）：**

| 空位 | 现状 | 我们的做法 |
|---|---|---|
| **截图拼接不重采样** | piknova 提到但受 4000px 上限；其余要么缩放要么裁切 | 原生分辨率拼接，画布随内容增长，明确「不重采样」 |
| **合并后控制输出体积** | 全站无人做；用户合并完还要再去压缩 | 结果页直接给「压到目标 KB」入口，复用 `/image-compress` |
| **HEIC 输入** | 只有 bulkpictools | 复用站内 HEIC 解码路径 |
| **精确像素级间距/对齐** | 多数只有预设滑杆 | 数字输入 + 对齐参考线 |
| **工具闭环** | 竞品多为孤立工具 | merge → resize → compress → convert 四向内链 |

**竞争结论（修正版）**：不是「在位者都很烂所以随便赢」，而是「头部排名仍被老工具占着，但产品标准已经被 3 个新站抬高」。我们能赢的点必须更窄、更具体：**截图/长图场景 + 不重采样 + 体积可控 + 站内闭环**，而不是笼统的「免费无水印本地处理」。

## 三、做什么（页面矩阵）

| 优先级 | 路由 | 目标查询 | 标题（EN，精确匹配） | 类型 |
|---|---|---|---|---|
| **P1-a** | `/merge-images` | merge images / combine images into one / merge multiple images into one | **Merge Images Online — Combine Images Into One (Free)** | 真工具 |
| **P1-b** | `/merge-images-side-by-side` | merge images side by side online / horizontally | **Merge Images Side by Side — Combine Photos Horizontally, Free** | 约束页（预填 `?layout=horizontal`） |
| **P1-b** | `/merge-images-vertically` | merge images vertically online / merge screenshots into one | **Merge Images Vertically — Stack Photos & Screenshots Into One** | 约束页（预填 `?layout=vertical`） |
| P2 | `/jpg-to-pdf` | merge jpg to pdf / combine images into pdf | JPG to PDF Converter — Combine Images Into One PDF | 真工具（需 pdf-lib） |
| P2 | `/photo-collage` | collage maker free / photo collage maker | Photo Collage Maker — Free Grid Collage Online | 模板型工具 |
| P2 | 博客《How to Merge Images on iPhone, Canva & Photoshop》 | how to merge two images … | — | 教程长文，导向工具 |

**为什么 PDF 支线不做第一枪**：C 簇 208 条建议、量最大，但 SERP 是 iLovePDF / Smallpdf / Adobe / Sejda 的正面战场，且需要引入 `pdf-lib` + 页面/尺寸/方向一整套 UI，工作量≈图片合并的 1.5 倍。等 `/merge-images` 跑出索引和转化数据再评估。

**为什么变体页放 P1-b 而不是同批全上**：先让核心工具页拿到索引与曝光，再用真实 query 数据决定变体页写哪两个，避免又造 10 个薄页。

## 四、工具怎么做（技术规格）

### 4.1 交互（首屏即工具，不搞营销页套壳）

1. **添加图片**：多选文件、拖拽、Ctrl+V 粘贴；支持 JPG/PNG/WebP/GIF 首帧/BMP；HEIC 给 `/heic-to-jpg` 引导，SVG 给 `/svg-converter`。
2. **排序**：缩略图列表，上下移动按钮（可键盘操作）+ 拖拽手柄；每项可删除、可单独旋转 90°。
3. **布局**（对应查询簇）：
   - `horizontal` 横向拼接（默认「统一高度」）
   - `vertical` 纵向堆叠（**截图模式默认「不重采样」+ 间距 0**，画布随内容增长）
   - `grid` 网格（列数 2/3/4，自动行）
   - `overlay` 叠加（后续版本，G 簇）
4. **参数**：间距 gap(0–100px，可数字输入)、外边距 padding、背景（透明 / 取色 / 白）、对齐（start/center/end）、圆角、**尺寸策略**（缩小最大 / 放大最小 / 裁剪最大 / 不调整——对齐 piknova，缺一项就会被比下去）。
5. **导出**：PNG（透明、无损）/ JPG（质量滑杆）/ WebP；显示输出像素尺寸与预估文件大小；下载单文件；**「压缩到目标大小」按钮跳 `/image-compress?size=…`（全站竞品无人做，是我们的实打实差异点）**。
6. **本地处理声明**：仍要写，但**不要当卖点讲**——piknova / bulkpictools / mytools 都已经做到，这是入场门槛。真正的卖点放在「截图不重采样」和「输出体积可控」。

### 4.2 关键算法决策

- **横向默认「统一高度」**：所有图缩放到同一高度（默认取最高图，或用户指定 1080/1440），宽度按比例；否则输出会高低错落，用户第一眼就觉得「不对」。提供「原始尺寸」选项。
- **截图模式必须逐像素 1:1**：`vertical` + 尺寸策略 `none` 时，每张按原始像素绘制、画布高 = 各图高之和 + 间距，**一次重采样都不做**；这是对 piknova（4000px 上限）和所有「自动缩放」工具的正面差异。
- **尺寸策略 4 档**（与 piknova 对齐）：`reduce`（默认，大图缩到最小图）/ `magnify`（小图放大到最大图）/ `crop`（不缩放，从中心裁掉大图边缘）/ `none`（谁都不动，画布自适应）。
- **网格模式**：先算单元格边长 = min(总宽/列数, …)，每张 cover 裁切填充，保证整齐。
- **输出上限**：单边 ≤ 16384px、总像素 ≤ 100M；超出自动降采样并在 UI 提示实际输出尺寸（避免 Safari/iOS 画布空白）。
- **体积预估**：导出前用 `canvas.toBlob` 试编码一次拿到真实字节数（不是估算），超过 2MB 时直接提示「压到 1MB」入口。
- **EXIF 方向**：用 `createImageBitmap(file, { imageOrientation: 'from-image' })` 统一矫正；老浏览器回退 `loadLocalImage()`（现代浏览器 `drawImage` 已自动定向）。
- **内存**：顺序 decode，逐张绘制后释放 `ImageBitmap`；>20 张或单图 >50MP 时提示。

### 4.3 复用现有代码

| 能力 | 现有实现 |
|---|---|
| 读图 | `composables/useImageTools.js` → `loadLocalImage` |
| 编码 | `encodeCanvas(canvas, mime, quality)`（已处理浏览器不支持 WebP 的报错） |
| 下载 | `downloadBlob(blob, name)` |
| 体积格式化 | `formatFileSize` |
| 页面壳 | `components/ToolLandingLayout.vue`（badge/title/points/features）+ 长文 `ToolContentSection` |
| SEO | `composables/useToolSeo.ts`（title/description/keywords/faqItems/schema） |

新组件：`components/ImageMergerTool.vue`（约 400–500 行），页面 `pages/merge-images.vue` 只做壳 + SEO + 长文。

### 4.4 已知坑

| 坑 | 处理 |
|---|---|
| JPG 无 alpha，透明背景会变黑 | 选 JPG 时强制填充背景色并禁用「透明」 |
| iOS Safari 画布上限低（~16.7M px） | 超限自动缩放 + 提示 |
| HEIC 直接 decode 失败 | 捕获后提示并链接 `/heic-to-jpg` |
| 超大图导致标签页崩溃 | 单图 >50MP 或总量 >200MP 直接拒绝并说明 |
| GIF 动图 | 只取首帧，UI 明示 |
| 输出文件名 | `merge-{n}-images-{w}x{h}.png` |

### 4.5 工作量

| 项 | 估时 |
|---|---|
| `ImageMergerTool.vue`（布局/排序/导出/边界） | 1–1.5 天 |
| 尺寸策略 4 档 + 截图 1:1 不重采样 + 数字输入 | +0.5 天 |
| `/merge-images` 页面 + 长文 + FAQ | 0.5 天 |
| 六语言 i18n（~40 键 × 6） | 0.5 天 |
| 导航 / 内链 / tool-content / 校验 | 0.5 天 |
| **合计（P1-a）** | **约 3–3.5 天** |
| 两个变体页 | +0.5 天 |
| HEIC 输入（可选，接 wasm 解码） | +1 天 |

## 五、SEO 与工程接线清单（缺一不可）

1. **页面文件**：`pages/merge-images.vue`（静态路由 → `nuxt.config.ts` 的 `collectStaticRoutes()` 自动收进 prerender，无需手改列表）。
2. **i18n 六语言同批**：新增 `mergeTool.*`（title/lead/upload/layout/gap/padding/background/align/quality/export/localProcessing/faq q1-a4…）+ `imageTools.merge.title`（导航）+ `menu.mergeImages`。**绝不 EN-only 上线**（历史欠账的教训）。
3. **导航**：`layouts/default.vue` 的 `menu.image` 组加一条 `/merge-images`。
4. **长文**：`data/tool-content.ts` 新增 `'/merge-images'` 条目（heading + 2 段 + bullets），讲清「合并 vs 拼图 vs PDF」「无损条件」「隐私」。
5. **内链（双向）**：`/image-resizer`、`/image-cropper`、`/image-compress`、`/image-converter`、`/image-aspect-ratio`、`/heic-to-jpg` 的 related 块加 `/merge-images`；`/merge-images` 反向链接它们。
6. **结构化数据**：`useToolSeo({ faqItems })` 自动出 FAQPage + SoftwareApplication；标题里必须出现 "into one image"，避开 PDF 意图混淆。
7. **Sitemap**：prerender 列表已回灌 `@nuxtjs/sitemap`，静态页自动收录；部署后核对 `en.xml` 里出现 `/merge-images`。
8. **上线后**：`/merge-images` 立即请求索引（滚动 24h 配额，见 `gsc-indexing-requests`）；部署验证 title/canonical/200（`nuxt-cloudflare-deploy-verify`）；8 周后复测。

## 六、怎么获取流量（按投入产出排序）

**前提认知**：这个簇的 SERP 全是工具页，不是内容页。但 2.5 的实测证明，新站能进前 10 靠的是「工具够用 + 内容够深 + 结构化数据 + 多语言」，不是单靠功能。所以顺序是：先拿长尾，再啃 head term，同时把页面做成「竞品对比 + FAQ + 六语言」的完整资产。

| 顺序 | 渠道 | 具体动作 | 预期 | 成本 |
|---|---|---|---|---|
| 1 | **布局长尾（主攻）** | `/merge-images-side-by-side`、`/merge-images-vertically`，标题精确匹配；vertically 是 0 品牌 SERP | 4–8 周进前 20–30，8–12 周进前 10 | 0.5 天/页 |
| 2 | **场景长尾** | 同一页用 H2/FAQ 覆盖 `merge screenshots into one image`、`merge two images into one free`、`merge png/jpg files into one`、`without losing quality` | 跟随主页面起量 | 写作时间 |
| 3 | **内容深度（竞品已验证）** | 页尾放「vs PineTools / vs Canva / vs Smallpdf」对比表（PineTools 只有 2 张、Smallpdf 自己写「合成长图做不到」）；FAQ ≥ 15 问；六语言 hreflang 全上 | bulkpictools 靠这套进前 10，我们复制 | 0.5 天 |
| 4 | **head term** | `/merge-images` 标题 = `Merge Images Online — Combine Images Into One (Free)`；靠内链 + 时间 + 外链 | 3–6 个月进前 20 | 持续 |
| 5 | **教程截流** | 一篇长文《How to Merge Images on iPhone, Canva, Photoshop & Word》，每节末尾 CTA 到工具；发布到 D1 博客 + Blogger | 抢 J 簇 99 条 how-to 查询，转化率高（用户已在找方法） | 0.5 天 |
| 6 | **站内权重传导** | 6 个图片工具页 related 块 + 唯一有权重的 `/font-compress` 侧栏加一条 Image tools 链接；首页 image 组导航 | 让新页 1–2 周内被抓取 | 0.5 天 |
| 7 | **索引** | sitemap 自动收录 + GSC 逐条请求索引（滚动 24h ~10 条）；用内链让 Googlebot 自然发现 | 1–2 周索引 | 10 分钟/批 |
| 8 | **站外（低成本）** | ① Reddit（r/photoshop、r/software）真实回答带工具链接；② StackOverflow 用 canvas 代码回答「programmatically merge images」并附工具；③ Product Hunt / 工具目录一次性 launch 拿首批外链 | 首批外链 + 早期点击 | 各 1–2 小时 |
| 9 | **转化与回访** | 结果页放「压缩到目标大小 → /image-compress」「改尺寸 → /image-resizer」「转格式 → /image-converter」；**不重采样 + 体积可控**做口碑 | 提升单次会话页数 | 已有组件 |

**不要做的**：买外链、批量提交目录站、给每个长尾都开独立页（薄内容）、在 Reddit 硬发链接（会被封）。

**真实预期曲线**（低权重新站）：
- 1–2 周：索引，0–50 曝光
- 4–8 周：布局长尾开始有曝光，排名 20–40
- 3 个月：vertically / side-by-side 进前 20，簇曝光 300–800/月
- 6 个月：head term 进前 20，簇曝光 1,500–3,000/月

## 七、风险与不做的事

| 风险 | 应对 |
|---|---|
| 薄内容被判低质 | 必须是真工具 + 长文 + FAQ；不做「只有 CTA 的 landing」 |
| 变体页重复内容 | 每页独立 H1/FAQ/示例图，CTA 带不同预填参数；先上 1 个看数据 |
| 与 `/image-resizer` 语义重叠 | 分工写进两页文案：resizer=单图改尺寸，merge=多图合成一张 |
| 大站（Canva/Adobe）压制 | 打长尾（side by side / vertically / screenshots / without losing quality），不硬刚 head term |
| **新入场者已把产品标准抬高**（piknova / bulkpictools / mytools） | 不拼「本地处理/无水印」（已是标配），拼**截图 1:1 不重采样 + 输出体积可控 + 站内闭环**；每季度复测一次竞品功能表 |
| 性能问题劝退 | 首屏 3 张示例图 + 上限提示；大图自动降采样 |
| 一次开 10 个变体页 | 禁止。核心页索引后再按真实 query 扩 |

## 八、验收指标

| 时点 | 指标 | 目标 |
|---|---|---|
| 上线 3 天 | 部署验证 | `/merge-images` 200、title 正确、sitemap 含该 URL、已提交索引 |
| 2 周 | 索引 + 首批曝光 | GSC 出现 merge 簇查询（≥10 条） |
| 8 周 | 曝光 / 点击 / 排名 | 簇曝光 ≥ 500/月；至少 1 条 side-by-side 长尾进前 20；CTR ≥ 1.5% |
| 8 周 | 竞品对标 | 至少 2 项功能领先（截图 1:1、输出体积控制），并在页面显式写出对比表 |
| 8 周 | 使用信号 | 有下载事件（GA4 若已埋点）→ 决定是否上 PDF 支线 |

> 任何页面 8 周内不下结论（沿用 `docs/demand-analysis.md` 的纪律）。
