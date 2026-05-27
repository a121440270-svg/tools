<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">{{ $t('blog.title') }}</h1>
      <div class="flex items-center gap-4">
        <div class="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
          <button
            v-for="sort in sorts"
            :key="sort.value"
            @click="sortBy = sort.value"
            class="px-3 py-1 rounded-md transition-colors"
            :class="{
              'bg-white text-primary dark:bg-gray-800 dark:text-primary-foreground': sortBy === sort.value,
              'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600': sortBy !== sort.value
            }"
          >
            {{ $t(sort.label) }}
          </button>
        </div>
        <button
          @click="handleWriteArticle"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {{ $t('blog.write') }}
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="space-y-6">
        <div 
          v-for="article in paginatedArticles" 
          :key="article.id"
          class="border-b dark:border-gray-700 pb-6 last:border-0"
        >
          <NuxtLink 
            :to="localePath(`/blog/${article.slug}-${article.id}`)" 
            class="block hover:text-primary dark:hover:text-primary-foreground"
          >
            <h2 class="text-xl font-medium mb-2">{{ article.title }}</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{{ article.summary }}</p>
          </NuxtLink>
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span class="mr-4">{{ $t('blog.author') }}：{{ article.author }}</span>
            <span class="mr-4">{{ $t('blog.posted') }}：{{ formatDate(article.posted_time) }}</span>
            <span class="mr-4">{{ $t('blog.type') }}：{{ article.type || '-' }}</span>
            <span>{{ $t('blog.hits') }}：{{ article.hits }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination section -->
    <div class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- 每页条数选择和总数 -->
      <div class="flex items-center gap-2">
        <span>{{$t('blog.pageSize')}}</span>
        <select v-model.number="pageSize" @change="handlePageSizeChange" class="border rounded px-2 py-1 font-semibold bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm">
          <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }}</option>
        </select>
        <span class="font-semibold text-gray-700">{{$t('blog.items')}}</span>
        <span class="ml-2 text-gray-500">{{$t('blog.totalItems', { total: total })}}</span>
      </div>
      <!-- 分页条 -->
      <div class="flex items-center gap-1">
        <button :disabled="currentPage === 1" @click="changePage(1)" class="px-2 py-1 rounded" :class="currentPage === 1 ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'">«</button>
        <button :disabled="currentPage === 1" @click="changePage(currentPage-1)" class="px-2 py-1 rounded" :class="currentPage === 1 ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'">‹</button>
        <template v-for="page in paginationPages">
          <button v-if="page === '...'" disabled class="px-2 py-1" :key="'ellipsis-'+page">...</button>
          <button v-else @click="changePage(page)" :class="page === currentPage ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'" class="px-3 py-1 rounded-md" :key="'pagebtn-'+page">{{ page }}</button>
        </template>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage+1)" class="px-2 py-1 rounded" :class="currentPage === totalPages ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'">›</button>
        <button :disabled="currentPage === totalPages" @click="changePage(totalPages)" class="px-2 py-1 rounded" :class="currentPage === totalPages ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-600'">»</button>
      </div>
      <!-- 跳转到指定页 -->
      <div class="flex items-center gap-2">
        <span>{{$t('blog.gotoPage') || '跳转到'}}</span>
        <input type="number" v-model.number="jumpPage" min="1" :max="totalPages" class="border rounded px-2 py-1 w-16 font-semibold bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm" @keyup.enter="handleJumpPage" />
        <button @click="handleJumpPage" class="px-2 py-1 bg-primary text-white rounded font-semibold">{{$t('blog.go') || 'GO'}}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useUser } from '~/composables/useAuth'
import { useLocalePath } from '#i18n'

const localePath = useLocalePath()
const { t, locale } = useI18n()
const user = useUser()
const router = useRouter()

// 分页参数
const pageSize = ref(5)
const currentPage = ref(1)
const total = ref(0)
const articles = ref([])
const jumpPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

// 省略号分页算法
const paginationPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')
    for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
      pages.push(i)
    }
    if (current < total - 3) pages.push('...')
    pages.push(total)
  }
  return pages
})

function changePage(page) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
}

function handlePageSizeChange() {
  currentPage.value = 1
  fetchArticles()
}

function handleJumpPage() {
  let page = Number(jumpPage.value)
  if (!page || page < 1) page = 1
  if (page > totalPages.value) page = totalPages.value
  currentPage.value = page
}

// 排序
const sortBy = ref('posted_time')
const sorts = [
  { label: 'blog.sort.hits', value: 'hits' },
  { label: 'blog.sort.time', value: 'posted_time' }
]

// 获取文章列表
const fetchArticles = async () => {
  try {
    const { data, error } = await useFetch('/api/articlepage', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        sort: sortBy.value
      }
    })
    if (error.value) {
      if (typeof window !== 'undefined') {
        ElMessage.error(t('blog.fetchError'))
      } else {
        console.error(t('blog.fetchError'))
      }
      return
    }
    articles.value = data.value?.list || []
    total.value = data.value?.total || 0
  } catch (e) {
    if (typeof window !== 'undefined') {
      ElMessage.error(t('blog.fetchError'))
    } else {
      console.error(t('blog.fetchError'))
    }
  }
}

// 监听分页、排序、每页条数变化
watch([currentPage, sortBy, pageSize], fetchArticles, { immediate: true })

const paginatedArticles = computed(() => articles.value)
const sortedArticles = computed(() => articles.value)

const handleWriteArticle = () => {
  if (!user.value?.id) {
    ElMessage.error(t('blog.needLogin'))
    router.push(localePath('/auth/login'))
    return
  }
  router.push('/blog/post')
}

// 格式化日期
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

// SEO meta
useHead({
  title: t('blog.title'),
  meta: [
    {
      name: 'description',
      content: t('blog.seoDesc')
    },
    {
      name: 'keywords',
      content: t('blog.seoKeywords')
    },
    {
      property: 'og:title',
      content: t('blog.title')
    },
    {
      property: 'og:description',
      content: t('blog.seoDesc')
    }
  ]
})
</script>