<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-medium dark:text-white">{{ $t('blog.title') }}</h1>
        <p class="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          {{ $t('blog.seoDesc') }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex rounded-md bg-gray-100 p-1 dark:bg-gray-700">
          <button
            v-for="sort in sorts"
            :key="sort.value"
            type="button"
            class="rounded-md px-3 py-1 transition-colors"
            :class="{
              'bg-white text-primary dark:bg-gray-800 dark:text-primary-foreground': sortBy === sort.value,
              'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600': sortBy !== sort.value
            }"
            @click="handleSort(sort.value)"
          >
            {{ $t(sort.label) }}
          </button>
        </div>
        <button
          type="button"
          class="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          @click="handleWriteArticle"
        >
          {{ $t('blog.write') }}
        </button>
      </div>
    </div>

    <div v-if="pending" class="py-12 text-center text-gray-500 dark:text-gray-400">
      <span class="animate-spin">🔄</span> {{ $t('common.loading') }}
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
      {{ $t('blog.fetchError') }}
    </div>

    <div v-else class="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-8">
      <p v-if="!articles.length" class="py-8 text-center text-gray-500 dark:text-gray-400">
        {{ $t('blog.totalItems', { total: 0 }) }}
      </p>
      <div class="space-y-6">
        <article
          v-for="article in articles"
          :key="article.id"
          class="border-b pb-6 last:border-0 dark:border-gray-700"
        >
          <NuxtLink
            :to="articleLink(article)"
            class="block hover:text-primary dark:hover:text-primary-foreground"
          >
            <h2 class="mb-2 text-xl font-medium">{{ article.title }}</h2>
            <p class="mb-4 line-clamp-3 text-gray-600 dark:text-gray-400">{{ excerpt(article) }}</p>
          </NuxtLink>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span v-if="article.author">{{ $t('blog.author') }}：{{ article.author }}</span>
            <time v-if="article.posted_time" :datetime="article.posted_time">{{ $t('blog.posted') }}：{{ formatDate(article.posted_time) }}</time>
            <span v-if="article.type">{{ $t('blog.type') }}：{{ article.type }}</span>
            <span>{{ $t('blog.hits') }}：{{ article.hits }}</span>
          </div>
        </article>
      </div>
    </div>

    <!-- Pagination: real links so crawlers can walk every listing page. -->
    <nav
      v-if="totalPages > 1"
      class="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row"
      :aria-label="$t('blog.title')"
    >
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ $t('blog.totalItems', { total }) }}
      </p>

      <div class="flex flex-wrap items-center justify-center gap-1">
        <NuxtLink
          :to="pageLink(1)"
          class="rounded px-2 py-1"
          :class="currentPage === 1 ? 'pointer-events-none bg-gray-200 text-gray-400 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'"
          :aria-disabled="currentPage === 1"
          rel="first"
        >«</NuxtLink>
        <NuxtLink
          :to="pageLink(currentPage - 1)"
          class="rounded px-2 py-1"
          :class="currentPage === 1 ? 'pointer-events-none bg-gray-200 text-gray-400 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'"
          :aria-disabled="currentPage === 1"
          rel="prev"
        >‹</NuxtLink>
        <template v-for="page in paginationPages" :key="'page-' + page">
          <span v-if="page === '...'" class="px-2 py-1 text-gray-400">…</span>
          <NuxtLink
            v-else
            :to="pageLink(page)"
            class="rounded-md px-3 py-1"
            :class="page === currentPage ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'"
            :aria-current="page === currentPage ? 'page' : undefined"
          >{{ page }}</NuxtLink>
        </template>
        <NuxtLink
          :to="pageLink(currentPage + 1)"
          class="rounded px-2 py-1"
          :class="currentPage === totalPages ? 'pointer-events-none bg-gray-200 text-gray-400 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'"
          :aria-disabled="currentPage === totalPages"
          rel="next"
        >›</NuxtLink>
        <NuxtLink
          :to="pageLink(totalPages)"
          class="rounded px-2 py-1"
          :class="currentPage === totalPages ? 'pointer-events-none bg-gray-200 text-gray-400 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'"
          :aria-disabled="currentPage === totalPages"
          rel="last"
        >»</NuxtLink>
      </div>

      <form class="flex items-center gap-2" @submit.prevent="handleJumpPage">
        <label for="blog-jump-page" class="text-sm text-gray-600 dark:text-gray-300">{{ $t('blog.gotoPage') }}</label>
        <input
          id="blog-jump-page"
          v-model.number="jumpPage"
          type="number"
          min="1"
          :max="totalPages"
          class="w-16 rounded border bg-white px-2 py-1 font-semibold text-gray-800 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-100"
        />
        <button type="submit" class="rounded bg-primary px-2 py-1 font-semibold text-white">{{ $t('blog.go') }}</button>
      </form>
    </nav>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useUser } from '~/composables/useAuth'
import { useLocalePath } from '#i18n'

const PAGE_SIZE = 12

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const user = useUser()

const sorts = [
  { label: 'blog.sort.time', value: 'posted_time' },
  { label: 'blog.sort.hits', value: 'hits' }
]

const sortBy = computed(() => (route.query.sort === 'hits' ? 'hits' : 'posted_time'))
const currentPage = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

const jumpPage = ref(currentPage.value)
watch(currentPage, (page) => { jumpPage.value = page })

// Server-rendered so the article links exist in the initial HTML. This is what
// lets crawlers discover every post instead of waiting for client-side JS.
// `useAsyncData` requires a plain string key (Nuxt 3.16 throws on a getter), so
// the key is resolved once and the `watch` option refetches on query/locale
// changes.
// Articles are authored only in en/zh. Asking the API for `lang=de` returns an
// empty list, which made `/de/blog` (and fr/ja/ar) an empty listing with zero
// article links — thin content for crawlers. Fall back to English instead.
const contentLang = computed(() => (locale.value === 'zh' ? 'zh' : 'en'))
const blogKey = `blog-list:${contentLang.value}:${currentPage.value}:${sortBy.value}`
const { data, pending, error } = await useAsyncData(
  blogKey,
  () => $fetch('/api/articlepage', {
    params: {
      page: currentPage.value,
      pageSize: PAGE_SIZE,
      sort: sortBy.value,
      lang: contentLang.value,
      excerpt: 1
    }
  }),
  { watch: [currentPage, sortBy, locale] }
)

const articles = computed(() => data.value?.list || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// Ellipsis pagination algorithm.
const paginationPages = computed(() => {
  const pages = []
  const count = totalPages.value
  const current = currentPage.value
  if (count <= 7) {
    for (let i = 1; i <= count; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')
    for (let i = Math.max(2, current - 2); i <= Math.min(count - 1, current + 2); i++) {
      pages.push(i)
    }
    if (current < count - 3) pages.push('...')
    pages.push(count)
  }
  return pages
})

function pageLink(page) {
  const query = {}
  const target = Math.min(Math.max(1, page), totalPages.value)
  if (target > 1) query.page = String(target)
  if (sortBy.value === 'hits') query.sort = 'hits'
  return localePath({ path: '/blog', query })
}

function articleLink(article) {
  const slug = String(article.slug || '').trim().replace(/^\/+|\/+$/g, '')
  const suffix = slug ? `${slug}-${article.id}` : `${article.id}`
  // Articles only exist in en/zh. In the other locales link straight at the
  // English URL instead of emitting a `/{locale}/blog/...` link that would 301.
  const code = locale.value === 'zh' ? 'zh' : 'en'
  return `${code === 'zh' ? '/zh' : ''}/blog/${encodeURI(suffix)}`
}

function handleSort(value) {
  if (value === sortBy.value) return
  const query = value === 'hits' ? { sort: 'hits' } : {}
  router.push(localePath({ path: '/blog', query }))
}

function handleJumpPage() {
  const page = Number(jumpPage.value)
  if (!Number.isFinite(page)) {
    jumpPage.value = currentPage.value
    return
  }
  router.push(pageLink(page))
}

function excerpt(article) {
  if (article.summary) return article.summary
  return stripHtml(article.content).slice(0, 200)
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const handleWriteArticle = () => {
  if (!user.value?.id) {
    ElMessage.error(t('blog.needLogin'))
    router.push(localePath('/auth/login'))
    return
  }
  router.push(localePath('/blog/post'))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

useToolSeo({
  title: () => currentPage.value > 1
    ? `${t('blog.title')} — ${currentPage.value} | OnliTool`
    : `${t('blog.title')} | OnliTool`,
  description: () => t('blog.seoDesc'),
  keywords: () => t('blog.seoKeywords'),
  type: 'WebPage',
  // Paginated listings self-canonicalise so each page can be indexed on its
  // own, while the `?sort=` view points back at the unsorted page to avoid a
  // duplicate listing. Only en/zh actually author the listing, so de/fr/ja/ar
  // fold their canonical onto the English URL (they render the same posts).
  canonical: () => {
    const contentLocale = locale.value === 'zh' ? 'zh' : 'en'
    const query = []
    if (currentPage.value > 1) query.push(`page=${currentPage.value}`)
    return `${contentLocale === 'zh' ? '/zh' : ''}/blog${query.length ? `?${query.join('&')}` : ''}`
  },
  // The article list is only authored for en/zh; the other locales show the same
  // English posts, so they must not claim a de/fr/ja/ar translation.
  translatedLocales: ['en', 'zh']
})
</script>
