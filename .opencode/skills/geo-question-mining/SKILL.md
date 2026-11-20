---
name: "geo-question-mining"
description: "GEO (Generative Engine Optimization) workflow that discovers the natural-language questions real users ask AI assistants, then turns them into on-page FAQ / llms.txt / schema content so the site gets cited in AI answers. Use whenever doing GEO / AI-search optimization / answer-engine layout, planning FAQ sections, writing ai-citable long-form copy, or deciding which questions a new tool page must answer. Triggers: GEO, 生成式引擎优化, AI 搜索优化, 问 AI 客户怎么问, 用户会怎么问, FAQ 布局, llms.txt, AI Overviews, answer engine, 被 AI 引用, 问题挖掘."
---

# GEO 问题挖掘（问 AI「客户会怎么问」）

## 核心原则

**SEO 抢排名，GEO 抢引用。** 用户在 AI 助手里不是输关键词，而是用完整自然语言提问。
所以内容要按「问题 → 直接答案」组织，而不是按「关键词 → 文案」组织。

> 强制步骤：做任何 GEO / AI 搜索布局前，**先问 AI「目标用户就这个主题会怎么问？」**，
> 把得到的问题清单当成页面的 FAQ、H2 标题、llms.txt 条目的唯一输入源。
> 这一步不是可选项 —— 没有它，GEO 内容就是闭门造车。

## 何时用

- 新工具页 / 长尾页的 SEO+GEO 布局（本仓库 `pages/*.vue`）
- 给现有页面补 FAQ 与结构化数据
- 要更新 `llms.txt` / `llms-full.txt` 的「AI 须知」
- 调研某个主题该做哪些页面

## 步骤

### 1. 明确目标与人群
写一句话：谁、在什么场景、想解决什么。例：
「老师、活动主持、直播主，想用在线转盘随机点名 / 抽奖 / 做决定。」

### 2. 问 AI（本助手即 AI，直接生成；或用外部 AI Mode / ChatGPT）
标准提示词（可直接复用）：

```
一个用户想用 [工具/主题] 来解决 [场景]。
请列出目标用户最可能向 AI 助手提出的 30 个自然语言问题，
按意图分组：①怎么操作 ②公平性/可信度 ③对比与替代 ④限制与收费 ⑤使用场景。
要求：用用户的原话，不要用营销语言；每个问题单独一行。
```

中文场景把提示词换成中文即可。若外部 AI 抓不到（本项目 Google AI Mode 正文常为空），
**由本助手直接以 AI 身份回答同一问题**，产出等价问题库，并记录标注「来源：agent 自问」。

### 2.5 用 Autocomplete 校验用户原话（防止 AI 问题库跑偏）

AI 生成的问题库再自然，也是「推测」。必须用真实搜索建议校验用词、词序和场景权重。
标准做法（本项目已验证可行，走 SOCKS5 代理）：

```powershell
$proxy = "socks5h://127.0.0.1:4080"
$q = "yes or no wheel"
$url = "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=" + [uri]::EscapeDataString($q)
curl.exe --proxy $proxy -s --max-time 15 $url
```

把主词 + 各场景词（10–15 组）跑一遍，重点看三件事：
1. **词序/写法**：`random picker no repeats` 有联想，`no repeat name picker` 返回空 → 页面 keywords 用前者。
2. **场景权重**：`random giveaway picker` 返回 instagram/tiktok/youtube 一串 → 社媒抽奖是最大长尾，必须单独做 FAQ/use case。
3. **修饰词**：`spin the wheel` 返回 custom/generator/yes or no → 进 keywords 与 H2。

> 调研不是交付物，是页面的输入。每一条有效联想都要映射到具体页面元素（见第 3 步），
> 并在方案文档里留下「发现 → 调整 → 代码位置」的对照表。
> 本项目完整示例见 `docs/wheel-spinner-geo-seo-layout.md` 第 8 节。

### 3. 问题分级 → 页面元素映射（关键表）

| 问题类型 | 落点 | 结构化数据 |
|---|---|---|
| 怎么操作（how-to） | 页面 H2 + 直接答案段 + FAQ | FAQPage |
| 公平性/可信度 | 首屏「可信承诺」区块 + 独立审计说明 | FAQPage + `schemaProperties` |
| 对比与替代 | 独立 alternatives 页 / 对比章节 | Article + dateModified |
| 限制与收费 | FAQ 明确写「免费 / 无上限 / 无注册」 | FAQPage + `offers.price=0` |
| 使用场景 | 长文段落 + 模板入口 + llms.txt 条目 | WebApplication featureList |

### 4. GEO 内容三件套（每个问题都要过一遍）

1. **直接答案前置**：每个 H2 下第一段 40–60 词即可独立引用，不依赖上下文。
2. **FAQ 可见且同源**：页面可见 FAQ 与 `useToolSeo({ faqItems })` 用同一份数据，
   同时生成 FAQPage schema —— AI 抓得到结构化数据，也抓得到正文。
3. **llms.txt 收口**：把「要点 + 直接答案」写进 `public/llms.txt` 与 `llms-full.txt`
   （本仓库由 `npm run llms` 从 `data/tool-content.ts` 生成，改文案后必须重跑）。

### 5. 接线（本仓库特有，漏一条等于没上线）

- [ ] `pages/<slug>.vue` 的 `useToolSeo` 传 `faqItems`（来自问题库）
- [ ] `data/tool-content.ts` 加该路由长文案（heading + paragraphs + bullets）—— llms 语料源
- [ ] `i18n/locales/{en,zh,ja,de,fr,ar}.json` 六语言同批（key 结构对齐 EN）
- [ ] `scripts/generate-llms.mjs` 的 `GROUPS` 归类新工具，否则落入 "Other tools"
- [ ] 跑 `npm run llms` 重生成两份 txt（deploy 脚本不自动跑，必须手动）
- [ ] `layouts/default.vue` 侧栏 + `pages/index.vue` 首页卡加入口
- [ ] `nuxt.config.ts`：静态页自动进 prerender/sitemap，无需改；动态路由才需 `EXTRA_PRERENDER_ROUTES`
- [ ] 若新页只有 EN/ZH 文案：页面传 `translatedLocales: ['en','zh']`，并在布局 `useHead` 中把它加入「页面独占 cluster」分支，避免两套 hreflang 冲突
- [ ] 长尾页复用同一落地页组件 + 共享兄弟内链表，避免每个页面重复写模板与链接簇

## 坑 → 根因 → 规避

| 坑 | 根因 | 规避 |
|---|---|---|
| 页面有 FAQ 但 AI 不引用 | 答案埋在长文里，没有独立可引用段 | 每个问题下第一段写 40–60 词自足答案 |
| AI 引用了竞品而不是本站 | 本站 llms.txt 没写该工具 / 没有明确「本地处理、免费」事实 | 更新 tool-content + 重跑 llms，首屏写清事实 |
| FAQPage schema 与正文不一致 | 两处各写一份 | 同一 `faqItems` computed 同时渲染与传 schema |
| 六语言只有英文版被引用 | 只写 EN，其他 locale 回退 = 重复内容 | 六语言同批交付 + 校验段落齐全 |
| llms.txt 上线后没变 | deploy 脚本不跑 `npm run llms` | 部署清单里显式加这一步 |
| 问题库是营销词不是用户问法 | 用「高效、专业、一站式」等词 | 要求 AI 用用户原话，禁用营销形容词 |
| en/zh 落地页出现 6 语言 hreflang 冲突 | 布局层 i18n cluster 与页面 `translatedLocales` 两套并存 | 页面传 `translatedLocales: ['en','zh']`，同时在 `layouts/default.vue` 的 `useHead` 把该路由加入 `links = []` 分支（与 alternatives/legal 页一致），让页面独占 canonical/hreflang |

## 产出模板

一次挖掘结束，交付三样：
1. **问题库**：按 5 类意图分组、每条单行的用户原话清单（标注来源：外部 AI / agent 自问）
2. **映射表**：每个问题 → 页面元素 → schema 字段
3. **落地清单**：上面第 5 步的接线 checkbox（勾选状态）

部署后核对：`grep` 新路由在 `sitemap_index.xml` 与 `llms.txt` 中命中；FAQ 可见且与 schema 一致。
