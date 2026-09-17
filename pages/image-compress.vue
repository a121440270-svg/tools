<template>
  <div class="img-compress-page">
    <div class="page-header">
      <div class="header-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
          <path d="M21 8v13H3V8"/>
          <path d="M1 3h22v5H1z"/>
          <path d="M10 12h4"/>
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('compress.title') }}</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ t('compress.subtitle') }}</p>
      </div>
    </div>

    <!-- Upload -->
    <div v-if="!images.length" class="upload-zone" @click="$refs.fileInput.click()" @drop.prevent="onDrop" @dragover.prevent>
      <div class="upload-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
      <p class="upload-text">{{ t('compress.uploadText') }}</p>
      <p class="upload-hint">{{ t('compress.uploadHint') }}</p>
      <input ref="fileInput" type="file" accept="image/*" multiple @change="onFileChange" class="hidden" />
    </div>

    <!-- Image list -->
    <div v-else class="compress-layout">
      <!-- Left: image list -->
      <div class="list-panel">
        <div class="panel-top">
          <span class="count-badge">{{ images.length }} {{ t('compress.images') }}</span>
          <button class="btn-clear" @click="clearAll">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            {{ t('compress.clearAll') }}
          </button>
        </div>

        <div class="image-list">
          <div v-for="(img, idx) in images" :key="idx" :class="['img-card', img.processed ? 'done' : 'pending']" @click="selectedImage = idx">
            <div class="thumb-wrap">
              <img :src="img.preview" class="thumb" />
              <div v-if="img.processed" class="check-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-4 h-4">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
            <div class="img-meta">
              <div class="img-name">{{ img.name }}</div>
              <div class="img-sizes">
                <span class="size-origin">{{ formatBytes(img.original) }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3 mx-1">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
                <span :class="['size-compressed', img.reduced ? 'reduced' : '']">{{ img.compressed ? formatBytes(img.compressed) : '--' }}</span>
              </div>
              <div v-if="img.reduced" class="savings-badge">-{{ Math.round((1 - img.compressed / img.original) * 100) }}%</div>
            </div>
          </div>
        </div>

        <!-- Compress button -->
        <button v-if="!processing && images.some(i => !i.processed)" class="btn btn-primary btn-block" @click="startCompress">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2">
            <path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12v4"/>
          </svg>
          {{ t('compress.start') }}
        </button>
        <button v-if="processing" class="btn btn-primary btn-block" disabled>
          <span class="spinner mr-2"></span>
          {{ t('compress.processing') }}
        </button>
        <button v-if="allDone" class="btn btn-success btn-block" @click="downloadAll">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 mr-2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ t('compress.downloadAll') }}
        </button>
      </div>

      <!-- Right: settings panel -->
      <div class="settings-panel">
        <div class="section-title">{{ t('compress.settings') }}</div>

        <!-- Quality -->
        <div class="slider-group">
          <div class="slider-label">
            <span>{{ t('compress.quality') }}</span>
            <span class="slider-val">{{ quality }}%</span>
          </div>
          <input type="range" v-model.number="quality" min="1" max="100" class="slider" />
          <div class="quality-presets">
            <button :class="['preset-btn', quality === 80 ? 'active' : '']" @click="quality = 80">High</button>
            <button :class="['preset-btn', quality === 60 ? 'active' : '']" @click="quality = 60">Medium</button>
            <button :class="['preset-btn', quality === 40 ? 'active' : '']" @click="quality = 40">Low</button>
            <button :class="['preset-btn', quality === 20 ? 'active' : '']" @click="quality = 20">Extreme</button>
          </div>
        </div>

        <!-- Max dimension -->
        <div class="slider-group">
          <div class="slider-label">
            <span>{{ t('compress.maxDim') }}</span>
          </div>
          <select v-model.number="maxDim" class="select-input">
            <option :value="0">{{ t('compress.originalSize') }}</option>
            <option :value="1920">1920px</option>
            <option :value="1280">1280px</option>
            <option :value="800">800px</option>
            <option :value="640">640px</option>
          </select>
        </div>

        <!-- Output format -->
        <div class="slider-group">
          <div class="slider-label">
            <span>{{ t('compress.format') }}</span>
          </div>
          <div class="format-tabs">
            <button :class="['format-tab', outputFormat === 'jpeg' ? 'active' : '']" @click="outputFormat = 'jpeg'">JPEG</button>
            <button :class="['format-tab', outputFormat === 'webp' ? 'active' : '']" @click="outputFormat = 'webp'">WebP</button>
            <button :class="['format-tab', outputFormat === 'png' ? 'active' : '']" @click="outputFormat = 'png'">PNG</button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-box" v-if="totalSaved > 0">
          <div class="stat-row">
            <span>{{ t('compress.totalSaved') }}</span>
            <span class="stat-value positive">-{{ formatBytes(totalSaved) }}</span>
          </div>
          <div class="stat-row">
            <span>{{ t('compress.savingsRate') }}</span>
            <span class="stat-value positive">{{ Math.round(savingsRate) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import JSZip from 'jszip'
const { t } = useI18n()

useHead({
  title: t('compress.title') + ' | OnliTool',
  meta: [
    { name: 'description', content: t('compress.seoDesc') },
    { name: 'keywords', content: '图片压缩,image compression,online compressor,jpg png webp' }
  ]
})

const fileInput = ref(null)
const images = ref([])
const selectedImage = ref(0)
const processing = ref(false)
const quality = ref(60)
const maxDim = ref(0)
const outputFormat = ref('jpeg')

const allDone = computed(() => images.value.length > 0 && images.value.every(i => i.processed))
const totalOriginal = computed(() => images.value.reduce((s, i) => s + (i.original || 0), 0))
const totalCompressed = computed(() => images.value.reduce((s, i) => s + (i.compressed || 0), 0))
const totalSaved = computed(() => Math.max(0, totalOriginal.value - totalCompressed.value))
const savingsRate = computed(() => totalOriginal.value > 0 ? ((totalOriginal.value - totalCompressed.value) / totalOriginal.value) * 100 : 0)

function onFileChange(e) {
  Array.from(e.target.files).forEach(addImage)
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e) {
  Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(addImage)
}

function addImage(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      images.value.push({
        name: file.name,
        preview: e.target.result,
        file,
        original: file.size,
        compressed: null,
        processed: false,
        imgEl: img
      })
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function clearAll() {
  images.value = []
  selectedImage.value = 0
}

function compressImage(imgData) {
  return new Promise((resolve) => {
    const img = imgData.imgEl
    let w = img.naturalWidth
    let h = img.naturalHeight
    if (maxDim.value > 0 && Math.max(w, h) > maxDim.value) {
      const ratio = maxDim.value / Math.max(w, h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (outputFormat.value === 'jpeg') ctx.fillStyle = '#ffffff'
    ctx.drawImage(img, 0, 0, w, h)

    const mime = outputFormat.value === 'png' ? 'image/png' : `image/${outputFormat.value}`
    canvas.toBlob(
      (blob) => resolve(blob),
      mime,
      quality.value / 100
    )
  })
}

async function startCompress() {
  processing.value = true
  for (let i = 0; i < images.value.length; i++) {
    if (images.value[i].processed) continue
    const blob = await compressImage(images.value[i])
    images.value[i].compressed = blob.size
    images.value[i].reduced = blob.size < images.value[i].original
    images.value[i].processed = true
    // Create download URL lazily
    if (!images.value[i].blobUrl) {
      images.value[i].blobUrl = URL.createObjectURL(blob)
    }
  }
  processing.value = false
}

function downloadSingle(idx) {
  const img = images.value[idx]
  if (!img.blobUrl) return
  const link = document.createElement('a')
  link.download = 'compressed_' + img.name
  link.href = img.blobUrl
  link.click()
}

async function downloadAll() {
  if (images.value.length === 1) {
    downloadSingle(0)
    return
  }
  const zip = new JSZip()
  images.value.forEach(img => {
    if (img.blobUrl) {
      zip.file('compressed_' + img.name, fetch(img.blobUrl).then(r => r.blob()))
    }
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'compressed_images.zip'
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 5000)
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.img-compress-page {
  max-width: 1100px;
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

/* Upload zone */
.upload-zone {
  border: 2px dashed rgb(var(--border));
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgb(var(--card));
}

.upload-zone:hover {
  border-color: rgb(var(--ring));
  background: rgb(var(--secondary));
}

.upload-icon-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: rgb(var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--primary));
  transition: all 0.2s;
}

.upload-zone:hover .upload-icon-wrap {
  transform: scale(1.1);
  background: rgb(var(--accent));
  color: rgb(var(--accent-foreground));
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--foreground));
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.85rem;
  color: rgb(148, 163, 184);
}

.hidden { display: none; }

/* Layout */
.compress-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 900px) {
  .compress-layout {
    grid-template-columns: 1fr;
  }
}

.list-panel, .settings-panel {
  background: rgb(var(--card));
  border: 1px solid rgb(var(--border));
  border-radius: 16px;
  padding: 1.5rem;
}

.panel-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.count-badge {
  font-size: 0.85rem;
  font-weight: 600;
  background: rgb(var(--secondary));
  color: rgb(var(--foreground));
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: rgb(148, 163, 184);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-clear:hover {
  color: #ef4444;
  background: rgb(254, 242, 242);
}

.dark .btn-clear:hover {
  background: rgb(68, 20, 20);
}

/* Image list */
.image-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.img-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.img-card:hover {
  background: rgb(var(--secondary));
}

.img-card.done {
  border-color: rgb(var(--border));
}

.thumb-wrap {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: rgb(var(--secondary));
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.check-badge {
  position: absolute;
  inset: 0;
  background: rgba(34, 197, 94, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.img-meta {
  flex: 1;
  min-width: 0;
}

.img-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgb(var(--foreground));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.img-sizes {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgb(148, 163, 184);
  margin-top: 2px;
}

.size-origin {
  text-decoration: line-through;
}

.size-compressed {
  font-weight: 600;
}

.size-compressed.reduced {
  color: #16a34a;
}

.dark .size-compressed.reduced {
  color: #4ade80;
}

.savings-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #16a34a;
  background: rgb(240, 253, 244);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.4rem;
}

.dark .savings-badge {
  background: rgb(20, 50, 20);
  color: #4ade80;
}

/* Settings panel */
.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgb(148, 163, 184);
  margin-bottom: 1rem;
}

.slider-group {
  margin-bottom: 1.25rem;
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

.quality-presets {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.preset-btn {
  flex: 1;
  padding: 0.3rem;
  font-size: 0.75rem;
  border: 1px solid rgb(var(--border));
  border-radius: 6px;
  background: transparent;
  color: rgb(var(--foreground));
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover {
  border-color: rgb(var(--ring));
}

.preset-btn.active {
  background: rgb(var(--primary));
  color: rgb(var(--primary-foreground));
  border-color: rgb(var(--primary));
}

.select-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgb(var(--border));
  border-radius: 8px;
  background: transparent;
  color: rgb(var(--foreground));
  font-size: 0.85rem;
  cursor: pointer;
}

.format-tabs {
  display: flex;
  gap: 0.4rem;
}

.format-tab {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgb(var(--border));
  border-radius: 8px;
  background: transparent;
  color: rgb(var(--foreground));
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.format-tab:hover {
  border-color: rgb(var(--ring));
}

.format-tab.active {
  background: rgb(var(--primary));
  color: rgb(var(--primary-foreground));
  border-color: rgb(var(--primary));
}

/* Stats */
.stats-box {
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 10px;
  background: rgb(var(--secondary));
  border: 1px solid rgb(var(--border));
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgb(var(--foreground));
  padding: 0.3rem 0;
}

.stat-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stat-value.positive {
  color: #16a34a;
}

.dark .stat-value.positive {
  color: #4ade80;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  gap: 0.5rem;
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: rgb(var(--primary));
  color: rgb(var(--primary-foreground));
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-success {
  background: #16a34a;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-1px);
}

.btn-block {
  margin-top: 0.75rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
