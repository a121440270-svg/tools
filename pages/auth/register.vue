<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
      <div class="text-center">
        <h1 class="text-3xl font-bold dark:text-white">{{ $t('auth.register') }}</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">{{ $t('auth.create_account') }}</p>
      </div>
      
      <form class="space-y-6" @submit.prevent="handleRegister">
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">{{ $t('auth.email') }}</label>
          <input 
            v-model="form.email"
            type="email"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">{{ $t('auth.username') }}</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            required
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">{{ $t('auth.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium mb-2 dark:text-gray-300">{{ $t('auth.confirm_password') }}</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            required
          >
        </div>

        <button
          type="submit"
          class="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {{ $t('auth.register_btn') }}
        </button>
        
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          {{ $t('auth.have_account') }}
          <NuxtLink 
            to="/auth/login" 
            class="text-primary underline hover:text-primary/80"
          >
            {{ $t('auth.login_here') }}
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const form = reactive({
  email: '',
  name: '',
  password: '',
  confirmPassword: ''
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userState = useUser()

const handleRegister = async () => {
  try {
    if (form.password !== form.confirmPassword) {
      alert(t('auth.password_mismatch'))
      return
    }
    const redirectPath = route.query.redirect || '/profile'
    const { data } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: form.email,
        name: form.name,
        psw: form.password // 修正为后端要求的 psw 字段
      }
    })
    if (data.value && data.value.success) {
      ElMessage.success('注册成功，请登录')
      await router.push('/auth/login')
    } else {
      ElMessage.error(data.value?.error || t('auth.register_failed'))
    }
  } catch (e) {
    console.error('Registration failed:', e)
    ElMessage.error(t('auth.register_failed'))
  }
}
</script>