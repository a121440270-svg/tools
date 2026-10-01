<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-medium">{{ $t('promptDetail.title') }}</h2>
      <div>
        <el-button type="primary" @click="goEdit">{{ $t('promptDetail.edit') }}</el-button>
        <el-button @click="goList">{{ $t('promptDetail.back') }}</el-button>
      </div>
    </div>

    <div v-if="loading">{{ $t('promptDetail.loading') }}</div>
    <div v-else>
      <div class="mb-4">
        <h3 class="text-xl font-semibold">{{ item.title }}</h3>
        <div class="text-sm text-gray-500">{{ $t('promptDetail.aiApp') }} {{ item.ai_app || '—' }}</div>
      </div>

      <div class="mb-4">
        <h4 class="font-medium">{{ $t('promptDetail.content') }}</h4>
        <pre class="whitespace-pre-wrap bg-gray-50 p-3 rounded">{{ item.content }}</pre>
      </div>

      <div>
        <h4 class="font-medium">{{ $t('promptDetail.instructions') }}</h4>
        <div class="prose">
          <p v-html="item.instructions"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from '#imports'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const item = ref(null)
const loading = ref(true)

async function fetch() {
  loading.value = true
  try {
    item.value = await $fetch(`/api/prompts/${id}`)
  } catch (e) {
    console.error(e)
  } finally { loading.value = false }
}

function goEdit() { router.push(`/prompts/edit/${id}`) }
function goList() { router.push('/prompts') }

fetch()
</script>
