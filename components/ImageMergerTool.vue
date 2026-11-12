<template>
  <main
    class="merger-tool"
    :class="{ 'is-dragging': dragging }"
    @drop.prevent="onDrop"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
  >
    <section
      v-if="!images.length"
      class="drop-zone mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-16 text-center"
      :class="{ dragover: dragging }"
      role="button"
      tabindex="0"
      @click="fileInput?.click()"
      @keydown.enter.prevent="fileInput?.click()"
      @keydown.space.prevent="fileInput?.click()"
    >
      <div class="drop-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <path d="M15 17h4m-2-2v4" />
        </svg>
      </div>
      <h2 class="drop-title">{{ t('mergeTool.uploadTitle') }}</h2>
      <p class="drop-hint">{{ t('mergeTool.uploadHint') }}</p>
      <p class="drop-paste">{{ t('mergeTool.uploadPaste') }}</p>
      <span class="btn-primary mt-2">{{ t('mergeTool.addMore') }}</span>
    </section>

    <div v-else class="merger-grid">
      <section class="panel image-panel">
        <header class="panel-head">
          <h2>{{ t('mergeTool.imagesTitle') }}</h2>
          <span class="panel-count">{{ t('mergeTool.imagesCount', { count: images.length, max: MAX_FILES }) }}</span>
          <button type="button" class="link-btn" @click="clearAll">{{ t('mergeTool.clearAll') }}</button>
        </header>

        <ul class="image-list">
          <li v-for="(item, index) in images" :key="item.id" class="image-row">
            <span class="image-index">{{ index + 1 }}</span>
            <span class="thumb-wrap">
              <img :src="item.url" :alt="item.name" class="thumb" :style="{ transform: `rotate(${item.rotation}deg)` }" />
            </span>
            <span class="image-meta">
              <span class="image-name" :title="item.name">{{ item.name }}</span>
              <span class="image-dims">{{ item.width }} × {{ item.height }} px · {{ formatFileSize(item.file.size) }}</span>
            </span>
            <span class="row-actions">
              <button type="button" :disabled="index === 0" :aria-label="t('mergeTool.moveUp')" :title="t('mergeTool.moveUp')" @click="move(index, -1)">↑</button>
              <button type="button" :disabled="index === images.length - 1" :aria-label="t('mergeTool.moveDown')" :title="t('mergeTool.moveDown')" @click="move(index, 1)">↓</button>
              <button type="button" :aria-label="t('mergeTool.rotate')" :title="t('mergeTool.rotate')" @click="rotate(item)">⟳</button>
              <button type="button" class="danger" :aria-label="t('mergeTool.remove')" :title="t('mergeTool.remove')" @click="remove(item.id)">×</button>
            </span>
          </li>
        </ul>

        <button type="button" class="add-more" @click="fileInput?.click()">+ {{ t('mergeTool.addMore') }}</button>
      </section>

      <section class="panel settings-panel">
        <div class="field">
          <span class="field-label">{{ t('mergeTool.layout') }}</span>
          <div class="segmented" role="group" :aria-label="t('mergeTool.layout')">
            <button
              v-for="option in layoutOptions"
              :key="option.value"
              type="button"
              :class="{ active: layout === option.value }"
              :aria-pressed="layout === option.value"
              @click="layout = option.value"
            >{{ option.label }}</button>
          </div>
        </div>

        <div v-if="layout === 'grid'" class="field">
          <span class="field-label">{{ t('mergeTool.columns') }}</span>
          <div class="segmented segmented-sm" role="group" :aria-label="t('mergeTool.columns')">
            <button
              v-for="column in [2, 3, 4]"
              :key="column"
              type="button"
              :class="{ active: gridColumns === column }"
              :aria-pressed="gridColumns === column"
              @click="gridColumns = column"
            >{{ column }}</button>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="merger-strategy">{{ t('mergeTool.sizeStrategy') }}</label>
          <select id="merger-strategy" v-model="sizeStrategy" class="control">
            <option value="reduce">{{ t('mergeTool.strategyReduce') }}</option>
            <option value="magnify">{{ t('mergeTool.strategyMagnify') }}</option>
            <option value="crop">{{ t('mergeTool.strategyCrop') }}</option>
            <option value="none">{{ t('mergeTool.strategyNone') }}</option>
          </select>
          <p class="hint">{{ strategyHint }}</p>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="merger-gap">{{ t('mergeTool.gap') }}</label>
            <input id="merger-gap" v-model.number="gap" class="control" type="number" min="0" max="400" step="1" />
          </div>
          <div class="field">
            <label class="field-label" for="merger-padding">{{ t('mergeTool.padding') }}</label>
            <input id="merger-padding" v-model.number="padding" class="control" type="number" min="0" max="400" step="1" />
          </div>
        </div>

        <div class="field">
          <span class="field-label">{{ t('mergeTool.background') }}</span>
          <div class="color-row">
            <button
              v-for="option in backgroundOptions"
              :key="option.value"
              type="button"
              class="color-btn"
              :class="{ active: background === option.value }"
              :aria-pressed="background === option.value"
              @click="background = option.value"
            >
              <span class="swatch" :class="option.swatch" />
              {{ option.label }}
            </button>
            <label class="color-picker" :title="t('mergeTool.bgCustom')">
              <input v-model="customColor" type="color" @input="background = customColor" />
              <span>{{ t('mergeTool.bgCustom') }}</span>
            </label>
          </div>
        </div>

        <div class="field">
          <span class="field-label">{{ t('mergeTool.align') }}</span>
          <div class="segmented segmented-sm" role="group" :aria-label="t('mergeTool.align')">
            <button
              v-for="option in alignOptions"
              :key="option.value"
              type="button"
              :class="{ active: align === option.value }"
              :aria-pressed="align === option.value"
              @click="align = option.value"
            >{{ option.label }}</button>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="merger-format">{{ t('mergeTool.outputFormat') }}</label>
            <select id="merger-format" v-model="outputFormat" class="control">
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          <div v-if="outputFormat !== 'image/png'" class="field">
            <label class="field-label" for="merger-quality">{{ t('mergeTool.quality') }} — {{ Math.round(quality * 100) }}%</label>
            <input id="merger-quality" v-model.number="quality" class="range" type="range" min="0.5" max="1" step="0.01" />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="merger-target">{{ t('mergeTool.compressTarget') }}</label>
          <div class="target-row">
            <input id="merger-target" v-model.number="targetKb" class="control" type="number" min="10" max="5000" step="10" />
            <span class="target-unit">KB</span>
          </div>
        </div>

        <button type="button" class="preset-btn" @click="applyScreenshotPreset">
          <span aria-hidden="true">▤</span> {{ t('mergeTool.screenshotPreset') }}
        </button>

        <div class="summary">
          <div class="summary-row">
            <span>{{ t('mergeTool.outputSize') }}</span>
            <strong>{{ outputLabel }}</strong>
          </div>
          <div v-if="result" class="summary-row">
            <span>{{ t('mergeTool.fileSize') }}</span>
            <strong>{{ formatFileSize(result.bytes) }}</strong>
          </div>
        </div>

        <p v-if="scaledNote" class="notice">{{ scaledNote }}</p>
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

        <div class="action-row">
          <button type="button" class="btn-primary" :disabled="busy || !plan" @click="merge">
            {{ busy ? t('mergeTool.merging') : t('mergeTool.mergeButton') }}
          </button>
          <a v-if="result" class="btn-secondary" :href="result.url" :download="result.name">{{ t('mergeTool.download') }}</a>
        </div>

        <div class="preview" :class="{ checkerboard: background === 'transparent' }">
          <canvas ref="previewCanvas" :aria-label="t('mergeTool.resultTitle')" />
        </div>

        <p v-if="layout === 'vertical' && sizeStrategy === 'none'" class="no-resample">
          <span aria-hidden="true">✓</span> {{ t('mergeTool.noResample') }}
        </p>
      </section>
    </div>

    <input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.heic,.heif" multiple @change="onFileChange" />

    <footer class="tool-foot">
      <p class="privacy">{{ t('mergeTool.privacy') }}</p>
      <nav class="related" :aria-label="t('mergeTool.relatedTitle')">
        <NuxtLinkLocale :to="compressHref">{{ t('mergeTool.compressLink') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/image-resizer">{{ t('mergeTool.resizeLink') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/image-converter">{{ t('mergeTool.convertLink') }}</NuxtLinkLocale>
      </nav>
    </footer>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { encodeCanvas, formatFileSize } from '~/composables/useImageTools'

const { t } = useI18n()

const MAX_FILES = 20
const MAX_SOURCE_PIXELS = 50_000_000
const MAX_TOTAL_PIXELS = 200_000_000
const MAX_SIDE = 16384
const MAX_OUTPUT_PIXELS = 100_000_000

const images = ref([])
const fileInput = ref(null)
const previewCanvas = ref(null)
const dragging = ref(false)
const busy = ref(false)
const errorMessage = ref('')
const result = ref(null)

const layout = ref('vertical')
const sizeStrategy = ref('none')
const gridColumns = ref(2)
const gap = ref(0)
const padding = ref(0)
const background = ref('transparent')
const customColor = ref('#ffffff')
const align = ref('center')
const outputFormat = ref('image/png')
const quality = ref(0.92)
const targetKb = ref(500)

let nextId = 0
const rotationCache = new Map()

const layoutOptions = computed(() => [
  { value: 'vertical', label: t('mergeTool.layoutVertical') },
  { value: 'horizontal', label: t('mergeTool.layoutHorizontal') },
  { value: 'grid', label: t('mergeTool.layoutGrid') }
])

const alignOptions = computed(() => [
  { value: 'start', label: t('mergeTool.alignStart') },
  { value: 'center', label: t('mergeTool.alignCenter') },
  { value: 'end', label: t('mergeTool.alignEnd') }
])

const backgroundOptions = computed(() => [
  { value: 'transparent', label: t('mergeTool.bgTransparent'), swatch: 'swatch-transparent' },
  { value: '#ffffff', label: t('mergeTool.bgWhite'), swatch: 'swatch-white' },
  { value: '#000000', label: t('mergeTool.bgBlack'), swatch: 'swatch-black' }
])

const strategyHint = computed(() => {
  const key = {
    reduce: 'mergeTool.strategyReduceHint',
    magnify: 'mergeTool.strategyMagnifyHint',
    crop: 'mergeTool.strategyCropHint',
    none: 'mergeTool.strategyNoneHint'
  }[sizeStrategy.value]
  return t(key)
})

/**
 * Returns a drawable source for an image, baking the current rotation into an
 * offscreen canvas so every layout calculation can ignore rotation afterwards.
 */
function sourceOf(item) {
  if (!item.rotation) return { el: item.image, w: item.width, h: item.height }
  const key = `${item.id}:${item.rotation}`
  const cached = rotationCache.get(key)
  if (cached) return cached

  const swap = item.rotation % 180 !== 0
  const canvas = document.createElement('canvas')
  canvas.width = swap ? item.height : item.width
  canvas.height = swap ? item.width : item.height
  const context = canvas.getContext('2d')
  if (context) {
    context.translate(canvas.width / 2, canvas.height / 2)
    context.rotate((item.rotation * Math.PI) / 180)
    context.drawImage(item.image, -item.width / 2, -item.height / 2)
  }
  const source = { el: canvas, w: canvas.width, h: canvas.height }
  rotationCache.set(key, source)
  return source
}

function clamp(value, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return min
  return Math.min(max, Math.max(min, Math.round(number)))
}

const plan = computed(() => {
  const items = images.value.map(item => ({ item, source: sourceOf(item) }))
  const count = items.length
  if (!count) return null

  const spacing = clamp(gap.value, 0, 400)
  const margin = clamp(padding.value, 0, 400)
  const strategy = sizeStrategy.value
  const alignment = align.value
  const placements = []
  let contentWidth = 0
  let contentHeight = 0

  if (layout.value === 'vertical') {
    const widths = items.map(entry => entry.source.w)
    const targetWidth = strategy === 'reduce' || strategy === 'crop'
      ? Math.min(...widths)
      : Math.max(...widths)

    let offsetY = 0
    for (const entry of items) {
      const { w, h } = entry.source
      let drawWidth
      let drawHeight
      let sourceX = 0
      let sourceY = 0
      let sourceWidth = w
      let sourceHeight = h

      if (strategy === 'reduce' || strategy === 'magnify') {
        drawWidth = targetWidth
        drawHeight = Math.max(1, Math.round((h * targetWidth) / w))
      } else if (strategy === 'crop') {
        drawWidth = targetWidth
        drawHeight = h
        sourceWidth = targetWidth
        sourceX = Math.round((w - targetWidth) / 2)
      } else {
        drawWidth = w
        drawHeight = h
      }

      const offsetX = alignment === 'start' ? 0 : alignment === 'end' ? targetWidth - drawWidth : (targetWidth - drawWidth) / 2
      placements.push({
        source: entry.source,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        x: Math.round(offsetX) + margin,
        y: offsetY + margin,
        width: drawWidth,
        height: drawHeight
      })
      offsetY += drawHeight + spacing
    }
    contentWidth = targetWidth
    contentHeight = offsetY - spacing
  } else if (layout.value === 'horizontal') {
    const heights = items.map(entry => entry.source.h)
    const targetHeight = strategy === 'reduce' || strategy === 'crop'
      ? Math.min(...heights)
      : Math.max(...heights)

    let offsetX = 0
    for (const entry of items) {
      const { w, h } = entry.source
      let drawWidth
      let drawHeight
      let sourceX = 0
      let sourceY = 0
      let sourceWidth = w
      let sourceHeight = h

      if (strategy === 'reduce' || strategy === 'magnify') {
        drawHeight = targetHeight
        drawWidth = Math.max(1, Math.round((w * targetHeight) / h))
      } else if (strategy === 'crop') {
        drawWidth = w
        drawHeight = targetHeight
        sourceHeight = targetHeight
        sourceY = Math.round((h - targetHeight) / 2)
      } else {
        drawWidth = w
        drawHeight = h
      }

      const offsetY = alignment === 'start' ? 0 : alignment === 'end' ? targetHeight - drawHeight : (targetHeight - drawHeight) / 2
      placements.push({
        source: entry.source,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        x: offsetX + margin,
        y: Math.round(offsetY) + margin,
        width: drawWidth,
        height: drawHeight
      })
      offsetX += drawWidth + spacing
    }
    contentWidth = offsetX - spacing
    contentHeight = targetHeight
  } else {
    const columns = Math.min(4, Math.max(1, Number(gridColumns.value) || 2))
    const rows = Math.ceil(count / columns)
    const widths = items.map(entry => entry.source.w)
    const heights = items.map(entry => entry.source.h)
    const cellWidth = strategy === 'reduce' ? Math.min(...widths) : Math.max(...widths)
    const cellHeight = strategy === 'reduce' ? Math.min(...heights) : Math.max(...heights)

    for (let index = 0; index < count; index++) {
      const entry = items[index]
      const { w, h } = entry.source
      const cover = Math.max(cellWidth / w, cellHeight / h)
      const sourceWidth = Math.min(w, cellWidth / cover)
      const sourceHeight = Math.min(h, cellHeight / cover)
      const column = index % columns
      const row = Math.floor(index / columns)
      placements.push({
        source: entry.source,
        sourceX: (w - sourceWidth) / 2,
        sourceY: (h - sourceHeight) / 2,
        sourceWidth,
        sourceHeight,
        x: margin + column * (cellWidth + spacing),
        y: margin + row * (cellHeight + spacing),
        width: cellWidth,
        height: cellHeight
      })
    }
    contentWidth = columns * cellWidth + (columns - 1) * spacing
    contentHeight = rows * cellHeight + (rows - 1) * spacing
  }

  const width = Math.max(1, Math.round(contentWidth + margin * 2))
  const height = Math.max(1, Math.round(contentHeight + margin * 2))
  const scale = Math.min(1, MAX_SIDE / width, MAX_SIDE / height, Math.sqrt(MAX_OUTPUT_PIXELS / (width * height)))

  return {
    width,
    height,
    scale,
    outputWidth: Math.max(1, Math.round(width * scale)),
    outputHeight: Math.max(1, Math.round(height * scale)),
    placements
  }
})

const outputLabel = computed(() => {
  if (!plan.value) return '—'
  return `${plan.value.outputWidth} × ${plan.value.outputHeight} px`
})

const compressHref = computed(() => `/image-compress?size=${clamp(targetKb.value, 10, 5000)}`)

const scaledNote = computed(() => {
  if (!plan.value || plan.value.scale >= 1) return ''
  return t('mergeTool.scaledDown', { w: plan.value.outputWidth, h: plan.value.outputHeight })
})

function fillBackground(context, width, height) {
  const value = background.value
  const fill = value === 'transparent' && outputFormat.value === 'image/jpeg' ? '#ffffff' : value
  if (fill === 'transparent') return
  context.fillStyle = fill
  context.fillRect(0, 0, width, height)
}

function paint(context, currentPlan, scale) {
  context.save()
  context.scale(scale, scale)
  fillBackground(context, currentPlan.width, currentPlan.height)
  for (const placement of currentPlan.placements) {
    context.drawImage(
      placement.source.el,
      placement.sourceX,
      placement.sourceY,
      placement.sourceWidth,
      placement.sourceHeight,
      placement.x,
      placement.y,
      placement.width,
      placement.height
    )
  }
  context.restore()
}

function renderPreview() {
  const canvas = previewCanvas.value
  const currentPlan = plan.value
  if (!canvas || !currentPlan) return
  const scale = Math.min(1, 900 / currentPlan.width, 560 / currentPlan.height)
  canvas.width = Math.max(1, Math.round(currentPlan.width * scale))
  canvas.height = Math.max(1, Math.round(currentPlan.height * scale))
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  paint(context, currentPlan, scale)
}

watch(plan, () => nextTick(renderPreview))

function resetResult() {
  if (result.value) URL.revokeObjectURL(result.value.url)
  result.value = null
}

function addFiles(fileList) {
  const files = Array.from(fileList || [])
  if (!files.length) return
  errorMessage.value = ''

  const accepted = files.filter(file => file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name))
  if (!accepted.length) {
    errorMessage.value = t('mergeTool.errorNoImages')
    return
  }

  for (const file of accepted) {
    if (/\.hei[cf]$/i.test(file.name) || /image\/hei[cf]/i.test(file.type)) {
      errorMessage.value = t('mergeTool.errorHeic')
      continue
    }
    if (images.value.length >= MAX_FILES) {
      errorMessage.value = t('mergeTool.errorTooMany', { max: MAX_FILES })
      break
    }

    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      if (image.width * image.height > MAX_SOURCE_PIXELS) {
        URL.revokeObjectURL(url)
        errorMessage.value = t('mergeTool.errorTooLarge', { name: file.name })
        return
      }
      const total = images.value.reduce((sum, item) => sum + item.width * item.height, 0) + image.width * image.height
      if (total > MAX_TOTAL_PIXELS) {
        URL.revokeObjectURL(url)
        errorMessage.value = t('mergeTool.errorTotalTooLarge')
        return
      }
      images.value.push({
        id: nextId++,
        file,
        name: file.name,
        url,
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        rotation: 0
      })
      resetResult()
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      errorMessage.value = t('mergeTool.errorDecode', { name: file.name })
    }
    image.src = url
  }
}

function onFileChange(event) {
  addFiles(event.target.files)
  event.target.value = ''
}

function onDragOver() {
  dragging.value = true
}

function onDragLeave(event) {
  if (!event.currentTarget?.contains(event.relatedTarget)) dragging.value = false
}

function onDrop(event) {
  dragging.value = false
  addFiles(event.dataTransfer?.files)
}

function onPaste(event) {
  const pasted = Array.from(event.clipboardData?.items || [])
    .filter(item => item.kind === 'file')
    .map(item => item.getAsFile())
    .filter(Boolean)
  if (pasted.length) addFiles(pasted)
}

function revokeItem(item) {
  URL.revokeObjectURL(item.url)
  for (const rotation of [90, 180, 270]) rotationCache.delete(`${item.id}:${rotation}`)
}

function remove(id) {
  const index = images.value.findIndex(item => item.id === id)
  if (index < 0) return
  revokeItem(images.value[index])
  images.value.splice(index, 1)
  resetResult()
}

function move(index, direction) {
  const target = index + direction
  if (target < 0 || target >= images.value.length) return
  const list = images.value.slice()
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item)
  images.value = list
  resetResult()
}

function rotate(item) {
  item.rotation = (item.rotation + 90) % 360
  resetResult()
}

function clearAll() {
  images.value.forEach(revokeItem)
  images.value = []
  errorMessage.value = ''
  resetResult()
}

function applyScreenshotPreset() {
  layout.value = 'vertical'
  sizeStrategy.value = 'none'
  gap.value = 0
  padding.value = 0
  background.value = 'transparent'
  align.value = 'center'
  outputFormat.value = 'image/png'
  resetResult()
}

async function merge() {
  if (!plan.value || busy.value) return
  busy.value = true
  errorMessage.value = ''
  resetResult()

  try {
    const currentPlan = plan.value
    const canvas = document.createElement('canvas')
    canvas.width = currentPlan.outputWidth
    canvas.height = currentPlan.outputHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error(t('mergeTool.errorMerge'))

    paint(context, currentPlan, currentPlan.scale)

    const blob = await encodeCanvas(canvas, outputFormat.value, quality.value)
    const extension = outputFormat.value.split('/')[1].replace('jpeg', 'jpg')
    result.value = {
      blob,
      url: URL.createObjectURL(blob),
      bytes: blob.size,
      width: canvas.width,
      height: canvas.height,
      name: `merged-image-${canvas.width}x${canvas.height}.${extension}`
    }
  } catch (error) {
    errorMessage.value = error?.message || t('mergeTool.errorMerge')
  } finally {
    busy.value = false
  }
}

watch([layout, sizeStrategy, gridColumns, gap, padding, background, align, outputFormat, quality], resetResult)

onMounted(() => {
  window.addEventListener('paste', onPaste)
  nextTick(renderPreview)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', onPaste)
  images.value.forEach(revokeItem)
  resetResult()
})
</script>

<style scoped>
.merger-tool {
  padding: 24px clamp(16px, 3vw, 32px) 28px;
  color: rgb(var(--foreground));
}

.merger-tool.is-dragging {
  outline: 2px dashed rgb(var(--primary));
  outline-offset: -8px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.drop-zone {
  cursor: pointer;
}

.drop-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 18px;
  border-radius: 50%;
  background: rgb(var(--primary) / 0.12);
  color: rgb(var(--primary));
}

.drop-icon svg {
  width: 32px;
  height: 32px;
}

.drop-title {
  margin: 0 0 6px;
  font-size: 1.25rem;
  font-weight: 700;
}

.drop-hint {
  margin: 0;
  color: rgb(var(--foreground) / 0.6);
  font-size: 0.9rem;
}

.drop-paste {
  margin: 6px 0 16px;
  color: rgb(var(--foreground) / 0.42);
  font-size: 0.8rem;
}

.merger-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: start;
}

@media (max-width: 900px) {
  .merger-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.panel {
  border: 1.5px solid rgb(var(--border));
  border-radius: 18px;
  background: rgb(var(--card));
  padding: 16px;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.panel-head h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.panel-count {
  color: rgb(var(--foreground) / 0.5);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
}

.link-btn {
  margin-inline-start: auto;
  border: 0;
  background: transparent;
  color: rgb(var(--accent));
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 420px;
  overflow-y: auto;
}

.image-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid rgb(var(--border));
  border-radius: 12px;
  background: rgb(var(--secondary) / 0.55);
}

.image-index {
  width: 20px;
  flex: 0 0 20px;
  color: rgb(var(--foreground) / 0.45);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  text-align: center;
}

.thumb-wrap {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgb(var(--border));
  background: repeating-conic-gradient(rgb(var(--foreground) / 0.06) 0% 25%, transparent 0% 50%) 50% / 12px 12px;
}

.thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.image-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.image-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
  font-weight: 600;
}

.image-dims {
  color: rgb(var(--foreground) / 0.5);
  font-size: 0.72rem;
}

.row-actions {
  display: flex;
  gap: 3px;
  flex: 0 0 auto;
}

.row-actions button {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgb(var(--border));
  border-radius: 7px;
  background: rgb(var(--card));
  color: rgb(var(--foreground) / 0.75);
  font-size: 0.8rem;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.row-actions button:hover:not(:disabled) {
  border-color: rgb(var(--primary));
  color: rgb(var(--primary));
}

.row-actions button.danger:hover {
  border-color: rgb(var(--accent));
  color: rgb(var(--accent));
}

.row-actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.add-more {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border: 1.5px dashed rgb(var(--primary) / 0.4);
  border-radius: 12px;
  background: transparent;
  color: rgb(var(--primary));
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.add-more:hover {
  border-color: rgb(var(--primary));
  background: rgb(var(--primary) / 0.06);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-label {
  color: rgb(var(--foreground) / 0.62);
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.control {
  min-height: 38px;
  width: 100%;
  border: 1px solid rgb(var(--input));
  border-radius: 10px;
  padding: 0 10px;
  background: rgb(var(--card));
  color: rgb(var(--foreground));
  font: inherit;
  font-size: 0.86rem;
}

.control:focus-visible {
  outline: 2px solid rgb(var(--ring));
  outline-offset: 1px;
}

.hint {
  margin: 0;
  color: rgb(var(--foreground) / 0.5);
  font-size: 0.76rem;
  line-height: 1.5;
}

.segmented {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgb(var(--border));
  border-radius: 11px;
  background: rgb(var(--secondary) / 0.7);
}

.segmented button {
  flex: 1;
  padding: 7px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: rgb(var(--foreground) / 0.65);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.segmented button.active {
  background: rgb(var(--primary));
  color: rgb(var(--primary-foreground));
}

.segmented-sm button {
  font-size: 0.76rem;
}

.color-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.color-btn,
.color-picker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid rgb(var(--border));
  border-radius: 9px;
  background: rgb(var(--card));
  color: rgb(var(--foreground) / 0.72);
  font-size: 0.76rem;
  cursor: pointer;
}

.color-btn.active {
  border-color: rgb(var(--primary));
  color: rgb(var(--primary));
  box-shadow: inset 0 0 0 1px rgb(var(--primary) / 0.4);
}

.color-picker input {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgb(var(--foreground) / 0.25);
}

.swatch-transparent {
  background: repeating-conic-gradient(rgb(var(--foreground) / 0.25) 0% 25%, transparent 0% 50%) 50% / 8px 8px;
}

.swatch-white {
  background: #fff;
}

.swatch-black {
  background: #000;
}

.range {
  width: 100%;
  accent-color: rgb(var(--primary));
}

.target-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-unit {
  color: rgb(var(--foreground) / 0.55);
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
}

.preset-btn {
  width: 100%;
  margin-bottom: 14px;
  padding: 9px 12px;
  border: 1.5px solid rgb(var(--accent) / 0.45);
  border-radius: 10px;
  background: rgb(var(--accent) / 0.07);
  color: rgb(var(--accent));
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.preset-btn:hover {
  background: rgb(var(--accent) / 0.12);
  border-color: rgb(var(--accent));
}

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;
  padding: 11px 13px;
  border: 1px solid rgb(var(--border));
  border-radius: 11px;
  background: rgb(var(--secondary) / 0.55);
}

.summary-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.8rem;
}

.summary-row span {
  color: rgb(var(--foreground) / 0.55);
}

.summary-row strong {
  font-family: 'DM Mono', monospace;
  font-size: 0.82rem;
}

.notice {
  margin: 10px 0 0;
  padding: 9px 11px;
  border-radius: 9px;
  background: rgb(var(--primary) / 0.08);
  color: rgb(var(--primary));
  font-size: 0.78rem;
  line-height: 1.5;
}

.error {
  margin: 10px 0 0;
  padding: 9px 11px;
  border-radius: 9px;
  background: rgb(var(--accent) / 0.1);
  color: rgb(var(--accent));
  font-size: 0.8rem;
  line-height: 1.5;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.action-row .btn-primary,
.action-row .btn-secondary {
  flex: 1;
  min-width: 140px;
}

.preview {
  display: grid;
  place-items: center;
  margin-top: 14px;
  padding: 10px;
  border: 1px solid rgb(var(--border));
  border-radius: 12px;
  background: rgb(var(--secondary) / 0.5);
  min-height: 120px;
  overflow: hidden;
}

.preview.checkerboard {
  background: repeating-conic-gradient(rgb(var(--foreground) / 0.07) 0% 25%, transparent 0% 50%) 50% / 16px 16px;
}

.preview canvas {
  max-width: 100%;
  height: auto;
  display: block;
  box-shadow: 0 6px 20px -12px rgb(0 0 0 / 0.6);
}

.no-resample {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0;
  color: rgb(var(--primary));
  font-size: 0.78rem;
  font-weight: 600;
}

.tool-foot {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid rgb(var(--border));
}

.privacy {
  margin: 0 0 8px;
  color: rgb(var(--foreground) / 0.55);
  font-size: 0.78rem;
}

.related {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  font-size: 0.84rem;
}

.related a {
  color: rgb(var(--primary));
  font-weight: 600;
  text-decoration: none;
}

.related a:hover {
  text-decoration: underline;
}

@media (max-width: 520px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .image-row {
    flex-wrap: wrap;
  }

  .image-meta {
    flex-basis: calc(100% - 120px);
  }
}
</style>
