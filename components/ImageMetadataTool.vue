<template>
  <main class="metadata-tool">
    <header class="tool-heading">
      <span class="eyebrow">{{ cleanExif ? 'IMAGE PRIVACY' : 'IMAGE INSPECTOR' }}</span>
      <h1>{{ t(`imageTools.${toolKey}.title`) }}</h1>
      <p>{{ t(`imageTools.${toolKey}.description`) }}</p>
      <ExifGuideLink />
    </header>

    <section v-if="!images.length" class="drop-zone" :class="{ dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false">
      <input ref="fileInput" class="visually-hidden" type="file" :accept="cleanExif ? 'image/jpeg,image/png,image/webp,image/bmp,image/avif,.jpg,.jpeg,.png,.webp,.bmp,.avif' : 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif'" :multiple="cleanExif" @click.stop @change="onFileChange" />
      <span class="upload-mark">⌕</span>
      <strong>{{ t('imageTools.uploadPrompt') }}</strong>
      <small>{{ t('imageTools.localProcessing') }}</small>
    </section>

    <section v-else class="workspace">
      <div class="toolbar">
        <strong>{{ images.length }} {{ t('imageTools.images') }}</strong>
        <div class="toolbar-actions">
          <button class="button secondary" type="button" :disabled="processing" @click="fileInput?.click()">{{ t('imageTools.addImages') }}</button>
          <button class="button secondary" type="button" :disabled="processing" @click="clearAll">{{ t('imageTools.clearAll') }}</button>
          <input ref="fileInput" class="visually-hidden" type="file" :accept="cleanExif ? 'image/jpeg,image/png,image/webp,image/bmp,image/avif,.jpg,.jpeg,.png,.webp,.bmp,.avif' : 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif'" :multiple="cleanExif" @click.stop @change="onFileChange" />
        </div>
      </div>

      <div class="tool-grid" :class="{ compact: cleanExif, 'info-view': !cleanExif }">
        <div v-if="cleanExif" class="settings-panel">
          <label class="format-field">{{ t('imageTools.exif.outputFormat') }}
            <select v-model="format" :disabled="processing"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>
          </label>
          <button class="button primary" type="button" :disabled="processing || !pendingCount" @click="cleanAll">{{ processing ? t('imageTools.converter.converting', { current: processedCount, total: images.length }) : t('imageTools.exif.removeButton') }}</button>
          <button v-if="completedCount > 1" class="button secondary" type="button" :disabled="processing" @click="downloadZip">{{ t('imageTools.downloadAll') }}</button>
          <p class="privacy-message">{{ t('imageTools.exif.privacyNote') }}</p>
          <div class="file-list">
            <article v-for="image in images" :key="image.id" class="file-row">
              <img :src="image.resultUrl || image.url" :alt="image.file.name" />
              <div class="file-details">
                <strong :title="image.file.name">{{ image.file.name }}</strong>
                <span>{{ image.resultBlob ? t('imageTools.done') : formatFileSize(image.file.size) }}</span>
                <span v-if="image.metadataFields.length">{{ t('imageTools.info.metadataFound', { count: image.metadataFields.length }) }}</span>
                <span v-else>{{ t('imageTools.info.noMetadata') }}</span>
                <span v-for="warning in metadataWarnings(image)" :key="warning" class="privacy-warning">{{ t(`imageTools.info.${warning}`) }}</span>
                <span v-if="image.error" class="error-text">{{ image.error }}</span>
              </div>
              <a v-if="image.resultUrl" class="button download" :href="image.resultUrl" :download="image.outputName">{{ t('imageTools.download') }}</a>
            </article>
          </div>
        </div>

        <div v-else class="info-layout">
          <div class="thumbnail-list">
            <button v-for="(image, index) in images" :key="image.id" type="button" :class="{ active: selectedIndex === index }" @click="selectedIndex = index">
              <img :src="image.url" :alt="image.file.name" /><span>{{ image.file.name }}</span>
            </button>
          </div>
          <div v-if="selected" class="info-panel">
            <img class="preview" :src="selected.url" :alt="selected.file.name" />
            <dl class="info-table">
              <div><dt>{{ t('imageTools.info.fileName') }}</dt><dd>{{ selected.file.name }}</dd></div>
              <div><dt>{{ t('imageTools.info.fileSize') }}</dt><dd>{{ formatFileSize(selected.file.size) }}</dd></div>
              <div><dt>{{ t('imageTools.dimensions') }}</dt><dd>{{ selected.width }} × {{ selected.height }} px</dd></div>
              <div><dt>{{ t('imageTools.info.aspectRatio') }}</dt><dd>{{ ratio(selected.width, selected.height) }}</dd></div>
              <div><dt>{{ t('imageTools.format') }}</dt><dd>{{ selected.file.type || extension(selected.file.name) }}</dd></div>
              <div><dt>{{ t('imageTools.info.colorMode') }}</dt><dd>{{ t('imageTools.info.decodedMode') }}</dd></div>
            </dl>
            <div v-if="summaryFields(selected).length" class="metadata-summary">
              <h2>基本信息</h2>
              <dl class="info-table metadata-table">
                <div v-for="field in summaryFields(selected)" :key="field.key">
                  <dt>{{ field.labelKey ? t(field.labelKey) : prettifyLabel(field.tag) }}</dt>
                  <dd>{{ field.value }}</dd>
                </div>
              </dl>
            </div>
            <div v-if="metadataWarnings(selected).length" class="metadata-alert">
              <strong>{{ t('imageTools.info.privacyWarnings') }}</strong>
              <span v-for="warning in metadataWarnings(selected)" :key="warning">{{ t(`imageTools.info.${warning}`) }}</span>
            </div>
            <dl v-if="selectedCoordinates" class="info-table metadata-table">
              <div class="location-row">
                <dt>{{ t('imageTools.info.location') }}</dt>
                <dd>
                  <button class="button secondary" type="button" :disabled="selected.locationLoading" @click="lookupLocation">
                    {{ selected.locationLoading ? t('imageTools.info.locationLoading') : t('imageTools.info.locationLookup') }}
                  </button>
                  <small>{{ t('imageTools.info.locationPrivacy') }}</small>
                  <p v-if="selected.locationAddress">{{ selected.locationAddress }}</p>
                  <small><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{{ t('imageTools.info.locationAttribution') }}</a></small>
                  <small v-if="selected.locationError" class="location-error">{{ t(selected.locationError) }}</small>
                </dd>
              </div>
            </dl>
            <section class="technical-section">
              <details class="technical-details">
                <summary class="technical-summary">
                  <span>技术详情</span>
                  <small v-if="selected.metadataFields.length">（共 {{ selected.metadataFields.length }} 项）</small>
                </summary>
                <div v-if="selected.metadataGroups.length" class="metadata-overview">
                  <span v-for="group in selected.metadataGroups" :key="group.key">{{ t(`imageTools.info.${group.labelKey}`) }} · {{ group.fields.length }}</span>
                </div>
                <section v-for="group in selected.metadataGroups" :key="group.key" class="metadata-section">
                  <h3>{{ t(`imageTools.info.${group.labelKey}`) }} <small>{{ group.fields.length }}</small></h3>
                  <dl class="info-table metadata-table">
                    <div v-for="field in group.fields" :key="field.key"><dt>{{ field.labelKey ? t(field.labelKey) : prettifyLabel(field.key) }}</dt><dd>{{ field.value }}</dd></div>
                  </dl>
                </section>
              </details>
            </section>
            <p v-if="!selected.metadataFields.length">{{ t('imageTools.info.noMetadata') }}</p>
          </div>
        </div>
      </div>
      <p v-if="errorMessage" class="notice error" role="alert">{{ errorMessage }}</p>
    </section>

    <footer class="privacy-note">{{ t('imageTools.localProcessing') }}</footer>
    <nav class="related" :aria-label="t('imageTools.relatedTitle')">
      <NuxtLinkLocale to="/image-metadata">{{ t('imageTools.metadataHub.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/exif-editor">{{ t('imageTools.exifEditor.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-to-base64">{{ t('imageTools.base64.toTitle') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-color-picker">{{ t('imageTools.colorPicker.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale v-if="!cleanExif" to="/remove-exif">{{ t('imageTools.exif.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale v-else to="/image-info">{{ t('imageTools.info.title') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import JSZip from 'jszip'
import { encodeCanvas, fileStem, formatFileSize, loadLocalImage } from '~/composables/useImageTools'

const props = defineProps({ cleanExif: { type: Boolean, default: false }, variant: { type: String, default: '' } })
const { t } = useI18n()
const images = ref([])
const fileInput = ref(null)
const dragging = ref(false)
const selectedIndex = ref(0)
const format = ref('image/jpeg')
const processing = ref(false)
const processedCount = ref(0)
const errorMessage = ref('')
let nextId = 0
const selected = computed(() => images.value[selectedIndex.value] || null)
const toolKey = computed(() => props.variant || (props.cleanExif ? 'exif' : 'info'))
const pendingCount = computed(() => images.value.some(image => !image.resultBlob))
const completedCount = computed(() => images.value.filter(image => image.resultBlob).length)
const selectedCoordinates = computed(() => {
  const fields = selected.value?.metadataFields || []
  let latitude = NaN
  let longitude = NaN
  for (const field of fields) {
    const tag = field.tag?.toLowerCase()
    if (tag === 'latitude' || tag === 'gpslatitude' || tag === 'gpslatitude' || field.key?.toLowerCase().includes('latitude')) {
      latitude = Number(field.value)
    }
    if (tag === 'longitude' || tag === 'gpslongitude' || field.key?.toLowerCase().includes('longitude')) {
      longitude = Number(field.value)
    }
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    const grouped = selected.value?.metadataGroups || []
    const gpsGroup = grouped.find(g => g.key === 'gps')
    if (gpsGroup) {
      for (const field of gpsGroup.fields) {
        const key = field.key?.toLowerCase()
        if (key.includes('latitude')) latitude = Number(field.value)
        if (key.includes('longitude')) longitude = Number(field.value)
      }
    }
  }
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null
})

watch(format, () => {
  for (const image of images.value) {
    if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
    image.resultBlob = null
    image.resultUrl = ''
    image.outputName = ''
    image.error = ''
  }
})

useToolSeo({
  title: () => t(`imageTools.${toolKey.value}.seoTitle`),
  description: () => t(`imageTools.${toolKey.value}.seoDescription`),
  keywords: () => t(`imageTools.${toolKey.value}.seoKeywords`),
  applicationCategory: 'MultimediaApplication'
})

function ratio(width, height) {
  if (!width || !height) return '—'
  let a = width
  let b = height
  while (b) [a, b] = [b, a % b]
  return `${width / a}:${height / a}`
}

function extension(name) {
  return name.split('.').pop()?.toUpperCase() || 'Unknown'
}

function displayValue(value) {
  if (value instanceof Date) return value.toLocaleString()
  if (ArrayBuffer.isView(value)) return `Binary data (${value.byteLength} bytes)`
  if (value instanceof ArrayBuffer) return `Binary data (${value.byteLength} bytes)`
  if (Array.isArray(value)) return value.slice(0, 30).map(item => typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)).join(', ') + (value.length > 30 ? ', ...' : '')
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(5)
  const text = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)
  return text.length > 500 ? `${text.slice(0, 500)}...` : text
}

const metadataSections = {
  ifd0: 'groupImage', exif: 'groupExif', gps: 'groupGps', iptc: 'groupIptc',
  xmp: 'groupXmp', icc: 'groupIcc', jfif: 'groupJfif', ihdr: 'groupPng',
  interop: 'groupInterop', ifd1: 'groupThumbnail'
}
const metadataFieldLabels = {
  Make: 'imageTools.info.cameraMake', Model: 'imageTools.info.cameraModel',
  DateTimeOriginal: 'imageTools.info.dateTaken', Software: 'imageTools.info.software',
  latitude: 'imageTools.info.latitude', longitude: 'imageTools.info.longitude'
}

function flattenMetadata(groupKey, value, prefix, fields, depth = 0) {
  if (value === undefined || value === null || fields.length >= 250) return
  if (value instanceof Date || ArrayBuffer.isView(value) || value instanceof ArrayBuffer || typeof value !== 'object' || Array.isArray(value)) {
    const tag = prefix.split('.').pop() || prefix
    fields.push({ key: prefix, tag, labelKey: metadataFieldLabels[tag] || '', value: displayValue(value) })
    return
  }
  if (depth >= 5) {
    fields.push({ key: prefix, tag: prefix.split('.').pop() || prefix, labelKey: '', value: displayValue(value) })
    return
  }
  for (const [key, nestedValue] of Object.entries(value)) {
    flattenMetadata(groupKey, nestedValue, prefix ? `${prefix}.${key}` : key, fields, depth + 1)
  }
}

function organizeMetadata(data) {
  const groups = []
  const fields = []
  for (const [section, value] of Object.entries(data || {})) {
    if (section === 'errors' || value === undefined || value === null) continue
    const key = Object.hasOwn(metadataSections, section) ? section : 'xmp'
    let group = groups.find(item => item.key === key)
    if (!group) {
      group = { key, labelKey: metadataSections[key], fields: [] }
      groups.push(group)
    }
    flattenMetadata(key, value, '', group.fields)
  }
  for (const group of groups) fields.push(...group.fields)
  return { groups: groups.filter(group => group.fields.length), fields }
}

function metadataWarnings(image) {
  const fields = image?.metadataFields || []
  const groups = image?.metadataGroups || []
  const tags = fields.map(field => field.tag.toLowerCase())
  const warnings = []
  if (groups.some(group => group.key === 'gps')) warnings.push('gpsWarning')
  if (tags.some(tag => /make|model|serial|lens|firmware|software|owner/.test(tag))) warnings.push('deviceWarning')
  if (tags.some(tag => /date|time|timestamp/.test(tag))) warnings.push('dateWarning')
  if (tags.some(tag => /artist|creator|author|copyright|comment|description|byline|caption/.test(tag))) warnings.push('authorWarning')
  if (groups.some(group => group.key === 'ifd1')) warnings.push('thumbnailWarning')
  return warnings
}

function prettifyLabel(label) {
  if (!label) return ''
  const parts = label.split('.')
  const last = parts[parts.length - 1]
  return last.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()
}

const rawGpsTags = /^(GPSLatitude|GPSLongitude|GPSLatitudeRef|GPSLongitudeRef|GPSAltitude|GPSDest|GPSArea|GPSProcessing|GPSVersion|GPSMapDatum|GPSDifferential)/

function summaryFields(image) {
  if (!image?.metadataFields) return []
  const priorityTags = ['Make', 'Model', 'DateTimeOriginal', 'DateTime', 'Software', 'latitude', 'longitude']
  const priority = []
  const seen = new Set()
  const add = (field) => {
    if (field && !seen.has(field.key)) {
      priority.push(field)
      seen.add(field.key)
    }
  }
  for (const tag of priorityTags) {
    const lower = tag.toLowerCase()
    add(image.metadataFields.find(f => f.tag?.toLowerCase() === lower || f.key?.toLowerCase() === lower))
  }
  for (const field of image.metadataFields) {
    if (seen.has(field.key) || rawGpsTags.test(field.tag || '')) continue
    if (/^(Make|Model|Lens|Artist|Copyright|Description|UserComment|DateTime|ExposureTime|FNumber|ISOSpeed|FocalLength|Flash|WhiteBalance|Orientation|ColorSpace)/i.test(field.tag || '')) add(field)
  }
  return priority.slice(0, 20)
}

async function readMetadata(file) {
  try {
    const module = await import('exifr')
    const parse = module.parse || module.default?.parse
    const data = await parse(file, {
      tiff: true, exif: true, gps: true, interop: true, ifd1: true,
      makerNote: true, userComment: true, iptc: true, xmp: true,
      icc: true, jfif: true, ihdr: true, mergeOutput: false
    })
    return organizeMetadata(data)
  } catch {
    return { groups: [], fields: [] }
  }
}

async function lookupLocation() {
  const image = selected.value
  const coordinates = selectedCoordinates.value
  if (!image || !coordinates || image.locationLoading) return
  image.locationLoading = true
  image.locationError = ''
  image.locationAddress = ''
  try {
    const query = new URLSearchParams({
      format: 'jsonv2',
      lat: String(coordinates.latitude),
      lon: String(coordinates.longitude),
      zoom: '18'
    })
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`, {
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) throw new Error('lookup-failed')
    const result = await response.json()
    image.locationAddress = result.display_name || ''
    if (!image.locationAddress) image.locationError = 'imageTools.info.locationNotFound'
  } catch {
    image.locationError = 'imageTools.info.locationLookupError'
  } finally {
    image.locationLoading = false
  }
}

async function addFiles(fileList) {
  const candidates = Array.from(fileList || []).filter(file => /^(image\/(jpeg|png|webp|gif|bmp|avif))$/i.test(file.type) || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name))
  for (const file of candidates) {
    try {
      if (props.cleanExif && (/^image\/gif$/i.test(file.type) || /\.gif$/i.test(file.name))) {
        errorMessage.value = t('imageTools.exif.animatedGifUnsupported')
        continue
      }
      const loaded = await loadLocalImage(file)
      if (loaded.image.naturalWidth * loaded.image.naturalHeight > 100_000_000) {
        URL.revokeObjectURL(loaded.url)
        throw new Error(t('imageTools.converter.imageTooLarge'))
      }
      const metadata = await readMetadata(file)
      images.value.push({ id: nextId++, file, image: loaded.image, url: loaded.url, width: loaded.image.naturalWidth, height: loaded.image.naturalHeight, metadataGroups: metadata.groups, metadataFields: metadata.fields, resultBlob: null, resultUrl: '', outputName: '', error: '', locationLoading: false, locationAddress: '', locationError: '' })
    } catch (error) {
      errorMessage.value = error?.message || t('imageTools.info.readError', { name: file.name })
    }
  }
  if (!candidates.length && fileList?.length) errorMessage.value = t('imageTools.converter.noFiles')
}

function onFileChange(event) {
  addFiles(event.target.files)
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  addFiles(event.dataTransfer?.files)
}

function clearAll() {
  for (const image of images.value) {
    URL.revokeObjectURL(image.url)
    if (image.resultUrl) URL.revokeObjectURL(image.resultUrl)
  }
  images.value = []
  selectedIndex.value = 0
  errorMessage.value = ''
}

async function cleanOne(image) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error(t('imageTools.exif.processError'))
  if (format.value === 'image/jpeg') {
    context.fillStyle = '#fff'
    context.fillRect(0, 0, image.width, image.height)
  }
  context.drawImage(image.image, 0, 0)
  const blob = await encodeCanvas(canvas, format.value)
  return { blob, name: `${fileStem(image.file.name)}-clean.${format.value.split('/')[1].replace('jpeg', 'jpg')}` }
}

async function cleanAll() {
  processing.value = true
  processedCount.value = 0
  errorMessage.value = ''
  try {
    for (const image of images.value) {
      if (!image.resultBlob) {
        try {
          const result = await cleanOne(image)
          image.resultBlob = result.blob
          image.outputName = result.name
          image.resultUrl = URL.createObjectURL(result.blob)
          image.error = ''
        } catch (error) {
          image.error = error?.message || t('imageTools.exif.processError')
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
  const used = new Set()
  for (const image of images.value.filter(item => item.resultBlob)) {
    let name = image.outputName
    let suffix = 1
    while (used.has(name)) {
      const dot = image.outputName.lastIndexOf('.')
      name = `${image.outputName.slice(0, dot)}-${suffix++}${image.outputName.slice(dot)}`
    }
    used.add(name)
    zip.file(name, image.resultBlob)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'images-without-metadata.zip'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onBeforeUnmount(clearAll)
</script>

<style scoped>
.metadata-tool { --ink: #202a2a; --muted: #667373; --line: #d9e1dc; --accent: #176c59; --wash: #f1f6f1; max-width: 980px; margin: 0 auto; padding: 42px 24px 72px; color: var(--ink); }
.tool-heading { margin-bottom: 28px; }
.eyebrow { color: var(--accent); font: 700 11px/1.4 ui-monospace, Consolas, monospace; }
.tool-heading h1 { margin: 8px 0; font-size: 32px; line-height: 1.15; font-weight: 750; }
.tool-heading p { max-width: 680px; margin: 0; color: var(--muted); line-height: 1.6; }
.drop-zone { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 1px dashed #8ea79a; background: repeating-linear-gradient(135deg, #f7faf6 0, #f7faf6 14px, #f2f7f1 14px, #f2f7f1 28px); cursor: pointer; text-align: center; padding: 24px; }
.drop-zone.dragging { outline: 3px solid #176c5940; border-color: var(--accent); }
.drop-zone small { color: var(--muted); }
.upload-mark { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; background: var(--accent); color: white; font-size: 25px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.toolbar, .toolbar-actions { display: flex; align-items: center; gap: 10px; }
.toolbar { justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--line); }
.toolbar-actions { flex-wrap: wrap; }
.tool-grid { display: grid; grid-template-columns: minmax(210px, .7fr) minmax(0, 1.3fr); gap: 20px; padding-top: 20px; }
.tool-grid.compact { display: block; }
.tool-grid.info-view { display: block; }
.settings-panel { display: grid; align-content: start; gap: 12px; }
.format-field { display: grid; gap: 6px; color: var(--muted); font-size: 13px; }
.format-field select { min-height: 38px; border: 1px solid var(--line); padding: 0 10px; background: transparent; color: var(--ink); }
.button { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; padding: 0 14px; text-decoration: none; font: inherit; font-size: 14px; cursor: pointer; }
.button:disabled { opacity: .55; cursor: default; }
.primary, .download { background: var(--accent); color: white; }
.secondary { border-color: var(--line); background: transparent; color: var(--ink); }
.privacy-message, .privacy-note { color: var(--muted); font-size: 13px; line-height: 1.5; }
.file-list { display: grid; margin-top: 10px; }
.file-row { min-width: 0; display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line); }
.file-row img { width: 48px; height: 48px; object-fit: contain; background: var(--wash); }
.file-details { min-width: 0; display: grid; gap: 4px; }
.file-details strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-details span { color: var(--muted); font-size: 13px; }
.file-details .privacy-warning { color: #9a541e; }
.error-text, .error { color: #a33e31 !important; }
.info-layout { min-width: 0; display: grid; grid-template-columns: minmax(160px, .55fr) minmax(0, 1.45fr); gap: 18px; padding-top: 18px; }
.thumbnail-list { display: grid; align-content: start; gap: 4px; }
.thumbnail-list button { min-width: 0; display: flex; align-items: center; gap: 9px; border: 1px solid transparent; padding: 6px; background: transparent; color: var(--ink); text-align: left; cursor: pointer; }
.thumbnail-list button.active { border-color: var(--accent); background: var(--wash); }
.thumbnail-list img { width: 42px; height: 42px; object-fit: contain; background: var(--wash); }
.thumbnail-list span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.info-panel { min-width: 0; }
.preview { width: min(100%, 420px); max-height: 300px; object-fit: contain; background: var(--wash); border: 1px solid var(--line); }
.info-panel h2 { margin: 22px 0 8px; font-size: 16px; }
.metadata-overview { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 10px 0 14px; color: var(--muted); font-size: 13px; }
.metadata-alert { display: grid; gap: 5px; margin: 12px 0 18px; border-left: 3px solid #bd7130; padding: 10px 12px; background: #fff5e9; color: #703d19; font-size: 13px; }
.metadata-summary { margin: 18px 0 10px; }
.metadata-summary h2 { margin: 0 0 8px; font-size: 15px; }
.technical-section { margin: 16px 0 18px; }
.technical-details { border: 1px solid var(--line); background: var(--wash); }
.technical-summary { padding: 10px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
.technical-summary small { color: var(--muted); font-weight: 400; }
.technical-details[open] .technical-summary { border-bottom: 1px solid var(--line); }
.technical-details > div, .technical-details > section { padding: 10px 12px; }
.metadata-section { margin: 18px 0; }
.metadata-section h3 { margin: 0; border-bottom: 1px solid var(--line); padding-bottom: 7px; font-size: 14px; }
.metadata-section h3 small { margin-left: 5px; color: var(--muted); font-weight: 400; }
.info-table { display: grid; margin: 12px 0 0; }
.info-table > div { display: grid; grid-template-columns: minmax(120px, .55fr) minmax(0, 1.45fr); gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--line); }
.info-table dt { color: var(--muted); }
.info-table dd { margin: 0; overflow-wrap: anywhere; }
.location-row dd { display: grid; justify-items: start; gap: 8px; }
.location-row p { margin: 0; }
.location-row small { color: var(--muted); font-size: 12px; }
.location-row a { color: var(--accent); }
.location-row .location-error { color: #a33e31; }
.metadata-table p { color: var(--muted); }
.notice { padding: 10px 12px; background: #fff3ef; }
.privacy-note { margin: 20px 0; }
.related { display: flex; flex-wrap: wrap; gap: 10px 22px; border-top: 1px solid var(--line); padding-top: 18px; }
.related a { color: var(--accent); text-underline-offset: 3px; }
@media (max-width: 700px) { .metadata-tool { padding: 28px 16px 52px; } .tool-heading h1 { font-size: 27px; } .tool-grid, .info-layout { grid-template-columns: 1fr; } .thumbnail-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } .file-row { grid-template-columns: 42px minmax(0, 1fr); } .file-row img { width: 42px; height: 42px; } .file-row .download { grid-column: 2; justify-self: start; } .info-table > div { grid-template-columns: minmax(100px, .7fr) minmax(0, 1.3fr); } }
</style>

<style>
.dark .metadata-tool { --ink: #e4ece8; --muted: #b3c1bb; --line: #3a4943; --wash: #202d28; }
.dark .metadata-tool .drop-zone { background: repeating-linear-gradient(135deg, #202d28 0, #202d28 14px, #26352f 14px, #26352f 28px); }
.dark .metadata-tool .related a { color: #7bd8b6; }
.dark .metadata-tool .metadata-alert { border-color: #d39a63; background: #3a2d22; color: #f0c89f; }
.dark .metadata-tool .file-details .privacy-warning { color: #e9ad73; }
</style>