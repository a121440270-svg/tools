<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      <div class="text-center">
        <h1 class="text-3xl font-bold dark:text-white">用户登录</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">欢迎回来，请输入您的凭证</p>
      </div>
      
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">邮箱地址</label>
          <input 
            v-model="form.email"
            type="email"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            required
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            required
          >
        </div>

        <button
          type="submit"
          class="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          登录
        </button>
        
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          {{ $t('auth.no_account') }}
          <NuxtLink 
            to="/auth/register" 
            class="text-primary underline hover:text-primary/80"
          >
            {{ $t('auth.register_now') }}
          </NuxtLink>
        </div>
        或使用 GitHub 登录
        <button 
          type="button"
          class="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
          </svg>
          使用 GitHub 登录
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

definePageMeta({
  layout: false
})
const form = reactive({
  email: '',
  password: ''
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userState = useUser()

const handleLogin = async () => {
  try {
    const redirectPath = route.query.redirect || '/profile'
    const { data } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        psw: form.password // 修正为后端要求的 psw 字段
      }
    })
    if (data.value && !data.value.error) {
      userState.value = {
        ...data.value,
        id: data.value.id || Date.now()
      }
      ElMessage.success(t('auth.login_success') || '登录成功')
      await router.push(redirectPath) // 确保跳转
    } else {
      ElMessage.error(data.value?.error || t('auth.login_failed') || '账号或密码错误')
    }
  } catch (e) {
    console.error('Login failed:', e)
    ElMessage.error(t('auth.login_failed') || '登录失败')
  }
}
</script>