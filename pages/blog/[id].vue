<template>
  <div v-if="pending" class="text-center py-8">
    <span class="animate-spin">🔄</span> {{ $t('common.loading') }}
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
        {{ $t('blog.backToList') }}
      </NuxtLink>
      
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <h1 class="text-3xl font-medium mb-6 dark:text-white">{{ article.title }}</h1>

      <div class="mb-4 flex flex-wrap gap-4 items-center">
        <span class="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{{ $t('blog.category') }}：{{ article.category }}</span>
        <!-- <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('blog.author') }}：{{ article.author }}</span> -->
        <!-- edit link shown only to the article author -->
      <span v-if="canEdit" class="text-xs text-gray-500 dark:text-gray-400">
        <NuxtLink :to="editLink">
          {{ $t('blog.edit') }}
        </NuxtLink>
      </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('blog.lastUpdate') }}：{{ formatDate(article.last_mod_time) }}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ $t('blog.hits') }}：{{ article.hits }}</span>
        <div v-if="article.catalog && article.catalog.length" class="relative">
          <button @click="showCatalog = !showCatalog" class="text-primary underline text-xs">
            {{ showCatalog ? $t('blog.collapseCatalog') : $t('blog.expandCatalog') }}
          </button>
          <ul v-show="showCatalog" class="mt-2 ml-2 pl-4 border-l dark:border-gray-700 text-sm space-y-1">
            <li v-for="(item, idx) in article.catalog" :key="idx">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div class="prose dark:prose-invert max-w-none" v-html="article.content">
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '#app'
const route = useRoute()
const { data: articleRaw, pending } = useFetch(`/api/articles/${route.params.id}`)
const showCatalog = ref(true)
const { t, locale } = useI18n()

// attempt to get current user from common places (project may use different auth)
const currentUserState = useState ? useState('user') : null
const currentUser = computed(() => {
  if (!currentUserState) return null
  return currentUserState.value || null
})

// canEdit if current user's id or username matches article author fields
const canEdit = computed(() => {
  if (!article.value || !currentUser.value) return false
  // prefer authorId if backend provides it
  if (article.value.author_id && currentUser.value.id) {
    return String(article.value.author_id) === String(currentUser.value.id)
  }
  // fall back to username/email matching
  if (article.value.author && currentUser.value.username) {
    return String(article.value.author) === String(currentUser.value.username)
  }
  return false
})

const editLink = computed(() => {
  const id = route.params.id
  const lang = locale?.value || ''
  return { path: '/blog/post', query: { id, lang } }
})
const article = computed(() => {
  if (!articleRaw.value) return null
  // 兼容后端返回的 catalog 字段为字符串或数组
  let catalog = articleRaw.value.catalog
  if (typeof catalog === 'string') {
    catalog = catalog.split(',').map(i => i.trim()).filter(Boolean)
  }
  return { ...articleRaw.value.article,...articleRaw.value.articlel, catalog }
})

useHead(() => ({
  title: article.value?.title || t('blog.defaultTitle') || 'Blog',
  meta: [
    {
      name: 'description',
      content: article.value?.description || article.value?.summary || ''
    },
    {
      name: 'keywords',
      content: Array.isArray(article.value?.keywords)
        ? article.value.keywords.join(', ')
        : (article.value?.keywords || '')
    }
  ]
}))

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
</script>