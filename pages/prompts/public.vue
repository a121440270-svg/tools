<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">{{ $t('prompts.title') }}</h1>
      <div class="flex items-center gap-4">
        <div class="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
          <!-- simple sort placeholder if needed -->
        </div>
        <button
          @click="handleWritePrompt"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {{ $t('prompts.write') }}
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="space-y-6">
        <div 
          v-for="p in prompts" 
          :key="p.id"
          class="border-b dark:border-gray-700 pb-6 last:border-0"
        >
          <NuxtLink :to="`/prompts/${p.id}`" class="block hover:text-primary dark:hover:text-primary-foreground">
            <h2 class="text-xl font-medium mb-2">{{ p.title }}</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{{ summarize(p.content) }}</p>
          </NuxtLink>
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span class="mr-4">{{ p.ai_app || '-' }}</span>
            <span class="mr-4">{{ formatDate(p.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

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
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useUser } from '~/composables/useAuth'

const { locale, t } = useI18n()
const user = useUser()
const router = useRouter()

const pageSize = 5
const currentPage = ref(1)
const total = ref(0)
const prompts = ref([])

async function fetchPrompts() {
  try {
    const res = await useFetch('/api/prompts', { params: { page: currentPage.value, pageSize, lang: locale.value } })
    prompts.value = res.data.value?.list || []
    total.value = res.data.value?.total || 0
  } catch (e) {
    console.error(e)
    ElMessage.error(t('prompts.fetchError'))
  }
}

watch([currentPage, () => locale.value], fetchPrompts, { immediate: true })

function summarize(text = '', length = 160) {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function handleWritePrompt() {
  if (!user.value?.id) {
    ElMessage.error(t('prompts.needLogin'))
    router.push('/auth/login')
    return
  }
  router.push('/prompts/edit/new')
}
</script>

<style scoped>
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden }
</style>
