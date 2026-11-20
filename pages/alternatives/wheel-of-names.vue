<template>
  <div class="mx-auto max-w-5xl py-6 sm:py-10">
    <!-- Hero -->
    <header class="reveal relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_60px_-52px_rgba(0,0,0,0.5)] dark:border-slate-800 dark:bg-slate-900/95 sm:p-10" style="--rd: 40ms">
      <div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ff5a2d]/10 blur-3xl" aria-hidden="true" />
      <div class="relative">
        <nav class="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500" aria-label="Breadcrumb">
          <NuxtLinkLocale to="/alternatives" class="transition hover:text-primary">{{ copy.breadcrumbHub }}</NuxtLinkLocale>
          <span aria-hidden="true">/</span>
          <span class="text-slate-600 dark:text-slate-300">Wheel of Names</span>
        </nav>
        <p class="kicker mt-4">{{ copy.kicker }}</p>
        <h1 class="mt-3 max-w-3xl font-display text-[clamp(2.1rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-slate-900 dark:text-white">
          {{ copy.title }}
        </h1>
        <p class="mt-5 max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {{ copy.lead }}
        </p>
        <p class="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          {{ copy.updated }}
        </p>
      </div>
    </header>

    <!-- Verdict -->
    <section class="mt-5 rounded-2xl border border-[#ff5a2d]/25 bg-[#ff5a2d]/5 p-5 sm:p-6" aria-labelledby="verdict-title">
      <p id="verdict-title" class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff5a2d]">{{ copy.verdictLabel }}</p>
      <p class="mt-2 max-w-3xl text-[15px] font-medium leading-7 text-slate-800 dark:text-slate-100">
        {{ copy.verdict }}
      </p>
    </section>

    <!-- Disambiguation / affiliation -->
    <section class="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/80 sm:p-6" aria-labelledby="disambiguation-title">
      <h2 id="disambiguation-title" class="font-display text-lg font-bold text-slate-900 dark:text-white">
        {{ copy.disambiguationTitle }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
        {{ copy.disambiguation }}
      </p>
      <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
        {{ copy.affiliationNote }}
      </p>
    </section>

    <!-- Comparison table -->
    <section class="mt-8" aria-labelledby="table-title">
      <h2 id="table-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ copy.tableTitle }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{{ copy.tableNote }}</p>

      <div class="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table class="w-full min-w-[720px] border-collapse text-start text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/70">
              <th scope="col" class="w-[24%] px-4 py-3 text-start font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {{ copy.tableFeature }}
              </th>
              <th scope="col" class="px-4 py-3 text-start font-display text-[15px] font-bold text-slate-900 dark:text-white">
                {{ copy.tableThem }}
              </th>
              <th scope="col" class="px-4 py-3 text-start font-display text-[15px] font-bold text-slate-900 dark:text-white">
                {{ copy.tableUs }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in copy.rows" :key="row.feature" class="border-t border-slate-200 align-top dark:border-slate-800">
              <th scope="row" class="px-4 py-3 text-start font-medium text-slate-700 dark:text-slate-200">{{ row.feature }}</th>
              <td class="px-4 py-3 leading-6 text-slate-600 dark:text-slate-300">{{ row.them }}</td>
              <td class="px-4 py-3 leading-6 text-slate-600 dark:text-slate-300">{{ row.us }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- When to choose -->
    <section class="mt-8 grid gap-4 md:grid-cols-2" aria-labelledby="choose-title">
      <h2 id="choose-title" class="sr-only">{{ copy.chooseTitle }}</h2>
      <div class="rounded-2xl border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{{ copy.chooseThemLabel }}</p>
        <ul class="mt-3 space-y-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <li v-for="item in copy.chooseThem" :key="item" class="flex gap-2.5">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
      <div class="rounded-2xl border border-primary/25 bg-primary/5 p-5 dark:border-primary/30 dark:bg-primary/10 sm:p-6">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{{ copy.chooseUsLabel }}</p>
        <ul class="mt-3 space-y-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
          <li v-for="item in copy.chooseUs" :key="item" class="flex gap-2.5">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Deeper links -->
    <section class="mt-8 rounded-[28px] border border-slate-200 bg-white/95 p-6 dark:border-slate-800 dark:bg-slate-900/95 sm:p-8" aria-labelledby="deeper-title">
      <h2 id="deeper-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ copy.deeperTitle }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{{ copy.deeperIntro }}</p>
      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <NuxtLinkLocale
          v-for="link in copy.deeperLinks"
          :key="link.path"
          :to="link.path"
          class="lift group flex items-start justify-between gap-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 transition hover:border-primary/40 dark:border-slate-700/70 dark:bg-slate-800/40"
        >
          <span>
            <span class="block text-sm font-semibold text-slate-800 dark:text-slate-100">{{ link.title }}</span>
            <span class="mt-1 block text-[13px] leading-6 text-slate-500 dark:text-slate-400">{{ link.text }}</span>
          </span>
          <span class="mt-1 shrink-0 font-mono text-sm text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#ff5a2d]" aria-hidden="true">→</span>
        </NuxtLinkLocale>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mt-8" aria-labelledby="faq-title">
      <h2 id="faq-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ copy.faqTitle }}
      </h2>
      <div class="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white/90 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/80">
        <details v-for="faq in copy.faqs" :key="faq.q" class="group p-5">
          <summary class="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-semibold text-slate-800 dark:text-slate-100">
            <span>{{ faq.q }}</span>
            <span class="mt-0.5 font-mono text-slate-400 transition group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{{ faq.a }}</p>
        </details>
      </div>
    </section>

    <!-- Disclaimer -->
    <footer class="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <p class="text-[13px] leading-6 text-slate-500 dark:text-slate-400">{{ copy.disclaimer }}</p>
      <p class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
        <NuxtLinkLocale to="/alternatives" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
          {{ copy.breadcrumbHub }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/spin-the-wheel" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
          {{ copy.linkWheel }}
        </NuxtLinkLocale>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { locale } = useI18n()
const isZh = computed(() => locale.value === 'zh')

const en = {
  breadcrumbHub: 'All alternatives',
  kicker: 'Alternatives · Wheel of Names',
  title: 'Wheel of Names alternative: a free, private picker',
  lead: 'Short answer: Wheel of Names (wheelofnames.com) is a popular browser spinner for classroom names and giveaways. OnliTool is a free alternative that runs locally, needs no account, shows no ads, places no limit on entries and publishes an audit note with cryptographic randomness for every result.',
  updated: 'Last updated: November 20, 2026',
  verdictLabel: 'The short version',
  verdict: 'Choose Wheel of Names if you want a mature, widely used spinner with 65 languages, image and Google Sheets import, multiple wheels, OBS support and a large sound library. Choose OnliTool if an ad-free interface, a per-spin audit note with an entry hash, and local-only storage matter more to you.',
  disambiguationTitle: 'Which product is this about?',
  disambiguation: 'This page compares Wheel of Names, the browser wheel at wheelofnames.com. "Wheel of Names" is also used as a generic phrase for any name spinner; this comparison is about the specific product, not the category.',
  affiliationNote: 'OnliTool is not affiliated with Wheel of Names. The name is used only to identify the product being compared.',
  tableTitle: 'Side by side',
  tableNote: 'Based on the public pages of both sites in November 2026. Products change; confirm a specific feature on the tool page before relying on it.',
  tableFeature: 'Feature',
  tableThem: 'Wheel of Names (wheelofnames.com)',
  tableUs: 'OnliTool (this site)',
  rows: [
    {
      feature: 'What it is',
      them: 'A widely used browser wheel for randomly picking names, numbers and custom entries.',
      us: 'An independent browser workbench with a free spin-the-wheel tool and other random helpers.'
    },
    {
      feature: 'Where it runs',
      them: 'Browser-based; public site reports local and cloud save options.',
      us: 'Runs in your browser; the entry list is kept in local storage on your device.'
    },
    {
      feature: 'Account required',
      them: 'No sign-up advertised for core use.',
      us: 'No account for any tool.'
    },
    {
      feature: 'Price and ads',
      them: 'Core tools advertised as free; advertising exists and can be dismissed.',
      us: 'Free with no ads and no paywall.'
    },
    {
      feature: 'Randomness',
      them: 'Public site states it uses crypto.getRandomValues and publishes a randomness audit.',
      us: 'Uses Web Crypto; the result is picked before the animation and each spin shows an audit note with random value, timestamp and entry-list hash.'
    },
    {
      feature: 'Import formats',
      them: 'Advertises image import and Google Sheets import in addition to pasted lists.',
      us: 'Paste a list separated by newlines, commas or semicolons; share links encode the list in the URL.'
    },
    {
      feature: 'Languages',
      them: 'Public site advertises 65 languages.',
      us: 'Six languages: English, 简体中文, 日本語, Deutsch, Français, العربية.'
    },
    {
      feature: 'Streaming and presentation',
      them: 'Public site advertises OBS / Streamlabs support and 150+ sound effects.',
      us: 'Fullscreen mode, sound and confetti; capture the browser window in OBS or Streamlabs.'
    },
    {
      feature: 'Other random helpers',
      them: 'Focused on wheel/spinner features and templates.',
      us: 'Coin flip, random number and shuffle controls are exposed next to the wheel.'
    }
  ],
  chooseTitle: 'When to choose each',
  chooseThemLabel: 'Good reasons to use Wheel of Names',
  chooseThem: [
    'You need 65 interface languages or a large sound library.',
    'You want to import names from an image or a Google Sheet.',
    'You rely on multiple saved wheels and short links in one product.',
    'You want a tool with a very large install base and many tutorials.'
  ],
  chooseUsLabel: 'Good reasons to use OnliTool',
  chooseUs: [
    'You want an ad-free screen when projecting a draw in class or on stream.',
    'You want a fresh audit note with an entry hash for every single spin.',
    'You want the entry list to stay in local storage and never touch a server.',
    'You also need coin flips, random numbers and shuffle in the same place.'
  ],
  deeperTitle: 'Pick the right wheel for the job',
  deeperIntro: 'If you do not need a full comparison, these task pages answer the most common questions directly and open the free wheel with the right settings.',
  deeperLinks: [
    { path: '/spin-the-wheel', title: 'Spin the Wheel', text: 'The main free picker with weights, no-repeats mode and audit notes.' },
    { path: '/yes-or-no-wheel', title: 'Yes or No Wheel', text: 'Two-sided spinner for binary decisions and tarot-style questions.' },
    { path: '/raffle-wheel', title: 'Raffle Wheel', text: 'Run a fair prize draw from a list of names or ticket numbers.' },
    { path: '/random-name-picker-no-repeats', title: 'Random Name Picker No Repeats', text: 'Draw names without picking the same person twice.' },
    { path: '/random-giveaway-picker', title: 'Random Giveaway Picker', text: 'Pick winners from Instagram, TikTok and YouTube entries.' }
  ],
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'Is there a free alternative to Wheel of Names?',
      a: 'Yes. OnliTool offers a free spin-the-wheel tool with no account, no ads and no entry limit. Like Wheel of Names, it runs in the browser. It adds a per-spin audit note with a hash of the entry list, and keeps your list in local storage instead of a cloud account.'
    },
    {
      q: 'Is OnliTool affiliated with Wheel of Names?',
      a: 'No. OnliTool is an independent project. The name Wheel of Names appears here only so readers can compare two specific products; this page is not endorsed by or connected to wheelofnames.com.'
    },
    {
      q: 'Which wheel is better for classroom roll call?',
      a: 'Both work. Wheel of Names offers many languages, saved wheels and a large sound library. OnliTool is ad-free and shows an audit note after each spin, which helps when students ask how the name was chosen. For no-repeat roll call, use OnliTool Elimination mode.'
    },
    {
      q: 'Can I verify that a wheel spin was not rigged?',
      a: 'OnliTool picks the winner with Web Crypto before the animation plays and prints a note with the random value, timestamp and a hash of the entry list for every spin. Copy that note to prove the result was random. Wheel of Names also publishes a randomness audit; check its current documentation for details.'
    },
    {
      q: 'Can I import a list from Google Sheets or an image?',
      a: 'Wheel of Names advertises both image and Google Sheets import. OnliTool accepts pasted lists separated by newlines, commas or semicolons, which covers a copied spreadsheet column. A share link carries the list inside the URL so co-hosts can reuse the same wheel.'
    },
    {
      q: 'Does the alternative work on a phone?',
      a: 'Yes. Both tools run in a modern browser, so the OnliTool wheel works on phones and tablets as well as desktops. For classroom or stream use, a laptop with a larger screen and fullscreen mode is more practical.'
    }
  ],
  disclaimer: 'Feature descriptions reflect public information available in November 2026 and may change. Verify current features on each product’s own page before making a decision.',
  linkWheel: 'Open Spin the Wheel'
}

const zh = {
  breadcrumbHub: '全部替代方案',
  kicker: '替代方案 · Wheel of Names',
  title: 'Wheel of Names 替代方案：免费且私密的转盘',
  lead: '简要回答：Wheel of Names（wheelofnames.com）是广受欢迎的课堂点名与抽奖转盘。OnliTool 是免费替代方案，在本地浏览器运行、无需账号、无广告、无名单上限，并为每次结果生成基于密码学随机数的审计记录。',
  updated: '最后更新：2026 年 11 月 20 日',
  verdictLabel: '一句话结论',
  verdict: '如果你需要成熟的全球化工具、65 种语言、图片与 Google Sheets 导入、多转盘、OBS 支持和大量音效，选 Wheel of Names。如果你更在意无广告界面、每次旋转都带名单哈希的审计记录，以及完全本地保存，选 OnliTool。',
  disambiguationTitle: '这里对比的是哪个产品？',
  disambiguation: '本页对比的是 wheelofnames.com 上的浏览器转盘产品。Wheel of Names 也常被当作任意姓名转盘的通用说法；本页讨论的是这个具体产品，而不是整个品类。',
  affiliationNote: 'OnliTool 与 Wheel of Names 无关联；使用该名称仅为标识被对比的产品。',
  tableTitle: '逐项对比',
  tableNote: '依据 2026 年 11 月双方公开页面整理。产品会变化，请以各自工具页的当前说明为准。',
  tableFeature: '功能',
  tableThem: 'Wheel of Names（wheelofnames.com）',
  tableUs: 'OnliTool（本站）',
  rows: [
    {
      feature: '产品定位',
      them: '广泛使用的浏览器转盘，可随机抽取姓名、数字和自定义条目。',
      us: '独立的浏览器工具站，提供免费转盘及其他随机辅助功能。'
    },
    {
      feature: '运行方式',
      them: '基于浏览器；公开站点说明支持本地与云端保存。',
      us: '在浏览器中运行；名单保存在本设备的本地存储中。'
    },
    {
      feature: '需要账号',
      them: '核心功能无需注册。',
      us: '所有工具均无需账号。'
    },
    {
      feature: '价格与广告',
      them: '核心功能免费；存在广告，可关闭。',
      us: '完全免费，无广告、无付费墙。'
    },
    {
      feature: '随机性',
      them: '公开站点说明使用 crypto.getRandomValues，并发布随机性审计。',
      us: '使用 Web Crypto，在动画前选出结果；每次旋转显示随机值、时间戳和名单哈希审计记录。'
    },
    {
      feature: '导入方式',
      them: '除粘贴名单外，公开说明支持图片与 Google Sheets 导入。',
      us: '支持换行、逗号或分号分隔的粘贴名单；分享链接把名单编码进 URL。'
    },
    {
      feature: '语言',
      them: '公开站点说明支持 65 种语言。',
      us: '六种语言：英语、简体中文、日本語、Deutsch、Français、العربية。'
    },
    {
      feature: '直播与演示',
      them: '公开说明支持 OBS / Streamlabs，并提供 150 多种音效。',
      us: '全屏、音效与撒花；可在 OBS 或 Streamlabs 中捕获浏览器窗口。'
    },
    {
      feature: '其他随机工具',
      them: '聚焦转盘功能与模板。',
      us: '转盘旁直接提供抛硬币、随机数与打乱功能。'
    }
  ],
  chooseTitle: '各自适合谁',
  chooseThemLabel: '适合使用 Wheel of Names 的情况',
  chooseThem: [
    '你需要 65 种界面语言或庞大的音效库。',
    '你希望从图片或 Google Sheets 导入姓名。',
    '你依赖多转盘保存和短链接等一体化功能。',
    '你希望使用用户量大、教程丰富的工具。'
  ],
  chooseUsLabel: '适合使用 OnliTool 的情况',
  chooseUs: [
    '课堂投影或直播时希望画面完全没有广告。',
    '你希望每次旋转都有带名单哈希的独立审计记录。',
    '你希望名单只存在本地，不接触任何服务器。',
    '你还需要在同一页面使用抛硬币、随机数和打乱。'
  ],
  deeperTitle: '按需求选择合适的转盘',
  deeperIntro: '如果不需要完整对比，这些场景页直接回答常见问题，并用合适的设置打开免费转盘。',
  deeperLinks: [
    { path: '/spin-the-wheel', title: '转盘抽奖工具', text: '主工具：支持权重、不重复模式和审计记录。' },
    { path: '/yes-or-no-wheel', title: '是或否转盘', text: '用于二选一决策与塔罗式提问的双面转盘。' },
    { path: '/raffle-wheel', title: '抽奖转盘', text: '从姓名或奖券名单中公平抽取获奖者。' },
    { path: '/random-name-picker-no-repeats', title: '随机点名（不重复）', text: '抽取姓名且同一人不会被抽中两次。' },
    { path: '/random-giveaway-picker', title: '抽奖获奖者选择器', text: '从 Instagram、TikTok、YouTube 名单中抽取获奖者。' }
  ],
  faqTitle: '常见问题',
  faqs: [
    {
      q: 'Wheel of Names 有免费的替代方案吗？',
      a: '有。OnliTool 提供免费转盘，无需账号、无广告、无名单上限，同样在浏览器中运行。它额外为每次旋转生成带名单哈希的审计记录，并把名单保存在本地存储而不是云端账号。'
    },
    {
      q: 'OnliTool 与 Wheel of Names 有关联吗？',
      a: '没有。OnliTool 是独立项目。本页使用 Wheel of Names 这一名称仅为对比两个具体产品，未获得 wheelofnames.com 的背书，也不与其存在关联。'
    },
    {
      q: '课堂点名用哪个转盘更好？',
      a: '两者都可以。Wheel of Names 提供多语言、多转盘保存和大量音效。OnliTool 无广告，且每次旋转都有审计记录，便于回应学生对抽取方式的疑问。需要不重复点名时，可使用 OnliTool 的淘汰模式。'
    },
    {
      q: '能验证转盘结果没有被操控吗？',
      a: 'OnliTool 在动画播放前用 Web Crypto 选出结果，每次旋转都会输出随机值、时间戳和名单哈希，复制即可证明结果是随机的。Wheel of Names 也发布随机性审计，详情请查看其当前文档。'
    },
    {
      q: '能从 Google Sheets 或图片导入名单吗？',
      a: 'Wheel of Names 公开说明支持图片与 Google Sheets 导入。OnliTool 支持粘贴以换行、逗号或分号分隔的名单，足以处理复制出来的表格列；分享链接会把名单编码进 URL，方便联合主持复用。'
    },
    {
      q: '这个替代方案能在手机上使用吗？',
      a: '可以。两者都在现代浏览器中运行，OnliTool 转盘同样适用于手机和平板。用于课堂或直播时，屏幕更大的笔记本配合全屏模式更实用。'
    }
  ],
  disclaimer: '功能描述依据 2026 年 11 月的公开信息，可能发生变化。做决定前请在各产品自己的页面上核实当前功能。',
  linkWheel: '打开转盘工具'
}

const copy = computed(() => (isZh.value ? zh : en))

useToolSeo({
  type: 'WebPage',
  title: () =>
    isZh.value
      ? 'Wheel of Names 替代方案：免费无广告转盘对比 | OnliTool'
      : 'Wheel of Names Alternative (2026): Free Ad-Free Picker | OnliTool',
  description: () =>
    isZh.value
      ? '客观对比 Wheel of Names 与 OnliTool：本地运行、无广告、每次旋转的审计记录、名单上限与直播支持，并给出各自适用场景。与 Wheel of Names 无关联。'
      : 'Compare Wheel of Names and OnliTool: local processing, no ads, a per-spin audit note, entry limits and streaming support, plus when to pick each. Not affiliated.',
  keywords: () =>
    'wheel of names alternative, free alternative to wheel of names, wheel of names vs, wheel of names competitor, ad free wheel spinner, wheel of names 替代',
  faqItems: () => copy.value.faqs.map((item) => ({ q: item.q, a: item.a })),
  dateModified: '2026-11-20',
  translatedLocales: ['en', 'zh'],
  schemaProperties: {
    about: [
      { '@type': 'Thing', name: 'Wheel of Names', sameAs: 'https://wheelofnames.com/' },
      { '@type': 'Thing', name: 'OnliTool', sameAs: 'https://onlitools.com/' }
    ]
  }
})
</script>
