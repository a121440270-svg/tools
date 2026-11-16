# onlitools 现有工具需求调查与成功率评估

> 数据日期：2026-11-13 ｜ 市场：Google US / en ｜ 站点：onlitools.com
> 数据源：GSC 16 个月页面表（2025-08 ~ 2026-11）、Google 自动补全 49 个 seed、Google Trends 12 个月（21 组，含 image compressor 锚点）、真实 Google SERP 37 个查询（hl=en&gl=us）
> **Keyword Planner 未取到**（需 Ads 登录，见第 9 节）。本文所有量级均为 Trends 相对值，不是月搜索量。
> **重要前提：45 个评分单元里 39 个上线不满 2 个月**（2026-09-17 之后的四批）。对它们，GSC 的 0 曝光是「还没被评估」，不是「失败」。

---

## 一、结论（TL;DR）

1. **整站只有一个真实成功的工具：`/font-compress`** —— 16 个月 5,317 曝光 / 462 点击 / 均位 12.7，占全站点击 94%。它在 `font compressor` 的真实 SERP 里排第 7（前 6 位是 fontcompressor.com、fontsource、youcompress、fonts2u、nanofile、memejpg）。
2. **它的成功不是因为词大，恰恰是因为词小。** `font compressor` 的 Trends 量级只有 `image compressor` 的 **1.7%**，竞争 5/5，但意图独占、无大品牌、可做深。**这是本站唯一被验证的商业模式：小词 + 精准工具 + 长期积累。**
3. **图像簇是「需求最大、竞争最狠、权重为零」的组合**：16 个月 106 曝光 / 0 点击。`heic to jpg`（相对需求 5.09）、`image converter`（2.52）、`png to webp`（2.0）都是大需求，但 SERP 前 10 被 cloudconvert / adobe / canva / iloveimg / tinypng 占满，且 37/37 个查询都出现 AI Overview。**不能把它当增长引擎，只能选 1–2 个做差异化。**
4. **最该马上做的不是新页，而是 5 个老页的「最后一公里」**：
   - `/json-csv-convert` 均位 **23.6**（唯一在第 3 页的老页）；
   - `/hash-text` 118 曝光、均位 50.4（标题和 `hash generator` 不对齐）；
   - `/case-converter`（旧 `/uppercase`）152 曝光、**0 点击**、均位 41.5，301 已生效但权重未转移；
   - `/font-compress` CTR 只有 8.7%，同位置可到 12%+；
   - WebP 三个 URL 互抢，且都不在 sitemap 里。
5. **25 个「约束意图页」（compress png to 200kb 之类）应该停止扩张**。5 个族全部 26% / D 档，25 页合计 0 曝光，模板同质、关键词在 Trends 里全部为 0，SERP 上是 11zon / cloudinary / iloveimg 这类批量页。**保留 3–4 页，其余到期 301 合并。**
6. **元数据簇是「页数过剩、意图重叠」的典型**：7 个单元 25 曝光 0 点击。真正的入口词是 `image info`（相对需求 1.65，SERP 全是小型 metadata viewer，竞争 3），应该以它为簇入口，`remove exif` / `gps remover` 做子意图，其余 3 页合并。
7. **明确不做**：AI 图像/视频生成（需求 14/11，但 SERP 5/5 全大牌 + 成本）、`/id-photo`（SERP 5/5 + YMYL + 均位 61.7）、`json formatter`（品牌垄断）、`font validator / unicode / size analyzer`（需求 ≈ 0）。

---

## 二、组合现状：90% 的页面还在观察期

| 批次 | 上线时间 | 页数 | GSC 表现 |
|---|---|---:|---|
| 老页（≥11 个月） | 2025-04 ~ 2025-12 | 6 个单元 | 唯一有曝光的资产（font-compress、hash、token、json-csv、uppercase、WebP） |
| 中期页（1.9 个月） | 2026-09-17 | 6 个单元 | id-photo 68 曝光、date-format 51，其余 0 |
| 新页（<1 个月） | 2026-10-29 / 11-12 | **33 个单元** | 几乎全 0 |

**读法**

- 39/45 个单元上线不满 2 个月，按上一轮结论「8 周内不下结论」，它们的分数只代表**结构可行性**，不代表已被证伪。
- 真正能用来判断方法论的样本只有 6 个老页。这 6 个里：1 个成功（font-compress）、2 个「有曝光但点击几乎为零」（hash 118/2、uppercase 152/0）、1 个「第 3 页」（json-csv）、2 个「有曝光但均位 50+」（WebP）。
- 所以本次评估的重点不是「哪些新页失败了」，而是**「哪些页在结构上就不可能赢」**——竞争 5/5 + 需求为 0 + 站点零权重，三者同时成立时才判死。

---

## 三、评分模型

### 3.1 定义

**成功率 P = 该页 12 个月内进入目标查询自然结果前 10、并稳定获得点击的概率**（启发式排序值，不是统计预测）。

```
P = 100 × ( 0.35×D/5 + 0.25×T/5 + 0.25×(5−C)/5 + 0.15×F/5 )

D = 需求   = max( Trends 相对值分桶 , 本页 GSC 曝光分桶 )
T = 簇级牵引力 = 站点在该查询簇已被 Google 验证的程度（0–5）
C = SERP 竞争（1–5，5 最难，来自真实 SERP 前 10 构成）
F = 站点适配（0–5：有无真实实现、内容深度、内链位置、是否独占语义）
```

**护栏（防止「低竞争 + 零需求」被算成好机会）**

| 条件 | 处理 | 理由 |
|---|---|---|
| D ≤ 1 | P 上限 28（D 档） | 没人搜的页面不可能「成功」，竞争再低也没用 |
| D ≤ 2 | P 上限 45（B 档） | 微需求只值一次标题级投入 |
| F ≤ 1 | P 上限 30（D 档） | 没有真实供给（AI 类）不该给高分 |

档位：A ≥ 60，B ≥ 45，C ≥ 30，D < 30。

### 3.2 为什么 D 和 T 分开

上一版模型把「本页曝光」同时算进需求（D）和牵引力（T），导致 `font-compress` 仅凭历史数据就拿到 75%。现在：

- **D 用 Trends 为主、本页 GSC 为辅**：没有 GSC 不代表没需求，Trends 能补；
- **T 用簇级而非页级**：字体簇已被证明能排到 12.7 位，这个「能力」对新页是可继承的；图像簇没有，就不给；
- 这样 `ttf-to-woff2` 才能拿到 64%（簇能力 5 + 需求 3），而 `font-validator` 仍然只有 28%（需求 0.5 触发护栏）。

### 3.3 分桶规则

| Trends 相对值 | 分桶 | | GSC 曝光 | 分桶 |
|---|---|---|---|---|
| ≥ 5 | 5 | | ≥ 1000 | 5 |
| ≥ 2 | 4.5 | | ≥ 300 | 4.5 |
| ≥ 1 | 4 | | ≥ 100 | 4 |
| ≥ 0.5 | 3.5 | | ≥ 30 | 3 |
| ≥ 0.2 | 3 | | ≥ 10 | 2 |
| ≥ 0.05 | 2 | | ≥ 1 | 1 |
| ≥ 0.01 | 1 | | 0 | 0 |
| < 0.01 | 0.5 | | | |

### 3.4 已知偏差（必须一起读）

| 偏差 | 影响 | 处理 |
|---|---|---|
| 新页 T=簇级、D 无历史 | 新页分数系统性偏高或偏低 1 档 | 用 † 标观察期，**只看结构不看分** |
| Trends 长尾量化到 0–1 | `font subsetter`、`compress woff2` 这类词被判为 0.5 | 用自动补全 rel（601–1250）校准，已在表内修正 |
| 锚点噪声 ±2–3x | 同一词在不同组里做锚点差 4–59 | 相对值只用于**同簇内部排序**，不跨簇比大小 |
| SERP 采样一次性 | 个性化 / 地域漂移 | 37 个查询均 `hl=en&gl=us&pws=0`，同一天采完 |
| C 值有外推 | 约束页族、jpg 约束页、exif editor 等未单独采样 | 表内 C 有 37 个实测，其余按同族外推 |

---

## 四、簇级结论

| 簇 | 评分单元 | 16 个月曝光 | 点击 | 均分 | 结论 |
|---|---:|---:|---:|---:|---|
| 字体 | 9 | 5,317 | 462 | 41 | **唯一资产**。1 个主攻 + 1 个押注 + 3 个维持，其余 4 个合并/停投 |
| 开发/文本 | 8 | 440 | 2 | 55 | **结构分最高但没点击**。json-csv、hash、case 三页是「最后一公里」问题 |
| 图片 | 10 | 106 | 0 | 50 | 需求最大、竞争最狠、权重为零。只押 HEIC + 修 resizer，其余不投 |
| 元数据 | 7 | 25 | 0 | 40 | 页数过剩、意图重叠。以 image-info 为入口，合并 2 个真重复页（保留唯一的编辑页 exif-editor） |
| 编码 | 3 | 0 | 0 | 47 | 顺手工具，维持即可 |
| 约束页 | 5（25 页） | 0 | 0 | 26 | **停止扩张**，到期收缩到 3–4 页 |
| 证件照 | 1 | 68 | 1 | 37 | 不做（SERP 5/5 + YMYL + 均位 61.7） |
| AI | 2 | 0 | 0 | 30 | 不做（无供给优势） |

分布：**A 档 5 个、B 档 20 个、C 档 7 个、D 档 13 个**；判断列：主攻 1、押注 3、加码 5、维持 17、合并 6、冻结 5、停投 4、不做 3、收敛 1。

---

## 五、45 个评分单元明细

`†` = 上线不满 2 个月，分数只代表结构可行性。「曝光/点击/均位」为该页（或该族合计）GSC 16 个月数据。

| 簇 | 工具 / 页面 | 主关键词 | Trends 相对值 | 曝光/点击/均位 | 页龄 | 成功率 | 档 | 判断 | 调整方向 |
|---|---|---|---:|---|---:|---:|---|---|---|
| 字体 | Font Compressor | font compressor | 0.017 | 5317 / 462 / 12.7 | 16月 | **75%** | A | 主攻 | 加码：唯一有权重页，做内链枢纽 + 首屏 CTR 优化 |
| 字体 | TTF→WOFF2 | ttf to woff2 | 0.35 | 0 / 0 / — | <1月† | **64%** | A | 押注 | P1 押注：需求真实（AC 1250），补 exact 标题与首屏内链 |
| 字体 | Font Subsetter | font subsetter | 0.15 | 0 / 0 / — | <1月† | **45%** | B | 维持 | 保留：SERP 有缝（fontsource 为主），主打 google font subset |
| 字体 | Font Inspector | font inspector | 0.05 | 0 / 0 / — | <1月† | **45%** | B | 维持 | 改定位：SERP 以 Chrome 扩展为主，在线仅 fontdrop/opentype.js，做「Font Inspector Online」 |
| 字体 | Compress WOFF/WOFF2 | compress woff2 | 0.02 | 0 / 0 / — | <1月† | **28%** | D | 合并 | 合并：两页同一意图，留 1 页，另一页 301 |
| 字体 | Font CSS Generator | @font-face generator | 0.03 | 0 / 0 / — | <1月† | **28%** | D | 维持 | 修标题：真实查询是 @font-face generator |
| 字体 | Font Size Analyzer | font size analyzer | ~0 | 0 / 0 / — | <1月† | **28%** | D | 停投 | 停投：竞争极低但没人搜，无查询空间 |
| 字体 | Font Unicode Checker | font unicode checker | ~0 | 0 / 0 / — | <1月† | **28%** | D | 停投 | 停投：保留为 font-compress 的子功能，不做独立页 |
| 字体 | Font Validator | font validator | ~0 | 0 / 0 / — | <1月† | **28%** | D | 停投 | 停投：需求 ~0，SERP 是 CVE/插件，意图错配 |
| 开发 | Hash Text | hash generator | 0.136 | 118 / 2 / 50.4 | 18.7月 | **64%** | A | 加码 | P0 修标题：118 曝光均位 50.4，标题与 hash generator 不对齐 |
| 开发 | JSON Compare | json compare | 0.439 | 0 / 0 / — | <1月† | **62%** | A | 维持 | 保留小修：竞争中等，打 diff 语义 |
| 开发 | Case Converter | case converter | 1.41 | 152 / 0 / 41.5 | <1月† | **61%** | A | 加码 | P0 收尾：旧 /uppercase 301 已生效，清理站内旧链 + 请求索引等权重转移 |
| 开发 | Token Generator | random token generator | 0.05 | 55 / 0 / 31.8 | 18.7月 | **58%** | B | 维持 | 修标题：55 曝光均位 31.8，改完等 8 周 |
| 开发 | JSON↔CSV | json to csv | 0.488 | 64 / 0 / 23.6 | 14.6月 | **57%** | B | 加码 | P0 最强单点：64 曝光均位 23.6，唯一接近首页的老页 |
| 开发 | JSON Formatter | json formatter | 0.909 | 0 / 0 / — | 1.9月† | **55%** | B | 停投 | 不投：SERP 5/5（jsonformatter.org + AIO），进去也是陪跑 |
| 开发 | Date Format | timestamp converter | 0.25 | 51 / 0 / 43.1 | 1.9月† | **54%** | B | 加码 | P1 改标题：51 曝光均位 43.1，真实词是 timestamp converter |
| 开发 | Text Dedup | remove duplicate lines | 0.024 | 0 / 0 / — | <1月† | **28%** | D | 维持 | 保留：`text dedupe` AC 1250，标题补 tool 措辞 |
| 图片 | HEIC→JPG | heic to jpg | 5.09 | 0 / 0 / — | <1月† | **56%** | B | 押注 | P1 押注：需求最高（5.09），差异化 = 批量 + 本地不上传 |
| 图片 | Image/PNG/JPG→WebP | png to webp | 2 | 58 / 0 / 33.7 | 13.2月 | **52%** | B | 收敛 | 收敛：同一模板 3 个 URL 互抢，canonical 到 1 页 |
| 图片 | WebP→PNG/JPG | webp to png | 2 | 15 / 0 / 53.9 | 13.2月 | **52%** | B | 维持 | 保留：15 曝光均位 53.9，两页合并成 1 页双向 |
| 图片 | Image Converter | image converter | 2.52 | 0 / 0 / — | <1月† | **52%** | B | 维持 | 观察：需求第二大，SERP 5/5，等权重再投 |
| 图片 | SVG Converter | svg converter | 0.91 | 0 / 0 / — | <1月† | **50%** | B | 维持 | 保留：SERP 有独立小站，收窄到 SVG→PNG |
| 图片 | Increase Image Size | increase image size | 0.5 | 0 / 0 / — | <1月† | **50%** | B | 维持 | 改定位：KB 与尺寸放大是两个意图，标题必须二选一 |
| 图片 | Image Resizer | image resizer | 1.39 | 33 / 0 / 46.8 | <1月† | **49%** | B | 加码 | 修标题：33 曝光均位 46.8，已进候选池，补 px/KB 双模式 |
| 图片 | Image Compressor | image compressor | 1 | 0 / 0 / — | 1.9月† | **49%** | B | 维持 | 差异化：不抢 head，做「批量 / 不上传 / 目标体积」 |
| 图片 | Merge Images | merge images | 0.45 | 0 / 0 / — | <1月† | **47%** | B | 维持 | 保留：SERP 有独立小站，可接上一轮拼版结论 |
| 图片 | Image Cropper | image cropper | 0.29 | 0 / 0 / — | <1月† | **42%** | C | 合并 | 合并：SERP 大牌占满，降为 resizer 的 H2 模式 |
| 元数据 | Image Info | image info | 1.65 | 0 / 0 / — | <1月† | **55%** | B | 押注 | P1 押注：SERP 全是小型 metadata viewer，而 image info 正是该簇头部词，做簇入口页 |
| 元数据 | Image Metadata | image metadata | 0.935 | 19 / 0 / 60.4 | <1月† | **49%** | B | 维持 | 改标题：19 曝光均位 60.4，向 Image Metadata Viewer 靠 |
| 元数据 | GPS Remover | gps remover | 0.271 | 5 / 0 / 25.8 | <1月† | **45%** | B | 维持 | 保留：5 曝光均位 25.8，簇内唯一有实质曝光且进前 30 的页 |
| 元数据 | Remove EXIF | remove exif | 0.102 | 0 / 0 / — | <1月† | **38%** | C | 维持 | 做该簇「移除」子意图的唯一主页面，接住 2 条 301 |
| 元数据 | Metadata Analyzer | photo metadata viewer | 0.05 | 0 / 0 / — | <1月† | **38%** | C | 合并 | 合并：与 image-info 同组件，301 → image-info |
| 元数据 | Metadata Remover | image metadata remover | ~0 | 1 / 0 / 3 | <1月† | **28%** | D | 合并 | 合并：与 remove-exif 同组件，301 → remove-exif |
| 元数据 | EXIF Editor | exif editor | ~0 | 0 / 0 / — | <1月† | **28%** | D | 合并 | 合并：需求 ~0，编辑能力不足，301 到 remove-exif |
| 编码 | Aspect Ratio | aspect ratio calculator | 0.25 | 0 / 0 / — | <1月† | **49%** | B | 维持 | 保留：竞争 2.5（低），可吃「16:9 calculator」长尾 |
| 编码 | Color Picker | color picker from image | 0.5 | 0 / 0 / — | <1月† | **48%** | B | 维持 | 保留：需求 0.5，与 image-info 互链 |
| 编码 | Image↔Base64 | image to base64 | 0.254 | 0 / 0 / — | <1月† | **44%** | C | 合并 | 合并：两页合成 1 页双向转换，301 掉另一个 |
| 约束页 | Compress PNG to KB/MB（6 页） | compress png to 200kb | 0.02 | 0 / 0 / — | <1月† | **26%** | D | 冻结 | 冻结：到期只留 200kb/1mb 两页，其余 301 |
| 约束页 | Compress JPG to KB/MB（7 页） | compress jpg to 200kb | 0.02 | 0 / 0 / — | <1月† | **26%** | D | 冻结 | 冻结：7 页抢同一意图，保留 200kb/1mb |
| 约束页 | Image Compress to KB（6 页） | compress image to 100kb | 0.02 | 0 / 0 / — | <1月† | **26%** | D | 冻结 | 冻结：不新增；到期只留 100kb/200kb |
| 约束页 | Compress Image to 250kb/2mb/5mb | compress image to 250kb | 0.02 | 0 / 0 / — | <1月† | **26%** | D | 冻结 | 冻结：与上族同模板同意图，到期 301 合并 |
| 约束页 | Reduce Image Size（3 页） | reduce image size to 250kb | 0.02 | 0 / 0 / — | <1月† | **26%** | D | 冻结 | 冻结：reduce 动词空间应作 H2 并入主压图页 |
| 证件照 | ID Photo | passport photo maker | 0.15 | 68 / 1 / 61.7 | 1.9月† | **37%** | C | 不做 | 不做：68 曝光均位 61.7，SERP 5/5 + YMYL，上一轮已否决 |
| AI | AI Image Generator | ai image generator | 14 | 0 / 0 / — | 1.9月† | **30%** | C | 不做 | 不做：需求最大但 SERP 全大牌 + AIO，无供给优势 |
| AI | AI Video Generator | ai video generator | 11 | 0 / 0 / — | 1.9月† | **30%** | C | 不做 | 不做：同上，成本与合规风险更高 |

> `json formatter` 55% / B 档，但判断是「停投」：它的分来自需求（0.909）和站点适配（3.5），模型无法表达「jsonformatter.org 十年品牌 + jsonlint 双寡头 + AI Overview」这种结构性垄断。**判断列优先于分数。** 同理 `font css generator` 28% 仍「维持」——它只值一次标题修改，不值一个项目。
>
> `Case Converter` 页龄显示 <1 月，但它的曝光来自旧 URL `/uppercase`（2025-12 上线、已 301），数据等效于 11 个月老页。

---

## 六、逐簇调整方向

### 6.1 字体簇（9 个单元，唯一有资产的簇）

**事实**

- `font-compress`：5,317 曝光 / 462 点击 / 均位 12.7 / CTR **8.7%**；在 `font compressor` SERP 排第 7。
- 簇内其余 8 页：全部 <1 月，0 曝光。
- `ttf to woff2` SERP：cloudconvert、fontsource、everythingfonts、routenote、freefileconvert、Microsoft Store —— **有 3 个小站可复制**，不是死局。
- `font subsetter` SERP：everythingfonts、fontsubset.com、fonts.google.com、fonttools 文档、GitHub —— **工具站只有 2 个**，是字体簇里竞争最松的。
- `font validator` SERP：全部是 GitHub / softonic / 博客 / CVE 讨论 —— 意图不是在线工具。

**动作**

| 优先级 | 动作 | 依据 |
|---|---|---|
| P0 | `font-compress` 首屏加「压缩前后体积对比 + 支持 TTF/OTF/WOFF/WOFF2 + 不上传」三件套，目标 CTR 8.7% → 12% | 均位 12.7、曝光 5,317，CTR 是唯一可控杠杆 |
| P0 | 把 `ttf-to-woff2`、`font-subsetter`、`compress-woff2` 提到 `font-compress` 正文首屏（现在只在页脚相关工具块） | 唯一权重页传相关性，比新建 10 页有效 |
| P1 | `ttf-to-woff2` 标题改 `TTF to WOFF2 Converter — Free, Online, Batch`，H2 覆盖 `woff2 to ttf` | AC：`ttf to woff2 converter` 1250、`free` 601、`online` 600 |
| P1 | `font-subsetter` 主打 `google font subset` / `subset font online`，CTA 指向 font-compress 的子集功能 | AC：`google font subsetter` 552、`font subsetter online` 601 |
| P2 | `font-inspector` 改「Font Inspector Online — Inspect Fonts in URL/Image」 | SERP 只有 fontdrop.info、opentype.js 两个在线工具 |
| 合并 | `compress-woff` → `compress-woff2`（301）；`font-unicode-checker`、`font-size-analyzer` 并入 `font-compress` 的功能说明 | 需求 ≈ 0（Trends 0、AC 无独立补全） |
| 停投 | `font-validator` | SERP 无工具意图 |

**不要做**：把字体簇做成「字体工具箱」大而全的导航页。font-compress 赢在单点做深。

### 6.2 开发/文本簇（8 个单元，结构分最高、点击最少）

**事实**

- `/hash-text` 118 曝光 / 2 点击 / 均位 **50.4**；SERP 前 9 全是小工具站（md5hashgenerator、browserling、emn178、bcrypt.online、keycdn），**没有大品牌**。
- `/json-csv-convert` 64 曝光 / 0 点击 / 均位 **23.6**（第 3 页，唯一接近首页的老页）；SERP：convertcsv、konklone、data.page、jsonformatter、jsonlint。
- `/uppercase`（已 301 到 `/case-converter`）152 曝光 / **0 点击** / 均位 41.5；`case converter` SERP 有 8 个专用站（convertcase.net、textmagic、caseconverter.cc、lexilogos…）。
- `/token-generator` 55 曝光 / 0 点击 / 均位 31.8；SERP：it-tools、openreplay、generate-random、w3schools。
- `/date-format` 51 曝光 / 0 点击 / 均位 43.1，但页面标题是「Date Format」，真实查询是 `timestamp converter`（SERP：epochconverter、unixtimestamp、site24x7）。

**动作**

| 优先级 | 动作 | 依据 |
|---|---|---|
| P0 | `json-csv-convert` 冲首页：标题 exact `JSON to CSV Converter — Free, Online`，加 `CSV to JSON` H2 + 大文件/嵌套 JSON 示例，从首页与 font-compress 正文加内链 | 均位 23.6，是唯一「只差一步」的老页 |
| P0 | `hash-text` 标题改 `Hash Generator — MD5, SHA-1, SHA-256 Online`，并补**文件 hash**（现在只有文本） | 均位 50.4 + 118 曝光说明已进候选池；SERP 无大品牌 |
| P0 | `/uppercase` 合并收尾：确认 301 保留查询权重；在 `case-converter` H1/H2 写入 `uppercase to lowercase`；提交索引 | 152 曝光 0 点击，是「标题不对齐」的教科书案例 |
| P1 | `date-format` 标题改 `Timestamp Converter — Unix/Epoch to Date`（保留 date format 作 H2） | 51 曝光均位 43.1，词错配 |
| P1 | `text-dedup` 标题补 `Dedupe`：`Remove Duplicate Lines — Text Deduplicator` | AC `text dedupe` 1250 |
| 维持 | `token-generator`、`json-compare` | 已改标题/新页，等 8 周 |
| 停投 | `json-formatter` | 品牌 + AIO 双杀，无差异化空间 |

**共性判断**：这一簇不需要新页，需要**把已有页面的标题改成用户真实搜索的词**。均位 23–50、曝光 50–150，是「改标题就能动」的区间。

### 6.3 图片簇（10 个单元，106 曝光 0 点击）

**事实**

- 需求侧最强：`heic to jpg` 相对 5.09、`image converter` 2.52、`png to webp` 2.0、`image resizer` 1.39、`image compressor` 1.0。
- 供给侧最弱：SERP 前 10 全是 cloudconvert / adobe / canva / iloveimg / tinypng / squoosh / freeconvert / ezgif，**37/37 查询有 AI Overview**。
- 站点侧：13 个月的老页 `/image-to-webp` + `/png-to-webp` + `/jpg-to-webp` 合计只有 58 曝光、均位 33.7、0 点击；`/webp-to-png` + `/webp-to-jpg` 合计 15 曝光、均位 53.9。
- **结构 bug**：`/image-to-webp`、`/png-to-webp`、`/jpg-to-webp` 由同一个 `[format]-to-webp.vue` 渲染，其中 `/image-to-webp` 命中 `format="image"`，标题退化成「JPG/PNG to WebP」，与另两页近重复；三页**都不在 sitemap**（en.xml 319 条 URL，WebP 相关 0 条）。

**动作**

| 优先级 | 动作 | 依据 |
|---|---|---|
| P0 | WebP 收敛：保留 `/png-to-webp`、`/jpg-to-webp`（format 感知标题已实现），`/image-to-webp` 301 到 `/png-to-webp`，导航改指 `/png-to-webp` | 三页互抢同一意图，且都在 sitemap 外 |
| P0 | 把 `/png-to-webp`、`/jpg-to-webp`、`/webp-to-png`、`/webp-to-jpg` 加进 prerender / sitemap | `collectStaticRoutes()` 跳过 `[param]`，动态页全部漏掉 |
| P1 | **HEIC→JPG 押注**：批量转换 + 本地不上传 + 「iPhone 照片为什么是 HEIC」正文 + 转换前后尺寸表；目标 8 周 300 曝光 | 需求最高（5.09），且 HEIC 是 iPhone 用户刚需、有内容可写 |
| P1 | `image-resizer` 标题改 `Resize Image to Exact Pixels or KB`，把 px / KB / 百分比做成三模式 | 33 曝光均位 46.8，已进候选池；`photo resizer in kb` AC 557 |
| P2 | `merge-images` 接上一轮「打印拼版」结论（A4/4×6 网格 + 裁切线） | `print multiple photos on one page` SERP 有 2 个独立小站 |
| 合并 | `image-cropper` → `image-resizer` 的 H2 模式 | SERP 5/5（imageresizer、iloveimg、adobe、canva、croppola） |
| 维持不投 | `image-compress`、`image-converter`、`svg-converter`、`increase-image-size` | 需求真实但 SERP 5/5；等站点有权重再说 |

**判断**：图像簇的正确目标是「1–2 个差异化页跑通」，不是「13 个工具全面铺开」。现在的 13 个 URL 摊薄了本就为零的权重。

### 6.4 元数据簇（7 个单元，25 曝光 0 点击）

**事实**

- `image info` 相对需求 **1.65**（该簇最高），SERP 前 9 全是小型 metadata viewer（pics.io、jimp、metadata2go、exif.tools、exifinfo.org、onlineexifviewer、pic2map、picstack）——**没有一个是大品牌，也没有一个是「专用大站」**。
- `image metadata` 19 曝光 / 均位 60.4；`gps remover` 5 曝光 / 均位 **25.8**（该簇唯一有实质曝光且进前 30 的页）。
- `remove exif` SERP：exifremover、verexif、jimp、metadata2go、pics.io、tinypngnow、imagy、exifremove —— 8 个小站，竞争 4，可打。
- 现有 7 个页面里，`metadata-analyzer` 与 `image-info` **渲染同一个组件**（查看），`image-metadata-remover` 与 `remove-exif` **渲染同一个组件**（移除），属真重复；`exif-editor` 是独立的编辑工具（`ExifEditorTool`，仅 JPEG），需求虽 ≈ 0 但功能不重复，保留。

**动作**

| 优先级 | 动作 | 依据 |
|---|---|---|
| P0 | 2 条 301：`metadata-analyzer` → `image-info`；`image-metadata-remover` → `remove-exif`。保留 `exif-editor` | 同一意图多个 URL 互相稀释；但只合并渲染同一组件的真重复页，不牺牲唯一的编辑能力 |
| P1 | `image-info` 做簇入口：标题 `Image Info / Image Properties Viewer — EXIF, GPS, Camera` | 需求 1.65 + SERP 全是小站，是本簇最像可赢的一页 |
| P1 | `image-metadata` 标题改 `Image Metadata Viewer` | 19 曝光均位 60.4，向查询词靠 |
| 维持 | `gps-remover`（均位 25.8）、`remove-exif`（做「移除」子意图主页面） | 已有排名信号 / SERP 可打 |
| 内链 | `image-info` ↔ `remove-exif` ↔ `gps-remover` 三页互链，`exif-guide` 作为内容支撑指向三页 | 簇内权重集中 |

### 6.5 约束页族（25 页 / 5 族，0 曝光）

**事实**

- 25 页全部 26% / D 档；Trends 里 `compress png to 200kb`、`compress image to 250kb`、`reduce image size to 250kb` **全部为 0**（不是低，是量化后为 0）。
- 自动补全 rel 很高（`compress image to 100kb` 1250、`reduce image size to 250kb` 1250），但上一轮已验证 **rel ≠ 量级**（`passport photo sheet maker` rel=1250、Trends=1）。
- SERP：`compress png to 200kb` → 11zon、cloudinary、compresspng、zeeconvert、iloveimg、adobe、pi7、smallpdf、dochub；`compress image to 250kb` → simpleimageresizer、smalljpg、jpeg-optimizer、11zon、cloudinary、mb2kb。**全是批量页 + 大品牌，没有一个是「只做 200kb」的专页。**
- 7 页零内链：`compress-image-to-5mb`、`compress-jpg-to-50kb/150kb/5mb`、`compress-png-to-100kb/5mb`、`reduce-image-size-to-5mb`。

**动作**

| 优先级 | 动作 | 依据 |
|---|---|---|
| 冻结 | **不再新增任何约束页** | 25 页已覆盖 20kb–5mb 全区间，边际为零 |
| P1 | 只加强 3 页：`compress-png-to-200kb`、`compress-jpg-to-200kb`、`image-compress-to-100kb`（唯一有实测 SERP 且 rel 最高的） | 三页代表三个最高频约束 |
| 补内链 | 7 个孤儿页从对应主族页加兄弟链接 | 没内链 = 不被发现 |
| 8 周后 | 单页曝光 <50 的约束页 → 301 到族内最强页；最终保留 3–4 页 | 薄模板页会被 Google 折叠 |

**如果一定要赌**：赌「compress to exact size」的**产品能力**（拖入即出、保证不超过目标体积、显示压缩前后对比），而不是赌页面数量。

### 6.6 编码小工具（3 个单元）

- `aspect ratio calculator` 竞争 2.5（SERP 全是 calculateaspectratio、calculatorsoup、digitalrebellion 这类小工具）→ 值得保留，补 `16:9`、`4:3`、`9:16` 预设页内锚点。
- `color picker from image` 竞争 3（imagecolorpicker、figma、htmlcolorcodes、redketchup）→ 保留，与 `image-info` 互链。
- `image-to-base64` / `base64-to-image` 两页同一意图 → 合并成 1 页双向转换。

**共性**：这三个是「顺手工具」，不投入内容，不新建。

### 6.7 证件照与 AI（3 个单元）

- `/id-photo`：68 曝光 / 1 点击 / 均位 61.7；SERP 5/5（美国务院官网 + idphoto4you + cutout + photogov + photoaid + epassportphoto）；YMYL 属性强、需按国家维护规格。**不做**，与上一轮打印/拼版结论一致。
- AI Image / Video Generator：需求 14 / 11（全站最高），但 SERP 5/5（canva、openart、higgsfield、deepai、adobe、bing、gemini）、无 API 成本优势、无内容深度。**不做**。若要做，只做「prompt 工具 + 导航」，不做生成。

---

## 七、站点级结构问题（实测，非推测）

这四条会直接吃掉上面所有页面策略的收益，优先级高于任何内容工作。

| # | 问题 | 证据 | 修复 |
|---|---|---|---|
| 1 | **5 个 WebP 页面不在 sitemap** | `https://onlitools.com/__sitemap__/en.xml` 319 条 URL，`png-to-webp` / `jpg-to-webp` / `image-to-webp` / `webp-to-png` / `webp-to-jpg` **各 0 条**；`nuxt.config.ts` 的 `collectStaticRoutes()` 明确跳过 `[param]` 路由 | 把这 4–5 个 URL 显式加入 prerenderRoutes，或改成静态页 |
| 2 | **导航指向一个被动态路由兜住的 URL** | `layouts/default.vue:1315` 指向 `/image-to-webp`，该 URL 由 `[format]-to-webp.vue` 以 `format="image"` 渲染，标题退化为「JPG/PNG to WebP」 | 导航改为 `/png-to-webp`，`/image-to-webp` 301 |
| 3 | **7 个约束页零内链（另有 3 个 WebP 动态页同样无入链）** | `compress-image-to-5mb`、`compress-jpg-to-50kb`、`compress-jpg-to-150kb`、`compress-jpg-to-5mb`、`compress-png-to-100kb`、`compress-png-to-5mb`、`reduce-image-size-to-5mb` 在全站任何 vue/ts/md 里都没有入链；`png-to-webp`、`jpg-to-webp`、`jpeg-to-webp` 同样 0 入链 | 从对应族的主页加兄弟链接；WebP 页由导航与正文接入 |
| 4 | **301 合并尚未被 Google 消化** | `/uppercase` 301 → `/case-converter` 已生效（旧页 2026-11-09 删除），但 16 个月数据里 152 曝光 / 0 点击 / 均位 41.5 仍全部记在旧 URL；301 之后不足一周，尚未重爬 | 确认 301 链、清理站内指向旧 URL 的链接、旧页面内容要点合并进新页后请求索引 |

---

## 八、路线图

### P0（本周，零新页）

1. `json-csv-convert` 冲首页（标题 + H2 + 内链 + 索引）
2. `hash-text` 标题 exact + 补文件 hash
3. `case-converter` /uppercase 合并收尾
4. `font-compress` 首屏三件套（CTR 8.7% → 12%）
5. WebP 三页收敛 + 进 sitemap
6. 元数据 2 条真重复 301（保留 `exif-editor`）
7. 7 个孤儿页补内链

### P1（2–6 周）

1. `heic-to-jpg` 押注（批量 + 不上传 + iPhone 内容）
2. `image-info` 做元数据簇入口页
3. `ttf-to-woff2` / `font-subsetter` 首屏内链 + exact 标题
4. `date-format` → Timestamp Converter；`image-resizer` → px/KB 双模式
5. 约束页只加强 3 页（png-200kb / jpg-200kb / image-100kb）

### P2（6–12 周，看数据再定）

1. `merge-images` 拼版模式
2. `svg-converter` 收窄到 SVG→PNG
3. `image-compressor` 差异化（批量 / 不上传 / 目标体积）
4. `font-inspector` 改「Font Inspector Online」

### 不做 / 冻结

- 新增约束页、AI 生成、id-photo、打印拼版独立产品线
- `json formatter`、`image cropper`、`image converter` head 词
- `font validator`、`font unicode checker`、`font size analyzer`

### 8 周验收线

| 页面 | 达标线（周均） | 不达标处理 |
|---|---|---|
| `font-compress` | CTR ≥ 11%，点击 ≥ 35/周 | 继续改首屏文案 |
| `ttf-to-woff2` | 曝光 ≥ 150/月 | 检查索引与内链，不扩页 |
| `heic-to-jpg` | 曝光 ≥ 300/月 | 停投，回退到「不投图像 head」 |
| `json-csv-convert` | 均位 ≤ 15 | 放弃该页，转内链支撑 |
| `image-info` | 曝光 ≥ 100/月 | 元数据簇整体降级为内链页 |
| `hash-text` | 均位 ≤ 30 | 标题二次迭代 |
| 约束页（保留的 3 页） | 任一页曝光 ≥ 50/月 | 全部 301 到主压图页 |

---

## 九、缺口与风险

### 9.1 Keyword Planner 仍缺

- 需要已登录的 Google Ads 账号；本机 Chrome 127+ 的 App-Bound Encryption 导致复制 profile 后仍跳登录页，**不能代登录**。
- 补齐路径：① 在调试 Chrome 里手动登录 Ads 后抓「获取搜索量和预测数据」；② 直接导出 CSV（Keyword / Avg. monthly searches / Competition / Top of page bid）。
- **在拿到 KP 之前，本文所有量级都是 Trends 相对值（锚点归一化），不是月搜索量。** 但这不影响排序：判死的页面是「需求量化后为 0 + 竞争 5/5 + 站点零权重」三条件同时成立。

### 9.2 其他风险

| 风险 | 说明 | 缓解 |
|---|---|---|
| 观察期误判 | 39/45 单元 <2 个月，0 曝光不代表失败 | 8 周后再跑一次本表，只对老页下结论 |
| AI Overview 吃掉点击 | 37/37 查询都有 AIO，工具类 CTR 整体被压 | 以「曝光 + 均位」为主要指标，点击作辅助 |
| Trends 长尾为 0 | 只表示「小」，不表示「没有」 | 用自动补全 rel + SERP 有无独立小站交叉验证 |
| 薄模板页被折叠 | 25 个约束页同构 | 冻结扩张 + 到期合并 |
| 权重摊薄 | 13 个图像 URL 分享一个零权重域 | 集中到 2–3 页 |
| 无法衡量真实使用 | 没有 GA4 工具事件，只有排名和点击 | 补 GA4 事件（下载/复制/转换成功）后再做下一轮 |

---

## 十、附录

### 10.1 原始数据（本机临时目录）

```
C:\Users\Administrator\AppData\Local\Temp\opencode\
├── gsc-pages.json            # GSC 16 个月页面表（原始）
├── gsc-route-map.json        # 页面 → 路由聚合（曝光/点击/均位）
├── ac-tools.json             # 49 个 seed 的原始自动补全响应
├── trends-tools.json         # Trends 12 个月，10 组（无锚点）
├── trends-tools-anchor.json  # Trends 12 个月，11 组（image compressor 锚点）
├── serp-tools.json           # 15 个查询的真实 SERP
├── serp-tools2.json          # 10 个查询
├── serp-tools3.json          # 12 个查询（image info / json compare / gps remover 等）
├── tools-score3.mjs          # 评分模型（D/T/C/F + 护栏）
├── tools-score3.json         # 45 个单元的评分结果
└── tools-table.md            # 本文明细表
```

### 10.2 复现

```bash
# Trends（组内归一化，务必带锚点词 image compressor）
node .opencode/skills/demand-mining/scripts/trends.mjs groups.json out.json US "today 12-m"

# 评分（读取 gsc-route-map.json）
node tools-score3.mjs

# SERP（需 9222 调试端口 + socks5 代理）
node serp-tools3.mjs
```

### 10.3 37 个真实 SERP 采样查询

font compressor、ttf to woff2、font subsetter、font inspector、font validator、font css generator、compress woff2 file、image compressor、image resizer、image cropper、image converter、png to webp、webp to png、heic to jpg、svg converter、image to base64、image info、image properties viewer、image metadata viewer、remove exif、gps remover、merge images、increase image size in kb、compress image to 250kb、compress png to 200kb、passport photo maker、case converter、hash generator、json formatter、json compare、json to csv、timestamp converter、remove duplicate lines、random token generator、aspect ratio calculator、color picker from image、ai image generator。

（全部 `hl=en&gl=us&num=20&pws=0`，2026-11-13 当天采集，37/37 出现 AI Overview。）

### 10.4 与上一轮文档的关系

- `docs/demand-analysis.md`：GSC 查询簇 + 自动补全 + P0/P1 执行记录（2026-11-11，已上线 17 页）。
- `docs/demand-print-layout.md`：打印/拼版方向否决（2026-11-13）。
- 本文：**对现有全部工具的横向审计**，回答「每个工具值不值得继续投」。三份文档共用同一套 GSC 与 Trends 数据口径，结论不冲突：打印/拼版不做、id-photo 不做、AI 不做、约束页不再扩张。
