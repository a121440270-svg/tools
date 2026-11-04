<template>
  <div class="mx-auto max-w-6xl py-6 sm:py-10">
    <!-- hero -->
    <section
      class="reveal relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_30px_60px_-50px_rgba(0,0,0,0.55)] dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div class="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
        style="
          background-image: radial-gradient(circle at 1px 1px, rgb(var(--foreground) / 0.12) 1px, transparent 0);
          background-size: 22px 22px;
        "
        aria-hidden="true"
      />
      <div class="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#ff5a2d]/10 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

      <div class="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1.45fr_1fr] md:gap-10 lg:gap-12">
        <div class="flex flex-col justify-center">
          <p class="kicker">{{ copy.kicker }}</p>
          <h1
            class="mt-4 max-w-2xl font-display text-[clamp(2.4rem,5.8vw,4.3rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slate-900 dark:text-white"
          >
            {{ copy.title }}
          </h1>
          <p class="mt-5 max-w-xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            {{ copy.lead }}
          </p>
          <div class="mt-7 flex flex-wrap gap-2">
            <span
              v-for="chip in copy.chips"
              :key="chip"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-[#ff5a2d]" aria-hidden="true" />
              {{ chip }}
            </span>
          </div>
        </div>

        <!-- spec sheet -->
        <div class="relative overflow-hidden rounded-2xl bg-[#101c18] p-5 text-white shadow-[0_24px_48px_-34px_rgba(0,0,0,0.9)] sm:p-6">
          <div
            class="pointer-events-none absolute inset-0 opacity-40"
            style="
              background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1px, transparent 0);
              background-size: 18px 18px;
            "
            aria-hidden="true"
          />
          <div class="relative">
            <div class="flex items-center justify-between">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{{ copy.specTitle }}</p>
              <span class="font-mono text-[10px] tracking-[0.14em] text-white/35">v.2026</span>
            </div>
            <dl class="mt-3 divide-y divide-white/10">
              <div v-for="row in copy.spec" :key="row.label" class="flex items-baseline justify-between gap-4 py-2.5">
                <dt class="font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/45">{{ row.label }}</dt>
                <dd class="text-end text-[13px] font-medium text-white/90">{{ row.value }}</dd>
              </div>
            </dl>
            <p class="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5be3a7]" aria-hidden="true" />
              {{ copy.statusLabel }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- mobile contents -->
    <nav class="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden" :aria-label="copy.tocLabel">
      <a
        v-for="item in copy.toc"
        :key="item.id"
        :href="`#${item.id}`"
        class="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary/40 hover:text-primary dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
        @click.prevent="goSection(item.id)"
      >
        {{ item.label }}
      </a>
    </nav>

    <div class="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
      <!-- desktop contents -->
      <aside class="hidden lg:block">
        <nav class="sticky top-24" :aria-label="copy.tocLabel">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {{ copy.tocLabel }}
          </p>
          <ol class="mt-3 space-y-0.5 border-s border-slate-200 ps-3 dark:border-slate-800">
            <li v-for="(item, index) in copy.toc" :key="item.id">
              <a
                :href="`#${item.id}`"
                class="flex items-baseline gap-2 rounded-e-md py-1.5 pe-2 ps-1 text-[13px] leading-snug transition-colors"
                :class="
                  activeSection === item.id
                    ? 'font-semibold text-primary'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                "
                @click.prevent="goSection(item.id)"
              >
                <span class="font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500">{{ pad(index) }}</span>
                <span>{{ item.label }}</span>
              </a>
            </li>
          </ol>
          <NuxtLink
            :to="localePath('/contact')"
            class="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#ff5a2d] transition hover:gap-2.5"
          >
            {{ copy.tocContact }}
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </nav>
      </aside>

      <!-- article -->
      <article
        class="reveal min-w-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_30px_60px_-52px_rgba(0,0,0,0.5)] dark:border-slate-800 dark:bg-slate-900/95"
        style="--rd: 90ms"
      >
        <div class="p-6 sm:p-10">
          <!-- 01 story -->
          <section id="story" class="scroll-mt-24">
            <div class="flex items-start gap-3">
              <span class="mt-1.5 font-mono text-[11px] tabular-nums tracking-[0.12em] text-[#ff5a2d]">01</span>
              <h2 class="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[1.5rem]">
                {{ copy.storyHeading }}
              </h2>
            </div>
            <div class="mt-3 space-y-3 sm:ps-9">
              <p
                v-for="(paragraph, index) in copy.story"
                :key="index"
                class="max-w-[68ch] text-[15px] leading-[1.85] text-slate-600 dark:text-slate-300"
              >
                {{ paragraph }}
              </p>
              <p
                class="max-w-[68ch] border-s-2 border-[#ff5a2d] ps-4 text-[15px] font-medium leading-7 text-slate-800 dark:text-slate-100"
              >
                {{ copy.signature }}
              </p>
            </div>
          </section>

          <!-- 02 tools -->
          <section id="tools" class="mt-9 scroll-mt-24 border-t border-slate-200/80 pt-9 dark:border-slate-800/80">
            <div class="flex items-start gap-3">
              <span class="mt-1.5 font-mono text-[11px] tabular-nums tracking-[0.12em] text-[#ff5a2d]">02</span>
              <h2 class="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[1.5rem]">
                {{ copy.toolsHeading }}
              </h2>
            </div>
            <p class="mt-3 max-w-[68ch] text-[15px] leading-[1.85] text-slate-600 dark:text-slate-300 sm:ps-9">
              {{ copy.toolsIntro }}
            </p>
            <div class="mt-5 grid gap-3 sm:ps-9 md:grid-cols-3">
              <div
                v-for="card in copy.cards"
                :key="card.title"
                class="lift rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-700/70 dark:bg-slate-800/40"
              >
                <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff5a2d]">{{ card.index }}</span>
                <h3 class="mt-2 font-display text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
                  {{ card.title }}
                </h3>
                <p class="mt-1.5 text-[13px] leading-6 text-slate-600 dark:text-slate-400">{{ card.text }}</p>
              </div>
            </div>
            <p class="mt-4 max-w-[68ch] text-[13px] leading-6 text-slate-500 dark:text-slate-400 sm:ps-9">
              {{ copy.toolsNote }}
            </p>
          </section>

          <!-- 03 writing -->
          <section id="writing" class="mt-9 scroll-mt-24 border-t border-slate-200/80 pt-9 dark:border-slate-800/80">
            <div class="flex items-start gap-3">
              <span class="mt-1.5 font-mono text-[11px] tabular-nums tracking-[0.12em] text-[#ff5a2d]">03</span>
              <h2 class="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[1.5rem]">
                {{ copy.writingHeading }}
              </h2>
            </div>
            <div class="mt-3 space-y-3 sm:ps-9">
              <p
                v-for="(paragraph, index) in copy.writing"
                :key="index"
                class="max-w-[68ch] text-[15px] leading-[1.85] text-slate-600 dark:text-slate-300"
              >
                {{ paragraph }}
              </p>
              <div class="max-w-[68ch] rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-700/70 dark:bg-slate-800/40">
                <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {{ copy.correctionsLabel }}
                </p>
                <p class="mt-1.5 text-[13.5px] leading-6 text-slate-600 dark:text-slate-300">{{ copy.corrections }}</p>
              </div>
            </div>
          </section>

          <!-- 04 languages -->
          <section id="langs" class="mt-9 scroll-mt-24 border-t border-slate-200/80 pt-9 dark:border-slate-800/80">
            <div class="flex items-start gap-3">
              <span class="mt-1.5 font-mono text-[11px] tabular-nums tracking-[0.12em] text-[#ff5a2d]">04</span>
              <h2 class="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[1.5rem]">
                {{ copy.langsHeading }}
              </h2>
            </div>
            <p class="mt-3 max-w-[68ch] text-[15px] leading-[1.85] text-slate-600 dark:text-slate-300 sm:ps-9">
              {{ copy.langsIntro }}
            </p>
            <div class="mt-5 grid grid-cols-2 gap-2 sm:ps-9 md:grid-cols-3">
              <button
                v-for="language in languages"
                :key="language.code"
                type="button"
                class="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white/70 px-3.5 py-3 text-start transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_24px_-20px_rgba(0,0,0,0.7)] dark:border-slate-700/70 dark:bg-slate-800/40"
                :aria-label="language.name"
                @click="setLocale(language.code.toLowerCase())"
              >
                <span class="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{{ language.name }}</span>
                <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 transition group-hover:text-primary dark:text-slate-500">
                  {{ language.code }}
                </span>
              </button>
            </div>
          </section>

          <!-- contact -->
          <div class="mt-10 overflow-hidden rounded-2xl bg-[#101c18] p-5 text-white shadow-[0_24px_48px_-36px_rgba(0,0,0,0.9)] sm:p-6">
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div class="max-w-md">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{{ copy.contactHeading }}</p>
                <p class="mt-2 text-sm leading-6 text-white/70">{{ copy.contactText }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2.5">
                <NuxtLink
                  :to="localePath('/contact')"
                  class="rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-white/80 transition hover:border-white/50 hover:text-white"
                >
                  {{ copy.contactPageLabel }}
                </NuxtLink>
                <a
                  href="mailto:huiqinliu1005@gmail.com"
                  class="inline-flex max-w-full items-center gap-2 truncate rounded-full bg-[#ff5a2d] px-4 py-2 text-[13px] font-semibold text-[#16120f] transition hover:-translate-y-0.5 hover:bg-[#ff6d45]"
                >
                  <svg
                    class="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  huiqinliu1005@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const { locale, setLocale } = useI18n()
const localePath = useLocalePath()
const isZh = computed(() => locale.value === 'zh')

const languages = [
  { code: 'EN', name: 'English' },
  { code: 'ZH', name: '简体中文' },
  { code: 'JA', name: '日本語' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'AR', name: 'العربية' },
]

const en = {
  kicker: 'About · The workbench',
  title: 'Small tools, made with care.',
  lead: 'A free, independent workbench for files, text, images and code — built to finish one small task well, without an account or an upload.',
  chips: ['Local-first', '6 languages', 'No sign-up'],
  specTitle: 'Spec sheet',
  spec: [
    { label: 'Project', value: 'Independent' },
    { label: 'Tools', value: 'Free to use' },
    { label: 'Processing', value: 'Local-first' },
    { label: 'Account', value: 'Not required' },
    { label: 'Languages', value: '6' },
  ],
  statusLabel: 'Online & maintained',
  tocLabel: 'Contents',
  tocContact: 'Contact',
  toc: [
    { id: 'story', label: 'Why it exists' },
    { id: 'tools', label: 'How tools are made' },
    { id: 'writing', label: 'Writing & corrections' },
    { id: 'langs', label: 'Languages' },
  ],
  storyHeading: 'Why it exists',
  story: [
    'I build and maintain OnliTool as an independent project: a set of free, privacy-friendly utilities for developers, designers and anyone who needs to finish a small file or text task quickly. Every tool is tested by hand, and feedback from readers decides what gets improved next.',
    'There is no content calendar and no growth team — just a workbench of small tools that I use myself. When something is missing or feels slow, that is usually the quickest way to get it fixed.',
  ],
  signature: 'Fewer features, done properly.',
  toolsHeading: 'How the tools are made',
  toolsIntro:
    'Most tools run entirely in your browser: images, fonts, JSON and pasted text are processed locally and are not uploaded. Features that need a server — accounts, shared notes, feedback and payments — are described in the privacy policy.',
  cards: [
    {
      index: 'A',
      title: 'Runs in your browser',
      text: 'Images, fonts, JSON and pasted text are processed on your device. Nothing is uploaded unless a tool clearly needs a server.',
    },
    {
      index: 'B',
      title: 'Tested by hand',
      text: 'Every release is checked with real files. A tool that quietly damages a file is worse than no tool at all.',
    },
    {
      index: 'C',
      title: 'Open to feedback',
      text: 'Missing a format or found an edge case? Send a note — reader reports decide what gets fixed next.',
    },
  ],
  toolsNote: 'No tool requires an account unless it is stated on the page.',
  writingHeading: 'Writing & corrections',
  writing: [
    'Articles are written to explain a problem and a practical solution, not to fill space. When a post relies on documentation or another source, we link to it.',
  ],
  correctionsLabel: 'Corrections welcome',
  corrections: 'If you spot an error or outdated code, email us and we will correct the article and note the update.',
  langsHeading: 'Languages',
  langsIntro:
    'The interface and tool pages are available in the following languages. Some long-form guides and blog posts are only published in English or Chinese while they are being translated; the interface falls back to English rather than showing missing text.',
  contactHeading: 'Say hello',
  contactText: 'Questions, corrections, or a tool you wish existed — email me directly.',
  contactPageLabel: 'Contact page',
}

const zh = {
  kicker: '关于 · 工作台',
  title: '小工具，也要认真做。',
  lead: '一组免费、独立的在线工具，处理文件、文本、图片与代码——专注把一件小事做好，不用登录，也不上传文件。',
  chips: ['本地优先', '6 种语言', '无需登录'],
  specTitle: '项目信息',
  spec: [
    { label: '项目', value: '独立开发' },
    { label: '工具', value: '免费使用' },
    { label: '处理方式', value: '本地优先' },
    { label: '账户', value: '无需登录' },
    { label: '语言', value: '6 种' },
  ],
  statusLabel: '持续在线维护',
  tocLabel: '本页内容',
  tocContact: '联系我',
  toc: [
    { id: 'story', label: '为什么做这个项目' },
    { id: 'tools', label: '工具是怎么做的' },
    { id: 'writing', label: '写作与勘误' },
    { id: 'langs', label: '多语言支持' },
  ],
  storyHeading: '为什么做这个项目',
  story: [
    'OnliTool 是我独立开发和维护的项目：一组免费、注重隐私的小工具，面向开发者、设计师，以及任何需要快速处理文件或文本的人。每个工具都经过手动测试，读者的反馈决定下一步优化什么。',
    '这里没有内容日历，也没有增长团队——只有一张我自己每天在用的工作台。发现缺什么、哪里慢，通常就是最快被修好的那件事。',
  ],
  signature: '功能少一点，但每个都做对。',
  toolsHeading: '工具是怎么做的',
  toolsIntro:
    '大部分工具完全在浏览器中运行：图片、字体、JSON 和粘贴的文本都在本地处理，不会上传。需要服务器的功能（账户、分享笔记、反馈和支付）已在隐私政策中说明。',
  cards: [
    {
      index: 'A',
      title: '在浏览器里完成',
      text: '图片、字体、JSON 和粘贴的文本都在你的设备上处理。除非工具明确需要服务器，否则不会上传任何内容。',
    },
    {
      index: 'B',
      title: '逐个手动测试',
      text: '每次发布前都用真实文件跑一遍。悄悄弄坏文件的工具，比没有工具更糟。',
    },
    {
      index: 'C',
      title: '听读者的反馈',
      text: '缺少某种格式，或遇到边界情况？发封邮件告诉我，读者的反馈决定下一步修什么。',
    },
  ],
  toolsNote: '除非页面明确提示，所有工具都不需要登录。',
  writingHeading: '写作与勘误',
  writing: ['文章的目标是解释问题并给出可执行的解决方案，而不是凑字数。如果内容参考了官方文档或其他资料，我们会给出链接。'],
  correctionsLabel: '欢迎勘误',
  corrections: '如发现错误或过时代码，欢迎邮件告知，我们会修正文章并注明更新。',
  langsHeading: '多语言支持',
  langsIntro:
    '界面和工具页支持以下语言。部分长文指南和博客仍在翻译中，暂时只提供中文或英文；界面会回退到英文，而不是显示缺失的文案。',
  contactHeading: '打个招呼',
  contactText: '有疑问、发现错误，或想要一个还不存在的工具？直接发邮件给我。',
  contactPageLabel: '联系页面',
}

const copy = computed(() => (isZh.value ? zh : en))

const pad = (index: number) => String(index + 1).padStart(2, '0')

const activeSection = ref('story')
let handleScroll: (() => void) | null = null

function updateActive() {
  let current = copy.value.toc[0]?.id ?? ''
  for (const item of copy.value.toc) {
    const element = document.getElementById(item.id)
    if (element && element.getBoundingClientRect().top <= 180) current = item.id
  }
  activeSection.value = current
}

function goSection(id: string) {
  const element = document.getElementById(id)
  if (!element) return
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
  activeSection.value = id
}

onMounted(() => {
  handleScroll = updateActive
  updateActive()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (handleScroll) window.removeEventListener('scroll', handleScroll)
})

useSeoMeta({
  title: () => (isZh.value ? '关于 OnliTool' : 'About OnliTool'),
  description: () =>
    isZh.value
      ? '了解 OnliTool：免费在线工具、内容原则、多语言支持与隐私处理方式。'
      : 'Learn about OnliTool: free online tools, editorial principles, supported languages and how we handle your data.',
  robots: 'index, follow',
})
</script>
