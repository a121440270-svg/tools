<template>
  <main class="svg-tool">
    <header class="tool-heading">
      <span class="eyebrow">VECTOR TO RASTER</span>
      <h1>{{ t('imageTools.svg.title') }}</h1>
      <p>{{ t('imageTools.svg.description') }}</p>
    </header>

    <section v-if="!source" class="drop-zone" :class="{ dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false">
      <input ref="fileInput" class="visually-hidden" type="file" accept="image/svg+xml,.svg" @click.stop @change="onFileChange" />
      <span class="upload-mark">◇</span>
      <strong>{{ t('imageTools.uploadPrompt') }}</strong>
      <small>{{ t('imageTools.localProcessing') }}</small>
    </section>

    <section v-else class="workspace">
      <div class="toolbar"><strong :title="fileName">{{ fileName }}</strong><button class="button secondary" type="button" :disabled="processing" @click="clearSource">{{ t('imageTools.svg.chooseAnother') }}</button><input ref="fileInput" class="visually-hidden" type="file" accept="image/svg+xml,.svg" @change="onFileChange" /></div>
      <div class="settings">
        <label>{{ t('imageTools.width') }}<input v-model.number="width" type="number" min="1" max="12000" :disabled="processing" /></label>
        <label>{{ t('imageTools.height') }}<input v-model.number="height" type="number" min="1" max="12000" :disabled="processing" /></label>
        <label class="format-field">{{ t('imageTools.resizer.outputFormat') }}
          <select v-model="format" :disabled="processing"><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>
        </label>
        <button class="button primary" type="button" :disabled="processing" @click="convert">{{ processing ? t('imageTools.converter.converting', { current: 1, total: 1 }) : t('imageTools.svg.convertButton') }}</button>
        <a v-if="resultUrl" class="button download" :href="resultUrl" :download="resultName">{{ t('imageTools.download') }}</a>
      </div>
      <div class="preview-grid">
        <figure><figcaption>{{ t('imageTools.original') }}</figcaption><div class="preview-wrap"><img :src="source.url" :alt="fileName" /></div></figure>
        <figure v-if="resultUrl"><figcaption>{{ t('imageTools.result') }}</figcaption><div class="preview-wrap"><img :src="resultUrl" :alt="resultName" /></div></figure>
      </div>
      <p v-if="errorMessage" class="notice error" role="alert">{{ errorMessage }}</p>
    </section>

    <footer class="privacy-note">{{ t('imageTools.localProcessing') }}</footer>
    <nav class="related" :aria-label="t('imageTools.relatedTitle')">
      <NuxtLinkLocale to="/image-converter">{{ t('imageTools.converter.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-info">{{ t('imageTools.info.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-resizer">{{ t('imageTools.resizer.title') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { encodeCanvas, fileStem, loadLocalImage } from '~/composables/useImageTools'

const { t } = useI18n()
const source = ref(null)
const fileInput = ref(null)
const dragging = ref(false)
const width = ref(1024)
const height = ref(768)
const format = ref('image/png')
const processing = ref(false)
const errorMessage = ref('')
const resultUrl = ref('')
const resultName = ref('')
let fileName = ''

useHead(() => ({
  title: t('imageTools.svg.seoTitle'),
  meta: [
    { name: 'description', content: t('imageTools.svg.seoDescription') },
    { name: 'keywords', content: t('imageTools.svg.seoKeywords') }
  ]
}))

function sanitizeSvg(text) {
  const document = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (document.querySelector('parsererror') || document.documentElement.localName !== 'svg') throw new Error(t('imageTools.svg.invalidFile'))
  document.querySelectorAll('script,foreignObject,iframe,object,embed,image,audio,video,style').forEach(element => element.remove())
  for (const element of document.querySelectorAll('*')) {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()
      if (name.startsWith('on') || name === 'src' || name === 'srcset') {
        element.removeAttribute(attribute.name)
      } else if ((name === 'href' || name.endsWith(':href')) && !value.startsWith('#')) {
        element.removeAttribute(attribute.name)
      } else if ((name === 'style' || /url\s*\(/i.test(value)) && /url\s*\((?!\s*['"]?#)/i.test(value)) {
        element.removeAttribute(attribute.name)
      }
    }
  }
  const root = document.documentElement
  root.removeAttribute('onload')
  const viewBox = root.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number)
  const intrinsicWidth = parseFloat(root.getAttribute('width'))
  const intrinsicHeight = parseFloat(root.getAttribute('height'))
  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    width.value = Math.round(viewBox[2])
    height.value = Math.round(viewBox[3])
  } else {
    width.value = Number.isFinite(intrinsicWidth) && intrinsicWidth > 0 ? Math.round(intrinsicWidth) : 1024
    height.value = Number.isFinite(intrinsicHeight) && intrinsicHeight > 0 ? Math.round(intrinsicHeight) : 768
  }
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  return new Blob([new XMLSerializer().serializeToString(root)], { type: 'image/svg+xml' })
}

async function addFile(file) {
  if (!file) return
  clearSource()
  try {
    const text = await file.text()
    if (text.length > 10 * 1024 * 1024) throw new Error(t('imageTools.svg.fileTooLarge'))
    const safeBlob = sanitizeSvg(text)
    const loaded = await loadLocalImage(safeBlob)
    source.value = { file, blob: safeBlob, url: loaded.url, image: loaded.image }
    fileName = file.name
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error?.message || t('imageTools.svg.invalidFile')
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

watch([width, height, format], clearResult)

function clearSource() {
  clearResult()
  if (source.value?.url) URL.revokeObjectURL(source.value.url)
  source.value = null
  fileName = ''
  errorMessage.value = ''
}

async function convert() {
  processing.value = true
  errorMessage.value = ''
  try {
    const outputWidth = Number(width.value)
    const outputHeight = Number(height.value)
    if (!Number.isInteger(outputWidth) || !Number.isInteger(outputHeight) || outputWidth < 1 || outputHeight < 1 || outputWidth > 12000 || outputHeight > 12000 || outputWidth * outputHeight > 100_000_000) throw new Error(t('imageTools.svg.invalidDimensions'))
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error(t('imageTools.svg.convertError'))
    context.drawImage(source.value.image, 0, 0, outputWidth, outputHeight)
    const blob = await encodeCanvas(canvas, format.value)
    clearResult()
    resultUrl.value = URL.createObjectURL(blob)
    resultName.value = `${fileStem(source.value.file.name)}.${format.value.split('/')[1]}`
  } catch (error) {
    errorMessage.value = error?.message || t('imageTools.svg.convertError')
  } finally {
    processing.value = false
  }
}

onBeforeUnmount(clearSource)
</script>

<style scoped>
.svg-tool { --ink: #202a2a; --muted: #667373; --line: #d9e1dc; --accent: #176c59; --wash: #f1f6f1; max-width: 980px; margin: 0 auto; padding: 42px 24px 72px; color: var(--ink); }
.tool-heading { margin-bottom: 28px; }
.eyebrow { color: var(--accent); font: 700 11px/1.4 ui-monospace, Consolas, monospace; }
.tool-heading h1 { margin: 8px 0; font-size: 32px; line-height: 1.15; font-weight: 750; }
.tool-heading p { max-width: 680px; margin: 0; color: var(--muted); line-height: 1.6; }
.drop-zone { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 1px dashed #8ea79a; background: repeating-linear-gradient(135deg, #f7faf6 0, #f7faf6 14px, #f2f7f1 14px, #f2f7f1 28px); cursor: pointer; text-align: center; padding: 24px; }
.drop-zone.dragging { outline: 3px solid #176c5940; border-color: var(--accent); }
.drop-zone small { color: var(--muted); }
.upload-mark { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; background: var(--accent); color: white; font-size: 25px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.toolbar, .settings { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.toolbar { justify-content: space-between; }
.toolbar strong { max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.settings label { display: grid; gap: 5px; color: var(--muted); font-size: 13px; }
.settings input, .settings select { width: 116px; height: 38px; border: 1px solid var(--line); padding: 0 9px; background: transparent; color: var(--ink); }
.button { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; padding: 0 14px; text-decoration: none; font: inherit; font-size: 14px; cursor: pointer; }
.button:disabled { opacity: .55; cursor: default; }
.primary, .download { background: var(--accent); color: white; }
.secondary { border-color: var(--line); background: transparent; color: var(--ink); }
.preview-grid { display: flex; flex-wrap: wrap; gap: 20px; padding-top: 18px; }
.preview-grid figure { flex: 1 1 260px; min-width: 0; margin: 0; }
.preview-grid figcaption { margin-bottom: 8px; color: var(--muted); font-size: 13px; }
.preview-wrap { min-height: 180px; display: grid; place-items: center; border: 1px solid var(--line); background: repeating-conic-gradient(#eef2ed 0 25%, white 0 50%) 0 / 18px 18px; }
.preview-wrap img { max-width: 100%; max-height: 420px; object-fit: contain; }
.notice { padding: 10px 12px; color: #a33e31; background: #fff3ef; }
.privacy-note { margin: 20px 0; color: var(--muted); font-size: 13px; }
.related { display: flex; flex-wrap: wrap; gap: 10px 22px; border-top: 1px solid var(--line); padding-top: 18px; }
.related a { color: var(--accent); text-underline-offset: 3px; }
@media (max-width: 640px) { .svg-tool { padding: 28px 16px 52px; } .tool-heading h1 { font-size: 27px; } }
</style>

<style>
.dark .svg-tool { --ink: #e4ece8; --muted: #b3c1bb; --line: #3a4943; --wash: #202d28; }
.dark .svg-tool .drop-zone { background: repeating-linear-gradient(135deg, #202d28 0, #202d28 14px, #26352f 14px, #26352f 28px); }
.dark .svg-tool .preview-wrap { background: repeating-conic-gradient(#2b3833 0 25%, #202d28 0 50%) 0 / 18px 18px; }
.dark .svg-tool .related a { color: #7bd8b6; }
</style>