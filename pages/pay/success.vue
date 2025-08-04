<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-pink-50 px-4">
    <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md text-center">
      <div v-if="avatar" class="flex justify-center mb-4">
        <img :src="avatar" alt="Avatar" class="w-20 h-20 rounded-full shadow-lg object-cover border-2 border-yellow-400" />
      </div>
      <h1 class="text-3xl font-bold text-amber-600">☕ Thank you!</h1>
      <p class="mt-4 text-lg text-gray-800">
        <span v-if="name">Dear <strong>{{ name }}</strong>,</span>
        <span v-else>Dear friend,</span><br />
        Thanks for buying me a coffee <span v-if="amount">(${{ amount }})</span>!
      </p>
      <p v-if="timestamp" class="mt-2 text-sm text-gray-500">
        Paid on {{ formatDate(timestamp) }}
      </p>
      <div class="mt-6 text-sm text-gray-500">
        You’ll be redirected in <span class="font-semibold">{{ countdown }}</span> seconds...
      </div>
      <NuxtLink to="/" class="mt-4 inline-block text-blue-500 hover:underline">← Back to Home</NuxtLink>
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
