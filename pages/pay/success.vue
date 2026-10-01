<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-pink-50 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center">
      <div v-if="avatar" class="flex justify-center mb-4">
        <img :src="avatar" :alt="$t('paymentSuccess.avatar')" class="w-20 h-20 rounded-full shadow-lg object-cover border-2 border-yellow-400" />
      </div>
      <h1 class="text-3xl font-bold text-amber-600">☕ {{ $t('paymentSuccess.title') }}</h1>
      <p class="mt-4 text-lg text-gray-800">
        <span v-if="name">{{ $t('paymentSuccess.dear', { name }) }}</span>
        <span v-else>{{ $t('paymentSuccess.dearFriend') }}</span><br />
        {{ $t('paymentSuccess.thanks') }} <span v-if="amount">(${{ amount }})</span>!
      </p>
      <p v-if="timestamp" class="mt-2 text-sm text-gray-500">
        {{ $t('paymentSuccess.paidOn', { date: formatDate(timestamp) }) }}
      </p>
      <div class="mt-6 text-sm text-gray-500">
        {{ $t('paymentSuccess.redirecting', { countdown }) }}
      </div>
      <NuxtLink to="/" class="mt-4 inline-block text-blue-500 hover:underline">← {{ $t('paymentSuccess.backHome') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

const name = (route.query.name as string) || ''
const amount = (route.query.amount as string) || ''
const avatar = (route.query.avatar as string) || ''
const timestamp = route.query.timestamp as string | undefined

// 自动跳转倒计时
const countdown = ref(5)
onMounted(() => {
  const interval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(interval)
      router.push('/')
    }
  }, 1000)
})

// 格式化日期
function formatDate(ts: string) {
  const date = new Date(ts)
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}
</script>
