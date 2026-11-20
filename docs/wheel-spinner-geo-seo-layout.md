# 通用转盘 / 随机决策工具：GEO + SEO 布局方案

> 输入：`docs/wheel-spinner-research.md`（需求与竞品调研）
> 方法：`.opencode/skills/geo-question-mining`（GEO 问题挖掘）
> 状态：方案层，不含业务代码改动
> 日期：2026-11-20

---

## 0. 这份方案解决什么

调研已经证明「转盘/随机点名」是成熟品类：Trends 美国 `spin the wheel` 相对指数均值 83，`wheel of names` 74.4，App Store 头部 4 款累计 22.3 万评分。
但本站 GSC 近 16 个月**零曝光**——必须从长尾切入、用 GEO 抢 AI 引用双线并行。

核心策略一句话：

> **SEO 用「精确短语页」抢排名，GEO 用「用户问题 → 直接答案」抢 AI 引用，两者共用同一份 FAQ 与长文案作为数据同源。**

---

## 1. GEO 第一步：问 AI「客户会怎么问」（强制步骤）

### 1.1 提问的提示词（skill 标准模板）

```
一个用户想用在线转盘/随机点名工具解决课堂点名、抽奖、团队决策问题。
请列出目标用户最可能向 AI 助手提出的 30 个自然语言问题，按意图分组：
①怎么操作 ②公平性/可信度 ③对比与替代 ④限制与收费 ⑤使用场景。
要求用用户原话，不要营销语言，每个问题单独一行。
```

> 来源说明：尝试用 Google AI Mode（页面参数 `udm=48`）抓取外部 AI 回答，但正文返回为空（本项目代理环境下 AI Mode 不可抓取）。
> 因此按 skill 规则，**由本助手以 AI 身份直接回答同一问题**，产出等价问题库。来源标注：`agent 自问`。

### 1.2 问题库（agent 自问，用户原话）

**① 怎么操作（how-to）**
1. 怎么在线做一个转盘来随机点名？
2. 怎么把一长串名字粘进转盘里？
3. 转盘的每个选项能设置不同的中奖概率吗？
4. 怎么让转盘抽中后不再重复抽到同一个人？
5. 转盘能不能导出或保存，下次打开还保留名单？
6. 怎么把转盘全屏显示给全班看？
7. 转盘转起来要多久，能不能调快一点？
8. 手机上能用这个转盘吗？
9. 怎么把转盘链接发给同事一起用？
10. 能不能只抽一部分、把已经抽过的移掉？

**② 公平性 / 可信度（trust）** ← 调研中 `wheel of names rigged` 是高排位联想词
11. 在线转盘抽奖真的随机吗，会不会被操控？
12. 怎么证明转盘的结果是公平随机的？
13. 转盘用的是什么随机数算法？
14. 权重设置会不会让转盘作弊？
15. 抽签结果能复核吗，有没有记录？
16. 为什么感觉总是抽到同一个人？

**③ 对比与替代（comparison）**
17. Wheel of Names 有免费替代品吗？
18. 有没有不用注册、没有广告的转盘工具？
19. Picker Wheel 和 Wheel of Names 哪个好？
20. 有没有能设置权重和百分比的转盘？
21. 哪个转盘支持 OBS 直播嵌入？
22. Wheel of Names 免费版有什么限制？

**④ 限制与收费（limits）**
23. 这个转盘免费吗，要付费吗？
24. 免费版最多能加多少个名字/选项？
25. 需要注册账号或登录吗？
26. 名单会不会上传服务器？隐私吗？

**⑤ 使用场景（use cases）**
27. 课堂上怎么用转盘随机点学生回答问题？
28. 直播抽奖怎么用转盘抽观众？
29. 怎么随机把一组成员分成几组？
30. 选择困难时怎么用转盘做决定？
31. Secret Santa（秘密圣诞老人）怎么用转盘抽签不抽到自己？
32. 活动暖场怎么用转盘做暖场抽奖？

中文补充（agent 自问）：
- 在线抽奖转盘怎么做？
- 随机点名不重复怎么设置？
- 随机抽签分组工具哪个好用？
- 转盘抽奖的几率能调吗？
- 免费无广告的在线转盘推荐？

### 1.3 问题 → 页面元素映射表（skill 第 3 步）

| 问题类型 | 代表问题 | 落点 | 结构化数据 |
|---|---|---|---|
| 怎么操作 | #1 #3 #4 #6 | 主工具页 H2 + 直接答案段 + FAQ | FAQPage |
| 公平性/可信度 | #11 #12 #13 #15 | 首屏「可信承诺」区块 + 独立审计说明 | FAQPage + `schemaProperties` |
| 对比与替代 | #17 #19 #22 | 独立 `alternatives/wheel-of-names` 页 | Article + `dateModified` |
| 限制与收费 | #23 #24 #25 #26 | FAQ 明写「免费/无上限/无注册/本地」 | FAQPage + `offers.price=0` |
| 使用场景 | #27 #28 #29 #31 | 各场景长尾页 + 模板入口 + llms.txt 条目 | WebApplication `featureList` |

> 关键洞察：调研里最痛的三点——**付费墙（111 条吐槽）、广告（37 条）、随机性存疑（19 条 + `rigged` 联想词）**——
> 正好对应 GEO 的「信任类问题」。把这三点写成**可引用的直接答案**，就是本站相对竞品最大的 GEO 差异化。

---

## 2. SEO 布局：URL 矩阵（按调研竞争度分级）

### 2.1 主工具页（P0，抢品类核心词）

| 路由 | 目标词 | 调研依据 | H1（精确短语） |
|---|---|---|---|
| `/spin-the-wheel` | spin the wheel | Trends 83，最大品类词 | Spin the Wheel — Free Random Picker |
| `/random-name-picker` | random name picker | Autocomplete 高相关 + 教师场景 | Random Name Picker |
| `/yes-or-no-wheel` | yes or no wheel | Trends 上升词 + 竞品长尾页 | Yes or No Wheel |

每页结构：`useToolSeo(title/description/keywords/faqItems/dateModified)` + 可见 FAQ + 长文案（`data/tool-content.ts`）。

### 2.2 场景/模式长尾页（P0-P1，实际流量入口）

| 路由 | 目标词 | 竞争度 | 优先级 |
|---|---|---|---|
| `/no-repeat-name-picker` | random name picker no repeats | 中 | P0 |
| `/weighted-random-wheel` | random wheel with percentages | 中 | P0 |
| `/raffle-wheel` | raffle wheel / raffle generator | 中高 | P0 |
| `/random-team-generator` | random team generator | 中（SERP 有空位） | P0 |
| `/classroom-name-picker` | classroom random name picker | 中 | P1 |
| `/giveaway-picker` | giveaway picker instagram/tiktok | 中 | P1 |
| `/secret-santa-picker` | secret santa picker | 低-中 | P1 |
| `/elimination-wheel` | random wheel elimination | 低-中 | P1 |

### 2.3 对比页（GEO 高价值，抢「替代」类问题）

| 路由 | 目标词 | 说明 |
|---|---|---|
| `/alternatives/wheel-of-names` | wheel of names alternative | 已有 `alternatives/` 目录与 Article schema 模式（`pages/alternatives/toolmole.vue`），直接复用；需 `dateModified` + 事实性对比 |

### 2.4 中文页（通过 i18n 前缀，不新建路由）

`/zh/spin-the-wheel`、`/zh/random-name-picker` 等自动由 `PRERENDER_LOCALES` 生成。
目标词：在线抽奖、随机点名、随机抽签、转盘抽奖（Autocomplete 已验证存在）。

> 注意：`wheel of names` 是竞品品牌词。只做「alternative / what is」事实性对比页，不做冒充品牌的主工具页，避免商标风险。

---

## 3. GEO 内容三件套（skill 第 4 步，每页都要过）

### 3.1 直接答案前置（40–60 词，AI 可独立引用）

每个 H2 下第一段必须是自足答案。示例（`/spin-the-wheel` 首屏，对应问题 #1 #11 #23）：

> A spin-the-wheel tool picks one option at random from a list you provide, for tasks like classroom roll call, giveaways, or team decisions. OnliTool's wheel runs entirely in your browser, uses cryptographic random numbers, needs no sign-up, has no entry limit, and shows an audit trail for every result.

要素：`用途定义` + `本地处理` + `CSPRNG` + `无注册/无上限` + `可审计`。这五点直接命中调研里的信任痛点。

### 3.2 FAQ 可见且同源

- 页面模板渲染 `faqItems`（来自问题库映射）
- 同一份 `faqItems` computed 传给 `useToolSeo({ faqItems })` 生成 FAQPage schema
- 禁止两处各写一份（skill 明列的坑）

### 3.3 llms.txt 收口

- `data/tool-content.ts` 为每个新路由加 `{ heading, paragraphs, bullets }`
- `scripts/generate-llms.mjs` 的 `GROUPS` 新增分类：

```js
{
  title: 'Random decision and wheel tools',
  match: (path) => /spin-the-wheel|name-picker|random-wheel|raffle-wheel|team-generator|yes-or-no-wheel|elimination-wheel|giveaway-picker|secret-santa/.test(path)
}
```

- 在 `## Notes for AI assistants` 增加可引用事实：

```
- Random picker tools run locally in the browser with no sign-up and no entry limit.
- Wheel results are chosen with cryptographic randomness before the spin animation; an audit note is shown for each result.
```

- **必须手动跑 `npm run llms`**（`deploy` 脚本不含此步，skill 已列为坑）。

---

## 4. 页面调整清单（调研结论 → 页面改动点）

| 调研发现 | 页面调整点 | GEO/SEO 元素 |
|---|---|---|
| 付费墙是头号吐槽（111） | 首屏 + FAQ 明写「100% 免费、无选项上限、权重免费」 | 直接答案 + `offers.price=0` |
| 广告吐槽（37） | 明写「无广告」，不做广告位 | 信任区块 + FAQ |
| `rigged` 联想词（19+） | 新增「公平性如何保证」区块：CSPRNG + 先定结果后动画 + 审计记录 | FAQPage + `schemaProperties` |
| 多随机器被藏起来招差评 | 二级入口显式列出 coin flip / random number / shuffle，一级直达 | `featureList` + 内链 |
| 名单数量限制吐槽 | 明写「支持 500+ 选项、批量粘贴/CSV」 | FAQ + 长文案 bullets |
| `no repeats` `with percentages` `elimination` 是高频长尾 | 各做独立长尾页 + 交叉内链（兄弟页 5-8 条） | 精确 H1 + FAQ + 内链 |
| OBS/直播场景 | 工具页加「OBS 嵌入」说明，长尾页承接 | featureList |
| 竞品站群用 `tools/*` 批量页 | 本站用 `pages/*.vue` 静态页（自动进 prerender/sitemap） | sitemap 覆盖 |

---

## 5. 接线清单（skill 第 5 步，本仓库特有）

新增每个页面时逐条勾选：

- [ ] `pages/<slug>.vue`：`useToolSeo` 传 `title`/`description`/`keywords`/`faqItems`/`dateModified`
- [ ] 页面模板可见渲染 FAQ（与 schema 同源）
- [ ] `data/tool-content.ts`：加 `'/<slug>': { heading, paragraphs, bullets }`
- [ ] `i18n/locales/{en,zh,ja,de,fr,ar}.json` 六语言同批（EN 先写，其他对齐 key）
- [ ] `scripts/generate-llms.mjs`：`GROUPS` 归类（见 3.3）
- [ ] 跑 `npm run llms` 重生成 `llms.txt` / `llms-full.txt`
- [ ] `layouts/default.vue` 侧栏入口 + `pages/index.vue` 首页卡（工具级）
- [ ] `nuxt.config.ts`：静态页自动进 prerender/sitemap，无需改

---

## 6. 验收（部署后）

1. `grep` 新路由在 `sitemap_index.xml` 与 `public/llms.txt` 中命中
2. FAQ 在页面可见，且与 `FAQPage` schema 的 `mainEntity` 一一对应
3. 每个 H2 下第一段是 40–60 词自足答案（不依赖上下文）
4. 六语言版本段落齐全，canonical 自指，hreflang 含 `x-default`
5. 用 AI 助手问问题库里的 5 类问题，检查是否引用本站（GEO 效果回测）

---

## 7. 与已有 GEO 基础设施的关系（不重复造轮子）

本仓库**已有**：`llms.txt` / `llms-full.txt`（生成器）、`robots.txt` 放行 8 类 AI 爬虫、`app.vue` 的 llms.txt `<link>` 与 `max-snippet:-1`、`useToolSeo` 的 FAQPage/Breadcrumb/Organization schema。
本方案**新增的是方法论与内容**：把「问 AI 客户会怎么问」固化为 skill，用问题库驱动 FAQ 与 llms 内容，而不是新增 GEO 代码模块。

---

## 8. 实证调研 → 页面调整记录（本次已执行）

> 用户要求：先实现页面，再做 SEO/GEO 调研，最后按调研结果调整页面。
> 调研时间：2026-11-20；方法：Google Autocomplete（15 组种子词，走 SOCKS5 代理）+ skill 问题库回看。

### 8.1 Autocomplete 实证发现（一手数据）

| 种子词 | 返回的高价值联想词 | 对页面的含义 |
|---|---|---|
| `spin the wheel` | custom / generator / names / yes or no / random picker / game / number / app | 主词需求真实；`custom`、`generator` 应进 keywords |
| `raffle wheel` | generator / spinner / online / numbers / **free** / app（10 条全返回） | 抽奖是强需求；`free` 高频 → 首屏免费承诺 |
| `yes or no wheel` | spin / decide / picker / **tarot** / **with question** / wheel of fortune tarot | 塔罗 + 带问题场景明确 → 新增 FAQ #9 |
| `random giveaway picker` | **instagram / facebook / tiktok / youtube / twitter** / free / wheel | 社媒抽奖是最大长尾群 → 新增 FAQ #8 + use case #2 |
| `random team generator` | **with names** / wheel / nba / nfl / pokemon / genshin / soccer | 分组场景真实且有游戏二创 → 新增 FAQ #10 + use case #3 |
| `spin the wheel for classroom` | game for classroom / classroom tools / writing ideas / game ideas | 课堂场景明确 → 新增 use case #1 |
| `random picker no repeats` | **random name picker no repeats** / random number no repeats / no repeats lottery | 用户实际词序是 `name picker no repeats`，不是 `no repeat name picker` → keywords 用词序修正 |
| `weighted random wheel` | generator / what is weighted distribution | 权重词有量但偏工具性 → 保留 FAQ #4 + keywords |
| `wheel of names alternative` | alternative reddit / **free alternative** / similar to wheel of names | 替代意图明确 → 对比页维持 P1，`free` 是核心卖点 |
| `no repeat name picker` / `wheel spinner` | 返回空 | 这两组词序/写法无联想，**不作为主目标词** |

> 中文 Autocomplete 在本代理下返回乱码/空，中文词继续只用此前调研的定性结论（在线抽奖、随机点名、随机抽签）。

### 8.2 据此做出的页面调整（已落地）

| 调研发现 | 页面调整 | 代码位置 |
|---|---|---|
| 社媒抽奖是最大长尾群 | FAQ 新增 #8（Instagram/TikTok/YouTube 抽奖）+ use case #2 + keywords | `spin-the-wheel.vue` / 六语言 |
| `yes or no wheel tarot` 高频 | FAQ 新增 #9（是/否 + 塔罗）+ use case #4 | 同上 |
| `random team generator with names` | FAQ 新增 #10（名单分组）+ use case #3 | 同上 |
| 课堂场景明确 | 新增 use case #1（课堂点名 + 投影全屏） | 同上 |
| `no repeat name picker` 无联想、正确词序是 `...no repeats` | keywords 与 FAQ #3 统一到 `random name picker no repeats` | 同上 |
| `custom` / `generator` 高频 | FAQ 新增 #7（自定义）+ keywords 增补 | 同上 |
| `free` 在 raffle/alternative 反复出现 | 首屏 trust strip + FAQ #1 + `offers.price=0` | 同上（已有基础上强化） |

**结果**：FAQ 从 6 条扩到 10 条，`featureList` 从 6 条扩到 10 条，新增 4 个「使用场景」直接答案区块（GEO 可引用），keywords 按真实联想词补齐。六语言 `wheelTool` 从 63 key 扩到 84 key。

### 8.3 已落地：长尾页与对比页（第二批实现）

> 按 8.1 的 Autocomplete 结果，8.2 调整主工具页之后，继续把最大长尾群拆成独立页面。
> 由于这些页的目标词来自英文 Autocomplete，正文按已有 `alternatives/toolmole.vue` 模式
> 内联 EN/ZH 双语文案（其余语言由 canonical 折回英文），并复用同一套 `useToolSeo` 约束。

| 新页面 | 目标词（Autocomplete 实证） | 页面结构 |
|---|---|---|
| `/yes-or-no-wheel` | `yes or no wheel tarot`、`with question` | 精确 H1 + 直接答案 + 步骤 + 6 FAQ |
| `/raffle-wheel` | `raffle wheel free`、`generator` | 精确 H1 + 淘汰模式说明 + 直播/投影 + 6 FAQ |
| `/random-name-picker-no-repeats` | `random picker no repeats`（词序已校验） | 精确 H1 + 不重复原理 + 权重 + 6 FAQ |
| `/random-giveaway-picker` | `giveaway picker instagram/tiktok/youtube` | 精确 H1 + 社媒名单 + 审计凭证 + 6 FAQ |
| `/alternatives/wheel-of-names` | `wheel of names free alternative` | 事实对比表 + 免责声明 + 6 FAQ（复用 toolmole 模板） |

**接线（每条都已执行）**

- 复用组件 `components/WheelDecisionLanding.vue`：4 个长尾页共用 hero / 直接答案 / 步骤 / 兄弟内链 / FAQ 结构，避免模板重复。
- 兄弟内链集中放在 `data/wheel-related.ts`，6 条互链（主工具 + 4 长尾 + 对比页），每个页面自动获得同一内链簇。
- 每个页面 `useToolSeo({ type: 'WebPage', translatedLocales: ['en','zh'], dateModified, faqItems, keywords })`：
  FAQ 可见 `<details>` 与 `FAQPage` schema 同源；`translatedLocales` 让 ja/de/fr/ar 的 canonical 折回英文。
- `layouts/default.vue`：新增 `isWheelLandingRoute`，让这 4 个页像 alternatives/legal 页一样由页面自己管辖
  canonical/hreflang，避免 i18n 层再广播一套不存在的 ja/de/fr/ar hreflang（会产生冲突链接）。
- 侧栏 `menu.crypto` 与首页工具卡各加 4 个入口；六语言 `home.tools` 新增 `wheelRaffle`/`wheelYesNo`/
  `wheelNoRepeats`/`wheelGiveaway`（Node 脚本注入，UTF-8 无乱码）。
- `pages/alternatives/index.vue`：对比 hub 增加 Wheel of Names 对比卡入口，避免对比页只有回链、无可发现入口。
- `data/tool-content.ts` 新增 5 个路由长文案；`generate-llms.mjs` GROUPS 正则补 `wheel-of-names`，
  `npm run llms` 后 `llms.txt: 7 core pages, 62 tools`。

**预渲染验证**：498 个路由全部预渲染成功；新页 H1 与精确目标词一致、FAQ schema 与可见 FAQ 各 6 条、
canonical 自指、hreflang 仅 en/zh/x-default；`/zh/*` 版本同步生成。

### 8.4 剩余待办

- `/weighted-random-wheel`、`/classroom-name-picker`、`/secret-santa-picker`、`/elimination-wheel`
  （Autocomplete 证据较弱或竞争度更高，暂列 P1/P2）。
- 上线后用 GSC 检查新页的「已编入索引 / 覆盖率」与真实 query 表现，再决定是否继续扩页。
