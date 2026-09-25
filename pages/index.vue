<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div class="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
      <header class="sticky top-0 z-40 mb-8 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-bold text-white shadow-md">
              O
            </div>
            <div>
              <div class="text-xl font-bold text-slate-900 dark:text-white">OnliTool</div>
              <div class="text-xs text-slate-500 dark:text-slate-400">{{ t('menu.desc') }}</div>
            </div>
          </div>

          <nav class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-full px-3 py-2 text-sm font-medium transition"
              :class="selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
              @click="selectedCategory = 'all'"
            >
              {{ t('home.all') }}
            </button>
            <button
              v-for="group in toolGroups"
              :key="group.key"
              type="button"
              class="rounded-full px-3 py-2 text-sm font-medium transition"
              :class="selectedCategory === group.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
              @click="selectedCategory = group.key"
            >
              {{ group.label }}
            </button>
          </nav>
        </div>
      </header>

      <section class="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-5 text-white shadow-xl dark:border-slate-700 sm:p-6">
        <div class="grid gap-4 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div class="mb-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.2em] text-blue-100 uppercase">
              {{ t('home.eyebrow') }}
            </div>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
              {{ t('home.title') }}
            </h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-slate-200">
              {{ t('home.description') }}
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner">
            <label class="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-300">{{ t('home.searchLabel') }}</label>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <input
                v-model="keyword"
                type="text"
                :placeholder="t('home.searchPlaceholder')"
                class="w-full rounded-xl border border-white/10 bg-slate-950/30 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 outline-none ring-0 transition focus:border-blue-400"
              />
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
              <span v-for="tag in searchTags" :key="tag" class="rounded-full bg-white/5 px-2 py-1">{{ tag }}</span>
            </div>
          </div>
        </div>
      </section>

      <div v-if="filteredGroups.length" class="space-y-5 pb-8">
        <section
          v-for="group in filteredGroups"
          :key="group.key"
          class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 text-left"
            @click="toggleGroup(group.key)"
          >
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                {{ group.label }}
              </div>
              <div class="mt-1 text-xl font-bold text-slate-900 dark:text-white">{{ group.title }}</div>
            </div>
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition dark:bg-slate-800 dark:text-slate-200">
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
                v-for="tool in group.tools"
                :key="tool.path"
                :to="tool.path"
                class="group rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-500"
              >
                <div class="mb-2 flex items-center justify-between">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-700">
                    <component :is="tool.icon" class="h-5 w-5 text-slate-700 dark:text-slate-100" />
                  </div>
                  <span class="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    {{ t('home.toolBadge') }}
                  </span>
                </div>

                <h3 class="text-base font-semibold text-slate-900 dark:text-white">{{ tool.name }}</h3>
                <p class="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                  {{ tool.description }}
                </p>
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {{ t('home.empty') }}
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

import { computed, defineComponent, h, ref } from 'vue'

const { t } = useI18n()

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
        name: 'Image Aspect Ratio Changer',
        path: '/image-aspect-ratio',
        description: 'Change images to 16:9, 1:1, 9:16, 4:3 and custom ratios with crop, fit, blur, or stretch modes.',
        icon: ImageIcon
      },
      {
        name: 'Increase Image Size in KB',
        path: '/increase-image-size',
        description: 'Increase image file size to a target KB or MB while keeping the original image dimensions.',
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
        name: t('home.tools.jsonCompare.name'),
        path: '/json-compare',
        description: t('home.tools.jsonCompare.description'),
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

useHead({
  title: t('home.seoTitle'),
  meta: [
    { name: 'description', content: t('home.seoDescription') },
    { name: 'keywords', content: t('home.seoKeywords') },
    { property: 'og:title', content: t('home.seoTitle') },
    { property: 'og:description', content: t('home.seoOgDescription') },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'OnliTool',
        url: 'https://onlitools.com',
        description: t('home.seoDescription'),
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://onlitools.com/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ]
})
</script>
