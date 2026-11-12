<template>
  <main class="tool-page">
    <header class="tool-header">
      <span class="tool-badge mb-4">{{ isHeicOnly ? 'HEIC' : t('home.categories.image') }}</span>
      <h1>{{ t(isHeicOnly ? 'imageTools.heic.title' : 'imageTools.converter.title') }}</h1>
      <p>{{ t(isHeicOnly ? 'imageTools.heic.description' : 'imageTools.converter.description') }}</p>
    </header>

    <section v-if="!images.length" class="drop-zone mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-16 text-center" :class="{ dragging, dragover: dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragenter.prevent="dragging = true">
      <input ref="fileInput" class="visually-hidden" type="file" :accept="accept" multiple @click.stop @change="onFileChange" />
      <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-primary">
          <path d="M12 3v12m0-12l-4 4m4-4l4 4"/>
          <path d="M3 15v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
        </svg>
      </div>
      <strong class="text-lg font-semibold text-slate-900 dark:text-white">{{ t('imageTools.uploadPrompt') }}</strong>
      <span class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ t(isHeicOnly ? 'imageTools.heic.acceptedFormats' : 'imageTools.converter.inputAccepted') }}</span>
      <small class="mt-1 text-xs text-slate-500 dark:text-slate-500">{{ t('imageTools.localProcessing') }}</small>
    </section>

    <section v-else class="tool-card mt-6">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
        <strong class="text-base font-semibold text-slate-900 dark:text-white">{{ images.length }} {{ t('imageTools.images') }}</strong>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" type="button" :disabled="processing" @click="fileInput?.click()">{{ t('imageTools.addImages') }}</button>
          <button class="btn-secondary" type="button" :disabled="processing" @click="clearAll">{{ t('imageTools.clearAll') }}</button>
          <input ref="fileInput" class="visually-hidden" type="file" :accept="accept" multiple @change="onFileChange" />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <label for="output-format" class="font-medium text-slate-700 dark:text-slate-300">{{ t('imageTools.converter.convertTo') }}</label>
        <select id="output-format" v-model="outputFormat" :disabled="processing" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option v-for="format in formats" :key="format.value" :value="format.value">{{ format.label }}</option>
        </select>
        <button class="btn-primary" type="button" :disabled="processing || !pendingCount" @click="convertAll">
          {{ processing ? t('imageTools.converter.converting', { current: processedCount, total: images.length }) : t('imageTools.converter.convertButton') }}
        </button>
        <button v-if="completedCount > 1" class="btn-secondary" type="button" :disabled="processing" @click="downloadZip">{{ t('imageTools.downloadAll') }}</button>
      </div>

      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ errorMessage }}</p>
      <div class="mt-4 space-y-3">
        <article v-for="image in images" :key="image.id" class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60">
          <img class="h-16 w-16 rounded-lg object-contain" :src="image.resultUrl || image.url" :alt="image.name" />
          <div class="min-w-0 flex-1">
            <strong class="block truncate text-sm font-semibold text-slate-900 dark:text-white" :title="image.name">{{ image.name }}</strong>
            <span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">{{ formatBytes(image.file.size) }}<template v-if="image.resultBlob"> → {{ formatBytes(image.resultBlob.size) }}</template></span>
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
      <NuxtLinkLocale to="/image-resizer" class="text-primary transition hover:underline">{{ t('imageTools.resizer.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale v-if="!isHeicOnly" to="/heic-to-jpg" class="text-primary transition hover:underline">{{ t('imageTools.heic.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale v-else to="/image-converter" class="text-primary transition hover:underline">{{ t('imageTools.converter.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-compress" class="text-primary transition hover:underline">{{ t('imageTools.related.compress') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/merge-images" class="text-primary transition hover:underline">{{ t('mergeTool.navTitle') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import JSZip from 'jszip'

const props = defineProps({ heicOnly: { type: Boolean, default: false } })
const { t } = useI18n()
const isHeicOnly = computed(() => props.heicOnly)
const accept = computed(() => isHeicOnly.value ? '.heic,.heif,image/heic,image/heif' : 'image/*,.heic,.heif,.avif')
const formats = computed(() => isHeicOnly.value
  ? [{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/png', label: 'PNG' }, { value: 'image/webp', label: 'WebP' }]
  : [{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/png', label: 'PNG' }, { value: 'image/webp', label: 'WebP' }, { value: 'image/avif', label: 'AVIF' }])
const outputFormat = ref(props.heicOnly ? 'image/jpeg' : 'image/webp')
const images = ref([])
const fileInput = ref(null)
const dragging = ref(false)
const processing = ref(false)
const processedCount = ref(0)
const errorMessage = ref('')
let nextId = 0
const completedCount = computed(() => images.value.filter(image => image.resultBlob).length)
const pendingCount = computed(() => images.value.some(image => !image.resultBlob))

watch(outputFormat, () => {
  for (const image of images.value) {
    if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
    image.resultBlob = null
    image.resultUrl = ''
    image.outputName = ''
    image.error = ''
  }
})

useHead(() => {
  const prefix = isHeicOnly.value ? 'heic' : 'converter'
  return {
    title: t(`imageTools.${prefix}.seoTitle`),
    meta: [
      { name: 'description', content: t(`imageTools.${prefix}.seoDescription`) },
      { name: 'keywords', content: t(`imageTools.${prefix}.seoKeywords`) }
    ]
  }
})

function isAccepted(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const heic = ['heic', 'heif'].includes(extension) || /image\/(heic|heif)/i.test(file.type)
  return isHeicOnly.value ? heic : file.type.startsWith('image/') || heic || ['avif', 'svg', 'bmp', 'tif', 'tiff'].includes(extension)
}

function addFiles(fileList) {
  const acceptedFiles = Array.from(fileList || []).filter(isAccepted)
  for (const file of acceptedFiles) {
    images.value.push({ id: nextId++, file, name: file.name, url: URL.createObjectURL(file), resultBlob: null, resultUrl: '', outputName: '', error: '' })
  }
  errorMessage.value = acceptedFiles.length || !fileList?.length ? '' : t('imageTools.converter.noFiles')
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

function loadImage(blob, name) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(t('imageTools.converter.decodeError', { name })))
    }
    image.src = url
  })
}

async function decodeSource(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (['tif', 'tiff'].includes(extension)) {
    const module = await import('utif')
    const UTIF = module.default || module
    const buffer = await file.arrayBuffer()
    const pages = UTIF.decode(buffer)
    const imageData = pages[0]
    if (!imageData) throw new Error(t('imageTools.converter.decodeError', { name: file.name }))
    UTIF.decodeImage(buffer, imageData)
    const width = imageData.width
    const height = imageData.height
    if (!width || !height || width * height > 100_000_000) throw new Error(t('imageTools.converter.imageTooLarge'))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error(t('imageTools.converter.convertError'))
    const pixels = context.createImageData(width, height)
    pixels.data.set(UTIF.toRGBA8(imageData))
    context.putImageData(pixels, 0, 0)
    const png = await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error(t('imageTools.converter.convertError'))), 'image/png'))
    return loadImage(png, file.name)
  }
  if (['heic', 'heif'].includes(extension) || /image\/(heic|heif)/i.test(file.type)) {
    const module = await import('heic2any')
    const decoder = module.default || module
    const decoded = await decoder({ blob: file, toType: 'image/png' })
    return loadImage(Array.isArray(decoded) ? decoded[0] : decoded, file.name)
  }
  return loadImage(file, file.name)
}

function encodeCanvas(canvas, mime) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob || blob.type !== mime) {
        reject(new Error(t('imageTools.converter.outputUnsupported', { format: mime.split('/')[1].toUpperCase() })))
        return
      }
      resolve(blob)
    }, mime, 0.92)
  })
}

async function convertImage(image) {
  const source = await decodeSource(image.file)
  const canvas = document.createElement('canvas')
  canvas.width = source.naturalWidth || source.width
  canvas.height = source.naturalHeight || source.height
  if (!canvas.width || !canvas.height || canvas.width * canvas.height > 100_000_000) throw new Error(t('imageTools.converter.imageTooLarge'))
  const context = canvas.getContext('2d')
  if (!context) throw new Error(t('imageTools.converter.convertError'))
  if (outputFormat.value === 'image/jpeg') {
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  context.drawImage(source, 0, 0)
  const blob = await encodeCanvas(canvas, outputFormat.value)
  const extension = outputFormat.value.split('/')[1].replace('jpeg', 'jpg')
  return { blob, name: `${image.name.replace(/\.[^.]+$/, '')}.${extension}` }
}

async function convertAll() {
  processing.value = true
  errorMessage.value = ''
  processedCount.value = 0
  try {
    for (const image of images.value) {
      if (!image.resultBlob) {
        image.error = ''
        try {
          const result = await convertImage(image)
          image.resultBlob = result.blob
          image.outputName = result.name
          image.resultUrl = URL.createObjectURL(result.blob)
        } catch (error) {
          image.error = error?.message || t('imageTools.converter.convertError')
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
  anchor.download = isHeicOnly.value ? 'heic-converted-images.zip' : 'converted-images.zip'
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