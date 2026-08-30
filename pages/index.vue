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
              全部
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
              Tool Directory
            </div>
            <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
              全站工具导航，快速找到你需要的在线工具
            </h1>
            <p class="mt-2 max-w-xl text-sm leading-6 text-slate-200">
              图片处理、字体压缩、文本转换、AI 工具与开发辅助工具，全部集中在这里，支持关键词搜索和分类快速筛选。
            </p>
          </div>

          <div class="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner">
            <label class="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-300">搜索</label>
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
                placeholder="搜索所有本站工具..."
                class="w-full rounded-xl border border-white/10 bg-slate-950/30 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 outline-none ring-0 transition focus:border-blue-400"
              />
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
              <span class="rounded-full bg-white/5 px-2 py-1">图片</span>
              <span class="rounded-full bg-white/5 px-2 py-1">AI</span>
              <span class="rounded-full bg-white/5 px-2 py-1">文本</span>
              <span class="rounded-full bg-white/5 px-2 py-1">压缩</span>
              <span class="rounded-full bg-white/5 px-2 py-1">开发</span>
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
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg shadow-sm dark:bg-slate-700">
                    {{ tool.icon }}
                  </div>
                  <span class="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    Tool
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
        没有找到匹配的工具，换个关键词试试。
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const { t } = useI18n()

// definePageMeta({ layout: false })

const keyword = ref('')
const selectedCategory = ref('all')
const expandedGroups = ref(['ai', 'image', 'file', 'text', 'utility'])

const toolGroups = computed(() => [
  {
    key: 'ai',
    label: t('menu.image') || 'AI 工具',
    title: 'AI 创意工具',
    tools: [
      {
        name: t('menu.agnes_image') || 'AI 图片生成',
        path: '/image-generator',
        description: t('agnesImage.subtitle') || '根据提示词生成高质量图片。',
        icon: '🎨'
      },
      {
        name: t('menu.agnes_video') || 'AI 视频生成',
        path: '/video-generator',
        description: t('agnesVideo.subtitle') || '生成短视频与创意动画内容。',
        icon: '🎬'
      }
    ]
  },
  {
    key: 'image',
    label: t('menu.image') || '图片处理',
    title: '图片工具',
    tools: [
      {
        name: t('webp.title') || '图片转 WebP',
        path: '/image-to-webp',
        description: t('webp.desc') || '批量将图片转换为 WebP 格式。',
        icon: '🖼️'
      },
      {
        name: 'WebP 转 JPG',
        path: '/webp-to-jpg',
        description: '批量 WebP 转 JPG，支持多图处理。',
        icon: '🧩'
      },
      {
        name: 'WebP 转 PNG',
        path: '/webp-to-png',
        description: '批量 WebP 转 PNG，适合图片透明处理。',
        icon: '🪟'
      },
      {
        name: t('menu.imageCompress') || '图片压缩',
        path: '/image-compress',
        description: '压缩 JPG、PNG 等图片，减少体积。',
        icon: '📦'
      },
      {
        name: t('menu.idPhoto') || '证件照制作',
        path: '/id-photo',
        description: '上传照片并快速生成证件照尺寸与背景。',
        icon: '📸'
      }
    ]
  },
  {
    key: 'file',
    label: t('menu.filetype') || '文件工具',
    title: '文件与格式工具',
    tools: [
      {
        name: t('menu.ttf') || 'TTF 字体压缩',
        path: '/font-compress',
        description: t('font.seo_desc') || '压缩 TTF 字体并生成更小的子集字体。',
        icon: '🔤'
      },
      {
        name: t('menu.jsoncsv') || 'JSON/CSV 转换',
        path: '/json-csv-convert',
        description: t('jsoncsv.index') || '快速转换 JSON 和 CSV 数据文件。',
        icon: '📄'
      }
    ]
  },
  {
    key: 'text',
    label: '文本工具',
    title: '文本与内容工具',
    tools: [
      {
        name: t('menu.uppercase') || '大写转换',
        path: '/uppercase',
        description: '快速把文本转成大写并复制到剪贴板。',
        icon: '🔠'
      },
      {
        name: 'Token generator',
        path: '/token-generator',
        description: '生成随机 Token，支持字母、数字和符号组合。',
        icon: '⚡'
      },
      {
        name: 'Hash text',
        path: '/hash-text',
        description: '对文本执行 MD5、SHA 等常见哈希算法。',
        icon: '🧬'
      }
    ]
  },
  {
    key: 'utility',
    label: t('menu.crypto') || '实用工具',
    title: '开发与工具类',
    tools: [
      {
        name: 'Blog',
        path: '/blog',
        description: '浏览文章和站内教程内容。',
        icon: '📝'
      },
      {
        name: 'Prompts',
        path: '/prompts',
        description: '查看和使用可复用的提示词模板。',
        icon: '💡'
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
  title: 'OnliTool - 全站工具导航',
  meta: [
    { name: 'description', content: 'OnliTool 提供图片处理、AI 工具、字体压缩、文本转换、开发辅助等在线工具，一站式工具导航。' },
    { name: 'keywords', content: '在线工具, 图片处理, AI工具, 字体压缩, 文件转换, 开发工具, OnliTool' },
    { property: 'og:title', content: 'OnliTool - 全站工具导航' },
    { property: 'og:description', content: '一站式在线工具导航，快速找到图片、AI、文本、转换和开发辅助工具。' },
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
        description: 'OnliTool 提供图片处理、字体压缩、文本转换、AI 工具和开发辅助工具。',
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
