<template>
  <div class="max-w-3xl py-10 flex flex-col md:flex-row gap-8">
    <div class="w-full md:w-1/3">
      <div class="sticky top-20">
        <ul class="flex flex-col gap-2 overflow-y-auto">
          <li v-for="tab in tabs" :key="tab.key">
            <button
              class="w-full px-4 py-2 rounded text-left transition-colors text-gray-700 dark:text-gray-100 hover:bg-primary/10"
              :class="{ 'bg-primary/10 font-bold': activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div class="flex-1 min-h-[300px]">
      <div v-if="activeTab === 'me'">
        <h2 class="text-xl font-bold mb-2">关于我</h2>
        <p class="mb-2">你好，我是本网站的开发者，热爱前端与工具开发，欢迎交流与反馈！</p>
        <p>联系邮箱：<a href="mailto:your@email.com" class="underline text-primary">your@email.com</a></p>
      </div>
      <div v-else-if="activeTab === 'blog'">
        <h2 class="text-xl font-bold mb-2">关于博客</h2>
        <p>本博客分享前端开发、工具制作、技术心得等内容，欢迎关注和留言。</p>
      </div>
      <div v-else-if="activeTab === 'tools'">
        <h2 class="text-xl font-bold mb-2">关于工具</h2>
        <p>本站所有工具均为免费在线使用，支持批量处理、格式转换、多语言等功能，持续更新中。</p>
      </div>
      <div v-else-if="activeTab === 'langs'">
        <h2 class="text-xl font-bold mb-2">支持的多语言</h2>
        <ul class="list-disc pl-6">
          <li>中文（简体）</li>
          <li>English</li>
          <li>其他语言持续添加中...</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const tabs = [
  { key: 'me', label: '关于我' },
  { key: 'blog', label: '关于博客' },
  { key: 'tools', label: '关于工具' },
  { key: 'langs', label: '支持的多语言' }
]
const activeTab = ref('me')
</script>

<style scoped>
/* 滚动条美化 */
ul::-webkit-scrollbar {
  height: 6px;
}
ul::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}
</style>
