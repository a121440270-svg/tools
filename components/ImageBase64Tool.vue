<template>
  <main class="tool-page">
    <header class="tool-header">
      <span class="tool-badge mb-4">{{ t('home.categories.image') }}</span>
      <h1>{{ t(reverse ? 'imageTools.base64.fromTitle' : 'imageTools.base64.toTitle') }}</h1>
      <p>{{ t(reverse ? 'imageTools.base64.fromDescription' : 'imageTools.base64.toDescription') }}</p>
    </header>

    <template v-if="!reverse">
      <section v-if="!file" class="drop-zone mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-16 text-center" :class="{ dragging, dragover: dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragenter.prevent="dragging = true">
        <input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.svg" @click.stop @change="onFileChange" />
        <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-primary">
            <path d="M12 3v12m0-12l-4 4m4-4l4 4"/>
            <path d="M3 15v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
          </svg>
        </div>
        <strong class="text-lg font-semibold text-slate-900 dark:text-white">{{ t('imageTools.uploadPrompt') }}</strong>
        <small class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ t('imageTools.localProcessing') }}</small>
      </section>
      <section v-else class="tool-card mt-6 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <strong class="truncate text-base font-semibold text-slate-900 dark:text-white" :title="file.name">{{ file.name }}</strong>
          <button class="btn-secondary" type="button" @click="clear">{{ t('imageTools.base64.changeImage') }}</button>
          <input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.svg" @change="onFileChange" />
        </div>
        <div class="flex justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <img class="max-h-[40vh] rounded-lg shadow-sm" :src="previewUrl" :alt="file.name" />
        </div>
        <div class="flex flex-wrap rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" role="group" :aria-label="t('imageTools.base64.outputType')">
          <button v-for="item in outputModes" :key="item.value" type="button" class="px-4 py-2 text-sm font-medium transition first:rounded-l-xl last:rounded-r-xl" :class="outputMode === item.value ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'" @click="outputMode = item.value">{{ t(item.label) }}</button>
        </div>
        <div>
          <div class="mb-2 flex items-center justify-between">
            <strong class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('imageTools.base64.output') }}</strong>
            <button class="btn-secondary" type="button" @click="copyOutput">{{ copied ? t('imageTools.base64.copied') : t('imageTools.base64.copy') }}</button>
          </div>
          <textarea :value="outputText" readonly spellcheck="false" :aria-label="t('imageTools.base64.output')" class="h-40 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"></textarea>
        </div>
      </section>
    </template>

    <section v-else class="tool-card mt-6 space-y-4">
      <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="base64-input">{{ t('imageTools.base64.pasteLabel') }}</label>
      <textarea id="base64-input" v-model="inputText" spellcheck="false" :placeholder="t('imageTools.base64.placeholder')" class="h-48 w-full rounded-2xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"></textarea>
      <div class="flex flex-wrap items-end gap-3">
        <label class="flex flex-col text-sm text-slate-600 dark:text-slate-400">{{ t('imageTools.resizer.outputFormat') }}
          <select v-model="format" class="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option>
          </select>
        </label>
        <button class="btn-primary" type="button" :disabled="processing || !inputText.trim()" @click="decodeBase64">{{ processing ? t('imageTools.converter.converting', { current: 1, total: 1 }) : t('imageTools.base64.previewButton') }}</button>
        <a v-if="resultUrl" class="btn-secondary" :href="resultUrl" :download="resultName">{{ t('imageTools.download') }}</a>
      </div>
      <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ errorMessage }}</p>
      <div v-if="resultUrl" class="flex justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
        <img class="max-h-[40vh] rounded-lg shadow-sm" :src="resultUrl" :alt="t('imageTools.base64.previewAlt')" />
      </div>
    </section>

    <footer class="mt-6 text-sm text-slate-500 dark:text-slate-400">{{ t('imageTools.localProcessing') }}</footer>
    <nav class="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-6 text-sm dark:border-slate-700" :aria-label="t('imageTools.relatedTitle')">
      <NuxtLinkLocale v-if="!reverse" to="/base64-to-image" class="text-primary transition hover:underline">{{ t('imageTools.base64.fromTitle') }}</NuxtLinkLocale>
      <NuxtLinkLocale v-else to="/image-to-base64" class="text-primary transition hover:underline">{{ t('imageTools.base64.toTitle') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-info" class="text-primary transition hover:underline">{{ t('imageTools.info.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-converter" class="text-primary transition hover:underline">{{ t('imageTools.converter.title') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { encodeCanvas } from '~/composables/useImageTools'

const props = defineProps({ reverse: { type: Boolean, default: false } })
const { t } = useI18n()
const outputModes = [
  { value: 'data', label: 'imageTools.base64.dataUrl' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' }
]
const file = ref(null)
const fileInput = ref(null)
const previewUrl = ref('')
const base64 = ref('')
const outputMode = ref('data')
const inputText = ref('')
const format = ref('image/png')
const resultUrl = ref('')
const resultName = ref('image.png')
const dragging = ref(false)
const processing = ref(false)
const copied = ref(false)
const errorMessage = ref('')
const outputText = computed(() => {
  if (!base64.value) return ''
  if (outputMode.value === 'html') return `<img src="${base64.value}" alt="image" />`
  if (outputMode.value === 'css') return `background-image: url("${base64.value}");`
  return base64.value
})

useHead(() => {
  const key = props.reverse ? 'from' : 'to'
  return {
    title: t(`imageTools.base64.${key}SeoTitle`),
    meta: [
      { name: 'description', content: t(`imageTools.base64.${key}SeoDescription`) },
      { name: 'keywords', content: t(`imageTools.base64.${key}SeoKeywords`) }
    ]
  }
})

function clearResult() {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''
  errorMessage.value = ''
}

watch([inputText, format], clearResult)

function clear() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  base64.value = ''
  file.value = null
}

function addFile(selected) {
  if (!selected) return
  clear()
  file.value = selected
  previewUrl.value = URL.createObjectURL(selected)
  const reader = new FileReader()
  reader.onload = () => { base64.value = String(reader.result || '') }
  reader.onerror = () => { errorMessage.value = t('imageTools.base64.readError') }
  reader.readAsDataURL(selected)
}

function onFileChange(event) {
  addFile(event.target.files?.[0])
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  addFile(event.dataTransfer?.files?.[0])
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(outputText.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1800)
  } catch {
    errorMessage.value = t('imageTools.base64.copyError')
  }
}

async function decodeBase64() {
  processing.value = true
  clearResult()
  try {
    const input = inputText.value.trim()
    const dataUrl = input.match(/^data:(image\/(?:png|jpeg|jpg|webp|svg\+xml));base64,([\s\S]+)$/i)
    const mime = dataUrl?.[1]?.toLowerCase().replace('jpg', 'jpeg') || 'image/png'
    const payload = (dataUrl?.[2] || input).replace(/\s/g, '')
    if (!payload || !/^[A-Za-z0-9+/]*={0,2}$/.test(payload) || payload.length % 4 === 1) throw new Error(t('imageTools.base64.invalidInput'))
    const binary = atob(payload)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
    const blob = new Blob([bytes], { type: mime })
    if (blob.size > 50 * 1024 * 1024) throw new Error(t('imageTools.base64.tooLarge'))
    const localUrl = URL.createObjectURL(blob)
    let outputBlob
    try {
      const image = await new Promise((resolve, reject) => {
        const element = new Image()
        element.onload = () => resolve(element)
        element.onerror = () => reject(new Error(t('imageTools.base64.decodeError')))
        element.src = localUrl
      })
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 100_000_000) throw new Error(t('imageTools.converter.imageTooLarge'))
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      if (!context) throw new Error(t('imageTools.base64.decodeError'))
      if (format.value === 'image/jpeg') {
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
      }
      context.drawImage(image, 0, 0)
      outputBlob = await encodeCanvas(canvas, format.value)
    } finally {
      URL.revokeObjectURL(localUrl)
    }
    clearResult()
    resultUrl.value = URL.createObjectURL(outputBlob)
    resultName.value = `image.${format.value.split('/')[1].replace('jpeg', 'jpg')}`
  } catch (error) {
    errorMessage.value = error?.message || t('imageTools.base64.decodeError')
  } finally {
    processing.value = false
  }
}

onBeforeUnmount(() => {
  clear()
  clearResult()
})
</script>

<style scoped>
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
</style>

<style>
.dark .base64-tool { --ink: #e4ece8; --muted: #b3c1bb; --line: #3a4943; --wash: #202d28; }
.dark .base64-tool .drop-zone { background: repeating-linear-gradient(135deg, #202d28 0, #202d28 14px, #26352f 14px, #26352f 28px); }
.dark .base64-tool .related a { color: #7bd8b6; }
</style>