# 通用转盘 / 随机决策工具：市场与竞品调研报告

调研日期：2026-11-20
目标：评估「选人 / 抽奖 / 其他随机决策场景」通用转盘工具的需求量、竞争度、用户吐槽点与设计细节。

---

## 0. 结论先行

| 维度 | 结论 |
|---|---|
| 需求真实性 | **已验证**。Google Trends 美国 `spin the wheel` 近 12 个月相对指数均值 83（峰值100），`wheel of names` 74.4；App Store 美区 4 个头部 App 累计评分约 22.3 万。属于成熟且持续的大众工具品类。 |
| 竞争度 | **头部极高、长尾可做**。主词被 `wheelofnames.com` 品牌垄断，并被 `pickerwheel.com`、`spinthewheel.io` 等站群用 `tools/*`、`wheels/*` 长尾页批量覆盖。 |
| 差异化机会 | **公平可验证 + 无广告无注册无上限 + 多模式 + 多随机器入口**。竞品最大吐槽正是付费墙、广告、条目上限和随机性存疑。 |
| 站内基础 | **从零起量**。onlitools.com 近 16 个月 GSC 无任何转盘类查询曝光，需靠长尾词切入，预计 3–6 个月积累。 |
| 建议 | **做，但不要做「又一个转盘」**。定位为「可审计的通用随机决策工具」，MVP 免费开放核心能力，长尾页面 + 场景模板驱动 SEO。 |

---

## 1. 数据方法与可信度标注

### 已验证数据（一手抓取）
- Google Trends 官方 API（经已登录 Chrome CDP 调用），US / CN，近 12 个月，相对指数。
- Google Autocomplete 官方接口 `client=chrome&hl=en&gl=us`，21 个种子词。
- Google Trends「相关搜索 / 上升查询」API。
- Google SERP（google.com.hk，en/gl=us 与 zh-CN/gl=cn）部分查询。
- iTunes Search API（US）App 评分与排名；iTunes Customer Reviews RSS（1–3 星，4 款头部 App）。
- 竞品官网直接抓取：wheelofnames.com、pickerwheel.com、wheelofnames.io、wheeldecide.com、wheelienames.com、classtools.net。
- 本站 GSC 导出：974 条查询词、373 条页面（近 16 个月）。

### 无法验证 / 限制（必须在决策时打折）
- `websearch` 工具 HTTP 402；`belt` 未登录；Google 搜索页、Reddit、DuckDuckGo、Brave、Mojeek 在代理环境下被阻断；Bing 结果严重中文化不可用。
- **Google Trends 是相对指数，不是绝对搜索量**；未用 Keyword Planner 校准月搜索量，本报告不编造具体搜量数字。
- **Google Trends CN geo 全部返回 0**，不能据此推断中文无需求，中文需求只用 Autocomplete 与 SERP 定性判断。
- App Store 评分是累计存量，不等于月活或下载量。
- 竞品 `462,479,318 spins` 等数字为站点自报，无法独立验证。
- Reddit 只拿到 Google 搜索摘要，未能直接打开帖子。
- SERP 中 `spin the wheel`、`wheel of names`、`raffle wheel`、`抽奖转盘` 抓取为 0 条，不能据此判断排名。

---

## 2. 需求量证据

### 2.1 Google Trends（US，近 12 个月，相对指数）

| 关键词组 | 组内词 | 均值 | 峰值 | 最近 12 周 |
|---|---|---|---|---|
| 品类核心 | spin the wheel | **83** | 100 | 82.3 |
| 品牌词 | wheel of names | **74.4** | 85 | 77.3 |
| 品类长尾 | random wheel generator | 9.6 | 13 | 9.2 |
| 品类长尾 | random name picker | 3.6 | 6 | 3.8 |
| 品类长尾 | raffle wheel | 1.3 | 2 | 1.3 |
| 组合 B | prize wheel / giveaway picker / yes or no wheel / random picker / wheel decide | 16.1 | 71 | 波动大 |
| 组合 C | random team generator / secret santa picker / spin the bottle / random number picker / classroom random name picker | 19.6 | 31 | 稳定缓降 |

> 组合值是归一化到该组最高词的相对值，**不能跨组相加**。

关键读数：
- `spin the wheel` 全年平稳在 75–100 区间，无季节性塌陷，是持续型工具需求。
- `wheel of names` 品牌词与品类词几乎同级（74.4 vs 83），说明品类已被一个品牌教育完成 —— 既是壁垒，也证明用户认知成熟。
- 长尾词量级远小于核心词，SEO 应以核心词做品牌 banner、以长尾词做实际流量入口。

### 2.2 Google Autocomplete（en/us）— 细分需求清单

- `spin the wheel` → custom / generator / names / **yes or no** / random picker / game / **number** / colors / nfl / nba / online
- `wheel of names` → spinner / **rigged** / generator / **discord bot** / dandys world / group / yes or no
- `random name picker` → wheel / from list / **no repeats** / for secret santa / for raffle / for teams / for giveaway / **duck race** / **in excel** / free
- `raffle wheel` → generator / **with multiple entries** / numbers / online free
- `random wheel generator` → names / number / **with percentages** / **elimination** / **numbers 1 100** / custom
- `giveaway picker` → **instagram / facebook / tiktok / twitter / comments** / **no login** / with multiple entries
- `yes or no wheel` → **tarot** / spiritual / with question / reddit
- `wheel decide` → **food / dinner / fast food** / tarot / with percentages
- `spin the bottle online` → **truth or dare** / multiplayer / with names / questions
- 中文：`随机点名器`、`随机抽签不重复`、`随机抽签分组`、`随机抽签顺序`、`抽奖转盘机率`、`抽奖转盘音效`、`在线抽奖系统`

### 2.3 Google Trends 相关搜索 / 上升词（US，近 12 个月）

- `spin the wheel` 相关：custom(100)、names(65)、generator(59)、game(58)、google spin the wheel(34)、number(28)、picker(28)、free(25)、nfl(21)、nba(20)、yes or no(18)、online(18)、app(17)、coin flip(13)
- `spin the wheel` **上升**：starpets spin the wheel(+900%)、jjk spin the wheel(+250%)、imposter game(+250%)、spinal tap(+80%)
- `wheel of names` 上升：imposter game(+300%)、google metronome(+80%)、wheel if names(+80%)
- `random name picker` 上升：wheel of names spinner(+550%)、flippity random name picker(+50%)、miniwebtool random name picker(Breakout)
- `yes or no` 上升：大量塔罗词 —— 6 of swords yes or no(+70%)、king of cups yes or no(+70%)、yes or no tarot
- `prize wheel` 相关：wheel of fortune(100) —— 被美综《Wheel of Fortune》严重污染，SEO 优先级低
- `raffle wheel` 相关：raffle generator(100)、raffle tickets(26)、raffle wheel online(59)

### 2.4 App Store（US，iTunes Search API）

| App | 评分 | 评分数 |
|---|---|---|
| Spin The Wheel - Random Picker | 4.87 | 98,062 |
| Tiny Decisions: Spin Wheel | 4.71 | 89,859 |
| Spin Wheel Decisions | 4.47 | 20,319 |
| Spin The Wheel - Pick Me | 4.60 | 15,506 |
| Wheel +: Spin Roulette Picker | 4.79 | 11,952 |
| Spin The Wheel Spinner Picker | 4.55 | 10,469 |
| Daily Decision Wheel | 4.67 | 9,917 |

前 4 名合计约 **22.3 万**评分，品类已被充分验证。同时几乎全部 App 评分 >4.4，说明**产品体验本身不难做，难的是商业模式不惹恼用户**（见吐槽章节）。

### 2.5 本站 GSC（onlitools.com，近 16 个月）

- 全站：点击 509、曝光 1.16 万、CTR 4.4%、平均排名 18.1。
- 热点查询集中在 `ttf compressor`、`compress ttf file`、`font compressor` 等字体压缩类。
- 用 wheel / spin / raffle / random / pick / 抽奖 / 转盘 / 随机 / 点名 筛选，仅命中误匹配：
  - `random token generator`（9 曝光，排名 83.2）、`generate random token`（7）、`css selector` 等。
- **结论：站内没有该品类的现成需求或权重，属于从零起量。** 现有站点主题权重在 font/token 类，迁移成本需计入。

---

## 3. 使用场景挖掘（超出「选人 / 抽奖」）

| 场景 | 具体用法 | 需求信号来源 |
|---|---|---|
| 课堂随机点名 | 抽学生回答、抽题号、值日分配、小组分工 | Autocomplete `classroom random name picker`、中文 `随机点名器`、Reddit 教师帖 |
| 抽奖 / 赠品 | 活动抽奖、社媒评论区抽奖（IG/TikTok/X）、多重中奖名额 | `raffle wheel with multiple entries`、`giveaway picker instagram comments` |
| 直播互动 | OBS/Streamlabs 浏览器源、观众抽取、惩罚/任务轮盘 | 竞品 OBS 支持、Reddit「Can streamers rig Wheel of Names?」 |
| 游戏 / 粉丝二创 | Imposter among us 转盘、JJK / Starpets 角色转盘 | Trends 上升词 `imposter game(+250~300%)`、`jjk spin the wheel(+250%)` |
| 选择困难 / 日常决策 | 午餐吃什么、yes/no、maybe | `wheel decide food/dinner`、`yes or no wheel` |
| 占卜 / 玄学 | 塔罗 yes/no 转盘、灵性指引 | Trends 上升 `6 of swords yes or no`、`yes or no tarot` |
| 团队管理 | 随机分组、发言顺序、任务分配、secret santa | `random team generator`、`secret santa picker`、`random name picker for teams` |
| 体育 / 赛事 | NFL/NBA 球队随机、赛程抽签 | `spin the wheel nfl/nba`、`team random picker nfl` |
| 聚会游戏 | spin the bottle、truth or dare、真心话大冒险 | `spin the bottle online truth or dare` |
| 教学辅助 | 抽题、单词复习、随机浏览器标签 | 竞品 classtools.net、flippity |
| 公平性演示 | 教学概率、审计随机过程 | wheelienames.com 的 provably fair 定位 |

---

## 4. 工具形态分类

1. **单页转盘型**：打开即用，输入名单 → 转。代表 wheeldecide.com、wheelofnames.com。
2. **多模式决策型**：转盘 + 硬币 + 随机数 + 洗牌 + 抽牌等。代表 Tiny Decisions。注意用户吐槽「不要把其他随机器藏到转盘后面」。
3. **站群长尾型**：一个域名下几百个 `tools/*` / `wheels/*` 页覆盖长尾。代表 pickerwheel.com、spinthewheel.io、spinthewheel.app、wheel-decide.com、randomspinwheel.com。
4. **平台内嵌型**：Wooclap、Flippity、ClassTools 把转盘作为教学平台功能之一。
5. **公平审计型**：主打 CSPRNG、可验证、无注册、离线。代表 wheelienames.com、wheelofnames.io/audit。
6. **本地桌面 / App 型**：iOS/Android 应用，评分高但付费墙争议大。
7. **中文工具站型**：lzltool、蓝人工具、uutool、lucky100 等，多为简单实现 + 广告。

---

## 5. 竞品格局与竞争度

### 5.1 主要竞品功能矩阵

| 竞品 | 核心优势 | 限制 / 市场位置 |
|---|---|---|
| **wheelofnames.com** | 站点自报 4.62 亿次旋转、65 语言、全功能免费、无需注册、图片/Google Sheets 导入、权重、多转盘、短链接、云/本地保存、OBS/Streamlabs、150+ 音效、`crypto.getRandomValues`、1 万次随机性审计 | 品类王者，`wheel of names` 已成通用词；广告可关闭但存在 |
| **pickerwheel.com** | 三种模式（normal / elimination / accumulation）、文本/CSV/图片、权重/标签/颜色、AI ideas、mystery wheel、shuffle、全屏、朗读、Share / Collect results、localStorage 自动保存 | 免费用户 15 个云文件、Collect 上限 10；Premium 解锁高级定制；长尾站群覆盖极广 |
| **spinthewheel.io** | 功能对标 wheelofnames，长尾页覆盖广 | 页面 JS 重，抓取困难 |
| **wheelofnames.io** | 工厂化内容：Tools / Templates / Gallery / Audit / Embed / Guides，含 secret santa generator、fairness audit | SEO 内容站属性强，品牌混淆 |
| **wheelienames.com** | 明确打「provably fair / Web Crypto API / no signup / no data / offline」 | 新站，主打差异化 |
| **wheeldecide.com** | 老牌极简，最多 100 项，抽中后移除、多主题色 | 保存需登录，功能单薄 |
| **classtools.net** | 教育场景，Slot Machine 切换、Share/Embed、Fullscreen | Premium 去广告，界面老旧 |
| **中文工具站** | 本地语言、符合国内习惯 | 体验参差、广告多、无公平性说明 |

### 5.2 SERP 观察（部分查询成功）

- `random wheel generator`：wheelofnames.com、spinthewheel.io、pickerwheel.com、wooclap.com、randomspinwheel.com、randomwheelspin.com
- `yes or no wheel`：pickerwheel.com/tools/yes-or-no-wheel、wheeldecide.com、spinthewheel.io、wooclap、spinthewheel.app、wheel-decide.com、randomspinwheel.com
- `random team generator`：randomlists.com、pickerwheel.com/tools/random-team-generator、app-sorteos.com、classtools.net、teamshufflr.com、online-stopwatch.com
- `随机点名`（zh-CN）：lzltool.com、GitHub ClassNamePicker、lanren-tools.com/roll-call、kuketang.cn、知乎、uutool.cn、lucky100.cn 等

**观察**：英文长尾被同一批域名的批量页面占满，是典型 SEO 站群打法；中文由本地工具站 + 教育站 + 开源项目占据，产品化体验仍有空档。

### 5.3 竞争度评级

| 细分 | 竞争度 | 说明 |
|---|---|---|
| 英文主词 `spin the wheel` / `wheel of names` | **极高** | 品牌垄断 + 站群 + 平台内容 + App 矩阵 |
| 英文长尾 `no repeats` / `with percentages` / `elimination` / `for secret santa` / `with multiple entries` | **中高** | 已被 pickerwheel/tools 与 spinthewheel 覆盖，但体验可超越 |
| 细分模式 `elimination` / `accumulation` / `mystery` / `fairness audit` / `OBS` / `CSV 导入` | **中** | 有明确差异化空间 |
| 中文 `随机点名` / `在线抽奖` / `随机抽签` | **中高** | 本地站 + 教育站 + 开源占满，但普遍体验一般 |
| 游戏二创 `imposter game` / `jjk spin the wheel` | **低-中** | 上升快（+250~300%），机会窗口 |
| 塔罗 `yes or no tarot` | **低-中** | 上升明显，竞品少 |
| `prize wheel` | **中（但流量不纯净）** | 被 Wheel of Fortune 综艺污染，不建议主攻 |

---

## 6. 用户吐槽点（证据与优先级）

数据源：4 款头部 iOS App 的 212 条 1–3 星评论（关键词命中，主题有重叠）+ Reddit Google 摘要 + 竞品定价页。

| 吐槽主题 | 命中数 | 典型原话 / 证据 | 产品启示 |
|---|---|---|---|
| 付费墙 / 订阅 | **111** | "Wouldn't let me go past 5 options without a subscription"；"Can't have more than 15 items without paying for pro"；"not paying a monthly subscription so I can change the weight"；"change the color of the option without buying something" | **核心功能全免费、无条目上限、权重免费** |
| UI / 改版 | 45 | "All the other randomizers (coins, numbers, etc) have to be accessed through choosing a wheel first"；"Update makes app useless... coin was everything to me" | 多随机器必须一级入口直达，不要藏在转盘后 |
| 广告 | 37 | "Unskippable ads, tracks your activity... sat through about 2 minutes of a war game ad" | 无广告或明确可关闭、不遮挡结果 |
| 名单 / 导入 / 数量限制 | 33 | "Can't even edit... you can't make your own"；"Where did my lists go?（Pro 用户列表全丢）" | 批量粘贴/CSV、可靠本地保存、可编辑 |
| 移除 / 不重复 | 28 | "all items have been chosen... when that is not true"（elimination bug）；Autocomplete `no repeats` | 模式正确性 + 状态可重置 |
| 旋转时长 / 速度 | 24 | 转太久 / 太快 / 不可调 | 速度与时长可调，可跳过 |
| 随机性存疑 | 19 | `wheel of names rigged` 是 Autocomplete 高排位词；"Can streamers rig Wheel of Names?" | **可审计随机是核心卖点** |
| Bug / 崩溃 | 9 | "Every time I go to change a wheel it instantly crashes" | 稳定性 |
| 保存丢失 | 3 | Pro 用户列表清空 | localStorage + 导出备份 |
| 音效 | 3 | 音量/音效烦人 | 默认可关 |

Reddit 搜索摘要补充：
- 教师寻找「能移除已抽中学生」的转盘；PowerPoint 方案最多 7 个学生。
- 「Looking for randomizer online name picker」。
- 「Wheel of Names Alternatives — does so much more that Wheel of Names, plus it's free」。

---

## 7. 设计细节建议

### 7.1 产品定位

> **「公平可验证的通用随机决策工具」** —— 不是又一个转盘，而是把竞品最被吐槽的三件事（付费墙、广告、随机性不透明）做成卖点。

目标用户：教师、活动主持、直播主、团队 leader、选择困难用户。

### 7.2 MVP（P0）

1. **转盘本体**：Canvas/SVG 高物理感动画（缓动、指针抖动、撒花、音效），速度/时长可调且可跳过。
2. **名单编辑**：换行/逗号/CSV 批量粘贴、即时过滤、颜色与权重、条目上限 ≥ 500（明确写「无上限」卖点）。
3. **三种模式**：普通 / 不重复（抽后移除）/ 累计（保留结果、可多人连续抽）+ 权重。
4. **可信随机**：
   - `window.crypto.getRandomValues`，禁用 `Math.random`；
   - rejection sampling 消除取模偏差；
   - **先抽结果，再算角度**（动画只是展示，不决定结果）；
   - 每次结果生成可复制的审计记录：条目快照哈希 + 随机字节哈希 + 时间戳 + 算法版本；
   - 文案明示：「结果在转盘开始前已由 CSPRNG 决定，动画仅为展示」。
5. **本地保存**：localStorage 自动保存，无需登录，支持导出/导入 JSON 备份。
6. **分享**：URL 参数压缩分享配置，无后端、无过期、无短链依赖。
7. **全屏 + 移动端 + 键盘快捷键**（空格抽、R 重置）。
8. **i18n**：复用站点现有六语言能力。

### 7.3 P1

- **模板库**：Yes/No、Undecided/Maybe、课堂点名、抽题、任务分配、分组、Secret Santa、午餐吃什么、NFL/NBA 球队（流量词）。
- **随机分组**：输入名单 → N 组均衡随机分组（同域，不是转盘但共享工具页）。
- **多随机器入口**：硬币 / 随机数 / 洗牌 / 抽牌，但保持**一级导航直达**（吐槽点）。
- **历史记录 + 结果导出 CSV**。
- **OBS/Streamlabs 透明背景嵌入页**与浏览器源专用 URL。
- **审计页**：展示算法、随机源、最近 N 次结果与哈希。
- **长尾页面**：`/tools/yes-or-no-wheel`、`/tools/random-name-picker`、`/tools/raffle-wheel`、`/tools/random-team-generator`、`/tools/no-repeats`、`/tools/weighted-wheel`、`/tools/classroom-name-picker`、`/tools/giveaway-picker`；中文 `随机点名`、`在线抽奖`、`随机抽签`。
- 每页独立 H1、FAQ Schema、可直接使用（不是纯文案页）。

### 7.4 P2

- 图片转盘、Google Sheets/表格导入、团队协作 Collect results、AI 生成选项、mystery wheel。
- 主题 / 品牌定制、音效库。
- 塔罗 yes/no 模板与游戏二创模板（捕捉上升词）。

### 7.5 交互 / 视觉细节

- 首屏即转盘 + 示例名单，**2 秒内可抽**；不要注册引导、不要弹窗。
- 强物理感但默认可关音效/撒花；高对比配色、色盲友好、深色模式。
- 条目 > 60 时自动缩小字号 / 环形排布，避免文字重叠。
- 移动端编辑区与转盘区分屏，抽奖时全屏。
- 结果页明确显示「本次已排除 / 剩余条目数」，消除 elimination 状态混乱。

### 7.6 SEO / 增长

- 主工具页抢 `spin the wheel` / `wheel of names` 品牌 banner，实际流量靠长尾页。
- 先上英文长尾（竞争度中高但量确定），再补中文页（需求未量化）。
- 内容文章做场景指南：课堂点名、直播抽奖、团建分组、活动公平性。
- 站内 GSC 当前无该品类权重，需 3–6 个月积累；不要预期短期主词排名。

### 7.7 商业化

- **核心功能全免费**：无广告、无注册、无条目上限、权重免费 —— 这是最有力的差异化。
- 可选变现：专业模板包 / 品牌定制 / OBS 高级主题 / 明确可关闭且非遮挡式广告。
- 禁止：条目数上限、权重付费、强制登录、不可跳过广告。

---

## 8. 风险与下一步验证

1. **品牌壁垒**：`wheel of names` 已成品类代名词，主词几乎无法撼动。
2. **站群覆盖**：英文长尾被批量页面占满，需要以真实体验与免费策略取胜。
3. **中文需求未量化**：Trends CN 无数据，建议用百度指数 / 5118 / 站长工具补验后再决定中文页投入。
4. **绝对搜量未知**：未用 Keyword Planner 校准，报告中所有 Trends 数字均为相对指数。
5. **建议下一步**：
   - 用 Google Keyword Planner（GSC 账号应有广告权限）拉 `spin the wheel` 等词的绝对月均搜索量与竞争度；
   - 用可直接访问的竞品帮助/定价页补齐付费墙细节；
   - 在仓库中确认 `/spin-the-wheel` 路由、i18n 六语言、`prerenderRoutes`、sitemap、侧边栏接线位置后再动手实现。
