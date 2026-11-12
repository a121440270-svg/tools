<template>
  <div class="aspect-ratio-page">
    <div class="page-header">
      <div class="header-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M8 10h8v8H8z"/>
          <path d="M10 8h4"/>
          <path d="M8 14h8"/>
        </svg>
      </div>
      <div>
        <h1>{{ $t('imageTools.aspect.title') }}</h1>
        <p>{{ $t('imageTools.aspect.description') }}</p>
      </div>
    </div>

    <div v-if="!images.length" class="upload-zone" @click="$refs.fileInput.click()" @drop.prevent="onDrop" @dragover.prevent>
      <div class="upload-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
      <p class="upload-text">{{ $t('imageTools.uploadPrompt') }}</p>
      <p class="upload-hint">{{ $t('imageTools.localProcessing') }}</p>
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />
    </div>

    <div v-else>
      <div class="batch-toolbar">
          <span>{{ images.length }} {{ $t('imageTools.images') }}</span>
        <div class="batch-actions">
          <label class="secondary-btn add-images-btn">
            {{ $t('imageTools.addImages') }}
            <input ref="addFilesInput" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />
          </label>
          <button type="button" class="secondary-btn" :disabled="processing" @click="clearAll">{{ $t('imageTools.clearAll') }}</button>
        </div>
      </div>
      <div class="tool-grid">
      <div class="panel settings-panel">
        <div class="section-title">{{ $t('imageTools.aspect.targetRatio') }}</div>

        <div class="ratio-preset-grid">
          <button
            v-for="preset in ratioPresets"
            :key="preset.label"
            type="button"
            class="ratio-preset"
            :class="{ active: selectedPreset === preset.label }"
            @click="selectPreset(preset.label)"
          >
            {{ preset.labelKey ? $t(preset.labelKey) : preset.label }}
          </button>
        </div>

        <div class="custom-ratio-row">
          <label>
            <span>{{ $t('imageTools.width') }}</span>
            <input v-model.number="customRatioX" type="number" min="1" max="100" step="1" />
          </label>
          <span class="ratio-separator">:</span>
          <label>
            <span>{{ $t('imageTools.height') }}</span>
            <input v-model.number="customRatioY" type="number" min="1" max="100" step="1" />
          </label>
        </div>

        <div class="section-title mt-6">{{ $t('imageTools.aspect.processingMode') }}</div>
        <div class="option-list">
          <label class="option-item" v-for="mode in processingModes" :key="mode.value">
            <input v-model="processingMode" :value="mode.value" type="radio" />
            <span>{{ $t(mode.labelKey) }}</span>
          </label>
        </div>

        <div v-if="processingMode === 'crop'" class="field-block">
          <div class="section-title">{{ $t('imageTools.aspect.cropPosition') }}</div>
          <div class="option-list compact">
            <label class="option-item" v-for="position in cropPositions" :key="position.value">
              <input v-model="cropPosition" :value="position.value" type="radio" />
              <span>{{ $t(position.labelKey) }}</span>
            </label>
          </div>
        </div>

        <div v-if="processingMode === 'fit'" class="field-block">
          <div class="section-title">{{ $t('imageTools.aspect.background') }}</div>
          <div class="option-list compact">
            <label class="option-item" v-for="bg in fitBackgroundOptions" :key="bg.value">
              <input v-model="fitBackground" :value="bg.value" type="radio" />
              <span>{{ $t(bg.labelKey) }}</span>
            </label>
          </div>
        </div>

        <div v-if="processingMode === 'blur'" class="field-block">
          <label class="slider-row">
            <span>{{ $t('imageTools.aspect.blurAmount') }}</span>
            <strong>{{ blurAmount }} px</strong>
          </label>
          <input v-model.number="blurAmount" type="range" min="2" max="40" step="1" />

          <label class="slider-row mt-3">
            <span>{{ $t('imageTools.aspect.backgroundScale') }}</span>
            <strong>{{ backgroundScale.toFixed(1) }}x</strong>
          </label>
          <input v-model.number="backgroundScale" type="range" min="1" max="2" step="0.1" />
        </div>

        <div v-if="processingMode === 'stretch'" class="field-block warning-box">
          {{ $t('imageTools.aspect.stretchWarning') }}
        </div>

        <div class="section-title mt-6">{{ $t('imageTools.aspect.outputSize') }}</div>
        <div class="size-row">
          <label>
            <span>{{ $t('imageTools.width') }}</span>
            <input v-model.number="outputWidth" type="number" min="1" step="1" @input="handleWidthInput" />
          </label>
          <label>
            <span>{{ $t('imageTools.height') }}</span>
            <input v-model.number="outputHeight" type="number" min="1" step="1" @input="handleHeightInput" />
          </label>
        </div>

        <label class="toggle-row">
          <input v-model="keepAspectRatio" type="checkbox" />
          <span>{{ $t('imageTools.aspect.keepRatio') }}</span>
        </label>

        <div class="action-row">
          <button type="button" class="primary-btn" :disabled="processing || !sourceImage" @click="applyTransformation">
            <span v-if="processing" class="spinner"></span>
            {{ processing ? $t('imageTools.processingCount', { current: processingCount, total: images.length }) : $t('imageTools.aspect.action', { count: images.length }) }}
          </button>
          <button v-if="downloadUrl" type="button" class="secondary-btn" @click="downloadResult">{{ $t('imageTools.download') }}</button>
          <button v-if="images.some(image => image.downloadUrl)" type="button" class="secondary-btn" :disabled="processing" @click="downloadAll">{{ $t('imageTools.downloadAll') }}</button>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </div>

      <div class="panel preview-panel">
        <div class="preview-head">
          <span>{{ $t('imageTools.original') }}</span>
          <span>{{ $t('imageTools.result') }}</span>
        </div>
        <div class="preview-grid">
          <div class="preview-box">
            <img v-if="sourceImage" :src="imageUrl" :alt="$t('imageTools.originalPreview', { name: imageName })" />
            <div class="meta-label">
              {{ sourceWidth }} × {{ sourceHeight }}
            </div>
          </div>
          <div class="preview-box">
            <canvas ref="previewCanvas" :width="outputWidth" :height="outputHeight"></canvas>
            <div class="meta-label">
              {{ outputWidth }} × {{ outputHeight }}
            </div>
          </div>
        </div>
        <div class="thumbnail-toolbar">
          <input
            v-model="imageSearch"
            class="thumbnail-search"
            type="search"
            :placeholder="$t('imageTools.searchImages')"
            :aria-label="$t('imageTools.searchImages')"
          />
          <span class="thumbnail-count">{{ $t('imageTools.filteredCount', { filtered: filteredImages.length, total: images.length }) }}</span>
        </div>
        <div class="batch-list">
          <button
            v-for="item in filteredImages"
            :key="item.image.id"
            type="button"
            class="batch-item"
            :class="{ active: selectedImageIndex === item.index }"
            :aria-pressed="selectedImageIndex === item.index"
            :title="item.image.name"
            @click="selectImage(item.index)"
          >
            <img :src="item.image.url" :alt="item.image.name" />
            <span class="batch-item-name">{{ item.image.name }}</span>
            <span class="batch-item-status">{{ item.image.downloadUrl ? $t('imageTools.done') : $t('imageTools.ready') }}</span>
          </button>
          <p v-if="!filteredImages.length" class="thumbnail-empty">{{ $t('imageTools.noImagesMatch') }}</p>
        </div>
      </div>
      </div>
    </div>

    <div class="related-tools">
      <h2>{{ $t('imageTools.relatedTitle') }}</h2>
      <div class="related-grid">
        <NuxtLinkLocale to="/image-compress">{{ $t('imageTools.related.compress') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/increase-image-size">{{ $t('imageTools.related.increaseSize') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/image-to-webp">{{ $t('imageTools.related.toWebp') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/webp-to-png">{{ $t('imageTools.related.webpToPng') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/merge-images">{{ $t('mergeTool.navTitle') }}</NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import JSZip from 'jszip'
const { t } = useI18n()

const fileInput = ref(null)
const addFilesInput = ref(null)
const images = ref([])
const selectedImageIndex = ref(0)
const imageSearch = ref('')
const filteredImages = computed(() => {
  const query = imageSearch.value.trim().toLocaleLowerCase()
  return images.value
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => image.name.toLocaleLowerCase().includes(query))
})
const selectedImage = computed(() => images.value[selectedImageIndex.value] || null)
const imageUrl = computed(() => selectedImage.value?.url || '')
const imageName = computed(() => selectedImage.value?.name || '')
const sourceImage = computed(() => selectedImage.value?.image || null)
const previewCanvas = ref(null)
const sourceWidth = computed(() => selectedImage.value?.width || 0)
const sourceHeight = computed(() => selectedImage.value?.height || 0)
const outputWidth = ref(1920)
const outputHeight = ref(1080)
const keepAspectRatio = ref(true)
const processing = ref(false)
const errorMessage = ref('')
const downloadUrl = computed(() => selectedImage.value?.downloadUrl || '')
const processingCount = ref(0)
const selectedPreset = ref('16:9')
const customRatioX = ref(5)
const customRatioY = ref(7)
const processingMode = ref('crop')
const cropPosition = ref('center')
const fitBackground = ref('white')
const blurAmount = ref(18)
const backgroundScale = ref(1.3)

const ratioPresets = [
  { label: '1:1', value: { width: 1, height: 1 } },
  { label: '4:3', value: { width: 4, height: 3 } },
  { label: '3:2', value: { width: 3, height: 2 } },
  { label: '16:9', value: { width: 16, height: 9 } },
  { label: '9:16', value: { width: 9, height: 16 } },
  { label: '4:5', value: { width: 4, height: 5 } },
  { label: '5:4', value: { width: 5, height: 4 } },
  { label: '21:9', value: { width: 21, height: 9 } },
  { label: '2:3', value: { width: 2, height: 3 } },
  { label: 'Custom', labelKey: 'imageTools.custom', value: null }
]

const processingModes = [
  { label: 'Crop', labelKey: 'imageTools.aspect.crop', value: 'crop' },
  { label: 'Fit', labelKey: 'imageTools.aspect.fit', value: 'fit' },
  { label: 'Blur Background', labelKey: 'imageTools.aspect.blurBackground', value: 'blur' },
  { label: 'Stretch', labelKey: 'imageTools.aspect.stretch', value: 'stretch' }
]

const cropPositions = [
  { label: 'Center', labelKey: 'imageTools.aspect.center', value: 'center' },
  { label: 'Top', labelKey: 'imageTools.aspect.top', value: 'top' },
  { label: 'Bottom', labelKey: 'imageTools.aspect.bottom', value: 'bottom' },
  { label: 'Left', labelKey: 'imageTools.aspect.left', value: 'left' },
  { label: 'Right', labelKey: 'imageTools.aspect.right', value: 'right' }
]

const fitBackgroundOptions = [
  { label: 'White', labelKey: 'imageTools.aspect.white', value: 'white' },
  { label: 'Black', labelKey: 'imageTools.aspect.black', value: 'black' },
  { label: 'Transparent', labelKey: 'imageTools.aspect.transparent', value: 'transparent' },
  { label: 'Custom', labelKey: 'imageTools.custom', value: 'custom' }
]

const currentRatio = computed(() => {
  if (selectedPreset.value === 'Custom') {
    return {
      width: Number(customRatioX.value) || 1,
      height: Number(customRatioY.value) || 1
    }
  }

  const match = ratioPresets.find(item => item.label === selectedPreset.value)
  if (!match || !match.value) {
    return { width: 16, height: 9 }
  }

  return match.value
})

useToolSeo({
  title: () => t('imageTools.aspect.seoTitle'),
  description: () => t('imageTools.aspect.seoDescription'),
  keywords: () => t('imageTools.aspect.seoKeywords')
})

function getAspectRatioValue() {
  const ratio = currentRatio.value
  return ratio.width / ratio.height
}

function clampDimension(value, fallback = 1) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback
  return Math.max(1, Math.round(numeric))
}

function syncOutputFromRatio() {
  if (!keepAspectRatio.value || !sourceImage.value) return
  const ratio = getAspectRatioValue()
  const baseWidth = clampDimension(outputWidth.value || sourceWidth.value || 1)
  const baseHeight = clampDimension(outputHeight.value || sourceHeight.value || 1)

  if (baseWidth >= baseHeight) {
    outputHeight.value = clampDimension(baseWidth / ratio)
  } else {
    outputWidth.value = clampDimension(baseHeight * ratio)
  }
}

function selectPreset(label) {
  selectedPreset.value = label
  if (label !== 'Custom') {
    const preset = ratioPresets.find(item => item.label === label)
    if (preset && preset.value) {
      customRatioX.value = preset.value.width
      customRatioY.value = preset.value.height
    }
  }
  syncOutputFromRatio()
}

function handleWidthInput() {
  if (!keepAspectRatio.value) return
  const ratio = getAspectRatioValue()
  outputHeight.value = clampDimension(outputWidth.value / ratio)
}

function handleHeightInput() {
  if (!keepAspectRatio.value) return
  const ratio = getAspectRatioValue()
  outputWidth.value = clampDimension(outputHeight.value * ratio)
}

function parseBackgroundColor() {
  if (fitBackground.value === 'black') return '#000000'
  if (fitBackground.value === 'transparent') return 'rgba(0,0,0,0)'
  if (fitBackground.value === 'custom') return '#ffffff'
  return '#ffffff'
}

function renderCanvas(canvas, image = sourceImage.value, imageWidth = sourceWidth.value, imageHeight = sourceHeight.value) {
  if (!image || !canvas) return null
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const targetRatio = getAspectRatioValue()
  const canvasWidth = clampDimension(outputWidth.value || sourceWidth.value || 1)
  const canvasHeight = clampDimension(outputHeight.value || sourceHeight.value || 1)
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.filter = 'none'

  if (processingMode.value === 'stretch') {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas
  }

  if (processingMode.value === 'fit') {
    ctx.fillStyle = parseBackgroundColor()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const sourceRatio = imageWidth / imageHeight || 1
    const scale = sourceRatio > targetRatio
      ? canvas.width / imageWidth
      : canvas.height / imageHeight

    const drawWidth = Math.max(1, imageWidth * scale)
    const drawHeight = Math.max(1, imageHeight * scale)
    const dx = (canvas.width - drawWidth) / 2
    const dy = (canvas.height - drawHeight) / 2
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight)
    return canvas
  }

  if (processingMode.value === 'blur') {
    ctx.fillStyle = parseBackgroundColor()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const bgScale = Math.max(1.05, Number(backgroundScale.value) || 1.3)
    ctx.filter = `blur(${blurAmount.value}px)`
    const bgW = Math.max(1, canvas.width * bgScale)
    const bgH = Math.max(1, canvas.height * bgScale)
    const bgX = (canvas.width - bgW) / 2
    const bgY = (canvas.height - bgH) / 2
    ctx.drawImage(image, bgX, bgY, bgW, bgH)
    ctx.filter = 'none'

    const sourceRatio = imageWidth / imageHeight || 1
    const scale = sourceRatio > targetRatio
      ? canvas.width / imageWidth
      : canvas.height / imageHeight
    const drawWidth = Math.max(1, imageWidth * scale)
    const drawHeight = Math.max(1, imageHeight * scale)
    const dx = (canvas.width - drawWidth) / 2
    const dy = (canvas.height - drawHeight) / 2
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight)
    return canvas
  }

  const sourceRatio = imageWidth / imageHeight || 1
  let sx = 0
  let sy = 0
  let sw = imageWidth
  let sh = imageHeight

  if (sourceRatio > targetRatio) {
    sw = Math.min(imageWidth, imageHeight * targetRatio)
    sw = Math.max(1, sw)
    sx = cropPosition.value === 'left'
      ? 0
      : cropPosition.value === 'right'
        ? Math.max(0, imageWidth - sw)
        : Math.max(0, (imageWidth - sw) / 2)
  } else {
    sh = Math.min(imageHeight, imageWidth / targetRatio)
    sh = Math.max(1, sh)
    sy = cropPosition.value === 'top'
      ? 0
      : cropPosition.value === 'bottom'
        ? Math.max(0, imageHeight - sh)
        : Math.max(0, (imageHeight - sh) / 2)
  }

      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  return canvas
}

function renderPreview() {
  if (!previewCanvas.value) return
  renderCanvas(previewCanvas.value)
}

function onFileChange(event) {
  addImages(event.target?.files)
  if (fileInput.value) fileInput.value.value = ''
  if (addFilesInput.value) addFilesInput.value.value = ''
}

function onDrop(event) {
  addImages(event.dataTransfer?.files)
}

async function addImages(fileList) {
  const files = Array.from(fileList || [])
  if (!files.length) return
  const validFiles = files.filter(file => file.type.startsWith('image/'))
  const loadedImages = await Promise.all(validFiles.map(loadImageFile))
  const addedImages = loadedImages.filter(Boolean)
  const wasEmpty = images.value.length === 0
  images.value.push(...addedImages)
  errorMessage.value = validFiles.length !== files.length
    ? t('imageTools.someFilesNotImages')
    : addedImages.length !== validFiles.length
      ? t('imageTools.someImagesNotLoaded')
      : ''
  if (wasEmpty && addedImages.length) selectImage(0)
}

function loadImageFile(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({
      id: `${Date.now()}-${Math.random()}`,
      image,
      url,
      name: file.name,
      width: image.naturalWidth,
      height: image.naturalHeight,
      downloadUrl: '',
      blob: null
    })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    image.src = url
  })
}

function selectImage(index) {
  selectedImageIndex.value = index
  const image = selectedImage.value
  if (!image) return
  outputWidth.value = image.width
  outputHeight.value = image.height
  if (keepAspectRatio.value) syncOutputFromRatio()
  renderPreview()
}

function clearAll() {
  images.value.forEach(image => {
    URL.revokeObjectURL(image.url)
    if (image.downloadUrl) URL.revokeObjectURL(image.downloadUrl)
  })
  images.value = []
  selectedImageIndex.value = 0
  imageSearch.value = ''
  errorMessage.value = ''
}

async function applyTransformation() {
  if (!sourceImage.value) return
  processing.value = true
  errorMessage.value = ''
  processingCount.value = 0
  let failedCount = 0
  const ratio = `${currentRatio.value.width}x${currentRatio.value.height}`

  for (const image of images.value) {
    const canvas = document.createElement('canvas')
    renderCanvas(canvas, image.image, image.width, image.height)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92))
    if (!blob) {
      failedCount += 1
      continue
    }
    if (image.downloadUrl) URL.revokeObjectURL(image.downloadUrl)
    image.blob = blob
    image.downloadUrl = URL.createObjectURL(blob)
    image.outputName = `${image.name.replace(/\.[^/.]+$/, '') || 'image'}-${ratio}.png`
    processingCount.value += 1
  }
  processing.value = false
  if (failedCount) errorMessage.value = `${failedCount} image(s) could not be processed.`
  renderPreview()
}

function downloadResult() {
  if (!selectedImage.value?.downloadUrl) return
  const a = document.createElement('a')
  a.href = selectedImage.value.downloadUrl
  a.download = selectedImage.value.outputName
  document.body.appendChild(a)
  a.click()
  a.remove()
}

async function downloadAll() {
  const completed = images.value.filter(image => image.blob)
  if (completed.length === 1) {
    const link = document.createElement('a')
    link.href = completed[0].downloadUrl
    link.download = completed[0].outputName
    link.click()
    return
  }
  if (!completed.length) return
  const zip = new JSZip()
  const names = new Map()
  completed.forEach(image => {
    const count = (names.get(image.outputName) || 0) + 1
    names.set(image.outputName, count)
    const name = count === 1
      ? image.outputName
      : `${image.outputName.replace(/\.png$/, '')} (${count}).png`
    zip.file(name, image.blob)
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'aspect-ratio-images.zip'
  link.click()
  URL.revokeObjectURL(url)
}

watch(
  () => [selectedPreset.value, customRatioX.value, customRatioY.value, keepAspectRatio.value],
  () => {
    if (!sourceImage.value) return
    if (keepAspectRatio.value) syncOutputFromRatio()
    clearResults()
    renderPreview()
  },
  { flush: 'post' }
)

watch(
  () => [processingMode.value, cropPosition.value, fitBackground.value, blurAmount.value, backgroundScale.value, outputWidth.value, outputHeight.value],
  () => {
    if (sourceImage.value) {
      clearResults()
      renderPreview()
    }
  },
  { flush: 'post' }
)

function clearResults() {
  images.value.forEach(image => {
    if (image.downloadUrl) URL.revokeObjectURL(image.downloadUrl)
    image.downloadUrl = ''
    image.blob = null
    image.outputName = ''
  })
}

onBeforeUnmount(() => {
  images.value.forEach(image => {
    URL.revokeObjectURL(image.url)
    if (image.downloadUrl) URL.revokeObjectURL(image.downloadUrl)
  })
})
</script>

<style scoped>
.aspect-ratio-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 80px;
  color: #e5e7eb;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.header-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.page-header h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  font-weight: 800;
}

.page-header p {
  margin: 8px 0 0;
  color: #9ca3af;
  max-width: 720px;
}

.upload-zone {
  padding: 48px 20px;
  border: 1.5px dashed rgba(148, 163, 184, 0.4);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.5);
  text-align: center;
  cursor: pointer;
}

.upload-icon-wrap {
  width: 72px;
  height: 72px;
  margin: 0 auto 14px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
}

.upload-text {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
}

.upload-hint {
  margin-top: 8px;
  color: #9ca3af;
}

.tool-grid {
  display: grid;
  grid-template-columns: minmax(0, 430px) minmax(0, 1fr);
  gap: 24px;
}

.panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 12px 30px rgba(2, 6, 23, 0.18);
}

.section-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 12px;
}

.ratio-preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ratio-preset {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.45);
  color: #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
}

.ratio-preset.active {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(96, 165, 250, 0.7);
  color: #bfdbfe;
}

.custom-ratio-row,
.size-row {
  display: grid;
  grid-template-columns: 1fr 18px 1fr;
  gap: 10px;
  align-items: end;
  margin-top: 16px;
}

.size-row {
  grid-template-columns: 1fr 1fr;
}

.custom-ratio-row label,
.size-row label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #cbd5e1;
  font-size: 0.82rem;
}

.custom-ratio-row input,
.size-row input,
.custom-ratio-row select,
.size-row select {
  background: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  padding: 10px 12px;
  width: 100%;
}

.ratio-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-weight: 800;
  padding-bottom: 12px;
}

.option-list {
  display: grid;
  gap: 8px;
}

.option-list.compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.slider-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e2e8f0;
  margin-bottom: 8px;
}

input[type="range"] {
  width: 100%;
}

.field-block {
  margin-top: 20px;
}

.warning-box {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.38);
  color: #fbbf24;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  color: #dfe7f3;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.primary-btn,
.secondary-btn {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.secondary-btn {
  background: rgba(148, 163, 184, 0.12);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.5);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.preview-panel {
  display: flex;
  flex-direction: column;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  color: #cbd5e1;
  font-weight: 700;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.thumbnail-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}

.thumbnail-search {
  min-width: 0;
  flex: 1;
  padding: 10px 12px;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
}

.thumbnail-search::placeholder {
  color: #94a3b8;
}

.thumbnail-count {
  flex: none;
  color: #cbd5e1;
  font-size: 0.85rem;
  white-space: nowrap;
}

.batch-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  align-content: start;
  gap: 10px;
  height: 224px;
  margin-top: 12px;
  padding: 2px 4px 2px 2px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.batch-item {
  display: grid;
  grid-template-rows: 64px auto auto;
  gap: 5px;
  min-width: 0;
  padding: 7px;
  color: #cbd5e1;
  text-align: left;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  cursor: pointer;
}

.batch-item.active {
  background: rgba(59, 130, 246, 0.14);
  border-color: #60a5fa;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.25);
}

.batch-item img {
  width: 100%;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  background: rgba(2, 6, 23, 0.7);
}

.batch-item-name {
  overflow: hidden;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-item-status {
  color: #94a3b8;
  font-size: 0.7rem;
}

.thumbnail-empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 16px 8px;
  color: #94a3b8;
  text-align: center;
}

.preview-box {
  position: relative;
  min-height: 250px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.preview-box img,
.preview-box canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.meta-label {
  position: absolute;
  left: 12px;
  bottom: 12px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.75rem;
  color: #e2e8f0;
}

.error-text {
  margin-top: 16px;
  color: #fca5a5;
}

@media (max-width: 860px) {
  .tool-grid {
    grid-template-columns: 1fr;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .thumbnail-toolbar {
    align-items: stretch;
  }
}

.related-tools {
  margin-top: 36px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.related-tools h2 {
  margin: 0 0 14px;
  font-size: 1.1rem;
  color: #e2e8f0;
}

.related-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.related-grid a {
  color: #bfdbfe;
  text-decoration: none;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.4);
  padding: 8px 12px;
  border-radius: 999px;
}
</style>
