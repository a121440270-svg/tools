<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-3xl font-bold mb-6 text-primary">欢迎来到 OnlinTool 后台管理系统</h1>
    <div class="flex flex-col items-center gap-8">
      <div class="text-5xl font-mono text-gray-700 dark:text-gray-200">
        {{ time }}
      </div>
      <el-calendar v-model="calendarDate" class="w-[420px] bg-white rounded shadow" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const time = ref('')
const calendarDate = ref(new Date())

let timer = null
const updateTime = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString()
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
definePageMeta({ layout: 'admin' })
</script>
