<template>
  <main class="color-tool">
    <header class="tool-heading">
      <span class="eyebrow">DESIGN + WEB TOOL</span>
      <h1>{{ t('imageTools.colorPicker.title') }}</h1>
      <p>{{ t('imageTools.colorPicker.description') }}</p>
    </header>

    <section v-if="!image" class="drop-zone" :class="{ dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false">
      <input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.svg" @click.stop @change="onFileChange" />
      <span class="upload-mark">◉</span>
      <strong>{{ t('imageTools.uploadPrompt') }}</strong>
      <small>{{ t('imageTools.localProcessing') }}</small>
    </section>

    <section v-else class="picker-workspace">
      <div class="toolbar"><strong :title="fileName">{{ fileName }}</strong><button class="button secondary" type="button" @click="clearImage">{{ t('imageTools.colorPicker.changeImage') }}</button><input ref="fileInput" class="visually-hidden" type="file" accept="image/*,.svg" @change="onFileChange" /></div>
      <div class="tool-grid">
        <div class="image-panel">
          <canvas ref="canvas" :width="image.naturalWidth" :height="image.naturalHeight" @click="pickColor"></canvas>
          <p>{{ t('imageTools.colorPicker.clickHint') }}</p>
        </div>
        <div class="palette-panel">
          <div class="picked-color">
            <span class="swatch large" :style="{ backgroundColor: picked.hex }"></span>
            <div><strong>{{ picked.hex }}</strong><span>{{ picked.rgb }}</span><span>{{ picked.hsl }}</span></div>
          </div>
          <button class="button secondary copy-button" type="button" @click="copyColor">{{ copied ? t('imageTools.base64.copied') : t('imageTools.base64.copy') }}</button>
          <h2>{{ t('imageTools.colorPicker.dominantColors') }}</h2>
          <div class="palette">
            <button v-for="color in palette" :key="color.hex" type="button" class="palette-color" :title="`${color.hex} · ${color.rgb}`" @click="picked = color">
              <span class="swatch" :style="{ backgroundColor: color.hex }"></span><span>{{ color.hex }}</span>
            </button>
          </div>
        </div>
      </div>
      <p v-if="errorMessage" class="notice error" role="alert">{{ errorMessage }}</p>
    </section>

    <footer class="privacy-note">{{ t('imageTools.localProcessing') }}</footer>
    <nav class="related" :aria-label="t('imageTools.relatedTitle')">
      <NuxtLinkLocale to="/image-info">{{ t('imageTools.info.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-converter">{{ t('imageTools.converter.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-to-base64">{{ t('imageTools.base64.toTitle') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { loadLocalImage } from '~/composables/useImageTools'

const { t } = useI18n()
const image = ref(null)
const fileName = ref('')
const canvas = ref(null)
const fileInput = ref(null)
const dragging = ref(false)
const picked = ref({ hex: '#176C59', rgb: 'rgb(23, 108, 89)', hsl: 'hsl(166, 65%, 26%)' })
const palette = ref([])
const copied = ref(false)
const errorMessage = ref('')
let imageUrl = ''

useHead(() => ({
  title: t('imageTools.colorPicker.seoTitle'),
  meta: [
    { name: 'description', content: t('imageTools.colorPicker.seoDescription') },
    { name: 'keywords', content: t('imageTools.colorPicker.seoKeywords') }
  ]
}))

function colorFromRgb(red, green, blue) {
  const hex = `#${[red, green, blue].map(value => value.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
  const r = red / 255
  const g = green / 255
  const b = blue / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let hue = 0
  const lightness = (max + min) / 2
  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0
  if (delta) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
  }
  hue = Math.round((hue * 60 + 360) % 360)
  return { hex, rgb: `rgb(${red}, ${green}, ${blue})`, hsl: `hsl(${hue}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)` }
}

function extractPalette(context, width, height) {
  const step = Math.max(1, Math.floor(Math.sqrt(width * height / 12000)))
  const counts = new Map()
  const data = context.getImageData(0, 0, width, height).data
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const offset = (y * width + x) * 4
      if (data[offset + 3] < 128) continue
      const bucket = [data[offset], data[offset + 1], data[offset + 2]].map(value => Math.min(255, Math.round(value / 32) * 32))
      const key = bucket.join(',')
      const item = counts.get(key) || { rgb: bucket, count: 0 }
      item.count++
      counts.set(key, item)
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 8).map(item => colorFromRgb(...item.rgb))
}

async function addFile(file) {
  if (!file) return
  clearImage()
  try {
    const loaded = await loadLocalImage(file)
    if (loaded.image.naturalWidth * loaded.image.naturalHeight > 100_000_000) {
      URL.revokeObjectURL(loaded.url)
      throw new Error(t('imageTools.converter.imageTooLarge'))
    }
    image.value = loaded.image
    imageUrl = loaded.url
    fileName.value = file.name
    await nextTick()
    const context = canvas.value?.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error(t('imageTools.colorPicker.readError'))
    context.drawImage(image.value, 0, 0)
    palette.value = extractPalette(context, image.value.naturalWidth, image.value.naturalHeight)
    if (palette.value[0]) picked.value = palette.value[0]
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error?.message || t('imageTools.colorPicker.readError')
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

function pickColor(event) {
  const bounds = canvas.value.getBoundingClientRect()
  const x = Math.min(image.value.naturalWidth - 1, Math.max(0, Math.floor((event.clientX - bounds.left) / bounds.width * image.value.naturalWidth)))
  const y = Math.min(image.value.naturalHeight - 1, Math.max(0, Math.floor((event.clientY - bounds.top) / bounds.height * image.value.naturalHeight)))
  const context = canvas.value.getContext('2d', { willReadFrequently: true })
  picked.value = colorFromRgb(...context.getImageData(x, y, 1, 1).data.slice(0, 3))
}

async function copyColor() {
  try {
    await navigator.clipboard.writeText(picked.value.hex)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1800)
  } catch {
    errorMessage.value = t('imageTools.base64.copyError')
  }
}

function clearImage() {
  if (imageUrl) URL.revokeObjectURL(imageUrl)
  imageUrl = ''
  image.value = null
  fileName.value = ''
  palette.value = []
}

onBeforeUnmount(clearImage)
</script>

<style scoped>
.color-tool { --ink: #202a2a; --muted: #667373; --line: #d9e1dc; --accent: #176c59; --wash: #f1f6f1; max-width: 980px; margin: 0 auto; padding: 42px 24px 72px; color: var(--ink); }
.tool-heading { margin-bottom: 28px; }
.eyebrow { color: var(--accent); font: 700 11px/1.4 ui-monospace, Consolas, monospace; }
.tool-heading h1 { margin: 8px 0; font-size: 32px; line-height: 1.15; font-weight: 750; }
.tool-heading p { max-width: 680px; margin: 0; color: var(--muted); line-height: 1.6; }
.drop-zone { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 1px dashed #8ea79a; background: repeating-linear-gradient(135deg, #f7faf6 0, #f7faf6 14px, #f2f7f1 14px, #f2f7f1 28px); cursor: pointer; text-align: center; padding: 24px; }
.drop-zone.dragging { outline: 3px solid #176c5940; border-color: var(--accent); }
.drop-zone small { color: var(--muted); }
.upload-mark { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; background: var(--accent); color: white; font-size: 25px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.toolbar strong { max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tool-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(220px, .7fr); gap: 24px; padding-top: 20px; }
.image-panel canvas { display: block; width: 100%; max-height: 580px; object-fit: contain; background: var(--wash); cursor: crosshair; }
.image-panel p, .privacy-note { color: var(--muted); font-size: 13px; }
.palette-panel h2 { margin: 24px 0 10px; font-size: 16px; }
.picked-color { display: flex; align-items: center; gap: 12px; }
.picked-color > div { display: grid; gap: 4px; }
.picked-color strong { font: 700 20px ui-monospace, Consolas, monospace; }
.picked-color span:not(.swatch) { color: var(--muted); font: 13px ui-monospace, Consolas, monospace; }
.swatch { display: block; width: 32px; height: 32px; border: 1px solid #0002; }
.swatch.large { width: 64px; height: 64px; }
.button { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--line); padding: 0 14px; background: transparent; color: var(--ink); font: inherit; cursor: pointer; }
.copy-button { margin-top: 14px; }
.palette { display: grid; gap: 4px; }
.palette-color { display: flex; align-items: center; gap: 10px; border: 0; padding: 5px 0; background: transparent; color: var(--ink); text-align: left; font: 13px ui-monospace, Consolas, monospace; cursor: pointer; }
.notice { padding: 10px 12px; color: #a33e31; background: #fff3ef; }
.privacy-note { margin: 20px 0; }
.related { display: flex; flex-wrap: wrap; gap: 10px 22px; border-top: 1px solid var(--line); padding-top: 18px; }
.related a { color: var(--accent); text-underline-offset: 3px; }
@media (max-width: 700px) { .color-tool { padding: 28px 16px 52px; } .tool-heading h1 { font-size: 27px; } .tool-grid { grid-template-columns: 1fr; } }
</style>

<style>
.dark .color-tool { --ink: #e4ece8; --muted: #b3c1bb; --line: #3a4943; --wash: #202d28; }
.dark .color-tool .drop-zone { background: repeating-linear-gradient(135deg, #202d28 0, #202d28 14px, #26352f 14px, #26352f 28px); }
.dark .color-tool .related a { color: #7bd8b6; }
</style>