<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 text-center">
      <h1 class="text-2xl font-bold mb-4">{{ $t('accountActivation.title') }}</h1>
      <div v-if="loading">
        {{ $t('accountActivation.activating') }}
      </div>
      <div v-else-if="success">
        <div class="text-green-600 text-lg mb-2">{{ $t('accountActivation.success') }}</div>
        <div>{{ $t('accountActivation.redirecting') }}</div>
        <el-button type="primary" class="mt-4" @click="goLogin">{{ $t('accountActivation.loginNow') }}</el-button>
      </div>
      <div v-else>
        <div class="text-red-600 text-lg mb-2">{{ $t('accountActivation.failed', { message: errorMsg }) }}</div>
        <el-button type="primary" class="mt-4" @click="goLogin">{{ $t('accountActivation.login') }}</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const loading = ref(true)
const success = ref(false)
const errorMsg = ref('')

function goLogin() {
  router.push(localePath('/auth/login'))
}

onMounted(async () => {
  await nextTick()
  const { email, code } = route.query
  if (!email || !code) {
    errorMsg.value = t('accountActivation.missingParams')
    loading.value = false
    return
  }
  const { data } = await useFetch('/api/auth/activate', {
    params: { email, code }
  })

  if (data.value && data.value.success) {
    success.value = true
    setTimeout(goLogin, 3000)
  } else {
    errorMsg.value = data.value?.error || t('accountActivation.failedFallback')
  }
  loading.value = false
})
definePageMeta({ layout: false })
</script>
