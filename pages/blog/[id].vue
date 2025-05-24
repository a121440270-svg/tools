<template>
  <div v-if="pending" class="text-center py-8">
    <span class="animate-spin">🔄</span> 加载中...
  </div>
  <div v-else-if="article">
    <div class="flex items-center justify-between mb-6">
      <NuxtLink 
        to="/blog" 
        class="flex items-center text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-foreground"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        返回列表
      </NuxtLink>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <h1 class="text-3xl font-medium mb-6 dark:text-white">{{ article.title }}</h1>
      
      <div class="prose dark:prose-invert max-w-none">
        {{ article.content }}
      </div>

      <div class="mt-8 pt-6 border-t dark:border-gray-700">
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span class="mr-4">作者：{{ article.author }}</span>
          <span>最后更新：{{ article.last_mod_time }}</span>
          <span class="ml-4">阅读量：{{ article.hits }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: article, pending } = useFetch(`/api/articles/${route.params.id}`)
</script>