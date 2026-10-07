<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
      <header class="sticky top-0 z-40 mb-6 mt-1 rounded-3xl border border-slate-200/90 bg-white/85 p-3 shadow-[0_18px_40px_-34px_rgba(0,0,0,0.6)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 sm:p-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <NuxtLinkLocale to="/" class="group flex items-center gap-3">
            <span class="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 font-display text-lg font-bold text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)] transition-all duration-200 group-hover:-rotate-6 group-hover:shadow-[0_16px_40px_-18px_rgba(255,90,45,0.8)] dark:bg-gradient-to-br dark:from-white dark:to-slate-100 dark:text-slate-900">
              O
              <span class="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#ff5a2d] shadow-[0_0_0_4px_rgba(255,90,45,0.3)] ring-2 ring-white dark:ring-slate-900" />
              <span class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></span>
            </span>
            <span>
              <span class="block font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">OnliTool</span>
              <span class="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{{ t('menu.desc') }}</span>
            </span>
          </NuxtLinkLocale>

          <nav class="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              class="rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition"
              :class="selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'"
              @click="selectedCategory = 'all'"
            >
              {{ t('home.all') }}
            </button>
            <button
              v-for="group in toolGroups"
              :key="group.key"
              type="button"
              class="rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition"
              :class="selectedCategory === group.key
                ? 'bg-primary text-white shadow-[0_8px_18px_-10px_rgb(var(--primary))]'
                : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'"
              @click="selectedCategory = group.key"
            >
              {{ group.label }}
            </button>
            <div class="relative inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-3 h-4 w-4 text-slate-500 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <select
                :value="locale"
                aria-label="Language"
                class="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                @change="changeLanguage"
              >
                <option v-for="availableLocale in locales" :key="availableLocale.code" :value="availableLocale.code">
                  {{ t(`locale.${availableLocale.code}`) }}
                </option>
              </select>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-400 hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-white"
              :aria-label="isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
              :title="isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
              @click="toggleTheme"
            >
              <svg v-if="isDark()" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13z" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      <!-- hero -->
      <section class="mb-6 grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <div class="reveal relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_24px_48px_-40px_rgba(0,0,0,0.7)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-8" style="--rd: 60ms">
          <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_0%_0%,rgba(15,163,125,0.08),transparent_60%)] dark:bg-[radial-gradient(800px_400px_at_0%_0%,rgba(15,163,125,0.12),transparent_60%)]"></div>
          <p class="kicker">{{ t('home.eyebrow') }}</p>
          <h1 class="mt-4 font-display text-[clamp(2.4rem,5.4vw,4.2rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-slate-900 dark:text-white">
            <span class="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-white">{{ t('home.title') }}</span>
          </h1>
          <p class="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {{ t('home.description') }}
          </p>
          <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <span class="inline-flex items-center gap-2"><span class="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_0_3px_rgb(var(--primary)/0.2)]" />local-first</span>
            <span class="inline-flex items-center gap-2"><span class="h-2 w-2 animate-pulse rounded-full bg-[#ff5a2d] shadow-[0_0_0_3px_rgba(255,90,45,0.25)] [animation-delay:200ms]" />no signup</span>
            <span class="inline-flex items-center gap-2"><span class="h-2 w-2 animate-pulse rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)] [animation-delay:400ms]" />free</span>
          </div>
        </div>

        <!-- search console -->
        <div class="reveal group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_28px_56px_-40px_rgba(0,0,0,0.9)] transition-transform duration-200 hover:-translate-y-0.5 dark:border-slate-700 sm:p-5" style="--rd: 160ms">
          <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(15,163,125,0.15),transparent_60%)] opacity-80 transition group-hover:opacity-100"></div>
          <div class="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            <span class="tool-badge">{{ t('home.searchLabel') }}</span>
            <span class="flex gap-1.5" aria-hidden="true">
              <span class="h-2 w-2 rounded-full bg-white/25 transition group-hover:bg-white/40" />
              <span class="h-2 w-2 rounded-full bg-white/25 transition group-hover:bg-white/40" />
              <span class="h-2 w-2 rounded-full bg-[#ff5a2d] shadow-[0_0_0_3px_rgba(255,107,61,0.25)]" />
            </span>
          </div>
          <label class="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{{ t('home.searchLabel') }}</label>
          <div class="relative">
            <span class="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              ref="searchInput"
              v-model="keyword"
              type="text"
              :placeholder="t('home.searchPlaceholder')"
              class="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-14 text-sm text-white placeholder:text-slate-400 outline-none ring-0 transition focus:border-[#ff5a2d] focus:bg-white/10 focus:ring-2 focus:ring-[#ff5a2d]/30"
            />
            <kbd class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/15 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-400 backdrop-blur-sm sm:block">/</kbd>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="tag in searchTags"
              :key="tag"
              type="button"
              class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-300 backdrop-blur-sm transition hover:border-[#ff5a2d] hover:bg-[#ff5a2d]/10 hover:text-white"
              @click="keyword = tag"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </section>

      <!-- groups -->
      <div v-if="filteredGroups.length" class="space-y-5 pb-10">
        <section
          v-for="(group, groupIndex) in filteredGroups"
          :key="group.key"
          class="reveal rounded-3xl border border-slate-200 bg-white/70 p-3 shadow-[0_20px_44px_-40px_rgba(0,0,0,0.7)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-4"
          :style="{ '--rd': `${80 + groupIndex * 60}ms` }"
        >
          <button
            type="button"
            class="group flex w-full items-center justify-between gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-white dark:hover:bg-slate-800/60"
            @click="toggleGroup(group.key)"
          >
            <div class="flex items-baseline gap-3">
              <span class="font-mono text-xs text-[#ff5a2d]">{{ String(groupIndex + 1).padStart(2, '0') }}</span>
              <span>
                <span class="block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {{ group.label }} · {{ group.tools.length }}
                </span>
                <span class="mt-0.5 block font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">{{ group.title }}</span>
              </span>
            </div>
            <span class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:border-white dark:group-hover:bg-white dark:group-hover:text-slate-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 transition-transform"
                :class="expandedGroups.includes(group.key) ? 'rotate-180' : ''"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>

          <div v-show="expandedGroups.includes(group.key)" class="mt-3">
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <NuxtLink
                v-for="(tool, toolIndex) in group.tools"
                :key="tool.path"
                :to="localePath(tool.path)"
                class="lift card-glow group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-800/60"
                :style="{ '--rd': `${toolIndex * 30}ms` }"
              >
                <div class="mb-3 flex items-start justify-between">
                  <span class="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-900/5 bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[#ff5a2d] group-hover:to-[#ff8a5d] group-hover:shadow-[0_10px_30px_-16px_rgba(255,90,45,1)] dark:border-white/10 dark:bg-slate-950 dark:group-hover:from-[#ff5a2d] dark:group-hover:to-[#ff8a5d]">
                    <component :is="tool.icon" class="h-5 w-5" />
                    <span class="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></span>
                  </span>
                  <span class="font-mono text-sm text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#ff5a2d] dark:text-slate-600">→</span>
                </div>

                <h3 class="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">{{ tool.name }}</h3>
                <p class="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                  {{ tool.description }}
                </p>
                <span class="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {{ t('home.toolBadge') }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-14 text-center dark:border-slate-700 dark:bg-slate-900/70">
        <p class="font-display text-xl font-bold text-slate-900 dark:text-white">{{ t('home.empty') }}</p>
        <button
          type="button"
          class="btn-secondary mt-5"
          @click="keyword = ''; selectedCategory = 'all'"
        >
          {{ t('home.all') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'

const { t, locales, locale, setLocale } = useI18n()
const localePath = useLocalePath()
const { toggleTheme, isDark } = useTheme()

function changeLanguage(event) {
  setLocale(event.target.value)
}

const createIcon = (children) => defineComponent({
  name: 'ToolSvgIcon',
  setup() {
    return () => h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 1.8,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        class: 'h-5 w-5'
      },
      children
    )
  }
})

const SparklesIcon = createIcon([
  h('path', { d: 'M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z' }),
  h('path', { d: 'M18.5 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z' }),
  h('path', { d: 'M5.5 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z' })
])

const VideoIcon = createIcon([
  h('rect', { x: '3', y: '5', width: '14', height: '14', rx: '2' }),
  h('path', { d: 'M17 10l4-3v10l-4-3' }),
  h('path', { d: 'M8 9l5 3-5 3V9z' })
])

const ImageIcon = createIcon([
  h('rect', { x: '3', y: '5', width: '18', height: '14', rx: '2' }),
  h('circle', { cx: '9', cy: '10', r: '2.5' }),
  h('path', { d: 'M21 15l-5-5L7 19' })
])

const CompressIcon = createIcon([
  h('path', { d: 'M5 9h14' }),
  h('path', { d: 'M8 5v4' }),
  h('path', { d: 'M16 5v4' }),
  h('path', { d: 'M9 15h6' }),
  h('path', { d: 'M12 15v4' }),
  h('path', { d: 'M4 19h16' })
])

const CameraIcon = createIcon([
  h('path', { d: 'M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z' }),
  h('circle', { cx: '12', cy: '12', r: '3.5' })
])

const TypographyIcon = createIcon([
  h('path', { d: 'M4 18V6h7' }),
  h('path', { d: 'M4 10h9' }),
  h('path', { d: 'M15 6h5v12' }),
  h('path', { d: 'M15 12h5' })
])

const FileIcon = createIcon([
  h('path', { d: 'M14 3h5v18h-14V3h5' }),
  h('path', { d: 'M14 3v5h5' }),
  h('path', { d: 'M8 12h8M8 16h8' })
])

const CodeIcon = createIcon([
  h('path', { d: 'M8 8l-4 4 4 4' }),
  h('path', { d: 'M16 8l4 4-4 4' }),
  h('path', { d: 'M14 4l-4 16' })
])

const TextIcon = createIcon([
  h('path', { d: 'M4 7h16M4 12h10M4 17h16' }),
  h('path', { d: 'M17 7v10' })
])

const CalendarIcon = createIcon([
  h('rect', { x: '3', y: '5', width: '18', height: '16', rx: '2' }),
  h('path', { d: 'M8 3v4M16 3v4M3 10h18' }),
  h('path', { d: 'M8 14h3v3H8z' })
])

const KeyIcon = createIcon([
  h('circle', { cx: '8', cy: '15', r: '3.5' }),
  h('path', { d: 'M11.5 15h8.5v3M15 15V9h4' }),
  h('path', { d: 'M18 9v3h-3' })
])

const HashIcon = createIcon([
  h('path', { d: 'M5 9h14M5 15h14M9 4l-2 16M17 4l-2 16' })
])

const BookIcon = createIcon([
  h('path', { d: 'M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15H6.5A2.5 2.5 0 0 0 4 21.5V6.5z' }),
  h('path', { d: 'M4 6.5V19' }),
  h('path', { d: 'M8 8h8M8 12h8' })
])

const LightbulbIcon = createIcon([
  h('path', { d: 'M9 18h6M10 21h4' }),
  h('path', { d: 'M9.5 15.5a6 6 0 1 1 5 0l-1.3 1.5h-2.4L9.5 15.5z' })
])

const keyword = ref('')
const selectedCategory = ref('all')
const expandedGroups = ref(['ai', 'image', 'file', 'text', 'utility'])
const searchInput = ref(null)

// "/" or Cmd/Ctrl+K jumps straight into search
function onSearchShortcut(event) {
  const target = event.target
  const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  const pressedSlash = event.key === '/'
  const pressedK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
  if (!pressedSlash && !pressedK) return
  if (typing && pressedSlash) return
  event.preventDefault()
  searchInput.value?.focus()
  searchInput.value?.select?.()
}

onMounted(() => window.addEventListener('keydown', onSearchShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', onSearchShortcut))

const searchTags = computed(() => [
  t('home.tags.image'),
  t('home.tags.ai'),
  t('home.tags.text'),
  t('home.tags.compression'),
  t('home.tags.development')
])

const toolGroups = computed(() => [
  {
    key: 'ai',
    label: t('home.categories.ai'),
    title: t('home.categoryTitles.ai'),
    tools: [
      {
        name: t('home.tools.aiImage.name'),
        path: '/image-generator',
        description: t('home.tools.aiImage.description'),
        icon: SparklesIcon
      },
      {
        name: t('home.tools.aiVideo.name'),
        path: '/video-generator',
        description: t('home.tools.aiVideo.description'),
        icon: VideoIcon
      }
    ]
  },
  {
    key: 'image',
    label: t('home.categories.image'),
    title: t('home.categoryTitles.image'),
    tools: [
      {
        name: t('home.tools.imageToWebp.name'),
        path: '/image-to-webp',
        description: t('home.tools.imageToWebp.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.converter.title'),
        path: '/image-converter',
        description: t('imageTools.converter.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.heic.title'),
        path: '/heic-to-jpg',
        description: t('imageTools.heic.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.resizer.title'),
        path: '/image-resizer',
        description: t('imageTools.resizer.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.cropper.title'),
        path: '/image-cropper',
        description: t('imageTools.cropper.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.base64.toTitle'),
        path: '/image-to-base64',
        description: t('imageTools.base64.toDescription'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.base64.fromTitle'),
        path: '/base64-to-image',
        description: t('imageTools.base64.fromDescription'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.info.title'),
        path: '/image-info',
        description: t('imageTools.info.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.exif.title'),
        path: '/remove-exif',
        description: t('imageTools.exif.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.metadataHub.title'),
        path: '/image-metadata',
        description: t('imageTools.metadataHub.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.exifEditor.title'),
        path: '/exif-editor',
        description: t('imageTools.exifEditor.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.colorPicker.title'),
        path: '/image-color-picker',
        description: t('imageTools.colorPicker.description'),
        icon: ImageIcon
      },
      {
        name: t('imageTools.svg.title'),
        path: '/svg-converter',
        description: t('imageTools.svg.description'),
        icon: ImageIcon
      },
      {
        name: t('home.tools.webpToJpg.name'),
        path: '/webp-to-jpg',
        description: t('home.tools.webpToJpg.description'),
        icon: CompressIcon
      },
      {
        name: t('home.tools.webpToPng.name'),
        path: '/webp-to-png',
        description: t('home.tools.webpToPng.description'),
        icon: ImageIcon
      },
      {
        name: t('home.tools.imageCompress.name'),
        path: '/image-compress',
        description: t('home.tools.imageCompress.description'),
        icon: CompressIcon
      },
      {
        name: t('home.tools.imageAspectRatio.name'),
        path: '/image-aspect-ratio',
        description: t('home.tools.imageAspectRatio.description'),
        icon: ImageIcon
      },
      {
        name: t('home.tools.increaseImageSize.name'),
        path: '/increase-image-size',
        description: t('home.tools.increaseImageSize.description'),
        icon: CompressIcon
      },
      {
        name: t('home.tools.idPhoto.name'),
        path: '/id-photo',
        description: t('home.tools.idPhoto.description'),
        icon: CameraIcon
      }
    ]
  },
  {
    key: 'file',
    label: t('home.categories.file'),
    title: t('home.categoryTitles.file'),
    tools: [
      {
        name: t('home.tools.fontCompress.name'),
        path: '/font-compress',
        description: t('home.tools.fontCompress.description'),
        icon: TypographyIcon
      },
      {
        name: t('home.tools.fontInspector.name'),
        path: '/font-inspector',
        description: t('home.tools.fontInspector.description'),
        icon: TypographyIcon
      },
      {
        name: t('home.tools.fontUnicodeChecker.name'),
        path: '/font-unicode-checker',
        description: t('home.tools.fontUnicodeChecker.description'),
        icon: TypographyIcon
      },
      {
        name: t('home.tools.fontSizeAnalyzer.name'),
        path: '/font-size-analyzer',
        description: t('home.tools.fontSizeAnalyzer.description'),
        icon: TypographyIcon
      },
      {
        name: t('home.tools.fontValidator.name'),
        path: '/font-validator',
        description: t('home.tools.fontValidator.description'),
        icon: TypographyIcon
      },
      {
        name: t('home.tools.fontCssGenerator.name'),
        path: '/font-css-generator',
        description: t('home.tools.fontCssGenerator.description'),
        icon: TypographyIcon
      },
      {
        name: t('home.tools.jsonCsv.name'),
        path: '/json-csv-convert',
        description: t('home.tools.jsonCsv.description'),
        icon: FileIcon
      },
      {
        name: t('home.tools.jsonFormatter.name'),
        path: '/json-formatter',
        description: t('home.tools.jsonFormatter.description'),
        icon: CodeIcon
      },
      {
        name: t('jsonCompare.title'),
        path: '/json-compare',
        description: t('jsonCompare.description'),
        icon: CodeIcon
      },
      {
        name: t('home.tools.dateFormat.name'),
        path: '/date-format',
        description: t('home.tools.dateFormat.description'),
        icon: CalendarIcon
      }
    ]
  },
  {
    key: 'text',
    label: t('home.categories.text'),
    title: t('home.categoryTitles.text'),
    tools: [
      {
        name: t('home.tools.uppercase.name'),
        path: '/uppercase',
        description: t('home.tools.uppercase.description'),
        icon: TextIcon
      },
      {
        name: t('home.tools.token.name'),
        path: '/token-generator',
        description: t('home.tools.token.description'),
        icon: KeyIcon
      },
      {
        name: t('home.tools.hash.name'),
        path: '/hash-text',
        description: t('home.tools.hash.description'),
        icon: HashIcon
      }
    ]
  },
  {
    key: 'utility',
    label: t('home.categories.utility'),
    title: t('home.categoryTitles.utility'),
    tools: [
      {
        name: t('home.tools.blog.name'),
        path: '/blog',
        description: t('home.tools.blog.description'),
        icon: BookIcon
      },
      {
        name: t('home.tools.prompts.name'),
        path: '/prompts',
        description: t('home.tools.prompts.description'),
        icon: LightbulbIcon
      },
      {
        name: t('home.tools.shareNote.name'),
        path: '/send-script-to-remote-user',
        description: t('home.tools.shareNote.description'),
        icon: CodeIcon
      }
    ]
  }
])

const filteredGroups = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return toolGroups.value.filter((group) => {
    const matchCategory = selectedCategory.value === 'all' || group.key === selectedCategory.value
    if (!matchCategory) return false

    const filteredTools = !search
      ? group.tools
      : group.tools.filter((tool) => {
          const text = `${tool.name} ${tool.description} ${tool.path}`.toLowerCase()
          return text.includes(search)
        })

    if (!filteredTools.length) return false

    return true
  }).map((group) => ({
    ...group,
    tools: !search
      ? group.tools
      : group.tools.filter((tool) => {
          const text = `${tool.name} ${tool.description} ${tool.path}`.toLowerCase()
          return text.includes(search)
        })
  }))
})

function toggleGroup(groupKey) {
  const idx = expandedGroups.value.indexOf(groupKey)
  if (idx >= 0) {
    expandedGroups.value.splice(idx, 1)
  } else {
    expandedGroups.value.push(groupKey)
  }
}

useToolSeo({
  title: computed(() => t('home.seoTitle')),
  description: computed(() => t('home.seoDescription')),
  keywords: computed(() => t('home.seoKeywords')),
  type: 'WebSite',
  schemaProperties: computed(() => ({
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://onlitools.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }))
})
</script>
