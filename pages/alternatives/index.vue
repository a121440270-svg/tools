<template>
  <div class="mx-auto max-w-5xl py-6 sm:py-10">
    <header class="reveal relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_60px_-52px_rgba(0,0,0,0.5)] dark:border-slate-800 dark:bg-slate-900/95 sm:p-10">
      <div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div class="relative">
        <nav class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500" aria-label="Breadcrumb">
          <NuxtLinkLocale to="/" class="transition hover:text-primary">{{ copy.breadcrumbHome }}</NuxtLinkLocale>
          <span aria-hidden="true">/</span>
          <span class="text-slate-600 dark:text-slate-300">{{ copy.breadcrumbHere }}</span>
        </nav>
        <p class="kicker mt-4">{{ copy.kicker }}</p>
        <h1 class="mt-3 max-w-3xl font-display text-[clamp(2.1rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-slate-900 dark:text-white">
          {{ copy.title }}
        </h1>
        <p class="mt-5 max-w-3xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {{ copy.lead }}
        </p>
      </div>
    </header>

    <section class="mt-8" aria-labelledby="comparisons-title">
      <h2 id="comparisons-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ copy.listTitle }}
      </h2>
      <div class="mt-4 grid gap-4">
        <NuxtLinkLocale
          to="/alternatives/toolmole"
          class="lift group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-5 transition hover:border-primary/40 dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-start sm:justify-between sm:p-6"
        >
          <span class="max-w-2xl">
            <span class="font-mono text-[10px] uppercase tracking-[0.16em] text-[#ff5a2d]">{{ copy.moleTag }}</span>
            <span class="mt-2 block font-display text-xl font-bold text-slate-900 dark:text-white">
              {{ copy.moleTitle }}
            </span>
            <span class="mt-2 block text-sm leading-7 text-slate-600 dark:text-slate-300">{{ copy.moleText }}</span>
          </span>
          <span class="mt-1 inline-flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400 transition group-hover:text-primary dark:text-slate-500">
            {{ copy.readLabel }}
            <span class="transition group-hover:translate-x-1" aria-hidden="true">→</span>
          </span>
        </NuxtLinkLocale>
      </div>
      <p class="mt-3 text-[13px] leading-6 text-slate-500 dark:text-slate-400">{{ copy.moreNote }}</p>
    </section>

    <section class="mt-8 rounded-[28px] border border-slate-200 bg-white/95 p-6 dark:border-slate-800 dark:bg-slate-900/95 sm:p-8" aria-labelledby="method-title">
      <h2 id="method-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ copy.methodTitle }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{{ copy.methodIntro }}</p>
      <ul class="mt-5 grid gap-3 sm:grid-cols-3">
        <li v-for="card in copy.methodCards" :key="card.title" class="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-700/70 dark:bg-slate-800/40">
          <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff5a2d]">{{ card.index }}</span>
          <span class="mt-2 block font-display text-[15px] font-bold leading-snug text-slate-900 dark:text-white">{{ card.title }}</span>
          <span class="mt-1.5 block text-[13px] leading-6 text-slate-600 dark:text-slate-400">{{ card.text }}</span>
        </li>
      </ul>
    </section>

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

    <footer class="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
      <NuxtLinkLocale to="/image-compress" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">{{ copy.linkCompress }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/gps-remover" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">{{ copy.linkGps }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-compress" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">{{ copy.linkFont }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/about" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">{{ copy.linkAbout }}</NuxtLinkLocale>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { locale } = useI18n()
const isZh = computed(() => locale.value === 'zh')

const en = {
  kicker: 'Alternatives',
  title: 'Tool alternatives and comparisons',
  lead: 'Straight comparisons for people who searched for a specific product and want to know what else exists. No fabricated scores, no sponsored placements, and no borrowed logos.',
  breadcrumbHome: 'Home',
  breadcrumbHere: 'Alternatives',
  listTitle: 'Published comparisons',
  moleTag: 'Comparison · Updated November 2026',
  moleTitle: 'ToolMole (toolmole.com) alternative',
  moleText: 'Which ToolMole is being compared, where each site processes files, and when OnliTool is the better fit for exact-size compression, EXIF/GPS removal or font subsetting.',
  readLabel: 'Read comparison',
  moreNote: 'More comparisons are added only when there is enough public information to be accurate.',
  methodTitle: 'How these pages are written',
  methodIntro: 'A comparison is useful only if you can check it. Each page states what was reviewed, links to the tools involved, and separates vendor claims from things we tested ourselves.',
  methodCards: [
    { index: 'A', title: 'Tested with real files', text: 'Image, metadata and font checks use real files, not marketing screenshots.' },
    { index: 'B', title: 'Dated and reversible', text: 'Every page carries an update date. If a product changes, the page is corrected rather than quietly left stale.' },
    { index: 'C', title: 'No fake ratings', text: 'There are no star scores or review markup. The differences are described in plain language so you can decide.' }
  ],
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'Are these comparison pages sponsored?',
      a: 'No. No brand pays for placement or for a favourable conclusion. OnliTool is one of the products compared, so the pages state that clearly and link to the alternatives.'
    },
    {
      q: 'Why is there no /10 score?',
      a: 'A single score hides the trade-offs that matter. A tool can be excellent for batch conversion and weak at metadata removal, so each page compares specific tasks instead.'
    },
    {
      q: 'Can I suggest a product to compare?',
      a: 'Yes. Send the product name and the task you care about through the contact page. Comparisons are added when there is enough public documentation to be accurate.'
    }
  ],
  linkCompress: 'Image compressor',
  linkGps: 'GPS remover',
  linkFont: 'Font compressor',
  linkAbout: 'About OnliTool'
}

const zh = {
  kicker: '替代方案',
  title: '工具替代方案与横向对比',
  lead: '给已经搜过某个具体产品、想知道还有什么选择的人。没有编造的评分，没有付费排名，也不借用对方 logo。',
  breadcrumbHome: '首页',
  breadcrumbHere: '替代方案',
  listTitle: '已发布的对比',
  moleTag: '对比 · 2026 年 11 月更新',
  moleTitle: 'ToolMole（toolmole.com）替代方案',
  moleText: '先确认对比的是哪个 ToolMole，再看两个站点如何处理文件，以及 OnliTool 在精确尺寸压缩、EXIF/GPS 移除和字体子集化上适合哪些场景。',
  readLabel: '阅读对比',
  moreNote: '只有在公开信息足够准确时，才会增加新的对比页面。',
  methodTitle: '这些页面是怎么写的',
  methodIntro: '对比只有可核查才有用。每个页面都会说明查看了什么、给出相关工具链接，并把厂商说法与我们的实际测试分开。',
  methodCards: [
    { index: 'A', title: '用真实文件测试', text: '图片、元数据和字体都使用真实文件检查，不用营销截图。' },
    { index: 'B', title: '标注日期，可修正', text: '每个页面都有更新日期。产品变化时会修正页面，而不是悄悄留着过时内容。' },
    { index: 'C', title: '不做假评分', text: '没有星级评分，也没有评分结构化数据。差异用直白语言写清楚，由你判断。' }
  ],
  faqTitle: '常见问题',
  faqs: [
    {
      q: '这些对比页面是赞助的吗？',
      a: '不是。没有品牌为排名或有利结论付费。OnliTool 本身也是被对比的产品之一，因此页面会明确说明，并给出其他选择的链接。'
    },
    {
      q: '为什么没有十分制评分？',
      a: '单一分数会掩盖真正重要的取舍。一个工具可能擅长批量转换，却不擅长元数据移除，所以每个页面比较的是具体任务。'
    },
    {
      q: '可以建议对比某个产品吗？',
      a: '可以。通过联系页面告诉我产品名和你关心的任务。公开资料足够准确时，我们会增加对比。'
    }
  ],
  linkCompress: '图片压缩',
  linkGps: 'GPS 移除',
  linkFont: '字体压缩',
  linkAbout: '关于 OnliTool'
}

const copy = computed(() => (isZh.value ? zh : en))

useToolSeo({
  type: 'WebPage',
  title: () => (isZh.value ? '工具替代方案与横向对比 | OnliTool' : 'Tool Alternatives & Comparisons | OnliTool'),
  description: () =>
    isZh.value
      ? 'OnliTool 的工具替代方案与横向对比：先确认对比对象，再按具体任务说明差异。无付费排名，无编造评分。'
      : 'Honest tool alternatives and side-by-side comparisons from OnliTool. No paid placements, no fabricated scores, and a clear note when OnliTool itself is one of the products compared.',
  faqItems: () => copy.value.faqs.map((item) => ({ q: item.q, a: item.a })),
  dateModified: '2026-11-07',
  // Body copy is authored inline in English and Chinese only.
  translatedLocales: ['en', 'zh']
})
</script>
