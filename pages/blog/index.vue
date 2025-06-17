<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">博客文章</h1>
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
            {{ sort.label }}
          </button>
        </div>
        <NuxtLink 
          to="/blog/post" 
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          写文章
        </NuxtLink>
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
            <span class="mr-4">作者：{{ article.author }}</span>
            <span>发布日期：{{ article.posted_time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination section -->
    <div class="mt-6 flex justify-center gap-2">
      <button 
        v-for="page in Math.ceil(sortedArticles.length / pageSize)"
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

const { data: article } = useFetch(`/api/article`)
console.log("查询到的文章");
console.log(article);
const articles = ref([
  {
    id: 1,
    title: 'Vue3 Composition API 最佳实践',
    summary: '深入讲解Vue3组合式API的使用技巧...',
    author: '前端专家',
    posted_time: '2024-03-22',
    hits: 256
  },
  {
    id: 2, 
    title: 'Nuxt3服务端渲染指南',
    summary: '从零开始构建Nuxt3 SSR应用...',
    author: '全栈工程师',
    posted_time: '2024-03-21',
    hits: 189
  },
  // 添加更多模拟数据...
])

// 分页功能
const pageSize = 5;
const currentPage = ref(1);
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return sortedArticles.value.slice(start, start + pageSize);
})

const sortBy = ref('hits')
const sorts = [
  { label: '按热度', value: 'hits' },
  { label: '按时间', value: 'posted_time' }
]

const sortedArticles = computed(() => {
  return [...articles.value].sort((a, b) => {
    if (sortBy.value === 'hits') {
      return b.hits - a.hits
    } else {
      return new Date(b.posted_time) - new Date(a.posted_time)
    }
  })
})
</script>