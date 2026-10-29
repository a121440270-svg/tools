<template>
  <div class="increase-page">
    <div class="page-header">
      <div class="header-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
          <path d="M12 5v14"/>
          <path d="M5 12h14"/>
          <path d="M7 7l10 10"/>
        </svg>
      </div>
      <div>
        <h1>{{ $t('imageTools.increase.title') }}</h1>
        <p>{{ $t('imageTools.increase.description') }}</p>
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
        <div class="section-title">{{ $t('imageTools.increase.targetSize') }}</div>
        <div class="preset-grid">
          <button v-for="preset in sizePresets" :key="preset.value" type="button" class="preset-btn" :class="{ active: preset.value === targetValue && targetUnit === preset.unit }" @click="selectPreset(preset)">
            {{ preset.label }}
          </button>
        </div>

        <div class="size-input-row">
          <input v-model.number="targetValue" type="number" min="1" max="5000" step="1" />
          <select v-model="targetUnit">
            <option value="kb">KB</option>
            <option value="mb">MB</option>
          </select>
        </div>

        <div class="section-title mt-6">{{ $t('imageTools.output') }}</div>
        <label class="toggle-row">
          <input v-model="keepDimensions" type="checkbox" />
          <span>{{ $t('imageTools.increase.keepDimensions') }}</span>
        </label>

        <div class="format-row">
          <label>{{ $t('imageTools.format') }}</label>
          <select v-model="outputFormat">
            <option value="original">{{ $t('imageTools.sameAsOriginal') }}</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
          </select>
        </div>

        <div class="action-row">
          <button type="button" class="primary-btn" :disabled="processing || !images.length" @click="processImage">
            <span v-if="processing" class="spinner"></span>
            {{ processing ? $t('imageTools.processingCount', { current: processingCount, total: images.length }) : $t('imageTools.increase.action', { count: images.length }) }}
          </button>
          <button v-if="resultUrl" type="button" class="secondary-btn" @click="downloadResult">{{ $t('imageTools.download') }}</button>
          <button v-if="images.some(image => image.resultUrl)" type="button" class="secondary-btn" :disabled="processing" @click="downloadAll">{{ $t('imageTools.downloadAll') }}</button>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </div>

      <div class="panel result-panel">
        <div class="result-header">{{ imageName }} · {{ selectedImageIndex + 1 }} / {{ images.length }}</div>
        <div class="stats-box">
          <div class="stat-row">
            <span>{{ $t('imageTools.original') }}</span>
            <strong>{{ formatBytes(fileSize) }}</strong>
          </div>
          <div class="stat-row">
            <span>{{ $t('imageTools.dimensions') }}</span>
            <strong>{{ sourceWidth }} × {{ sourceHeight }}</strong>
          </div>
          <div class="stat-row">
            <span>{{ $t('imageTools.target') }}</span>
            <strong>{{ targetValue }} {{ targetUnit.toUpperCase() }}</strong>
          </div>
          <div v-if="resultSize" class="stat-row accent">
            <span>{{ $t('imageTools.result') }}</span>
            <strong>{{ formatBytes(resultSize) }}</strong>
          </div>
        </div>

        <div class="preview-grid">
          <div class="preview-column">
            <span>{{ $t('imageTools.original') }}</span>
            <div class="preview-wrap">
              <img :src="imageUrl" :alt="$t('imageTools.originalPreview', { name: imageName })" />
            </div>
          </div>
          <div class="preview-column">
            <span>{{ $t('imageTools.result') }}</span>
            <div class="preview-wrap result-preview">
              <img v-if="resultUrl" :src="resultUrl" :alt="$t('imageTools.outputPreview', { name: imageName })" />
              <span v-else class="preview-placeholder">{{ $t('imageTools.processToPreview') }}</span>
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
            <span class="batch-item-status">{{ item.image.resultUrl ? $t('imageTools.doneSize', { size: formatBytes(item.image.resultSize) }) : formatBytes(item.image.fileSize) }}</span>
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
        <NuxtLinkLocale to="/image-aspect-ratio">{{ $t('imageTools.related.aspectRatio') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/image-to-webp">{{ $t('imageTools.related.toWebp') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/webp-to-png">{{ $t('imageTools.related.webpToPng') }}</NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
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
const resultUrl = computed(() => selectedImage.value?.resultUrl || '')
const sourceImage = computed(() => selectedImage.value?.image || null)
const sourceWidth = computed(() => selectedImage.value?.width || 0)
const sourceHeight = computed(() => selectedImage.value?.height || 0)
const fileSize = computed(() => selectedImage.value?.fileSize || 0)
const resultSize = computed(() => selectedImage.value?.resultSize || 0)
const imageName = computed(() => selectedImage.value?.name || '')
const processing = ref(false)
const errorMessage = ref('')
const processingCount = ref(0)
const keepDimensions = ref(true)
const outputFormat = ref('original')
const targetValue = ref(100)
const targetUnit = ref('kb')
const targetBytes = computed(() => {
  const value = Number(targetValue.value) || 0
  if (value <= 0) return 0
  return targetUnit.value === 'mb' ? value * 1024 * 1024 : value * 1024
})

const sizePresets = [
  { label: '50 KB', value: 50, unit: 'kb' },
  { label: '100 KB', value: 100, unit: 'kb' },
  { label: '200 KB', value: 200, unit: 'kb' },
  { label: '300 KB', value: 300, unit: 'kb' },
  { label: '500 KB', value: 500, unit: 'kb' },
  { label: '1 MB', value: 1, unit: 'mb' }
]

useToolSeo({
  title: () => t('imageTools.increase.seoTitle'),
  description: () => t('imageTools.increase.seoDescription'),
  keywords: () => t('imageTools.increase.seoKeywords')
})

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function selectPreset(item) {
  targetValue.value = item.value
  targetUnit.value = item.unit
}

function resolveMimeType(image = selectedImage.value) {
  if (outputFormat.value === 'original') {
    return ['image/png', 'image/webp', 'image/jpeg'].includes(image?.mimeType) ? image.mimeType : 'image/jpeg'
  }
  return outputFormat.value
}

function ensureMinimumSize(blob, minimumBytes) {
  if (blob.size >= minimumBytes) return blob
  const buffer = new Uint8Array(blob.size + Math.max(1024, minimumBytes - blob.size))
  const content = new Uint8Array(blob.size)
  const reader = new FileReader()

  return new Promise(resolve => {
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result)
      buffer.set(bytes, 0)
      for (let index = bytes.length; index < buffer.length; index += 1) {
        buffer[index] = 0x20
      }
      resolve(new Blob([buffer.slice(0, minimumBytes)], { type: blob.type }))
    }
    reader.readAsArrayBuffer(blob)
  })
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise(resolve => {
    canvas.toBlob(resolve, mimeType, quality)
  })
}

async function processImage() {
  if (!images.value.length || processing.value) return
  const minTarget = targetBytes.value
  if (!minTarget || minTarget <= 0) {
    errorMessage.value = t('imageTools.increase.invalidTarget')
    return
  }

  processing.value = true
  errorMessage.value = ''
  processingCount.value = 0
  let failedCount = 0

  try {
    for (const image of images.value) {
      if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
      image.resultUrl = ''
      image.resultBlob = null
      image.resultSize = 0

      if (image.fileSize >= minTarget) {
        failedCount += 1
        continue
      }

      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        failedCount += 1
        continue
      }

      ctx.drawImage(image.image, 0, 0)
      let outputBlob = await canvasToBlob(canvas, resolveMimeType(image), 0.95)
      if (!outputBlob) {
        failedCount += 1
        continue
      }
      if (outputBlob.size < minTarget) {
        outputBlob = await ensureMinimumSize(outputBlob, minTarget)
      }

      image.resultBlob = outputBlob
      image.resultSize = outputBlob.size
      image.resultMimeType = outputBlob.type
      image.resultUrl = URL.createObjectURL(outputBlob)
      processingCount.value += 1
    }
  } finally {
    processing.value = false
  }

  if (failedCount) {
    errorMessage.value = t('imageTools.increase.skippedImages', { count: failedCount })
  }
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
  if (wasEmpty && addedImages.length) selectedImageIndex.value = 0
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
      mimeType: file.type,
      fileSize: file.size,
      width: image.naturalWidth,
      height: image.naturalHeight,
      resultUrl: '',
      resultBlob: null,
      resultSize: 0,
      resultMimeType: ''
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
}

function clearAll() {
  images.value.forEach(image => {
    URL.revokeObjectURL(image.url)
    if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
  })
  images.value = []
  selectedImageIndex.value = 0
  imageSearch.value = ''
  errorMessage.value = ''
}

function downloadResult() {
  if (!resultUrl.value) return
  const selected = selectedImage.value
  const link = document.createElement('a')
  link.href = resultUrl.value
  link.download = getOutputName(selected)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

async function downloadAll() {
  const completed = images.value.filter(image => image.resultBlob)
  if (!completed.length) return
  if (completed.length === 1) {
    const link = document.createElement('a')
    link.href = completed[0].resultUrl
    link.download = getOutputName(completed[0])
    link.click()
    return
  }

  const zip = new JSZip()
  const names = new Map()
  completed.forEach(image => {
    const outputName = getOutputName(image)
    const count = (names.get(outputName) || 0) + 1
    names.set(outputName, count)
    const uniqueName = count === 1
      ? outputName
      : `${outputName.replace(/\.[^/.]+$/, '')} (${count})${outputName.match(/\.[^.]+$/)?.[0] || ''}`
    zip.file(uniqueName, image.resultBlob)
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'increased-image-sizes.zip'
  link.click()
  URL.revokeObjectURL(url)
}

function getOutputName(image) {
  const mimeType = image.resultMimeType || resolveMimeType(image)
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'
  const safeBase = (image.name || 'image').replace(/\.[^/.]+$/, '')
  const unit = targetUnit.value === 'mb' ? 'mb' : 'kb'
  return `${safeBase}-${targetValue.value}${unit}.${extension}`
}

onBeforeUnmount(() => {
  images.value.forEach(image => {
    URL.revokeObjectURL(image.url)
    if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
  })
})
</script>

<style scoped>
.increase-page {
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
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.1;
  font-weight: 800;
}

.page-header p {
  margin: 8px 0 0;
  color: #9ca3af;
  max-width: 700px;
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
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
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

.batch-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  color: #cbd5e1;
}

.batch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.add-images-btn {
  display: inline-flex;
  align-items: center;
}

.tool-grid {
  display: grid;
  grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
  gap: 24px;
}

.panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  padding: 22px;
}

.section-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 12px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.preset-btn {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.5);
  color: #e2e8f0;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.preset-btn.active {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(74, 222, 128, 0.6);
  color: #bbf7d0;
}

.size-input-row {
  display: grid;
  grid-template-columns: 1fr 110px;
  gap: 10px;
  margin-top: 16px;
}

.size-input-row input,
.size-input-row select,
.format-row select {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
  width: 100%;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #dfe7f3;
  margin-top: 18px;
}

.format-row {
  display: grid;
  gap: 8px;
  margin-top: 16px;
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
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.secondary-btn {
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
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

.error-text {
  margin-top: 16px;
  color: #fca5a5;
}

.result-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-header {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
  font-weight: 700;
}

.stats-box {
  display: grid;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.5);
}

.stat-row.accent {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(74, 222, 128, 0.3);
}

.preview-wrap {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.7);
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-wrap img {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  display: block;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.preview-column {
  display: grid;
  gap: 8px;
  min-width: 0;
  color: #cbd5e1;
  font-size: 0.85rem;
}

.preview-placeholder {
  padding: 16px;
  color: #94a3b8;
  text-align: center;
}

.thumbnail-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
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
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(74, 222, 128, 0.7);
  box-shadow: inset 0 0 0 1px rgba(74, 222, 128, 0.2);
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
  overflow: hidden;
  color: #94a3b8;
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumbnail-empty {
  grid-column: 1 / -1;
  margin: 0;
  padding: 16px 8px;
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 860px) {
  .tool-grid {
    grid-template-columns: 1fr;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .batch-toolbar,
  .thumbnail-toolbar {
    align-items: stretch;
    flex-direction: column;
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
