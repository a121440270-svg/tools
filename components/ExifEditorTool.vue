<template>
  <main class="exif-editor">
    <header>
      <span class="eyebrow">{{ t('imageTools.exifEditor.eyebrow') }}</span>
      <h1>{{ t('imageTools.exifEditor.title') }}</h1>
      <p>{{ t('imageTools.exifEditor.description') }}</p>
    </header>

    <section v-if="!sourceDataUrl" class="drop-zone" :class="{ dragging }" @click="fileInput?.click()" @drop.prevent="onDrop" @dragover.prevent="dragging = true" @dragleave.prevent="dragging = false">
      <input ref="fileInput" class="visually-hidden" type="file" accept="image/jpeg,.jpg,.jpeg" @click.stop @change="onFileChange" />
      <strong>{{ t('imageTools.exifEditor.upload') }}</strong>
      <small>{{ t('imageTools.exifEditor.localNote') }}</small>
    </section>

    <section v-else class="editor-workspace">
      <div class="editor-toolbar">
        <strong>{{ fileName }}</strong>
        <div>
          <button class="button secondary" type="button" @click="clearFile">{{ t('imageTools.exifEditor.changeImage') }}</button>
          <input ref="fileInput" class="visually-hidden" type="file" accept="image/jpeg,.jpg,.jpeg" @change="onFileChange" />
        </div>
      </div>

      <div class="editor-layout">
        <figure>
          <img :src="sourceDataUrl" :alt="fileName" />
          <figcaption>{{ t('imageTools.exifEditor.jpegOnly') }}</figcaption>
        </figure>
        <form class="fields" @submit.prevent="saveChanges">
          <label>{{ t('imageTools.exifEditor.dateTaken') }}
            <div class="date-time-fields">
              <input v-model="form.dateTaken" type="date" />
              <input v-model="form.timeTaken" type="time" step="1" />
            </div>
          </label>
          <label>{{ t('imageTools.exifEditor.cameraMake') }}
            <input v-model="form.cameraMake" type="text" maxlength="100" :placeholder="t('imageTools.exifEditor.asciiPlaceholder')" />
          </label>
          <label>{{ t('imageTools.exifEditor.cameraModel') }}
            <input v-model="form.cameraModel" type="text" maxlength="100" :placeholder="t('imageTools.exifEditor.asciiPlaceholder')" />
          </label>
          <label>{{ t('imageTools.exifEditor.author') }}
            <input v-model="form.author" type="text" maxlength="200" />
          </label>
          <label>{{ t('imageTools.exifEditor.copyright') }}
            <input v-model="form.copyright" type="text" maxlength="200" :placeholder="t('imageTools.exifEditor.asciiPlaceholder')" />
          </label>
          <label>{{ t('imageTools.exifEditor.descriptionField') }}
            <textarea v-model="form.description" rows="3" maxlength="1000" />
          </label>
          <fieldset>
            <legend>{{ t('imageTools.exifEditor.location') }}</legend>
            <div class="gps-fields">
              <label>{{ t('imageTools.info.latitude') }}
                <input v-model="form.latitude" type="number" min="-90" max="90" step="any" />
              </label>
              <label>{{ t('imageTools.info.longitude') }}
                <input v-model="form.longitude" type="number" min="-180" max="180" step="any" />
              </label>
              <label>{{ t('imageTools.exifEditor.altitude') }}
                <input v-model="form.altitude" type="number" step="any" />
              </label>
            </div>
            <button class="button secondary map-trigger" type="button" @click="openLocationMap">{{ t('imageTools.exifEditor.mapEditLocation') }}</button>
          </fieldset>
          <p class="privacy-note">{{ t('imageTools.exifEditor.preserveNote') }}</p>
          <p v-if="errorMessage" class="notice error" role="alert">{{ errorMessage }}</p>
          <div class="actions">
            <button class="button primary" type="submit" :disabled="saving">{{ saving ? t('imageTools.exifEditor.saving') : t('imageTools.exifEditor.save') }}</button>
            <a v-if="resultUrl" class="button download" :href="resultUrl" :download="outputName">{{ t('imageTools.exifEditor.download') }}</a>
          </div>
          <p v-if="resultUrl" class="success-note" role="status">{{ t('imageTools.exifEditor.success') }}</p>
        </form>
      </div>
    </section>

    <div v-if="mapDialogOpen" class="map-modal-backdrop" @click.self="closeLocationMap" @keydown.esc.stop.prevent="closeLocationMap" tabindex="-1">
      <section class="map-dialog" role="dialog" aria-modal="true" aria-labelledby="map-dialog-title">
        <header class="map-dialog-header">
          <h2 id="map-dialog-title">{{ t('imageTools.exifEditor.mapTitle') }}</h2>
          <button class="map-close" type="button" :aria-label="t('imageTools.exifEditor.mapCancel')" @click="closeLocationMap">×</button>
        </header>

        <p v-if="!baiduMapAk" class="map-message error" role="alert">{{ t('imageTools.exifEditor.mapMissingKey') }}</p>
        <template v-else>
          <form class="map-search" @submit.prevent="searchMapLocation">
            <input ref="mapSearchInput" v-model="mapSearchText" type="search" :placeholder="t('imageTools.exifEditor.mapSearchPlaceholder')" />
            <button class="button primary" type="submit" :disabled="mapSearching || !mapSearchText.trim()">{{ t('imageTools.exifEditor.mapSearch') }}</button>
          </form>
          <p class="map-hint">{{ t('imageTools.exifEditor.mapHint') }}</p>
          <p v-if="mapError" class="map-message error" role="alert">{{ mapError }}</p>

          <div class="map-selector" :class="{ 'has-results': mapResults.length }">
            <div ref="mapElement" class="map-canvas" :aria-label="t('imageTools.exifEditor.mapTitle')"></div>
            <div v-if="mapResults.length" class="map-results" :aria-label="t('imageTools.exifEditor.mapSearch')">
              <button v-for="(result, index) in mapResults" :key="`${result.title}-${index}`" type="button" class="map-result" @click="selectMapResult(result)">
                <strong>{{ result.title }}</strong>
                <small>{{ result.address }}</small>
              </button>
            </div>
          </div>

          <p v-if="selectedWgs84" class="map-coordinate-preview">
            {{ t('imageTools.info.latitude') }}: {{ selectedWgs84[1].toFixed(6) }}
            <span>{{ t('imageTools.info.longitude') }}: {{ selectedWgs84[0].toFixed(6) }}</span>
          </p>
          <div class="map-actions">
            <button class="button secondary" type="button" @click="closeLocationMap">{{ t('imageTools.exifEditor.mapCancel') }}</button>
            <button class="button primary" type="button" :disabled="!selectedWgs84" @click="applyMapLocation">{{ t('imageTools.exifEditor.mapUseLocation') }}</button>
          </div>
        </template>
      </section>
    </div>

    <nav class="related" :aria-label="t('imageTools.relatedTitle')">
      <NuxtLinkLocale to="/image-metadata">{{ t('imageTools.metadataHub.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/image-info">{{ t('imageTools.info.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/remove-exif">{{ t('imageTools.exif.title') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import coordtransform from 'coordtransform'
import { fileStem } from '~/composables/useImageTools'

const { t, locale } = useI18n()
const baiduMapAk = useRuntimeConfig().public.baiduMapAk
const fileInput = ref(null)
const mapElement = ref(null)
const mapSearchInput = ref(null)
const dragging = ref(false)
const sourceDataUrl = ref('')
const sourceExif = ref(null)
const fileName = ref('')
const outputName = ref('')
const resultUrl = ref('')
const errorMessage = ref('')
const saving = ref(false)
const mapDialogOpen = ref(false)
const mapSearchText = ref('')
const mapSearching = ref(false)
const mapError = ref('')
const mapResults = ref([])
const selectedBaiduPoint = ref(null)
const selectedWgs84 = computed(() => {
  if (!selectedBaiduPoint.value) return null
  const gcj02 = coordtransform.bd09togcj02(selectedBaiduPoint.value.lng, selectedBaiduPoint.value.lat)
  return coordtransform.gcj02towgs84(...gcj02)
})
const form = reactive({ dateTaken: '', timeTaken: '', cameraMake: '', cameraModel: '', author: '', copyright: '', description: '', latitude: '', longitude: '', altitude: '' })
let piexifApi
let baiduMapSdkPromise
let baiduMap
let baiduLocalSearch
let baiduMarker

const exifFaqItems = computed(() => locale.value.startsWith('zh')
  ? [
      { q: '可以修改照片中的 GPS 位置吗？', a: '可以手动输入经纬度，也可以使用地图选择位置并写入 JPEG 元数据。' },
      { q: '编辑器会上传我的照片吗？', a: '不会。文件只在浏览器本地处理，不会上传到服务器。' },
      { q: '可以修改哪些 EXIF 信息？', a: '可以修改相机品牌和型号、作者、版权、描述、拍摄日期时间及 GPS 坐标和海拔。' }
    ]
  : [
      { q: 'Can I edit GPS location in the EXIF editor?', a: 'Yes. Enter coordinates manually or use the map picker to apply a location to JPEG metadata.' },
      { q: 'Does the EXIF editor upload my images?', a: 'No. The file is processed locally in your browser and is not uploaded to a server.' },
      { q: 'What metadata can I change?', a: 'You can edit camera make and model, author, copyright, description, date taken, GPS coordinates, and altitude.' }
    ])

useToolSeo({
  title: computed(() => t('imageTools.exifEditor.seoTitle')),
  description: computed(() => t('imageTools.exifEditor.seoDescription')),
  keywords: computed(() => t('imageTools.exifEditor.seoKeywords')),
  applicationCategory: 'UtilitiesApplication',
  featureList: [
    'Edit EXIF camera metadata',
    'Edit photo date and time',
    'Edit GPS latitude and longitude',
    'Apply changes locally in the browser'
  ],
  faqItems: exifFaqItems,
  audience: 'Photographers and developers'
})

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(t('imageTools.exifEditor.readError')))
    reader.readAsDataURL(file)
  })
}

function textValue(value) {
  return typeof value === 'string' ? value.replace(/^ASCII\0+/, '').replace(/\0+$/, '') : ''
}

function windowsTextValue(value) {
  if (!Array.isArray(value) && !ArrayBuffer.isView(value)) return ''
  let text = ''
  for (let index = 0; index + 1 < value.length; index += 2) {
    const codeUnit = value[index] | (value[index + 1] << 8)
    if (!codeUnit) break
    text += String.fromCharCode(codeUnit)
  }
  return text
}

function windowsTextBytes(value) {
  const bytes = []
  for (let index = 0; index < value.length; index++) {
    const codeUnit = value.charCodeAt(index)
    bytes.push(codeUnit & 0xff, codeUnit >> 8)
  }
  return [...bytes, 0, 0]
}

function dateInputValue(value) {
  if (typeof value !== 'string') return ''
  const match = value.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/)
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}` : ''
}

function gpsNumber(rational, reference) {
  if (!Array.isArray(rational) || rational.length < 3) return ''
  const [degrees, minutes, seconds] = rational.map(([numerator, denominator]) => denominator ? numerator / denominator : 0)
  const value = degrees + minutes / 60 + seconds / 3600
  return String(reference === 'S' || reference === 'W' ? -value : value)
}

function wgs84ToBaiduPoint(longitude, latitude) {
  const gcj02 = coordtransform.wgs84togcj02(longitude, latitude)
  return coordtransform.gcj02tobd09(...gcj02)
}

function loadBaiduMapSdk() {
  if (window.BMap) return Promise.resolve()
  if (baiduMapSdkPromise) return baiduMapSdkPromise

  baiduMapSdkPromise = new Promise((resolve, reject) => {
    const callbackName = '__onExifEditorBaiduMapReady'
    const script = document.createElement('script')
    const timeout = window.setTimeout(() => {
      delete window[callbackName]
      baiduMapSdkPromise = null
      reject(new Error('Baidu Maps SDK load timed out'))
    }, 15000)

    window[callbackName] = () => {
      window.clearTimeout(timeout)
      delete window[callbackName]
      if (window.BMap) resolve()
      else reject(new Error('Baidu Maps SDK unavailable'))
    }
    script.async = true
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${encodeURIComponent(baiduMapAk)}&callback=${callbackName}`
    script.onerror = () => {
      window.clearTimeout(timeout)
      delete window[callbackName]
      baiduMapSdkPromise = null
      reject(new Error('Baidu Maps SDK failed to load'))
    }
    document.head.appendChild(script)
  })

  return baiduMapSdkPromise
}

function updateMapSelection(point) {
  selectedBaiduPoint.value = { lng: point.lng, lat: point.lat }
  if (baiduMarker) baiduMap.removeOverlay(baiduMarker)
  baiduMarker = new window.BMap.Marker(point)
  baiduMap.addOverlay(baiduMarker)
}

function initializeBaiduMap() {
  if (!mapElement.value || !window.BMap) return
  const BMap = window.BMap
  baiduMap = new BMap.Map(mapElement.value)
  baiduMap.enableScrollWheelZoom(true)
  baiduMap.centerAndZoom(new BMap.Point(116.404, 39.915), 11)
  baiduMap.addEventListener('click', event => updateMapSelection(event.point))
  baiduLocalSearch = new BMap.LocalSearch(baiduMap, {
    onSearchComplete(results) {
      mapSearching.value = false
      const count = results?.getCurrentNumPois?.() || 0
      mapResults.value = Array.from({ length: count }, (_, index) => {
        const result = results.getPoi(index)
        return {
          title: result.title,
          address: result.address || '',
          point: result.point
        }
      })
      mapError.value = mapResults.value.length ? '' : t('imageTools.exifEditor.mapNoResults')
    }
  })

  const latitude = Number(form.latitude)
  const longitude = Number(form.longitude)
  if (form.latitude !== '' && form.longitude !== '' && Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const [bdLongitude, bdLatitude] = wgs84ToBaiduPoint(longitude, latitude)
    const point = new BMap.Point(bdLongitude, bdLatitude)
    baiduMap.centerAndZoom(point, 15)
    updateMapSelection(point)
  }
  window.setTimeout(() => baiduMap?.checkResize(), 100)
}

async function openLocationMap() {
  mapDialogOpen.value = true
  mapSearchText.value = ''
  mapSearching.value = false
  mapError.value = ''
  mapResults.value = []
  selectedBaiduPoint.value = null
  await nextTick()
  if (!baiduMapAk) return

  try {
    await loadBaiduMapSdk()
    initializeBaiduMap()
    mapSearchInput.value?.focus()
  } catch {
    mapError.value = t('imageTools.exifEditor.mapLoadError')
  }
}

function searchMapLocation() {
  const query = mapSearchText.value.trim()
  if (!query || !baiduLocalSearch) return
  mapSearching.value = true
  mapError.value = ''
  mapResults.value = []
  baiduLocalSearch.search(query)
}

function selectMapResult(result) {
  const point = new window.BMap.Point(result.point.lng, result.point.lat)
  baiduMap.centerAndZoom(point, 16)
  updateMapSelection(point)
}

function applyMapLocation() {
  if (!selectedWgs84.value) return
  form.longitude = selectedWgs84.value[0].toFixed(6)
  form.latitude = selectedWgs84.value[1].toFixed(6)
  closeLocationMap()
}

function closeLocationMap() {
  mapDialogOpen.value = false
  baiduMap = null
  baiduLocalSearch = null
  baiduMarker = null
}

function loadForm(exif) {
  const zero = exif['0th'] || {}
  const details = exif.Exif || {}
  const gps = exif.GPS || {}
  const dateTaken = dateInputValue(details[piexifApi.ExifIFD.DateTimeOriginal])
  ;[form.dateTaken, form.timeTaken] = dateTaken ? dateTaken.split('T') : ['', '']
  form.cameraMake = textValue(zero[piexifApi.ImageIFD.Make])
  form.cameraModel = textValue(zero[piexifApi.ImageIFD.Model])
  form.author = textValue(zero[piexifApi.ImageIFD.Artist]) || windowsTextValue(zero[piexifApi.ImageIFD.XPAuthor])
  form.copyright = textValue(zero[piexifApi.ImageIFD.Copyright])
  form.description = textValue(zero[piexifApi.ImageIFD.ImageDescription]) || windowsTextValue(zero[piexifApi.ImageIFD.XPComment])
  form.latitude = gpsNumber(gps[piexifApi.GPSIFD.GPSLatitude], gps[piexifApi.GPSIFD.GPSLatitudeRef])
  form.longitude = gpsNumber(gps[piexifApi.GPSIFD.GPSLongitude], gps[piexifApi.GPSIFD.GPSLongitudeRef])
  const altitude = gps[piexifApi.GPSIFD.GPSAltitude]
  form.altitude = Array.isArray(altitude) && altitude[1] ? String((gps[piexifApi.GPSIFD.GPSAltitudeRef] ? -1 : 1) * altitude[0] / altitude[1]) : ''
}

async function loadFile(file) {
  errorMessage.value = ''
  if (!file || (!/^image\/jpeg$/i.test(file.type) && !/\.jpe?g$/i.test(file.name))) {
    errorMessage.value = t('imageTools.exifEditor.jpegOnlyError')
    return
  }
  if (file.size > 30 * 1024 * 1024) {
    errorMessage.value = t('imageTools.exifEditor.tooLarge')
    return
  }
  try {
    const module = await import('piexifjs')
    piexifApi = module.default || module
    const dataUrl = await readAsDataUrl(file)
    let exif
    try {
      exif = piexifApi.load(dataUrl)
    } catch {
      exif = { '0th': {}, Exif: {}, GPS: {}, Interop: {}, '1st': {}, thumbnail: null }
    }
    sourceDataUrl.value = dataUrl
    sourceExif.value = exif
    fileName.value = file.name
    outputName.value = `${fileStem(file.name)}-edited.jpg`
    loadForm(exif)
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = ''
  } catch {
    errorMessage.value = t('imageTools.exifEditor.readError')
  }
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) loadFile(file)
  event.target.value = ''
}

function onDrop(event) {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) loadFile(file)
}

function decimalToDms(value) {
  const absolute = Math.abs(value)
  const degrees = Math.floor(absolute)
  const minutesFloat = (absolute - degrees) * 60
  const minutes = Math.floor(minutesFloat)
  const seconds = Math.round((minutesFloat - minutes) * 60 * 10000)
  return [[degrees, 1], [minutes, 1], [seconds, 10000]]
}

function setTag(section, tag, value) {
  if (value === '' || value === undefined || value === null) delete section[tag]
  else section[tag] = value
}

function setWindowsTextTag(section, tag, value) {
  if (value) section[tag] = windowsTextBytes(value)
  else delete section[tag]
}

function makeExifDate(date, time) {
  if (!date) return ''
  const formattedTime = time ? (time.length === 5 ? `${time}:00` : time) : '00:00:00'
  return `${date.replaceAll('-', ':')} ${formattedTime}`
}

async function saveChanges() {
  if (!sourceExif.value || saving.value) return
  errorMessage.value = ''
  const textValues = [form.cameraMake, form.cameraModel, form.copyright]
  if (textValues.some(value => /[^\x00-\x7F]/.test(String(value ?? '')))) {
    errorMessage.value = t('imageTools.exifEditor.asciiOnly')
    return
  }
  const latitudeText = String(form.latitude ?? '').trim()
  const longitudeText = String(form.longitude ?? '').trim()
  const altitudeText = String(form.altitude ?? '').trim()
  const latitude = latitudeText === '' ? null : Number(latitudeText)
  const longitude = longitudeText === '' ? null : Number(longitudeText)
  const altitude = altitudeText === '' ? null : Number(altitudeText)
  if ((latitude === null) !== (longitude === null) || (latitude !== null && (!Number.isFinite(latitude) || Math.abs(latitude) > 90)) || (longitude !== null && (!Number.isFinite(longitude) || Math.abs(longitude) > 180)) || (altitude !== null && !Number.isFinite(altitude))) {
    errorMessage.value = t('imageTools.exifEditor.invalidGps')
    return
  }
  saving.value = true
  try {
    const exif = Object.fromEntries(Object.entries(sourceExif.value).map(([section, value]) => [section, value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : value]))
    exif['0th'] ||= {}
    exif.Exif ||= {}
    exif.GPS ||= {}
    const imageIfd = exif['0th']
    const photoIfd = exif.Exif
    const gpsIfd = exif.GPS
    const date = makeExifDate(form.dateTaken, form.timeTaken)
    setTag(imageIfd, piexifApi.ImageIFD.Make, form.cameraMake.trim())
    setTag(imageIfd, piexifApi.ImageIFD.Model, form.cameraModel.trim())
    setTag(imageIfd, piexifApi.ImageIFD.Copyright, form.copyright.trim())
    const author = form.author.trim()
    const description = form.description.trim()
    setTag(imageIfd, piexifApi.ImageIFD.Artist, /^[\x00-\x7F]*$/.test(author) ? author : '')
    setWindowsTextTag(imageIfd, piexifApi.ImageIFD.XPAuthor, author)
    setTag(imageIfd, piexifApi.ImageIFD.ImageDescription, /^[\x00-\x7F]*$/.test(description) ? description : '')
    setWindowsTextTag(imageIfd, piexifApi.ImageIFD.XPComment, description)
    setTag(imageIfd, piexifApi.ImageIFD.DateTime, date)
    setTag(photoIfd, piexifApi.ExifIFD.DateTimeOriginal, date)
    setTag(photoIfd, piexifApi.ExifIFD.DateTimeDigitized, date)
    if (latitude !== null && longitude !== null) {
      gpsIfd[piexifApi.GPSIFD.GPSVersionID] = [2, 3, 0, 0]
      gpsIfd[piexifApi.GPSIFD.GPSLatitudeRef] = latitude < 0 ? 'S' : 'N'
      gpsIfd[piexifApi.GPSIFD.GPSLatitude] = decimalToDms(latitude)
      gpsIfd[piexifApi.GPSIFD.GPSLongitudeRef] = longitude < 0 ? 'W' : 'E'
      gpsIfd[piexifApi.GPSIFD.GPSLongitude] = decimalToDms(longitude)
    } else {
      for (const tag of [piexifApi.GPSIFD.GPSLatitudeRef, piexifApi.GPSIFD.GPSLatitude, piexifApi.GPSIFD.GPSLongitudeRef, piexifApi.GPSIFD.GPSLongitude]) delete gpsIfd[tag]
    }
    if (altitude !== null) {
      gpsIfd[piexifApi.GPSIFD.GPSAltitudeRef] = altitude < 0 ? 1 : 0
      gpsIfd[piexifApi.GPSIFD.GPSAltitude] = [Math.round(Math.abs(altitude) * 100), 100]
    } else {
      delete gpsIfd[piexifApi.GPSIFD.GPSAltitudeRef]
      delete gpsIfd[piexifApi.GPSIFD.GPSAltitude]
    }
    const outputDataUrl = piexifApi.insert(piexifApi.dump(exif), sourceDataUrl.value)
    const response = await fetch(outputDataUrl)
    const blob = await response.blob()
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
  } catch {
    errorMessage.value = t('imageTools.exifEditor.writeError')
  } finally {
    saving.value = false
  }
}

function clearFile() {
  sourceDataUrl.value = ''
  sourceExif.value = null
  fileName.value = ''
  errorMessage.value = ''
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = ''
}

onBeforeUnmount(() => {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
})
</script>

<style scoped>
.exif-editor { --ink: #202a2a; --muted: #667373; --line: #d9e1dc; --accent: #176c59; --wash: #f1f6f1; max-width: 980px; margin: 0 auto; padding: 42px 24px 72px; color: var(--ink); }
header { margin-bottom: 24px; }
.eyebrow { color: var(--accent); font: 700 11px/1.4 ui-monospace, Consolas, monospace; }
h1 { margin: 8px 0; font-size: 32px; line-height: 1.15; }
header p { max-width: 700px; margin: 0; color: var(--muted); line-height: 1.6; }
.drop-zone { min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; border: 1px dashed #8ea79a; background: repeating-linear-gradient(135deg, #f7faf6 0, #f7faf6 14px, #f2f7f1 14px, #f2f7f1 28px); cursor: pointer; text-align: center; padding: 24px; }
.drop-zone small, .privacy-note, figcaption { color: var(--muted); font-size: 13px; line-height: 1.5; }
.drop-zone.dragging { outline: 3px solid #176c5940; border-color: var(--accent); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.editor-toolbar, .editor-toolbar > div, .actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.editor-toolbar { border-bottom: 1px solid var(--line); padding: 12px 0; }
.editor-layout { display: grid; grid-template-columns: minmax(220px, .75fr) minmax(0, 1.25fr); gap: 24px; padding-top: 20px; }
figure { margin: 0; }
figure img { display: block; width: 100%; max-height: 360px; object-fit: contain; background: var(--wash); border: 1px solid var(--line); }
figcaption { margin-top: 8px; }
.fields { display: grid; gap: 12px; }
.fields label { display: grid; gap: 6px; color: var(--muted); font-size: 13px; }
.fields input, .fields textarea { width: 100%; min-height: 38px; border: 1px solid var(--line); padding: 8px 10px; background: transparent; color: var(--ink); font: inherit; }
.date-time-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(130px, .65fr); gap: 8px; }
.fields textarea { resize: vertical; }
fieldset { border: 1px solid var(--line); padding: 12px; }
legend { padding: 0 5px; color: var(--muted); font-size: 13px; }
.gps-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.map-trigger { justify-self: start; }
.map-modal-backdrop { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 16px; background: rgb(10 20 17 / 62%); }
.map-dialog { width: min(960px, 100%); max-height: calc(100vh - 32px); overflow-y: auto; border: 1px solid var(--line); padding: 20px; background: #fff; color: var(--ink); box-shadow: 0 20px 60px rgb(0 0 0 / 24%); }
.map-dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 16px; }
.map-dialog h2 { margin: 0; font-size: 20px; line-height: 1.3; }
.map-close { width: 36px; height: 36px; border: 1px solid var(--line); background: transparent; color: inherit; font-size: 24px; line-height: 1; cursor: pointer; }
.map-search { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.map-search input { min-width: 0; min-height: 38px; border: 1px solid var(--line); padding: 8px 10px; background: transparent; color: inherit; font: inherit; }
.map-hint { margin: 8px 0 12px; color: var(--muted); font-size: 13px; }
.map-message { margin: 8px 0; }
.map-selector { display: grid; }
.map-selector.has-results { grid-template-columns: minmax(0, 1fr) minmax(190px, 260px); gap: 10px; }
.map-canvas { width: 100%; height: min(54vh, 520px); min-height: 320px; background: #e8edf0; }
.map-results { max-height: min(54vh, 520px); overflow-y: auto; border: 1px solid var(--line); }
.map-result { display: grid; width: 100%; gap: 4px; border: 0; border-bottom: 1px solid var(--line); padding: 10px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.map-result:hover { background: var(--wash); }
.map-result small { color: var(--muted); line-height: 1.4; }
.map-coordinate-preview { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 10px 0 0; color: var(--muted); font-size: 13px; }
.map-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.button { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--line); padding: 0 14px; background: transparent; color: var(--ink); font: inherit; text-decoration: none; cursor: pointer; }
.button.primary, .button.download { border-color: var(--accent); background: var(--accent); color: white; }
.button:disabled { opacity: .55; cursor: default; }
.privacy-note { margin: 0; }
.notice { padding: 10px 12px; background: #fff3ef; color: #a33e31; }
.success-note { margin: 0; color: var(--accent); font-size: 13px; }
.related { display: flex; flex-wrap: wrap; gap: 10px 22px; border-top: 1px solid var(--line); margin-top: 24px; padding-top: 18px; }
.related a { color: var(--accent); text-underline-offset: 3px; }
.dark .exif-editor { --ink: #e4ece8; --muted: #b3c1bb; --line: #3a4943; --wash: #202d28; }
.dark .exif-editor .drop-zone { background: repeating-linear-gradient(135deg, #202d28 0, #202d28 14px, #26352f 14px, #26352f 28px); }
.dark .exif-editor .related a { color: #7bd8b6; }
.dark .exif-editor .map-dialog { --line: #3a4943; --muted: #b3c1bb; --ink: #e4ece8; background: #202d28; }
@media (max-width: 700px) { .exif-editor { padding: 28px 16px 52px; } .editor-layout { grid-template-columns: 1fr; } .gps-fields { grid-template-columns: 1fr; } .actions > * { width: 100%; } .map-dialog { padding: 14px; } .map-selector.has-results { grid-template-columns: 1fr; } .map-results { max-height: 180px; } .map-canvas { height: 50vh; min-height: 260px; } }
</style>