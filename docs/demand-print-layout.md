# 需求分析：在线排版打印（print layout / photo sheet）

> 数据日期：2026-11-13 ｜ 市场：Google US / en ｜ 站点：onlitools.com
> 数据源：Google 自动补全（30 seeds）、Google Trends（12 个月 + 5 年）、真实 Google SERP（5 个查询）、GSC 16 个月（83 页 / 254 查询）
> **Keyword Planner 未取到**（需要 Ads 登录，见第 6 节），因此本文的量级均为 Trends 相对值，不是月均搜索量。

---

## 一、结论（TL;DR）

1. **「在线排版打印」不是一个需求，是三个互不相干的需求**：
   - 软件功能类（Word / Excel / ArcGIS 的 "print layout view"）——不是工具站能吃的；
   - 照片拼版 / 证件照排版（passport photo sheet、2x2 on 4x6）——意图真实，但**量级极小 + 竞争极高**；
   - 多图打印到一页（print multiple photos on one page）——**竞争有缝**，但量小、偏 how-to。
2. **不建议立项做独立「在线排版打印」工具。**
   - 核心短语 `passport photo sheet` / `photo print layout` 在美国 12 个月 Trends 均值只有 **1**（峰值 15 / 18），5 年基本为 0；
   - 真正有量的是 head term（`passport photo maker`、`photo collage maker`、`photo collage`），而 SERP 前 10 已经被专用工具站和大品牌占满；
   - 本站图像簇 16 个月只有 **212 曝光 / 1 点击**，`/id-photo` 排名 35–92，在该领域**零权重**。
3. **最小可行切法（P2，可选）**：不新建产品线，把「A4 / 4×6 拼版 + 裁切线 + 导出 JPG/PDF」作为 `/merge-images` 或 `/id-photo` 的功能扩展，落地页只打 `print multiple photos on one page` / `combine and print multiple images`，**不要**打 `passport photo sheet maker`。
4. 预期收益：最好情况是每月几十到几百访问，**不是增长引擎**；优先级应低于字体簇和已验证的 constraint 页。

---

## 二、需求拆解

| 需求原型 | 典型查询 | 真实意图 | 我们的可行性 |
|---|---|---|---|
| A. 软件打印布局 | print layout view in word / excel / arcgis pro | 找 Excel、ArcGIS 的功能入口 | ❌ 与工具站无关 |
| B. 证件照拼版 | passport photo sheet maker、passport photo 4x6 template、print 2x2 photo on 4x6 paper | 把 1 张证件照排成 4×6 / A4 相纸，带裁切线 | ⚠️ 意图匹配，但竞争与权重都不利 |
| C. 照片拼图 / 多图一页 | print multiple photos on one page、photo print layout online、photo collage maker for printing | 多张照片排到一页打印，或做拼图 | ⚠️ 竞争分层，只有长尾有缝 |
| D. 海报分块打印 | poster print a4 pages、tile print poster | 把大图切成 A4 拼贴 | ❌ 量小，Canva / 打印店主导 |
| E. 中文「排版打印」 | 照片打印排版、证件照排版 | 找本地打印店 / 排版软件 | ❌ 自动补全 relevance 550–601，且站内 zh 流量 <80/月 |

---

## 三、需求证据

### 3.1 自动补全（rel = Google suggest relevance，≈0–1300）

30 个 seed 中，与「排版/拼版」强相关的候选（rel ≥ 550）：

| 查询 | rel | 查询 | rel |
|---|---|---|---|
| passport photo sheet maker | **1250** | photo print layout online | **1250** |
| passport photo 4x6 template free | **1252** | photo printing layout software | **1250** |
| passport photo 4x6 generator | **1250** | photo grid maker | **1250** |
| 4x6 photo collage template | **1250** | print collage photos | **1250** |
| print 2x2 photo on 4x6 paper | **1250** | print photos on one page iphone | 601 |
| print multiple photos on one page online | 559 | arrange photos for printing online | 601 |
| print multiple images on one page online | 601 | photo collage maker for printing | 600 |

> **关键校准：rel ≠ 量级。**
> `passport photo sheet maker` rel=1250，但 Google Trends 美国 12 个月均值 **1**（峰值 15）。
> 自动补全只证明「这句话有人搜」，不能当搜索量用；立项前必须用 Trends / Keyword Planner 复核。

同时注意：`print photos on one page` 的补全几乎全是 **设备/系统后缀**（iphone、windows 11、mac、hp smart、ipad、android），说明这个簇的主体意图是 **how-to**，不是找在线工具。

### 3.2 Google Trends（US，组内最高点 = 100）

**近 12 个月（weekly）**

| 关键词 | 均值 | 近 12 周 | 峰值 | 前半年 → 后半年 |
|---|---:|---:|---:|---|
| passport photo sheet | 1 | 0 | 15 | 1 → 2 |
| photo print layout | 1 | 1 | 18 | 2 → 1 |
| print photos on one page | 3 | 3 | 14 | 3 → 3 |
| print layout | 7 | 5 | 13 | 8 → 6 |
| print 2x2 photo | 21 | 20 | 32 | 21 → 20 |
| id photo | 30 | 23 | 45 | 31 → 30 |
| photo collage | 36 | 25 | 70 | 39 → 34 |
| poster print | 42 | 36 | 100 | 44 → 40 |
| photo collage maker | 54 | 41 | 100 | 58 → 49 |
| passport photo | 66 | 50 | 100 | 71 → 60 |
| wallet size photos | 1 | 1 | 2 | 1 → 1 |
| visa photo | 11 | 5 | 19 | 14 → 9 |
| passport photo 4x6 | 0 | 0 | 1 | 0 → 0 |
| photo grid maker | 0 | 0 | 1 | 0 → 0 |

**近 5 年（按四段均值）**

| 关键词 | 5 年四段 | 5 年均值 |
|---|---|---:|
| passport photo sheet | 0 → 0 → 0 → 1 | 0 |
| passport photo maker | 10 → 13 → 21 → 23 | 17 |
| photo collage maker | 61 → 60 → 59 → 54 | 58 |
| print photos on one page | 2 → 2 → 1 → 2 | 2 |
| print multiple photos on one page | 0 → 0 → 0 → 0 | 0 |

**读法**
- 「sheet / layout」这类词在 Trends 里常年 0–2：**不是趋势问题，是分母太小**。
- 有量且长期向上的只有 `passport photo maker`（10→23），但它是 head term，竞争见 3.3。
- `photo collage maker` 缓慢下行（61→54），`passport photo`、`visa photo` 近 12 个月也在回落。

### 3.3 竞争度（真实 Google SERP，hl=en&gl=us）

**① passport photo sheet maker** —— 竞争 5/5，需求 1/5

| # | 站点 | 性质 |
|---|---|---|
| 1 | cutout.pro/passport-photo-maker | 专用工具 |
| 2 | 123passportphoto.com | 专用工具（老站） |
| 3 | passportgrid.com | 专用工具，exact-match 文案 |
| 4 | photogov.net | 专用工具 |
| 5 | pasandtech.com/passport-photo-print-sheet | 专用工具，URL exact-match |
| 6 | travel.state.gov | 官方信息 |
| 7 | photoaid.com | 专用工具（付费） |
| 8 | docset.in/printing-tools/passport-sheet | 专用工具，标题 exact-match |
| 9 | image.pi7.org/passport-size-photo | 专用工具 |

→ 8 个专用工具 + 1 个官方页；没有任何信息型结果。新站没有插入空间。

**② photo print layout online** —— 竞争 4.5/5，需求 1/5

Canva、PrestoPhoto、Adobe Express、Pixlr、PhotoCollage.com、PrintableMaker、Picsart、Canva（重复占位）——大品牌 + 免费工具，意图被「拼图」整体吃掉。

**③ print 2x2 photo on 4x6 paper** —— 竞争 4/5，需求 3/5

passportgrid、Reddit 帖、cutout.pro 4x6 模板、IDPhoto4You、PhotoPass.ai、passlens 博客、Walmart、passport-photo.online 博客。
→ 工具 + 信息混合，但头部仍被证件照工具占住。

**④ photo collage maker for printing** —— 竞争 5/5，需求 4/5

Canva、PicCollage、Adobe、App Store、Walgreens、Picsart、Pixlr、PhotoCollage.com、MyPoster。
→ 品牌 + 打印服务，纯 SEO 无法切入。

**⑤ print multiple photos on one page** —— 竞争 2.5/5，需求 1.5/5

| # | 站点 | 性质 |
|---|---|---|
| 1 | homiwork.com | 独立工具站 |
| 2 | App Store（Photo Printing） | 应用商店 |
| 3 | Reddit r/techsupport | 论坛 |
| 4 | merge-images.stackasian.com | **独立小工具站** |
| 5 | learn.microsoft.com | 官方问答 |
| 6 | YouTube 教程 | 视频 |
| 7 | HP 社区 | 官方社区 |
| 8 | Canon 支持 | 官方文档 |

→ **唯一有缝的查询**：top10 里出现两个独立小站，说明可排；但 5 个结果是 how-to，工具页只能吃一部分点击，且 Trends 均值仅 0–2。

### 3.4 本站现状（GSC 16 个月，2025-08 ~ 2026-11）

| 指标 | 数值 |
|---|---|
| 全站 | 493 点击 / 8,181 曝光 / 83 个有曝光页面 |
| 字体簇 | 462 点击 / 5,317 曝光（font-compress 单词 456 点击 / 5,282 曝光，均位 12.7） |
| 图像簇（全部图像工具） | **1 点击 / 212 曝光** |
| `/id-photo` | ≈68 曝光 / 1 点击，排名 35–92 |
| 与 print/passport 相关的查询 | 仅 4 条，各 1 曝光，排名 49–100 |

→ 站点在 Google 眼里仍是「font-compress 单页站」，**图像/打印领域没有可继承的权重**。

---

## 四、竞争度模型（可复用）

对每个候选词，按 SERP 前 10 构成打分（5 = 最难）：

| 类型 | 权重 |
|---|---|
| 专用工具站，标题/URL exact-match | 5 |
| 大品牌（Canva/Adobe/Google/ Walmart） | 4.5 |
| 电商/打印服务 | 4 |
| 官方文档 / 论坛 / Reddit | 2（说明意图不是工具） |
| 独立小工具站（可复制对手） | 1.5 |
| AI Overview 出现 | 点击率 −30~50% |

机会分 = 需求分 ÷ 竞争分：

| 候选 | 需求 | 竞争 | 机会 | 结论 |
|---|---:|---:|---:|---|
| passport photo sheet maker | 1 | 5 | 0.20 | 不做 |
| photo print layout online | 1 | 4.5 | 0.22 | 不做 |
| photo collage maker for printing | 4 | 5 | 0.80 | 不碰 head，只做长尾 |
| print 2x2 photo on 4x6 paper | 3 | 4 | 0.75 | 可作附属内容 |
| print multiple photos on one page | 1.5 | 2.5 | **0.60** | 唯一可试，但量小 |

---

## 五、决策

### 5.1 不做

- ❌ 独立 `/print-layout`、`/photo-sheet`、`/passport-photo-sheet` 产品线；
- ❌ 为 `passport photo sheet maker` 做 exact-match 落地页（有量的是 rel，不是需求；SERP 已被专用工具锁死）；
- ❌ 中文「排版打印」方向（zh 流量基数 <80/月）。

### 5.2 如果一定要做（P2）

**方案：给 `/merge-images` 增加「打印拼版」模式**
- A4 / Letter / 4×6 相纸预设，2×2、3×3、2×3 网格；
- 自动裁切线 / 出血线，导出 JPG（300dpi）+ 打印用 PDF；
- 证件照预设（2×2 in、35×45 mm）作为子模式，复用 `/id-photo` 的裁剪能力；
- 落地页只打：`print multiple photos on one page`、`print multiple images on one page`、`combine and print multiple images`；
- 不做 `passport photo sheet maker` 的独立页，只作为 FAQ / H2 覆盖。

**验收指标**
- 上线 8 周内该页曝光 ≥ 300/月、点击 ≥ 10/月，即算跑通；否则停投。
- 不新增 i18n 欠账：6 语言同批上线。

---

## 六、缺口：Keyword Planner（未完成）

**为什么没取到**：Keyword Planner 需要已登录的 Google Ads 账号；本机 Chrome 127+ 使用 App-Bound Encryption，复制 profile 起调试实例后仍跳登录页，不能代登录。

**补数据两条路**
1. 在调试 Chrome 里手动登录 Ads，然后抓「获取搜索量和预测数据」；
2. 导出 CSV（Keyword / Avg. monthly searches / Competition / Top of page bid），直接解析。

**在拿到 KP 之前，本文所有「量级」都是 Trends 相对值（组内 100 制），不是月搜索量。** 结论方向不受影响：即使 KP 显示 `passport photo sheet maker` 有 1–2k/月，SERP 的 8 个专用工具 + 本站零权重仍然足以否决独立立项。

---

## 七、风险

| 风险 | 说明 |
|---|---|
| 把 rel 当量级 | rel=1250 的微需求被误判为大需求（本次已出现） |
| 量级误判 | 未用 KP 校准，Trends 长尾为 0 只表示「小」，不表示「没有」 |
| 意图错配 | `print multiple photos on one page` 一半是 Windows/iPhone 教程流量，工具页转化低 |
| 竞争升级 | 证件照工具多为付费产品，SEO 投入大，且会持续加 exact-match 页 |
| 权重不足 | 图像簇 212 曝光，短期排名 30+ 属正常，8 周内不宜下结论 |

---

## 八、附录：数据与复现

原始数据（本机临时目录）：

```
C:\Users\Administrator\AppData\Local\Temp\opencode\
├── ac-print.json            # 30 个 seed 的原始自动补全响应
├── ac-print-parsed.json     # [{seed, suggestions:[{s,rel}]}]
├── trends-print.json        # 12 个月，3 组 × 5 词
├── trends-print-5y.json     # 5 年，1 组 × 5 词
├── serp-google-print.json   # 5 个查询的真实 Google SERP（标题 + 域名）
└── gsc-pages.json           # GSC 16 个月页面表
```

复现命令（趋势）：

```bash
node .opencode/skills/demand-mining/scripts/trends.mjs groups.json out.json US "today 12-m"
node .opencode/skills/demand-mining/scripts/trends.mjs groups.json out.json US "today 5-y"
```

SERP 采集：CDP 打开 `https://www.google.com/search?q=<q>&hl=en&gl=us&num=20&pws=0`，取 `#search a h3` + 最近 `cite`。

方法与坑（Trends 端点映射、`)]}',` 前缀、429 退避、uv/pip 在 SOCKS 下装包失败、profile 复制丢登录态）已写入
`.opencode/skills/demand-mining/SKILL.md` 第 2b 节。
