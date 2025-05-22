<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">发表文章</h1>
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="space-y-6">
        <div>
          <label class="block font-medium mb-2 dark:text-white">文章标题</label>
          <input
            v-model="form.title"
            type="text"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white"
            placeholder="请输入文章标题"
          >
        </div>

        <div>
          <label class="block font-medium mb-2 dark:text-white">文章内容</label>
          <textarea
            v-model="form.content"
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none h-64 bg-white dark:bg-gray-900 dark:text-white"
            placeholder="请输入文章内容..."
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button 
            @click="submitArticle"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            提交文章
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUser } from '~/composables/useAuth'
const user = useUser()

// 添加发布页面的访问控制
if (!user.value?.id) {
  alert('请先登录后再发布文章')
  await navigateTo('/auth/login')
}
const form = reactive({
  title: '',
  content: ''
})

const submitArticle = async () => {
  // 这里添加提交逻辑
  console.log('提交文章:', form)
}
</script>