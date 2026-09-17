<template>
  <div class="id-photo-page">
    <div class="page-header">
      <div class="header-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
          <path d="M3 7V5a2 2 0 012-2h2v18H5a2 2 0 01-2-2v-7a2 2 0 012-2h2a2 2 0 012 2v1h6v-1a2 2 0 012-2h1a2 2 0 012 2v7a2 2 0 01-2 2h-2"/>
          <circle cx="10" cy="14" r="2"/>
          <path d="M15 14c1.5 0 2.5 1 2.5 2.5S16.5 19 15 19s-2.5-.5-2.5-2.5S13.5 14 15 14z"/>
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('idPhoto.title') }}</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ t('idPhoto.subtitle') }}</p>
      </div>
      <span v-if="operationMessage" class="operation-message">{{ operationMessage }}</span>
    </div>

    <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" class="hidden" />

    <div class="editor-layout">
      <div class="preview-panel">
        <div class="preview-label">{{ t('idPhoto.preview') }}</div>
        <div
          v-if="imageSrc"
          class="canvas-wrap upload-dropzone"
          @click="$refs.fileInput.click()"
          @drop.prevent="onDrop"
          @dragover.prevent
        >
          <canvas ref="mainCanvas" class="main-canvas"></canvas>
          <canvas
            ref="paintCanvas"
            v-show="paintMode"
            class="paint-canvas"
            @pointerdown.stop.prevent="startPainting"
            @pointermove.stop.prevent="paint"
            @pointerup.stop.prevent="stopPainting"
            @pointerleave.stop.prevent="stopPainting"
          ></canvas>
        </div>
        <div
          v-else
          class="empty-preview upload-dropzone"
          @click="$refs.fileInput.click()"
          @drop.prevent="onDrop"
          @dragover.prevent
        >
          <div class="empty-preview-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <circle cx="9" cy="10" r="2"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <p>{{ t('idPhoto.uploadText') }}</p>
        </div>
        <div class="preview-info">
          <span>{{ imageInfo || t('idPhoto.uploadHint') }}</span>
        </div>

      </div>

      <div class="adjust-panel">
        <div class="action-row">
          <button class="btn btn-secondary" :disabled="!imageSrc || processing" @click="cutoutImage">
            {{ processing ? t('idPhoto.processing') : t('idPhoto.cutout') }}
          </button>
          <button class="btn btn-outline" type="button" :disabled="!imageSrc" @click="openAgnesAiBackground">
            Use Agnes AI
          </button>
          <button class="btn btn-primary" :disabled="!imageSrc" @click="downloadImage">
            {{ t('idPhoto.download') }}
          </button>
          <button class="btn btn-outline" @click="resetImage">
            {{ t('idPhoto.reUpload') }}
          </button>
        </div>

        <div class="section-title">{{ t('idPhoto.brushCutout') }}</div>
        <div class="slider-group">
          <div class="slider-label">
            <span>{{ t('idPhoto.brushSize') }}</span>
            <span class="slider-val">{{ t('idPhoto.brushSizeValue', { size: brushSize }) }}</span>
          </div>
          <input type="range" v-model.number="brushSize" min="8" max="100" class="slider" />
        </div>
        <div class="paint-actions">
          <button class="btn btn-outline" :disabled="!cutoutImg || processing" @click="togglePaintMode">
            {{ paintMode ? t('idPhoto.stopPainting') : t('idPhoto.startPainting') }}
          </button>
          <button class="btn btn-secondary" :disabled="!cutoutImg || !hasPaintMask || processing" @click="applyPaintMask">
            {{ t('idPhoto.removePaintedArea') }}
          </button>
        </div>

        <div class="section-title">{{ t('idPhoto.bgColor') }}</div>
        <div class="color-row">
          <button
            v-for="color in bgColors"
            :key="color.hex"
            :class="['color-swatch', selectedBg === color.hex ? 'swatch-active' : '']"
            :style="{ background: color.hex }"
            :title="color.name"
            type="button"
            @click="selectedBg = color.hex"
          />
          <label class="custom-color-label">
            <input v-model="selectedBg" type="color" class="custom-color-input" />
            <span class="custom-color-text">{{ t('idPhoto.custom') }}</span>
          </label>
        </div>

        <div class="section-title">{{ t('idPhoto.size') }}</div>
        <div class="size-grid">
              <button
                v-for="s in sizePresets"
                :key="s.label"
                :class="['size-btn', currentSize.label === s.label ? 'size-btn-active' : '']"
                @click="selectSize(s)"
              >
                {{ t(`idPhoto.sizes.${s.key}`) }}
                <span class="size-dims">{{ s.w }}×{{ s.h }}</span>
              </button>
            </div>

        <div class="section-title mt-4">{{ t('idPhoto.adjust') }}</div>
        <div class="slider-group">
          <div class="slider-label">
            <span>{{ t('idPhoto.brightness') }}</span>
            <span class="slider-val">{{ brightness }}%</span>
          </div>
          <input type="range" v-model.number="brightness" min="-50" max="50" class="slider" @input="render" />
        </div>
        <div class="slider-group">
          <div class="slider-label">
            <span>{{ t('idPhoto.contrast') }}</span>
            <span class="slider-val">{{ contrast }}%</span>
          </div>
          <input type="range" v-model.number="contrast" min="50" max="200" class="slider" @input="render" />
        </div>
        <div class="slider-group">
          <div class="slider-label">
            <span>{{ t('idPhoto.saturation') }}</span>
            <span class="slider-val">{{ saturation }}%</span>
          </div>
          <input type="range" v-model.number="saturation" min="0" max="200" class="slider" @input="render" />
        </div>
        <div class="section-title mt-4">{{ t('idPhoto.crop') }}</div>
        <div class="crop-controls">
          <div class="slider-group">
            <div class="slider-label">
              <span>{{ t('idPhoto.top') }}</span>
            </div>
            <input type="range" v-model.number="cropTop" min="-100" max="300" class="slider" @input="render" />
          </div>
          <div class="slider-group">
            <div class="slider-label">
              <span>{{ t('idPhoto.left') }}</span>
            </div>
            <input type="range" v-model.number="cropLeft" min="0" max="100" class="slider" @input="render" />
          </div>
          <div class="slider-group">
            <div class="slider-label">
              <span>{{ t('idPhoto.zoom') }}</span>
            </div>
            <input type="range" v-model.number="zoom" min="100" max="400" class="slider" @input="render" />
          </div>
        </div>
        <button class="btn btn-ghost" @click="resetCrop">{{ t('idPhoto.resetCrop') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { removeBackground } from '@imgly/background-removal'
const { t } = useI18n()

useHead({
  title: t('idPhoto.title') + ' | OnliTool',
  meta: [
    { name: 'description', content: t('idPhoto.seoDesc') },
    { name: 'keywords', content: t('idPhoto.seoKeywords') }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: t('idPhoto.title'),
        description: t('idPhoto.seoDesc'),
        applicationCategory: 'PhotographyApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: t('idPhoto.seoKeywords'),
      }),
    },
  ],
})

const fileInput = ref(null)
const mainCanvas = ref(null)
const paintCanvas = ref(null)
const manualMaskCanvas = ref(null)
const imageSrc = ref('')
const originalImg = ref(null)
const cutoutImg = ref(null)
const processing = ref(false)
const operationMessage = ref('')

// Settings
const currentSize = ref({ label: '1寸', w: 295, h: 413, cm: '25×35mm' })
const brightness = ref(0)
const contrast = ref(100)
const saturation = ref(100)
const cropTop = ref(80)
const cropLeft = ref(50)
const zoom = ref(150)
const cutoutMaxSize = 1600
const bgColors = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Blue', hex: '#438edb' },
  { name: 'Red', hex: '#d93b3b' },
  { name: 'Gray', hex: '#b0b0b0' },
]
const selectedBg = ref('#ffffff')
const paintMode = ref(false)
const painting = ref(false)
const hasPaintMask = ref(false)
const brushSize = ref(32)

const sizePresets = [
  { key: 'oneInch', label: '1寸', w: 295, h: 413, cm: '25×35mm' },
  { key: 'twoInch', label: '2寸', w: 413, h: 579, cm: '35×49mm' },
  { key: 'smallOneInch', label: '小1寸', w: 260, h: 378, cm: '22×32mm' },
  { key: 'passport', label: '护照', w: 354, h: 472, cm: '33×48mm' },
  { key: 'visa', label: '签证', w: 354, h: 472, cm: '35×45mm' },
  { key: 'socialSecurity', label: '社保', w: 352, h: 441, cm: '35×45mm' },
]

const imageInfo = computed(() => {
  if (!originalImg.value) return ''
  return `${originalImg.value.naturalWidth}×${originalImg.value.naturalHeight}`
})

function selectSize(s) {
  currentSize.value = s
  manualMaskCanvas.value = null
  hasPaintMask.value = false
  render()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  loadImage(file)
}

function onDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) loadImage(file)
}

function loadImage(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result
    cutoutImg.value = null
    paintMode.value = false
    clearPaintMask()
    manualMaskCanvas.value = null
    const img = new Image()
    img.onload = () => {
      originalImg.value = img
      nextTick(render)
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function resetImage() {
  imageSrc.value = ''
  originalImg.value = null
  cutoutImg.value = null
  processing.value = false
  brightness.value = 0
  contrast.value = 100
  saturation.value = 100
  cropTop.value = 80
  cropLeft.value = 50
  zoom.value = 150
  paintMode.value = false
  hasPaintMask.value = false
  clearPaintMask()
  manualMaskCanvas.value = null
  selectedBg.value = '#ffffff'
  operationMessage.value = t('idPhoto.cleared')
  if (fileInput.value) fileInput.value.value = ''
}

async function cutoutImage() {
  if (!imageSrc.value || processing.value) return

  processing.value = true
  operationMessage.value = t('idPhoto.processing')
  try {
    const input = await createCutoutInput(originalImg.value)
    const result = await removeBackground(input, {
      model: 'isnet_quint8',
      device: import.meta.client && navigator.gpu ? 'gpu' : 'cpu',
      output: { format: 'image/png' },
    })
    const cutoutUrl = URL.createObjectURL(result)
    const img = new Image()
    img.onload = () => {
      if (cutoutImg.value?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(cutoutImg.value.src)
      }
      cutoutImg.value = img
      manualMaskCanvas.value = document.createElement('canvas')
      operationMessage.value = t('idPhoto.cutoutSuccess')
      nextTick(render)
    }
    img.src = cutoutUrl
  } catch (error) {
    operationMessage.value = t('idPhoto.cutoutError')
  } finally {
    processing.value = false
  }
}

function createCutoutInput(img) {
  const longestSide = Math.max(img.naturalWidth, img.naturalHeight)
  if (longestSide <= cutoutMaxSize) {
    return fetch(imageSrc.value).then(response => response.blob())
  }

  const scale = cutoutMaxSize / longestSide
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Unable to prepare cutout image'))
    }, 'image/jpeg', 0.92)
  })
}

function togglePaintMode() {
  paintMode.value = !paintMode.value
  if (paintMode.value) {
    nextTick(() => syncPaintCanvas())
    operationMessage.value = t('idPhoto.paintHint')
  }
}

function syncPaintCanvas() {
  if (!paintCanvas.value || !mainCanvas.value) return
  paintCanvas.value.width = mainCanvas.value.width
  paintCanvas.value.height = mainCanvas.value.height
  if (!manualMaskCanvas.value) manualMaskCanvas.value = document.createElement('canvas')
  manualMaskCanvas.value.width = mainCanvas.value.width
  manualMaskCanvas.value.height = mainCanvas.value.height
}

function clearPaintMask() {
  if (!paintCanvas.value) return
  paintCanvas.value.getContext('2d').clearRect(0, 0, paintCanvas.value.width, paintCanvas.value.height)
  hasPaintMask.value = false
}

function getPaintPoint(event) {
  const canvas = paintCanvas.value
  const rect = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height,
  }
}

function startPainting(event) {
  painting.value = true
  paintCanvas.value.setPointerCapture(event.pointerId)
  paint(event)
}

function paint(event) {
  if (!painting.value || !paintCanvas.value) return
  const point = getPaintPoint(event)
  const context = paintCanvas.value.getContext('2d')
  context.fillStyle = 'rgba(239, 68, 68, 0.55)'
  context.beginPath()
  context.arc(point.x, point.y, brushSize.value / 2, 0, Math.PI * 2)
  context.fill()
  hasPaintMask.value = true
}

function stopPainting(event) {
  painting.value = false
  if (paintCanvas.value?.hasPointerCapture(event.pointerId)) {
    paintCanvas.value.releasePointerCapture(event.pointerId)
  }
}

async function applyPaintMask() {
  if (!mainCanvas.value || !paintCanvas.value || !hasPaintMask.value) return

  const maskContext = paintCanvas.value.getContext('2d')
  const manualMaskContext = manualMaskCanvas.value.getContext('2d')
  manualMaskContext.drawImage(paintCanvas.value, 0, 0)
  maskContext.clearRect(0, 0, paintCanvas.value.width, paintCanvas.value.height)
  clearPaintMask()
  paintMode.value = false
  render()
  operationMessage.value = t('idPhoto.paintSuccess')
}

function openAgnesAiBackground() {
  if (!imageSrc.value) {
    return
  }

  const prompt = 'Replace the background of this portrait with a clean solid background, keep the person natural, clean, and centered, preserve the face details, make it fit ID photo style.'

  if (import.meta.client) {
    sessionStorage.setItem('agnes-id-photo-ref', imageSrc.value)
  }

  navigateTo({
    path: '/image-generator',
    query: {
      prompt,
      mode: 'image',
    },
  })
}

function resetCrop() {
  cropTop.value = 80
  cropLeft.value = 50
  zoom.value = 150
  render()
}

function getRgbFromHex(color) {
  const hex = color.replace('#', '')
  const normalized = hex.length === 3
    ? hex.split('').map(value => value + value).join('')
    : hex
  const value = Number.parseInt(normalized, 16)
  return {
    red: (value >> 16) & 255,
    green: (value >> 8) & 255,
    blue: value & 255,
  }
}

function render() {
  if (!originalImg.value || !mainCanvas.value) return
  const canvas = mainCanvas.value
  const ctx = canvas.getContext('2d')
  const { w, h } = currentSize.value

  canvas.width = w
  canvas.height = h

  const processedImage = cutoutImg.value || originalImg.value

  if (cutoutImg.value) {
    ctx.fillStyle = selectedBg.value
    ctx.fillRect(0, 0, w, h)
  }

  // Calculate crop area from original image
  const srcW = processedImage.width
  const srcH = processedImage.height
  const scale = Math.max(w / srcW, h / srcH) * (zoom.value / 100)

  const drawW = srcW * scale
  const drawH = srcH * scale

  // Center offset + crop adjustments
  const offsetX = (w - drawW) / 2 + (cropLeft.value - 50) * (drawW / 500)
  const offsetY = (h - drawH) / 2 + (cropTop.value - 80) * (drawH / 500)

  ctx.filter = `brightness(${100 + brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%)`
  ctx.drawImage(processedImage, offsetX, offsetY, drawW, drawH)
  ctx.filter = 'none'

  if (manualMaskCanvas.value?.width === w && manualMaskCanvas.value?.height === h) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const maskData = manualMaskCanvas.value.getContext('2d').getImageData(0, 0, w, h).data
    const background = getRgbFromHex(selectedBg.value)
    for (let index = 0; index < maskData.length; index += 4) {
      if (maskData[index + 3] > 0) {
        imageData.data[index] = background.red
        imageData.data[index + 1] = background.green
        imageData.data[index + 2] = background.blue
        imageData.data[index + 3] = 255
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }
}

watch([brightness, contrast, saturation, cropTop, cropLeft, zoom, selectedBg], () => {
  render()
}, { immediate: false })

watch(currentSize, () => render(), { immediate: false })

function downloadImage() {
  if (!mainCanvas.value || !imageSrc.value) {
    operationMessage.value = '请先上传图片'
    return
  }
  const link = document.createElement('a')
  link.download = `id-photo-${currentSize.value.label}.png`
  link.href = mainCanvas.value.toDataURL('image/png')
  link.click()
  operationMessage.value = '图片已下载'
}

onMounted(() => {
  nextTick(render)
})
</script>

<style scoped>
.id-photo-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgb(var(--border));
}

.header-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-icon-wrap svg {
  width: 28px;
  height: 28px;
}

.text-muted-foreground {
  color: rgb(100, 116, 139);
}

.dark .text-muted-foreground {
  color: rgb(148, 163, 184);
}

.operation-message {
  margin-left: auto;
  color: rgb(var(--primary));
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
}

.hidden { display: none; }

.upload-dropzone {
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.upload-dropzone:hover {
  border-color: rgb(var(--ring));
  background: rgb(var(--secondary));
}

.canvas-wrap {
  width: 100%;
  position: relative;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  border: 1px dashed rgb(var(--border));
  border-radius: 12px;
  background: repeating-conic-gradient(rgb(229 231 235) 0% 25%, rgb(255 255 255) 0% 50%) 0 0 / 16px 16px;
  color: rgb(148, 163, 184);
  text-align: center;
  padding: 1rem;
}

.empty-preview-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--secondary));
  margin-bottom: 0.75rem;
}

.empty-preview p {
  margin: 0;
  font-size: 0.9rem;
}

/* Editor layout */
.editor-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 1023px) {
  .id-photo-page {
    padding: 0.5rem 0.75rem 1rem;
  }

  .page-header {
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
  }

  .header-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  .header-icon-wrap svg {
    width: 22px;
    height: 22px;
  }

  .page-header h1 {
    font-size: 1.25rem;
    line-height: 1.5rem;
  }

  .operation-message {
    width: 100%;
    flex-basis: 100%;
    margin-left: 0;
    text-align: left;
  }

  .editor-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .adjust-panel {
    order: 0;
  }

  .preview-panel, .adjust-panel {
    padding: 1rem;
    border-radius: 12px;
  }

  .action-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .btn {
    padding: 0.6rem 0.5rem;
    font-size: 0.8rem;
  }
}

.preview-panel, .adjust-panel {
  background: rgb(var(--card));
  border: 1px solid rgb(var(--border));
  border-radius: 16px;
  padding: 1.5rem;
}

.adjust-panel {
  order: -1;
}

@media (max-width: 1023px) {
  .preview-panel {
    order: -1;
  }

  .adjust-panel {
    order: 0;
  }
}

.preview-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(148, 163, 184);
  margin-bottom: 0.75rem;
}

.main-canvas {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid rgb(var(--border));
  display: block;
  margin-bottom: 0.75rem;
  background: repeating-conic-gradient(rgb(229 231 235) 0% 25%, rgb(255 255 255) 0% 50%) 0 0 / 16px 16px;
}

.paint-canvas {
  position: absolute;
  inset: 0 0 0.75rem;
  width: 100%;
  height: calc(100% - 0.75rem);
  border-radius: 8px;
  cursor: crosshair;
  touch-action: none;
}

.paint-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.preview-info {
  font-size: 0.8rem;
  color: rgb(148, 163, 184);
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(148, 163, 184);
  margin-bottom: 0.75rem;
}

/* Size presets */
.size-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.size-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.6rem 0.4rem;
  border: 1px solid rgb(var(--border));
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.8rem;
  color: rgb(var(--foreground));
}

.size-btn:hover {
  border-color: rgb(var(--ring));
  background: rgb(var(--secondary));
}

.size-btn-active {
  border-color: rgb(var(--primary)) !important;
  background: rgb(var(--primary)) !important;
  color: rgb(var(--primary-foreground)) !important;
}

.size-dims {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 2px;
}

/* Colors */
.color-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.agnes-bg-btn {
  margin-left: auto;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--secondary));
  color: rgb(var(--foreground));
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.agnes-bg-btn:hover {
  border-color: rgb(var(--primary));
  color: rgb(var(--primary));
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.swatch-active {
  border-color: rgb(var(--foreground));
  box-shadow: 0 0 0 2px rgb(var(--primary));
}

.custom-color-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: rgb(148, 163, 184);
}

.custom-color-input {
  width: 24px;
  height: 24px;
  border: none;
  padding: 0;
  border-radius: 4px;
  cursor: pointer;
}

/* Sliders */
.slider-group {
  margin-bottom: 1rem;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgb(var(--foreground));
  margin-bottom: 0.4rem;
}

.slider-val {
  color: rgb(148, 163, 184);
  font-variant-numeric: tabular-nums;
}

.slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: rgb(var(--secondary));
  border-radius: 3px;
  outline: none;
}

.dark .slider {
  background: rgb(71 85 105);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgb(var(--primary));
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.slider::-moz-range-track {
  height: 6px;
  background: rgb(var(--secondary));
  border-radius: 3px;
}

.dark .slider::-moz-range-track {
  background: rgb(71 85 105);
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgb(var(--primary));
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* Buttons */
.action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 0 0 1.25rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  gap: 0.4rem;
  justify-content: center;
  min-width: 0;
  white-space: nowrap;
}

.btn-primary {
  background: rgb(var(--primary));
  color: rgb(var(--primary-foreground));
}

.btn-secondary {
  background: rgb(var(--secondary));
  color: rgb(var(--foreground));
  border: 1px solid rgb(var(--border));
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: rgb(var(--foreground));
  border: 1px solid rgb(var(--border));
}

.btn-outline:hover {
  background: rgb(var(--secondary));
}

.btn-ghost {
  background: transparent;
  color: rgb(148, 163, 184);
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-ghost:hover {
  color: rgb(var(--foreground));
}
</style>
