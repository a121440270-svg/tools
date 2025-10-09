<template>
  <div class="max-w-2xl mx-auto py-10">
    <h1 class="text-2xl font-bold mb-4">{{ pageTitle }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-300">{{ t('imageConvert.description') }}</p>
    <div class="mb-6">
  <input type="file" multiple accept="image/*" @change="onFileChange" class="mb-2" />
      <span v-if="files.length" class="ml-2 text-green-600 dark:text-green-400">{{ t('imageConvert.selectedCount', { count: files.length }) }}</span>
    </div>
    <div class="mb-4">
      <label class="block mb-2 text-gray-700 dark:text-gray-200">{{ t('imageConvert.targetFormat') }}</label>
      <select v-model="targetFormat" class="border rounded px-2 py-1 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <option v-for="fmt in formats" :key="fmt" :value="fmt">{{ fmt.toUpperCase() }}</option>
      </select>
    </div>
    <div class="flex gap-2 mb-6">
      <button :disabled="!files.length || processing" @click="startConvert" class="bg-primary text-white px-4 py-2 rounded disabled:opacity-50">{{ t('imageConvert.start') }}</button>
      <button @click="clearFiles" class="px-4 py-2 rounded border">{{ t('imageConvert.clear') }}</button>
    </div>
    <div v-if="processing" class="mb-4">
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded h-3 overflow-hidden">
        <div class="bg-primary h-3 rounded transition-all duration-300" :style="{ width: ((progress/files.length)*100 || 0) + '%' }"></div>
      </div>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 flex items-center">
        <svg class="w-4 h-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg>
        {{ t('imageConvert.progress', { current: progress, total: files.length }) }}
      </p>
    </div>
    <div v-if="downloadUrl" class="mt-6">
      <div class="p-3 border rounded bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 flex items-center">
        <svg class="w-5 h-5 mr-2 text-green-500 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span class="mr-2">{{ t('imageConvert.success') }}</span>
        <a :href="downloadUrl" :download="downloadName" class="underline text-primary ml-auto">{{ t('imageConvert.download') }}</a>
      </div>
    </div>
    <div class="mt-8 p-4 border rounded text-sm dark:text-gray-100">
      <strong>WebP</strong> 支持多种图片格式批量转换，单图直接下载，多图打包下载。
    </div>
  </div>
</template>

<script setup>
import { useRoute, useHead } from '#imports'
import { ref, computed, watch } from 'vue'
import JSZip from 'jszip'
const { t } = useI18n()

const route = useRoute()
const formats = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'tiff']
const targetParam = route.params.target?.toLowerCase() || 'png'
const targetFormat = ref(formats.includes(targetParam) ? targetParam : 'png')
const acceptTypes = computed(() => {
  if (targetFormat.value === 'png') return 'image/webp,image/png,image/jpeg,image/jpg,image/bmp,image/gif,image/tiff'
  if (targetFormat.value === 'jpg' || targetFormat.value === 'jpeg') return 'image/webp,image/jpeg,image/jpg,image/png,image/bmp,image/gif,image/tiff'
  return 'image/webp,image/png,image/jpeg,image/jpg,image/bmp,image/gif,image/tiff'
})
const pageTitle = computed(() => {
  if (targetFormat.value === 'png') return 'WebP转PNG在线工具'
  if (targetFormat.value === 'jpg' || targetFormat.value === 'jpeg') return 'WebP转JPG在线工具'
  return `WebP转${targetFormat.value.toUpperCase()}在线工具`
})
useHead({
  title: pageTitle.value + ' | 图片格式转换 | 批量处理',
  meta: [
    { name: 'description', content: `在线WebP转${targetFormat.value.toUpperCase()}工具，支持批量图片转换，支持多语言，最佳SEO，安全高效。` },
    { name: 'keywords', content: `webp转${targetFormat.value},图片格式转换,批量图片转换,在线工具,SEO` }
  ]
})
const files = ref([])
const progress = ref(0)
const processing = ref(false)
const downloadUrl = ref('')
const downloadName = ref('')
function onFileChange(e) {
  files.value = Array.from(e.target.files)
  downloadUrl.value = ''
  downloadName.value = ''
  progress.value = 0
}
function clearFiles() {
  files.value = []
  downloadUrl.value = ''
  downloadName.value = ''
  progress.value = 0
}
async function startConvert() {
  processing.value = true
  progress.value = 0
  const zip = new JSZip()
  let results = []
  for (let i = 0; i < files.value.length; i++) {
    const file = files.value[i]
    const img = await fileToImage(file)
    const blob = await imageToFormat(img, targetFormat.value)
    const name = file.name.replace(/\.[^.]+$/, '.' + targetFormat.value)
    results.push({ name, blob })
    zip.file(name, blob)
    progress.value = i + 1
  }
  if (results.length === 1) {
    downloadUrl.value = URL.createObjectURL(results[0].blob)
    downloadName.value = results[0].name
  } else {
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadUrl.value = URL.createObjectURL(zipBlob)
    downloadName.value = 'images.zip'
  }
  processing.value = false
}
function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
function imageToFormat(img, format) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    let mime = 'image/png'
    if (format === 'jpg' || format === 'jpeg') mime = 'image/jpeg'
    else if (format === 'bmp') mime = 'image/bmp'
    else if (format === 'gif') mime = 'image/gif'
    else if (format === 'tiff') mime = 'image/tiff'
    canvas.toBlob(blob => resolve(blob), mime)
  })
}
</script>

<style scoped>
/* 按钮和进度条样式已用 Tailwind，保留空样式块可扩展 */
</style>
