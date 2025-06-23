<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 text-center">
      <h1 class="text-2xl font-bold mb-4">账号激活</h1>
      <div v-if="loading">
        正在激活，请稍候...
      </div>
      <div v-else-if="success">
        <div class="text-green-600 text-lg mb-2">激活成功！</div>
        <div>3秒后自动跳转到登录页面</div>
        <el-button type="primary" class="mt-4" @click="goLogin">立即登录</el-button>
      </div>
      <div v-else>
        <div class="text-red-600 text-lg mb-2">激活失败：{{ errorMsg }}</div>
        <el-button type="primary" class="mt-4" @click="goLogin">去登录</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const success = ref(false)
const errorMsg = ref('')

function goLogin() {
  router.push('/auth/login')
}

onMounted(async () => {
  await nextTick()
  const { email, code } = route.query
  if (!email || !code) {
    errorMsg.value = '参数缺失'
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
    errorMsg.value = data.value?.error || '激活失败'
  }
  loading.value = false
})
definePageMeta({ layout: false })
</script>
