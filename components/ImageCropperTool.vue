<template>
  <main class="tool-page">
    <header class="tool-header">
      <span class="tool-badge mb-4">{{ t('home.categories.image') }}</span>
      <h1>{{ t('imageTools.cropper.title') }}</h1>
      <p>{{ t('imageTools.cropper.description') }}</p>
    </header>

    <section v-if="!source" class="drop-zone mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-16 text-center" :class="{ dragging, dragover: dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragenter.prevent="dragging = true">
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

    <section v-else class="tool-card mt-6">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
        <strong class="truncate text-base font-semibold text-slate-900 dark:text-white" :title="source.file.name">{{ source.file.name }}</strong>
        <button type="button" class="btn-secondary" @click="clearImage">{{ t('imageTools.cropper.chooseAnother') }}</button>
        <input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.svg" @change="onFileChange" />
      </div>

      <div class="mt-4 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
        <fieldset class="flex flex-col gap-2">
          <legend class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('imageTools.cropper.aspectRatio') }}</legend>
          <div class="flex flex-wrap rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <button v-for="ratio in ratios" :key="ratio.label" type="button" class="px-3 py-1.5 text-sm font-medium transition first:rounded-l-xl last:rounded-r-xl" :class="activeRatio === ratio.value ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'" @click="selectRatio(ratio.value)">{{ t(ratio.label) }}</button>
          </div>
        </fieldset>
        <label class="flex flex-col text-sm text-slate-600 dark:text-slate-400">{{ t('imageTools.resizer.outputFormat') }}
          <select v-model="format" class="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option>
          </select>
        </label>
        <button class="btn-primary" type="button" :disabled="processing || !hasSelection" @click="cropImage">{{ processing ? t('imageTools.processing') : t('imageTools.cropper.cropButton') }}</button>
        <a v-if="resultUrl" class="btn-secondary" :href="resultUrl" :download="resultName">{{ t('imageTools.download') }}</a>
      </div>

      <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">{{ source.width }} × {{ source.height }} · {{ cropWidth }} × {{ cropHeight }}</p>
      <div ref="stage" class="relative mx-auto mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60" :style="stageStyle" @pointerdown="startSelection" @pointermove="updateSelection" @pointerup="finishSelection" @pointercancel="finishSelection">
        <img :src="source.url" :alt="source.file.name" draggable="false" class="h-full w-full select-none" />
        <div v-if="hasSelection" class="absolute z-10" :style="maskStyle">
          <div class="absolute -top-full left-0 w-full bg-black/50" style="height: 200vh"></div>
          <div class="absolute top-0 -left-full h-full bg-black/50" style="width: 200vw"></div>
          <div class="absolute right-0 top-0 h-full w-[200vw] translate-x-full bg-black/50"></div>
          <div class="absolute bottom-0 left-0 h-[200vh] w-full translate-y-full bg-black/50"></div>
          <div class="absolute inset-0 ring-2 ring-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
        </div>
      </div>
      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300" role="alert">{{ errorMessage }}</p>
      <div v-if="resultUrl" class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ t('imageTools.result') }}</span>
        <img :src="resultUrl" :alt="t('imageTools.outputPreview', { name: resultName })" class="mt-3 max-h-[60vh] rounded-lg shadow-sm" />
      </div>
    </section>

    <footer class="mt-6 text-sm text-slate-500 dark:text-slate-400">{{ t('imageTools.localProcessing') }}</footer>
    <nav class="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-6 text-sm dark:border-slate-700" :aria-label="t('imageTools.relatedTitle')">
      <NuxtLinkLocale to="/image-resizer" class="text-primary transition hover:underline">{{ t('imageTools.resizer.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-converter" class="text-primary transition hover:underline">{{ t('imageTools.converter.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-aspect-ratio" class="text-primary transition hover:underline">{{ t('imageTools.related.aspectRatio') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/merge-images" class="text-primary transition hover:underline">{{ t('mergeTool.navTitle') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { encodeCanvas, fileStem, loadLocalImage } from '~/composables/useImageTools'

const { t } = useI18n()
const ratios = [
  { value: null, label: 'imageTools.cropper.free' },
  { value: 1, label: 'imageTools.cropper.square' },
  { value: 4 / 3, label: 'imageTools.cropper.landscape43' },
  { value: 16 / 9, label: 'imageTools.cropper.wide169' },
  { value: 9 / 16, label: 'imageTools.cropper.portrait916' }
]
const source = ref(null)
const fileInput = ref(null)
const stage = ref(null)
const dragging = ref(false)
const activeRatio = ref(null)
const format = ref('image/png')
const selection = ref(null)
const pointerStart = ref(null)
const processing = ref(false)
const errorMessage = ref('')
const resultUrl = ref('')
const resultName = ref('')
const hasSelection = computed(() => selection.value?.width > 0.002 && selection.value?.height > 0.002)
const cropWidth = computed(() => hasSelection.value ? Math.round(selection.value.width * source.value.width) : 0)
const cropHeight = computed(() => hasSelection.value ? Math.round(selection.value.height * source.value.height) : 0)
const maskStyle = computed(() => ({
  left: `${selection.value.x * 100}%`,
  top: `${selection.value.y * 100}%`,
  width: `${selection.value.width * 100}%`,
  height: `${selection.value.height * 100}%`
}))
const stageStyle = computed(() => ({
  width: `min(100%, ${Math.min(2000, 560 * source.value.width / source.value.height)}px)`,
  aspectRatio: `${source.value.width} / ${source.value.height}`
}))

useHead(() => ({
  title: t('imageTools.cropper.seoTitle'),
  meta: [
    { name: 'description', content: t('imageTools.cropper.seoDescription') },
    { name: 'keywords', content: t('imageTools.cropper.seoKeywords') }
  ]
}))

function centeredSelection(ratio) {
  if (!ratio) return { x: 0, y: 0, width: 1, height: 1 }
  const imageRatio = source.value.width / source.value.height
  if (imageRatio > ratio) {
    const width = ratio / imageRatio
    return { x: (1 - width) / 2, y: 0, width, height: 1 }
  }
  const height = imageRatio / ratio
  return { x: 0, y: (1 - height) / 2, width: 1, height }
}

function selectRatio(ratio) {
  activeRatio.value = ratio
  selection.value = centeredSelection(ratio)
  clearResult()
}

async function addFile(file) {
  if (!file) return
  clearImage()
  try {
    const loaded = await loadLocalImage(file)
    const width = loaded.image.naturalWidth
    const height = loaded.image.naturalHeight
    if (!width || !height || width * height > 100_000_000) {
      URL.revokeObjectURL(loaded.url)
      throw new Error(t('imageTools.converter.imageTooLarge'))
    }
    source.value = { file, url: loaded.url, image: loaded.image, width, height }
    selection.value = centeredSelection(activeRatio.value)
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error?.message || t('imageTools.cropper.loadError')
  }
}

function onFileChange(event) {
  addFile(event.target.files?.[0])
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  addFile(event.dataTransfer?.files?.[0])
}

function clearResult() {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''
  resultName.value = ''
}

watch(format, clearResult)

function clearImage() {
  clearResult()
  if (source.value?.url) URL.revokeObjectURL(source.value.url)
  source.value = null
  selection.value = null
  errorMessage.value = ''
}

function pointFromEvent(event) {
  const bounds = stage.value.getBoundingClientRect()
  return {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
  }
}

function startSelection(event) {
  if (processing.value || !stage.value) return
  stage.value.setPointerCapture(event.pointerId)
  pointerStart.value = pointFromEvent(event)
  selection.value = { x: pointerStart.value.x, y: pointerStart.value.y, width: 0, height: 0 }
  clearResult()
}

function updateSelection(event) {
  if (!pointerStart.value || !source.value) return
  const point = pointFromEvent(event)
  let width = Math.max(0, point.x - pointerStart.value.x)
  let height = Math.max(0, point.y - pointerStart.value.y)
  if (activeRatio.value) {
    const selectionRatio = activeRatio.value * source.value.height / source.value.width
    if (width / Math.max(height, 0.0001) > selectionRatio) width = height * selectionRatio
    else height = width / selectionRatio
  }
  width = Math.min(width, 1 - pointerStart.value.x)
  height = Math.min(height, 1 - pointerStart.value.y)
  selection.value = { x: pointerStart.value.x, y: pointerStart.value.y, width, height }
}

function finishSelection() {
  pointerStart.value = null
}

async function cropImage() {
  if (!source.value || !hasSelection.value) return
  processing.value = true
  errorMessage.value = ''
  try {
    const x = Math.round(selection.value.x * source.value.width)
    const y = Math.round(selection.value.y * source.value.height)
    const width = Math.min(source.value.width - x, Math.round(selection.value.width * source.value.width))
    const height = Math.min(source.value.height - y, Math.round(selection.value.height * source.value.height))
    if (width < 1 || height < 1) throw new Error(t('imageTools.cropper.invalidSelection'))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error(t('imageTools.cropper.cropError'))
    if (format.value === 'image/jpeg') {
      context.fillStyle = '#fff'
      context.fillRect(0, 0, width, height)
    }
    context.drawImage(source.value.image, x, y, width, height, 0, 0, width, height)
    const blob = await encodeCanvas(canvas, format.value)
    clearResult()
    resultUrl.value = URL.createObjectURL(blob)
    resultName.value = `${fileStem(source.value.file.name)}-cropped.${format.value.split('/')[1].replace('jpeg', 'jpg')}`
  } catch (error) {
    errorMessage.value = error?.message || t('imageTools.cropper.cropError')
  } finally {
    processing.value = false
  }
}

onBeforeUnmount(clearImage)
</script>

<style scoped>
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
</style>

<style>
.dark .cropper-tool { --ink: #e4ece8; --muted: #b3c1bb; --line: #3a4943; }
.dark .cropper-tool .drop-zone { background: repeating-linear-gradient(135deg, #202d28 0, #202d28 14px, #26352f 14px, #26352f 28px); }
.dark .cropper-tool .format-field select, .dark .cropper-tool .secondary { color: var(--ink); background: #1c2924; }
.dark .cropper-tool .related a { color: #7bd8b6; }
</style>