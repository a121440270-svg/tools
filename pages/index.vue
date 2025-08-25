<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

    <h2 class="text-2xl font-medium mb-6 text-gray-900 dark:text-white">All the tools</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       <!-- Font Compress Tool -->
      <NuxtLink to="/font-compress" class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h6a4 4 0 004-4v-4z" />
            </svg>
          </div>
        </div>
        <h3 class="text-lg font-medium mb-1 dark:text-white">{{$t('menu.ttf')}}</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">{{$t('ttf.desc')}}</p>
      </NuxtLink>
      <!-- 图片转 WebP -->
      <NuxtLink to="/image-to-webp" class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="text-primary">
            <!-- 图片图标 -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" stroke="currentColor" fill="none"/>
              <circle cx="8.5" cy="8.5" r="2.5" stroke-width="2" stroke="currentColor" fill="none"/>
              <path d="M21 15l-5-5-4 4-7-7" stroke-width="2" stroke="currentColor" fill="none"/>
            </svg>
          </div>
        </div>
        <h3 class="text-lg font-medium mb-1 dark:text-white">{{ t('webp.title') }}</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ t('webp.desc') }}
        </p>
      </NuxtLink>
      <!-- Token Generator -->
      <NuxtLink to="/token-generator" class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <button class="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <h3 class="text-lg font-medium mb-1 dark:text-white">Token generator</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Generate random string with the chars you want, uppercase or lowercase letters, numbers and/or symbols.
        </p>
      </NuxtLink>

      <!-- Hash Text -->
      <NuxtLink to="/hash-text" class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
              <line x1="10" y1="3" x2="8" y2="21" />
              <line x1="16" y1="3" x2="14" y2="21" />
            </svg>
          </div>
          <button class="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <h3 class="text-lg font-medium mb-1 dark:text-white">Hash text</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          Hash a text string using the function you need: MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3 or RIPEMD160
        </p>
      </NuxtLink>

      <!-- JSON/CSV 转换工具 -->
      <NuxtLink to="/json-csv-convert" class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" stroke="currentColor" fill="none"/>
              <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">JSON</text>
            </svg>
          </div>
        </div>
        <h3 class="text-lg font-medium mb-1 dark:text-white">{{ t('jsoncsv.title') }}</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">{{ t('jsoncsv.input_placeholder') }}</p>
      </NuxtLink>

    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
useHead({
  title: t("home.title") + " | 图片转WebP、字体压缩等工具",
  meta: [
    { name: 'description', content: t('home.seo_desc') + '，支持图片转WebP、字体压缩、Token生成等实用工具，纯前端实现，安全高效。' },
    { name: 'keywords', content: t('home.seo_keywords') + ', webp, 图片压缩, 图片转webp, 字体压缩, 在线工具, 前端工具' }
  ]
})
</script>
