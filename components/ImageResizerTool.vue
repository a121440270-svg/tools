<template>
  <main class="tool-page">
    <header class="tool-header">
      <span class="tool-badge mb-4">{{ t('home.categories.image') }}</span>
      <h1>{{ t('imageTools.resizer.title') }}</h1>
      <p>{{ t('imageTools.resizer.description') }}</p>
    </header>

    <section v-if="!images.length" class="drop-zone mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-16 text-center" :class="{ dragging, dragover: dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragenter.prevent="dragging = true">
      <input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.svg,.bmp,.tif,.tiff" multiple @click.stop @change="onFileChange" />
      <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-primary">
          <path d="M12 3v12m0-12l-4 4m4-4l4 4"/>
          <path d="M3 15v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
        </svg>
      </div>
      <strong class="text-lg font-semibold text-slate-900 dark:text-white">{{ t('imageTools.uploadPrompt') }}</strong>
      <small class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ t('imageTools.localProcessing') }}</small>
    </section>

    <section v-else class="tool-card mt-6">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
        <strong class="text-base font-semibold text-slate-900 dark:text-white">{{ images.length }} {{ t('imageTools.images') }}</strong>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" type="button" :disabled="processing" @click="fileInput?.click()">{{ t('imageTools.addImages') }}</button>
          <button class="btn-secondary" type="button" :disabled="processing" @click="clearAll">{{ t('imageTools.clearAll') }}</button>
          <input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.svg" multiple @change="onFileChange" />
        </div>
      </div>

      <div class="controls">
        <div class="mode-tabs" role="group" :aria-label="t('imageTools.resizer.mode')">
          <button v-for="item in modes" :key="item.value" type="button" :disabled="processing" :class="{ active: mode === item.value }" @click="mode = item.value">{{ t(item.label) }}</button>
        </div>
        <div v-if="mode === 'dimensions'" class="dimension-fields">
          <label>{{ t('imageTools.width') }}<input v-model.number="width" type="number" min="1" max="32000" :disabled="processing" /></label>
          <span>×</span>
          <label>{{ t('imageTools.height') }}<input v-model.number="height" type="number" min="1" max="32000" :disabled="processing" /></label>
          <label class="check-label"><input v-model="keepRatio" type="checkbox" :disabled="processing" />{{ t('imageTools.resizer.keepRatio') }}</label>
        </div>
        <label v-else-if="mode === 'percentage'" class="single-field">{{ t('imageTools.resizer.scale') }}<span><input v-model.number="percentage" type="number" min="1" max="500" :disabled="processing" />%</span></label>
        <label v-else class="single-field">{{ t('imageTools.resizer.maxDimension') }}<span><input v-model.number="maxDimension" type="number" min="1" max="32000" :disabled="processing" />px</span></label>
        <label class="format-field">{{ t('imageTools.resizer.outputFormat') }}
          <select v-model="outputFormat" :disabled="processing"><option value="image/webp">WebP</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select>
        </label>
        <button class="button primary" type="button" :disabled="processing || !pendingCount" @click="resizeAll">{{ processing ? t('imageTools.converter.converting', { current: processedCount, total: images.length }) : t('imageTools.resizer.resizeButton') }}</button>
        <button v-if="completedCount > 1" class="button secondary" type="button" :disabled="processing" @click="downloadZip">{{ t('imageTools.downloadAll') }}</button>
      </div>

      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ errorMessage }}</p>
      <div class="mt-4 space-y-3">
        <article v-for="image in images" :key="image.id" class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60">
          <img class="h-16 w-16 rounded-lg object-contain" :src="image.resultUrl || image.url" :alt="image.name" />
          <div class="min-w-0 flex-1">
            <strong class="block truncate text-sm font-semibold text-slate-900 dark:text-white" :title="image.name">{{ image.name }}</strong>
            <span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">{{ image.width }} × {{ image.height }} · {{ formatBytes(image.file.size) }}<template v-if="image.resultBlob"> → {{ image.resultWidth }} × {{ image.resultHeight }} · {{ formatBytes(image.resultBlob.size) }}</template></span>
            <span v-if="image.error" class="mt-1 block text-xs text-red-600 dark:text-red-400">{{ image.error }}</span>
          </div>
          <span class="text-sm font-medium" :class="image.error ? 'text-red-600 dark:text-red-400' : image.resultBlob ? 'text-primary' : 'text-slate-500 dark:text-slate-400'">{{ image.error ? t('imageTools.converter.failed') : image.resultBlob ? t('imageTools.done') : t('imageTools.ready') }}</span>
          <a v-if="image.resultUrl" class="btn-primary" :href="image.resultUrl" :download="image.outputName">{{ t('imageTools.download') }}</a>
          <button class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:text-red-400" type="button" :aria-label="t('imageTools.clearAll')" :disabled="processing" @click="removeImage(image.id)">×</button>
        </article>
      </div>
    </section>

    <footer class="mt-6 text-sm text-slate-500 dark:text-slate-400">{{ t('imageTools.localProcessing') }}</footer>
    <nav class="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-6 text-sm dark:border-slate-700" :aria-label="t('imageTools.relatedTitle')">
      <NuxtLinkLocale to="/image-converter" class="text-primary transition hover:underline">{{ t('imageTools.converter.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/heic-to-jpg" class="text-primary transition hover:underline">{{ t('imageTools.heic.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-aspect-ratio" class="text-primary transition hover:underline">{{ t('imageTools.related.aspectRatio') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/merge-images" class="text-primary transition hover:underline">{{ t('mergeTool.navTitle') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import JSZip from 'jszip'

const { t } = useI18n()
const modes = [
  { value: 'dimensions', label: 'imageTools.resizer.dimensionsMode' },
  { value: 'percentage', label: 'imageTools.resizer.percentageMode' },
  { value: 'maximum', label: 'imageTools.resizer.maxMode' }
]
const images = ref([])
const fileInput = ref(null)
const dragging = ref(false)
const mode = ref('dimensions')
const width = ref(1200)
const height = ref(1200)
const keepRatio = ref(true)
const percentage = ref(50)
const maxDimension = ref(1920)
const outputFormat = ref('image/webp')
const processing = ref(false)
const processedCount = ref(0)
const errorMessage = ref('')
let nextId = 0
const completedCount = computed(() => images.value.filter(image => image.resultBlob).length)
const pendingCount = computed(() => images.value.some(image => !image.resultBlob))

useHead(() => ({
  title: t('imageTools.resizer.seoTitle'),
  meta: [
    { name: 'description', content: t('imageTools.resizer.seoDescription') },
    { name: 'keywords', content: t('imageTools.resizer.seoKeywords') }
  ]
}))

watch([width, height, keepRatio, percentage, maxDimension, mode, outputFormat], () => {
  images.value.forEach(image => {
    if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
    image.resultUrl = ''
    image.resultBlob = null
    image.error = ''
  })
})

function addFiles(fileList) {
  const files = Array.from(fileList || [])
  const accepted = files.filter(file => file.type.startsWith('image/') || /\.(svg|bmp|tif|tiff)$/i.test(file.name))
  for (const file of accepted) {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      if (image.width * image.height > 100_000_000) {
        URL.revokeObjectURL(url)
        errorMessage.value = t('imageTools.resizer.imageTooLarge', { name: file.name })
        return
      }
      images.value.push({ id: nextId++, file, name: file.name, url, image, width: image.naturalWidth, height: image.naturalHeight, resultBlob: null, resultUrl: '', outputName: '', error: '' })
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      errorMessage.value = t('imageTools.converter.decodeError', { name: file.name })
    }
    image.src = url
  }
  if (!accepted.length && files.length) errorMessage.value = t('imageTools.converter.noFiles')
  else errorMessage.value = ''
}

function onFileChange(event) {
  addFiles(event.target.files)
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  addFiles(event.dataTransfer?.files)
}

function onPaste(event) {
  const pasted = Array.from(event.clipboardData?.items || []).map(item => item.getAsFile()).filter(Boolean)
  if (pasted.length) addFiles(pasted)
}

function revokeImage(image) {
  URL.revokeObjectURL(image.url)
  if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
}

function removeImage(id) {
  const index = images.value.findIndex(image => image.id === id)
  if (index >= 0) {
    revokeImage(images.value[index])
    images.value.splice(index, 1)
  }
}

function clearAll() {
  images.value.forEach(revokeImage)
  images.value = []
  errorMessage.value = ''
}

function outputDimensions(image) {
  let outputWidth = Number(width.value)
  let outputHeight = Number(height.value)
  if (mode.value === 'percentage') {
    const scale = Number(percentage.value) / 100
    outputWidth = Math.round(image.width * scale)
    outputHeight = Math.round(image.height * scale)
  } else if (mode.value === 'maximum') {
    const scale = Math.min(1, Number(maxDimension.value) / Math.max(image.width, image.height))
    outputWidth = Math.round(image.width * scale)
    outputHeight = Math.round(image.height * scale)
  } else if (keepRatio.value) {
    const scale = Math.min(outputWidth / image.width, outputHeight / image.height)
    outputWidth = Math.max(1, Math.round(image.width * scale))
    outputHeight = Math.max(1, Math.round(image.height * scale))
  }
  if (![outputWidth, outputHeight].every(value => Number.isInteger(value) && value > 0 && value <= 32000) || outputWidth * outputHeight > 100_000_000) {
    throw new Error(t('imageTools.resizer.invalidDimensions'))
  }
  return { width: outputWidth, height: outputHeight }
}

function encode(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob || blob.type !== outputFormat.value) {
        reject(new Error(t('imageTools.converter.outputUnsupported', { format: outputFormat.value.split('/')[1].toUpperCase() })))
        return
      }
      resolve(blob)
    }, outputFormat.value, 0.92)
  })
}

async function resizeImage(image) {
  const size = outputDimensions(image)
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error(t('imageTools.resizer.resizeError'))
  if (outputFormat.value === 'image/jpeg') {
    context.fillStyle = '#fff'
    context.fillRect(0, 0, size.width, size.height)
  }
  context.drawImage(image.image, 0, 0, size.width, size.height)
  const blob = await encode(canvas)
  const extension = outputFormat.value.split('/')[1].replace('jpeg', 'jpg')
  return { blob, name: `${image.name.replace(/\.[^.]+$/, '')}-${size.width}x${size.height}.${extension}`, ...size }
}

async function resizeAll() {
  processing.value = true
  errorMessage.value = ''
  processedCount.value = 0
  try {
    for (const image of images.value) {
      if (!image.resultBlob) {
        image.error = ''
        try {
          const result = await resizeImage(image)
          image.resultBlob = result.blob
          image.resultWidth = result.width
          image.resultHeight = result.height
          image.outputName = result.name
          image.resultUrl = URL.createObjectURL(result.blob)
        } catch (error) {
          image.error = error?.message || t('imageTools.resizer.resizeError')
        }
      }
      processedCount.value++
    }
  } finally {
    processing.value = false
  }
}

async function downloadZip() {
  const zip = new JSZip()
  const usedNames = new Set()
  for (const image of images.value.filter(item => item.resultBlob)) {
    let name = image.outputName
    let suffix = 1
    while (usedNames.has(name)) {
      const dot = image.outputName.lastIndexOf('.')
      name = `${image.outputName.slice(0, dot)}-${suffix++}${image.outputName.slice(dot)}`
    }
    usedNames.add(name)
    zip.file(name, image.resultBlob)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'resized-images.zip'
  anchor.click()
  URL.revokeObjectURL(url)
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(() => window.addEventListener('paste', onPaste))
onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
  images.value.forEach(revokeImage)
})
</script>

<style scoped>
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
</style>

<style>
.dark .resizer-tool { --ink: #e4ece8; --muted: #b3c1bb; --line: #3a4943; --wash: #202d28; }
.dark .resizer-tool .drop-zone { background: repeating-linear-gradient(135deg, #202d28 0, #202d28 14px, #26352f 14px, #26352f 28px); }
.dark .resizer-tool .mode-tabs button, .dark .resizer-tool .dimension-fields input, .dark .resizer-tool .single-field input, .dark .resizer-tool .format-field select, .dark .resizer-tool .secondary { color: var(--ink); background: #1c2924; }
.dark .resizer-tool .mode-tabs button.active { color: white; background: var(--accent); }
.dark .resizer-tool .related a { color: #7bd8b6; }
</style>