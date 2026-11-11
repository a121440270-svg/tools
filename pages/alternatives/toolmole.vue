<template>
  <div class="mx-auto max-w-5xl py-6 sm:py-10">
    <!-- hero -->
    <header class="reveal relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_30px_60px_-52px_rgba(0,0,0,0.5)] dark:border-slate-800 dark:bg-slate-900/95 sm:p-10">
      <div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ff5a2d]/10 blur-3xl" aria-hidden="true" />
      <div class="relative">
        <nav class="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500" aria-label="Breadcrumb">
          <NuxtLinkLocale to="/alternatives" class="transition hover:text-primary">{{ copy.breadcrumbHub }}</NuxtLinkLocale>
          <span aria-hidden="true">/</span>
          <span class="text-slate-600 dark:text-slate-300">ToolMole</span>
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

    <!-- verdict -->
    <section class="mt-5 rounded-2xl border border-[#ff5a2d]/25 bg-[#ff5a2d]/5 p-5 sm:p-6" aria-labelledby="verdict-title">
      <p id="verdict-title" class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff5a2d]">{{ copy.verdictLabel }}</p>
      <p class="mt-2 max-w-3xl text-[15px] font-medium leading-7 text-slate-800 dark:text-slate-100">
        {{ copy.verdict }}
      </p>
    </section>

    <!-- disambiguation -->
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

    <!-- comparison table -->
    <section class="mt-8" aria-labelledby="table-title">
      <h2 id="table-title" class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ copy.tableTitle }}
      </h2>
      <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{{ copy.tableNote }}</p>

      <div class="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table class="w-full min-w-[720px] border-collapse text-start text-sm">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/70">
              <th scope="col" class="w-[26%] px-4 py-3 text-start font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {{ copy.tableFeature }}
              </th>
              <th scope="col" class="px-4 py-3 text-start font-display text-[15px] font-bold text-slate-900 dark:text-white">
                {{ copy.tableMole }}
              </th>
              <th scope="col" class="px-4 py-3 text-start font-display text-[15px] font-bold text-slate-900 dark:text-white">
                {{ copy.tableUs }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in copy.rows" :key="row.feature" class="border-t border-slate-200 align-top dark:border-slate-800">
              <th scope="row" class="px-4 py-3 text-start font-medium text-slate-700 dark:text-slate-200">{{ row.feature }}</th>
              <td class="px-4 py-3 leading-6 text-slate-600 dark:text-slate-300">{{ row.mole }}</td>
              <td class="px-4 py-3 leading-6 text-slate-600 dark:text-slate-300">{{ row.us }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- when to choose -->
    <section class="mt-8 grid gap-4 md:grid-cols-2" aria-labelledby="choose-title">
      <h2 id="choose-title" class="sr-only">{{ copy.chooseTitle }}</h2>
      <div class="rounded-2xl border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{{ copy.chooseMoleLabel }}</p>
        <ul class="mt-3 space-y-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <li v-for="item in copy.chooseMole" :key="item" class="flex gap-2.5">
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

    <!-- deeper -->
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

    <!-- faq -->
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

    <!-- disclaimer -->
    <footer class="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <p class="text-[13px] leading-6 text-slate-500 dark:text-slate-400">{{ copy.disclaimer }}</p>
      <p class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
        <NuxtLinkLocale to="/alternatives" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
          {{ copy.breadcrumbHub }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/image-compress" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
          {{ copy.linkCompress }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/gps-remover" class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
          {{ copy.linkGps }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/font-compress" class="text-primary underline decoration-primary/30 hover:decoration-primary">
          {{ copy.linkFont }}
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
  kicker: 'Alternatives · ToolMole',
  title: 'ToolMole alternative: an honest comparison',
  lead: 'Short answer: ToolMole (toolmole.com) is a broad, privacy-first toolbox for image, PDF and AI utilities. OnliTool is a smaller independent workbench that goes deeper on exact-size image compression, EXIF/GPS removal and font subsetting — and also runs in your browser.',
  updated: 'Last updated: November 7, 2026',
  verdictLabel: 'The short version',
  verdict: 'Choose ToolMole if you want one catalogue for many everyday file tasks. Choose OnliTool if you need to hit an exact file size, strip metadata before sharing a photo, or subset a font for the web.',
  disambiguationTitle: 'First, which ToolMole?',
  disambiguation: 'This page compares ToolMole, the browser-based tool suite at toolmole.com. It is not about Mole, the macOS cleaner, and it is not about a mole (the underground boring machine). Those are unrelated products that happen to share the name.',
  affiliationNote: 'OnliTool is not affiliated with ToolMole. The name is used only to identify the product being compared.',
  tableTitle: 'Side by side',
  tableNote: 'Based on the public pages of both sites in November 2026. Products change; confirm a specific feature on the tool page before relying on it.',
  tableFeature: 'Feature',
  tableMole: 'ToolMole (toolmole.com)',
  tableUs: 'OnliTool (this site)',
  rows: [
    {
      feature: 'What it is',
      mole: 'A broad browser-tool catalogue covering images, PDFs, media and AI helpers.',
      us: 'An independent workbench focused on image, font and text utilities.'
    },
    {
      feature: 'Where files are processed',
      mole: 'Advertises 100% in-browser processing for its core tools; some AI tools need local hardware.',
      us: 'Core image, font and text tools run in your browser; files are not uploaded.'
    },
    {
      feature: 'Account required',
      mole: 'No sign-up advertised for the core tools.',
      us: 'No account for any tool.'
    },
    {
      feature: 'Price',
      mole: 'Free core tools.',
      us: 'Free, with no paywall.'
    },
    {
      feature: 'Exact-size image compression',
      mole: 'General image compression and conversion.',
      us: 'Dedicated targets: 20 KB, 50 KB, 100 KB, 200 KB, 500 KB and 1 MB.'
    },
    {
      feature: 'EXIF / GPS removal',
      mole: 'Image tools may expose metadata options; confirm on the specific tool page.',
      us: 'Dedicated EXIF editor, GPS remover, metadata analyzer and privacy cleaner.'
    },
    {
      feature: 'Font subsetting',
      mole: 'Not part of the core categories we reviewed.',
      us: 'Dedicated TTF, OTF, WOFF and WOFF2 subsetter and compressor.'
    },
    {
      feature: 'Text and developer utilities',
      mole: 'Some utilities alongside the file tools.',
      us: 'Hashing, token generation, case conversion, JSON, Base64 and date tools.'
    },
    {
      feature: 'Interface languages',
      mole: 'Multiple languages.',
      us: 'English, 简体中文, 日本語, Deutsch, Français, العربية.'
    },
    {
      feature: 'Affiliation',
      mole: 'Independent product.',
      us: 'Independent product; not affiliated with ToolMole.'
    }
  ],
  chooseTitle: 'When to choose each',
  chooseMoleLabel: 'Pick ToolMole when…',
  chooseMole: [
    'You want one bookmark that covers many file types, including PDFs and media.',
    'You need a quick everyday conversion and do not care which tool handles it.',
    'You prefer a large catalogue with AI extras in the same place.'
  ],
  chooseUsLabel: 'Pick OnliTool when…',
  chooseUs: [
    'You must stay under an upload limit such as 100 KB.',
    'You are about to share a photo and want GPS and EXIF removed first.',
    'You need a smaller web font, for example a TTF subset exported as WOFF2.',
    'You want a dedicated page that explains the limits and privacy of each tool.'
  ],
  deeperTitle: 'Where OnliTool goes deeper',
  deeperIntro: 'These are the jobs people most often arrive with after searching for a ToolMole-style utility. Each link opens a dedicated tool, not a generic converter.',
  deeperLinks: [
    {
      path: '/image-compress-to-100kb',
      title: 'Compress an image to exactly 100 KB',
      text: 'Start from the target size instead of guessing a quality slider.'
    },
    {
      path: '/gps-remover',
      title: 'Remove GPS and EXIF from photos',
      text: 'Strip location, camera and timestamp metadata before sharing.'
    },
    {
      path: '/font-compress',
      title: 'Subset and compress TTF, OTF or WOFF2',
      text: 'Keep only the glyphs your page needs and download a smaller font.'
    },
    {
      path: '/metadata-analyzer',
      title: 'Inspect every metadata field',
      text: 'See what a photo reveals before you decide what to remove.'
    }
  ],
  faqTitle: 'Frequently asked questions',
  faqs: [
    {
      q: 'Is ToolMole the same as Mole for macOS?',
      a: 'No. ToolMole (toolmole.com) is a browser-based tool suite. Mole is a separate macOS cleaning app. They share part of a name but are unrelated products.'
    },
    {
      q: 'Is OnliTool affiliated with ToolMole?',
      a: 'No. OnliTool is an independent project. ToolMole is mentioned only to compare features; its logo and branding are not used here.'
    },
    {
      q: 'Which is better for compressing an image to exactly 100 KB?',
      a: 'OnliTool has dedicated pages and presets for common limits from 20 KB to 1 MB, so you start from the target instead of guessing. ToolMole focuses on general image compression and conversion.'
    },
    {
      q: 'Do these tools upload my files?',
      a: 'Both sites advertise local, in-browser processing for their core tools. Any server-backed feature should be described on the individual tool page. When in doubt, test with a non-sensitive file.'
    },
    {
      q: 'Can I use both sites?',
      a: 'Yes. Many people keep one large catalogue for variety and one specialised tool for exact-size compression or metadata removal.'
    }
  ],
  disclaimer: 'ToolMole is a trademark of its respective owner. OnliTool is not affiliated with, endorsed by or sponsored by ToolMole. This comparison reflects publicly visible information and our own testing, and it may become outdated.',
  breadcrumbHub: 'Alternatives',
  linkCompress: 'Image compressor',
  linkGps: 'GPS remover',
  linkFont: 'Font compressor'
}

const zh = {
  kicker: '替代方案 · ToolMole',
  title: 'ToolMole 替代方案：一份实事求是的对比',
  lead: '先说结论：ToolMole（toolmole.com）是一个覆盖面广、强调隐私的在线工具箱，包含图片、PDF 和 AI 工具。OnliTool 是一个更小的独立工具站，专注于精确尺寸压缩、EXIF/GPS 移除和字体子集化，同样在浏览器本地运行。',
  updated: '最后更新：2026 年 11 月 7 日',
  verdictLabel: '一句话结论',
  verdict: '如果你想要一个覆盖多种日常文件任务的工具箱，选 ToolMole；如果你需要压到精确的文件大小、分享前清除照片元数据，或为网页精简字体，选 OnliTool 更直接。',
  disambiguationTitle: '先确认：你说的是哪个 ToolMole？',
  disambiguation: '本页对比的是 toolmole.com 上那个基于浏览器的工具站，不是 macOS 清理软件 Mole，也不是地下钻孔机（mole）。它们只是名字相近，互不相关。',
  affiliationNote: 'OnliTool 与 ToolMole 没有关联；这里提到该名称仅为标识被对比的产品。',
  tableTitle: '逐项对比',
  tableNote: '信息基于两个站点 2026 年 11 月的公开页面。产品会变化，使用前请在具体工具页确认对应功能。',
  tableFeature: '项目',
  tableMole: 'ToolMole（toolmole.com）',
  tableUs: 'OnliTool（本站）',
  rows: [
    {
      feature: '定位',
      mole: '覆盖面较广的浏览器工具合集，包含图片、PDF、媒体和 AI 辅助工具。',
      us: '独立工具站，聚焦图片、字体和文本处理。'
    },
    {
      feature: '文件处理位置',
      mole: '核心工具宣称 100% 在浏览器内处理；部分 AI 工具需要本地硬件。',
      us: '核心图片、字体和文本工具在浏览器中运行，文件不会上传。'
    },
    {
      feature: '是否需要账户',
      mole: '核心工具宣称无需注册。',
      us: '所有工具都不需要账户。'
    },
    {
      feature: '价格',
      mole: '核心工具免费。',
      us: '免费，没有付费墙。'
    },
    {
      feature: '精确尺寸压缩',
      mole: '提供通用图片压缩与格式转换。',
      us: '提供 20 KB、50 KB、100 KB、200 KB、500 KB、1 MB 专用页面。'
    },
    {
      feature: 'EXIF / GPS 移除',
      mole: '图片工具中可能提供元数据选项，请在具体工具页确认。',
      us: '独立的 EXIF 编辑器、GPS 移除、元数据分析与隐私清理工具。'
    },
    {
      feature: '字体子集化',
      mole: '不在我们查看的核心分类中。',
      us: '独立的 TTF、OTF、WOFF、WOFF2 子集化与压缩工具。'
    },
    {
      feature: '文本与开发工具',
      mole: '在文件工具之外提供部分实用工具。',
      us: '哈希、令牌生成、大小写转换、JSON、Base64 和日期工具。'
    },
    {
      feature: '界面语言',
      mole: '支持多种语言。',
      us: 'English、简体中文、日本語、Deutsch、Français、العربية。'
    },
    {
      feature: '关联关系',
      mole: '独立产品。',
      us: '独立产品，与 ToolMole 无关联。'
    }
  ],
  chooseTitle: '各自适合谁',
  chooseMoleLabel: '选择 ToolMole，如果你……',
  chooseMole: [
    '想要一个书签覆盖多种文件类型，包括 PDF 和媒体文件。',
    '只需要快速完成日常转换，不在意由哪个工具处理。',
    '偏好一个工具数量多、还带 AI 功能的合集。'
  ],
  chooseUsLabel: '选择 OnliTool，如果你……',
  chooseUs: [
    '必须压在 100 KB 这类上传限制以内。',
    '准备分享照片，想先删掉 GPS 和 EXIF。',
    '需要更小的网页字体，例如把 TTF 子集导出为 WOFF2。',
    '希望每个工具都有独立页面说明限制与隐私处理方式。'
  ],
  deeperTitle: 'OnliTool 做得更深的地方',
  deeperIntro: '这些是用户搜索 ToolMole 类工具时最常见的具体任务。每个链接都指向专用工具页，而不是一个泛用转换器。',
  deeperLinks: [
    {
      path: '/image-compress-to-100kb',
      title: '把图片精确压到 100 KB',
      text: '从目标大小出发，而不是反复试质量滑块。'
    },
    {
      path: '/gps-remover',
      title: '移除照片中的 GPS 与 EXIF',
      text: '分享前清除位置、相机和时间戳等元数据。'
    },
    {
      path: '/font-compress',
      title: '子集化并压缩 TTF、OTF 或 WOFF2',
      text: '只保留页面需要的字形，下载更小的字体文件。'
    },
    {
      path: '/metadata-analyzer',
      title: '逐项查看元数据',
      text: '先看清照片暴露了什么，再决定删除哪些字段。'
    }
  ],
  faqTitle: '常见问题',
  faqs: [
    {
      q: 'ToolMole 和 macOS 上的 Mole 是同一个东西吗？',
      a: '不是。ToolMole（toolmole.com）是基于浏览器的工具站；Mole 是独立的 macOS 清理软件。两者只是名字部分重合，没有关联。'
    },
    {
      q: 'OnliTool 与 ToolMole 有关联吗？',
      a: '没有。OnliTool 是独立项目，提到 ToolMole 仅为功能对比，本页未使用对方 logo 或品牌素材。'
    },
    {
      q: '要把图片压到正好 100 KB，哪个更合适？',
      a: 'OnliTool 为 20 KB 到 1 MB 的常见限制提供了专用页面和预设，可以直接从目标值开始；ToolMole 更偏向通用图片压缩与格式转换。'
    },
    {
      q: '这些工具会上传我的文件吗？',
      a: '两个站点都宣称核心工具在浏览器本地处理。若有需要服务器的功能，应在具体工具页说明。不确定时，先用不敏感的文件测试。'
    },
    {
      q: '可以两个站点一起用吗？',
      a: '可以。很多人会保留一个大合集应付各种格式，再用专用工具处理精确尺寸压缩或元数据移除。'
    }
  ],
  disclaimer: 'ToolMole 是其所有者的商标。OnliTool 与 ToolMole 没有关联，也未获得其认可或赞助。本对比基于公开信息与我们的实际测试，可能随时间过时。',
  breadcrumbHub: '替代方案',
  linkCompress: '图片压缩',
  linkGps: 'GPS 移除',
  linkFont: '字体压缩'
}

const copy = computed(() => (isZh.value ? zh : en))

useToolSeo({
  type: 'WebPage',
  title: () =>
    isZh.value
      ? 'ToolMole 替代方案：功能对比与选择建议 | OnliTool'
      : 'ToolMole Alternative (2026): Honest Comparison | OnliTool',
  description: () =>
    isZh.value
      ? '客观对比 ToolMole（toolmole.com）与 OnliTool：本地处理、精确尺寸压缩、EXIF/GPS 移除、字体子集化的差异，以及各自适合的场景。与 ToolMole 无关联。'
      : 'Compare ToolMole and OnliTool: local processing, exact-size image compression, EXIF/GPS removal, font subsetting — plus when to pick each. Not affiliated.',
  faqItems: () => copy.value.faqs.map((item) => ({ q: item.q, a: item.a })),
  dateModified: '2026-11-07',
  // Body copy is authored inline in English and Chinese only.
  translatedLocales: ['en', 'zh'],
  schemaProperties: {
    about: [
      { '@type': 'Thing', name: 'ToolMole', sameAs: 'https://toolmole.com/' },
      { '@type': 'Thing', name: 'OnliTool', sameAs: 'https://onlitools.com/' }
    ]
  }
})
</script>
