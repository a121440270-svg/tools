<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
      <div class="flex items-center mb-6">
        <img :src="user.avatar" class="w-16 h-16 rounded-full mr-4">
        <div>
          <h1 class="text-2xl font-bold dark:text-white">{{ user.name }}</h1>
          <p class="text-gray-600 dark:text-gray-400">{{ user.email }}</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 class="font-medium mb-2 dark:text-white">账户信息</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">注册时间：2024-03-01</p>
        </div>
      </div>
    </div>
    
    <div class="mt-8 space-y-6">
      <h2 class="text-xl font-bold dark:text-white">活动时间线</h2>
      <div class="border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-4">
        <div 
          v-for="(activity, index) in sortedActivities" 
          :key="index"
          class="relative pb-4"
        >
          <div class="absolute -left-[7px] top-0 w-3 h-3 bg-primary rounded-full border-2 border-white dark:border-gray-800"></div>
          <div class="ml-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDateTime(activity.timestamp) }}
            </p>
            <p class="mt-1 text-gray-700 dark:text-gray-300">
              {{ activity.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    </div>
</template>

<script setup>
import { useUser } from '~/composables/useAuth'
const user = useUser()

// 添加重定向逻辑
if (!user.value?.id) {
  await navigateTo('/auth/login')
}

// 添加模拟活动数据
const activities = ref([
  {
    timestamp: new Date('2024-03-25T14:30:00'),
    description: '修改了个人资料信息'
  },
  {
    timestamp: new Date('2024-03-24T09:15:00'),
    description: '发布了新文章《Nuxt3最佳实践》'
  },
  {
    timestamp: new Date('2024-03-23T16:45:00'), 
    description: '登录系统'
  }
])

// 时间格式化方法
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 倒序排序
const sortedActivities = computed(() => {
  return [...activities.value].sort((a, b) => b.timestamp - a.timestamp)
})

</script>