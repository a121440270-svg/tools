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
                {{ $t(tab.label) }}
              </button>
            </li>
        </ul>
      </div>
    </div>
    <div class="flex-1 min-h-[300px]">
      <div v-if="activeTab === 'me'">
          <h2 class="text-xl font-bold mb-2">{{ $t('about.meTitle') }}</h2>
          <p class="mb-2">{{ $t('about.meText1') }}</p>
          <p>{{ $t('about.contactEmail') }}<a href="mailto:huiqinliu1005@gmail.com" class="underline text-primary">huiqinliu1005@gmail.com</a></p>
      </div>
      <div v-else-if="activeTab === 'blog'">
          <h2 class="text-xl font-bold mb-2">{{ $t('about.blogTitle') }}</h2>
          <p>{{ $t('about.blogText') }}</p>
      </div>
      <div v-else-if="activeTab === 'tools'">
          <h2 class="text-xl font-bold mb-2">{{ $t('about.toolsTitle') }}</h2>
          <p>{{ $t('about.toolsText') }}</p>
      </div>
      <div v-else-if="activeTab === 'langs'">
          <h2 class="text-xl font-bold mb-2">{{ $t('about.langsTitle') }}</h2>
          <ul class="list-disc pl-6">
            <li>{{ $t('about.langsList1') }}</li>
            <li>{{ $t('about.langsList2') }}</li>
            <li>{{ $t('about.langsList3') }}</li>
          </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const tabs = [
  { key: 'me', label: 'about.tabMe' },
  { key: 'blog', label: 'about.tabBlog' },
  { key: 'tools', label: 'about.tabTools' },
  { key: 'langs', label: 'about.tabLangs' }
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
