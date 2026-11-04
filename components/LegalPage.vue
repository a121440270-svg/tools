<template>
  <div class="mx-auto max-w-6xl py-6 sm:py-10">
    <!-- editorial hero -->
    <header
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

      <div class="relative p-6 sm:p-10">
        <p class="kicker">{{ kicker }}</p>
        <h1
          class="mt-4 max-w-3xl font-display text-[clamp(2.4rem,6vw,4.2rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slate-900 dark:text-white"
        >
          {{ title }}
        </h1>
        <p class="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {{ intro }}
        </p>

        <div class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <span
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 font-mono text-[10.5px] tracking-[0.06em] text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-[#ff5a2d]" aria-hidden="true" />
            {{ updated }}
          </span>
          <span class="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {{ minutes }} {{ readingLabel }}
          </span>
          <span class="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden="true" />
          <span class="hidden font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:inline">
            OnliTool
          </span>
        </div>
      </div>
    </header>

    <div class="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
      <!-- table of contents -->
      <aside class="hidden lg:block">
        <nav class="sticky top-24" :aria-label="tocLabel">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            {{ tocLabel }}
          </p>
          <ol class="mt-3 space-y-0.5 border-s border-slate-200 ps-3 dark:border-slate-800">
            <li v-for="(section, index) in sections" :key="section.heading">
              <a
                :href="`#${anchor(index)}`"
                class="group flex items-baseline gap-2 rounded-e-md py-1.5 pe-2 ps-1 text-[13px] leading-snug transition-colors"
                :class="
                  active === index
                    ? 'font-semibold text-primary'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                "
                :aria-current="active === index ? 'true' : undefined"
                @click.prevent="goTo(index)"
              >
                <span class="font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500">{{ pad(index) }}</span>
                <span>{{ section.heading }}</span>
              </a>
            </li>
          </ol>
        </nav>
      </aside>

      <!-- document -->
      <article
        class="reveal min-w-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 shadow-[0_30px_60px_-52px_rgba(0,0,0,0.5)] dark:border-slate-800 dark:bg-slate-900/95"
        style="--rd: 90ms"
      >
        <div class="p-6 sm:p-10">
          <section
            v-for="(section, index) in sections"
            :id="anchor(index)"
            :key="section.heading"
            class="mt-9 scroll-mt-24 border-t border-slate-200/80 pt-9 first:mt-0 first:border-t-0 first:pt-0 dark:border-slate-800/80"
          >
            <div class="flex items-start gap-3">
              <span class="mt-1.5 font-mono text-[11px] tabular-nums tracking-[0.12em] text-[#ff5a2d]">
                {{ pad(index) }}
              </span>
              <h2 class="font-display text-[1.35rem] font-bold leading-tight tracking-[-0.02em] text-slate-900 dark:text-white sm:text-[1.5rem]">
                {{ section.heading }}
              </h2>
            </div>

            <div class="mt-3 space-y-3 sm:ps-9">
              <p
                v-for="(paragraph, pIndex) in section.paragraphs"
                :key="pIndex"
                class="max-w-[68ch] text-[15px] leading-[1.85] text-slate-600 dark:text-slate-300"
              >
                <template v-for="(chunk, cIndex) in linkify(paragraph)" :key="cIndex">
                  <a
                    v-if="chunk.href"
                    :href="chunk.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary underline decoration-primary/30 underline-offset-2 transition hover:decoration-primary"
                    >{{ chunk.text }}</a
                  >
                  <template v-else>{{ chunk.text }}</template>
                </template>
              </p>

              <blockquote
                v-if="section.callout"
                class="flex max-w-[68ch] items-start gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4"
              >
                <svg
                  class="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <p class="text-sm font-medium leading-6 text-slate-800 dark:text-slate-100">{{ section.callout }}</p>
              </blockquote>

              <ul v-if="section.items?.length" class="max-w-[68ch] space-y-2.5 pt-1">
                <li
                  v-for="(item, iIndex) in section.items"
                  :key="iIndex"
                  class="flex gap-3 text-[15px] leading-[1.75] text-slate-600 dark:text-slate-300"
                >
                  <span class="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                  <span>
                    <template v-for="(chunk, cIndex) in linkify(item)" :key="cIndex">
                      <a
                        v-if="chunk.href"
                        :href="chunk.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary underline decoration-primary/30 underline-offset-2 transition hover:decoration-primary"
                        >{{ chunk.text }}</a
                      >
                      <template v-else>{{ chunk.text }}</template>
                    </template>
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <!-- contact block -->
          <div
            class="mt-10 overflow-hidden rounded-2xl bg-[#101c18] p-5 text-white shadow-[0_24px_48px_-36px_rgba(0,0,0,0.9)] sm:p-6"
          >
            <div class="flex flex-wrap items-end justify-between gap-4">
              <div class="max-w-md">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{{ contactHeading }}</p>
                <p class="mt-2 text-sm leading-6 text-white/70">{{ contactText }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2.5">
                <NuxtLink
                  :to="contactPageHref"
                  class="rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-white/80 transition hover:border-white/50 hover:text-white"
                >
                  {{ contactPageLabel }}
                </NuxtLink>
                <a
                  :href="`mailto:${email}`"
                  class="inline-flex items-center gap-2 rounded-full bg-[#ff5a2d] px-4 py-2 text-[13px] font-semibold text-[#16120f] transition hover:-translate-y-0.5 hover:bg-[#ff6d45]"
                >
                  <svg
                    class="h-3.5 w-3.5"
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
                  {{ email }}
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

interface LegalSection {
  heading: string
  paragraphs: string[]
  items?: string[]
  callout?: string
}

const props = defineProps<{
  kicker: string
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
  contactHeading: string
  contactText: string
  contactPageLabel: string
  contactPageHref: string
  email: string
  tocLabel: string
  readingLabel: string
}>()

const active = ref(0)

const pad = (index: number) => String(index + 1).padStart(2, '0')
const anchor = (index: number) => `legal-section-${index + 1}`

function linkify(text: string) {
  const chunks: { text: string; href?: string }[] = []
  const pattern = /(https?:\/\/[^\s<>"']+)/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) chunks.push({ text: text.slice(cursor, match.index) })

    let url = match[0]
    let tail = ''
    while (/[.,;:)\]]$/.test(url)) {
      tail = url.slice(-1) + tail
      url = url.slice(0, -1)
    }
    chunks.push({ text: url, href: url })
    if (tail) chunks.push({ text: tail })
    cursor = match.index + match[0].length
  }

  if (cursor < text.length) chunks.push({ text: text.slice(cursor) })
  return chunks
}

const minutes = computed(() => {
  const text = [
    props.intro,
    ...props.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.items ?? []),
      section.callout ?? '',
    ]),
  ].join(' ')

  const cjk = text.match(/[\u3400-\u9fff]/g)?.length ?? 0
  const words = text
    .replace(/[\u3400-\u9fff]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.round(cjk / 350 + words / 220))
})

let handleScroll: (() => void) | null = null

function updateActive() {
  let current = 0
  props.sections.forEach((_, index) => {
    const element = document.getElementById(anchor(index))
    if (element && element.getBoundingClientRect().top <= 170) current = index
  })
  active.value = current
}

function goTo(index: number) {
  const element = document.getElementById(anchor(index))
  if (!element) return
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  element.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${anchor(index)}`)
  active.value = index
}

onMounted(() => {
  handleScroll = updateActive
  updateActive()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (handleScroll) window.removeEventListener('scroll', handleScroll)
})
</script>
