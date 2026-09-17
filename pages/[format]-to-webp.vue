<template>
  <div class="max-w-2xl mx-auto py-10">
    <h1 class="text-2xl font-bold mb-4">{{ pageTitle }}</h1>
    <p class="mb-4 text-gray-600">{{ pageDescription }}</p>
    <p class="mb-4 text-sm font-semibold text-primary">{{ batchMessage }}</p>
    <p class="mb-4 text-sm text-gray-600">{{ localMessage }}</p>
    <el-form :label-width="'120px'" class="mb-6">
      <el-form-item :label="t('webp.upload')">
        <input type="file" accept="image/jpeg,image/png" multiple @change="onFilesChange" ref="inputRef" />
        <span v-if="fileNames.length" class="ml-2 text-green-600">{{ t('webp.selected', { count: fileNames.length }) }}</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!files.length || loading" @click="convertImages">{{ t('webp.start') }}</el-button>
        <el-button size="default" class="ml-2" @click="clearAll">{{ t('webp.clear') }}</el-button>
      </el-form-item>
    </el-form>
    <el-progress v-if="loading" :percentage="progress" status="active" class="mb-4" />
    <div v-if="downloadUrl" class="mt-6">
      <el-alert type="success" show-icon :title="t('webp.success')">
        <template #default>
          <a :href="downloadUrl" :download="downloadName" class="text-primary underline">
            {{ isZip ? batchDownloadMessage : t('webp.download_img') }}
          </a>
        </template>
      </el-alert>
    </div>
    <div v-if="errorMsg" class="mt-4 text-red-600">{{ errorMsg }}</div>
    <div class="mt-8 p-4 border rounded text-sm dark:text-gray-100">
      <strong>WebP</strong> {{ t('webp.intro') }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const { t } = useI18n()
// 需安装 jszip: npm i jszip
import JSZip from 'jszip'

const files = ref([])
const fileNames = ref([])
const inputRef = ref(null)
const downloadUrl = ref('')
const downloadName = ref('')
const errorMsg = ref('')
const loading = ref(false)
const progress = ref(0)
const isZip = ref(false)

const pageTitle = computed(() => t('webp.seo_title') || t('webp.title') || 'Batch JPG/PNG to WebP Converter')
const pageDescription = computed(() => t('webp.seo_desc') || t('webp.desc') || 'Batch convert JPG and PNG images to WebP online. Convert multiple images at once and download them as a ZIP file.')
const pageKeywords = computed(() => t('webp.seo_keywords') || 'batch image converter, JPG to WebP, PNG to WebP, bulk WebP converter, online image converter')
const batchMessage = computed(() => t('webp.batch_message') || 'Batch convert multiple JPG and PNG images to WebP in one go.')
const localMessage = computed(() => t('webp.local_message') || 'Files are processed locally in your browser and are never uploaded.')
const batchDownloadMessage = computed(() => t('webp.download_zip') || 'Download converted images as ZIP')

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { name: 'keywords', content: pageKeywords.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' }
  ],
  script: [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: pageTitle.value,
      description: `${pageDescription.value} ${localMessage.value}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      featureList: [
        'Batch JPG and PNG to WebP conversion',
        'Convert multiple images at once',
        'ZIP download for batch results',
        'Local browser processing with no file upload'
      ],
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    })
  }]
}))


function onFilesChange(e) {
  files.value = Array.from(e.target.files)
  fileNames.value = files.value.map(f => f.name)
  downloadUrl.value = ''
  errorMsg.value = ''
  isZip.value = false
}

function clearAll() {
  files.value = []
  fileNames.value = []
  downloadUrl.value = ''
  errorMsg.value = ''
  isZip.value = false
  if (inputRef.value) inputRef.value.value = ''
}

async function convertImages() {
  errorMsg.value = ''
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
  downloadUrl.value = ''
  loading.value = true
  progress.value = 0
  isZip.value = false
  try {
    if (!files.value.length) throw new Error(t('webp.no_file'))
    const webpBlobs = []
    for (let i = 0; i < files.value.length; i++) {
      progress.value = Math.round((i / files.value.length) * 80)
      const file = files.value[i]
      const blob = await imageFileToWebp(file)
      webpBlobs.push({ name: file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'), blob })
    }
    progress.value = 90
    if (webpBlobs.length === 1) {
      // 单张直接下载
      const { name, blob } = webpBlobs[0]
      downloadName.value = name
      downloadUrl.value = URL.createObjectURL(blob)
      isZip.value = false
    } else {
      // 多张打包 zip
      const zip = new JSZip()
      webpBlobs.forEach(({ name, blob }) => zip.file(name, blob))
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadName.value = 'images-webp.zip'
      downloadUrl.value = URL.createObjectURL(zipBlob)
      isZip.value = true
    }
    progress.value = 100
  } catch (e) {
    errorMsg.value = t('webp.error', { msg: e.message || e })
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
}

// 将图片文件转为 webp Blob
function imageFileToWebp(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function(evt) {
      const img = new window.Image()
      img.onload = function() {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          canvas.toBlob(blob => {
            if (blob) resolve(blob)
            else reject(new Error('WebP 转换失败'))
          }, 'image/webp', 0.92)
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = evt.target.result
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}
</script>
