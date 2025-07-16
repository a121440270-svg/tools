<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative">
    <!-- 多语言切换组件 -->
    <div class="absolute top-6 right-8 z-10">
      <select 
        v-model="$i18n.locale"
        @change="changeLanguage"
        class="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-700 dark:text-white"
      >
        <option v-for="locale in locales" :key="locale.code" :value="locale.code">
          {{ $t(`locale.${locale.code}`) }}
        </option>
      </select>
    </div>
    <div class="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      <div class="text-center">
        <h1 class="text-3xl font-bold dark:text-white"> {{ $t('login.title') }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{$t('login.welcome')}}</p>
      </div>
      
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">{{$t('login.email')}}</label>
          <input 
            v-model="form.email"
            type="email"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            required
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">{{$t('login.password')}}</label>
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
          {{$t('login.submit')}}
        </button>
        
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          {{ $t('auth.no_account') }}
          <NuxtLink 
            :to="localePath('/auth/register')" 
            class="text-primary underline hover:text-primary/80"
          >
            {{ $t('auth.register_now') }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userState = useUser()
import { useLocalePath } from '#i18n'
const { locales, setLocale } = useI18n()

const localePath = useLocalePath()


definePageMeta({
  layout: false
})
const form = reactive({
  email: '',
  password: ''
})
useHead({
  title: t('login.title') || 'User Login'
})

const changeLanguage = (e) => {
  setLocale(e.target.value)
}

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