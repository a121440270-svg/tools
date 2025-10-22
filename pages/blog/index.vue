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
            :to="`/blog/${article.id}`" 
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
    <div class="mt-6 flex justify-center gap-2">
      <button 
        v-for="page in Math.ceil(total / pageSize)"
        :key="page"
        @click="currentPage = page"
        class="px-3 py-1 rounded-md"
        :class="page === currentPage ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useUser } from '~/composables/useAuth'
const { t, locale } = useI18n()
const user = useUser()
const router = useRouter()

// 分页参数
const pageSize = 5
const currentPage = ref(1)
const total = ref(0)
const articles = ref([])

// 排序
const sortBy = ref('hits')
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
        pageSize,
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

// 监听分页和排序变化
watch([currentPage, sortBy], fetchArticles, { immediate: true })

const paginatedArticles = computed(() => articles.value)
const sortedArticles = computed(() => articles.value)

const handleWriteArticle = () => {
  if (!user.value?.id) {
    ElMessage.error(t('blog.needLogin'))
    router.push('/auth/login')
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