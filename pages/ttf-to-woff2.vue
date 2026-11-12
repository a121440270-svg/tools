<template>
  <div class="max-w-3xl mx-auto py-10">
    <h1 class="text-3xl font-bold mb-4">{{ t('fontConvert.title') }}</h1>
    <p class="mb-4 text-gray-600 text-base leading-7">{{ t('fontConvert.lead') }}</p>
    <el-form label-width="100px" class="mb-6">
      <el-form-item :label="t('fontConvert.upload')">
        <input type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFontFileChange" ref="fontInputRef" />
        <span v-if="fontName" class="ml-2 text-green-600">{{ t('fontConvert.selected', { name: fontName }) }}</span>
        <span v-if="originSize" class="ml-4 text-xs text-gray-500">{{ prettySize(originSize) }}</span>
      </el-form-item>
      <el-form-item :label="t('fontConvert.direction')">
        <el-radio-group v-model="outputType">
          <el-radio-button label="woff2">{{ t('fontConvert.toWoff2') }}</el-radio-button>
          <el-radio-button label="ttf">{{ t('fontConvert.toTtf') }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <p class="mb-5 text-sm text-gray-500">{{ t('fontConvert.localProcessing') }}</p>
      <el-form-item>
        <el-button type="primary" :disabled="!fontBuffer || loading" @click="convertFont">
          {{ t('fontConvert.start') }}
        </el-button>
        <el-button size="default" class="ml-2" @click="clearAll">{{ t('fontConvert.clear') }}</el-button>
      </el-form-item>
    </el-form>
    <el-progress v-if="loading" :percentage="progress" class="mb-4" />
    <div v-if="downloadUrl" class="mt-6">
      <el-alert type="success" show-icon :title="t('fontConvert.success')">
        <template #default>
          <p class="text-sm">
            {{ t('fontConvert.original') }}: {{ prettySize(originSize) }} →
            {{ t('fontConvert.converted') }}: {{ prettySize(convertedSize) }}
            ({{ t('fontConvert.saving') }}: {{ savingsPercentage }}%)
          </p>
          <a :href="downloadUrl" :download="downloadName" class="text-primary underline">{{ t('fontConvert.download') }}</a>
        </template>
      </el-alert>
    </div>
    <el-alert v-if="errorMsg" type="error" show-icon :title="t('fontConvert.error')" class="mt-4" />

    <section class="mt-14 border-t border-gray-200 pt-8 dark:border-slate-700">
      <h2 class="text-xl font-bold mb-6">{{ t('fontConvert.faqTitle') }}</h2>
      <div class="space-y-6">
        <div v-for="index in 4" :key="index">
          <h3 class="font-semibold mb-2">{{ t(`fontConvert.q${index}`) }}</h3>
          <p class="text-gray-600 leading-7">{{ t(`fontConvert.a${index}`) }}</p>
        </div>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-xl font-bold mb-4">{{ t('fontConvert.related') }}</h2>
      <div class="flex flex-wrap gap-3">
        <NuxtLinkLocale to="/font-compress" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-200">
          {{ t('menu.ttf') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/font-subsetter" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-200">
          {{ t('menu.fontSubsetter') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/compress-woff2" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-200">
          {{ t('menu.compressWoff2') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/font-inspector" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-200">
          {{ t('menu.fontInspector') }}
        </NuxtLinkLocale>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ensureWoff2Support, getFontFormat, parseFontBuffer } from '~/composables/useFontTools'
const { t } = useI18n()

const fontBuffer = ref(null)
const fontName = ref('')
const sourceFormat = ref(null)
const outputType = ref('woff2')
const downloadUrl = ref('')
const downloadName = ref('converted.woff2')
const errorMsg = ref('')
const originSize = ref(0)
const convertedSize = ref(0)
const loading = ref(false)
const progress = ref(0)
const fontInputRef = ref(null)

const pageTitle = computed(() => t('fontConvert.seoTitle'))
const pageDescription = computed(() => t('fontConvert.seoDescription'))
const pageKeywords = computed(() => t('fontConvert.seoKeywords'))

useToolSeo({
  title: pageTitle,
  description: pageDescription,
  keywords: pageKeywords,
  featureList: computed(() => pageKeywords.value.split(',').map(item => item.trim()).filter(Boolean)),
  faqItems: computed(() => [1, 2, 3, 4].map(index => ({
    q: t(`fontConvert.q${index}`),
    a: t(`fontConvert.a${index}`)
  }))),
  dateModified: '2026-11-11',
  schemaProperties: { category: 'Font Tools' }
})

const savingsPercentage = computed(() => originSize.value
  ? (((originSize.value - convertedSize.value) / originSize.value) * 100).toFixed(1)
  : '0.0')

function prettySize(size) {
  if (!size) return ''
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

function onFontFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  loadFontFile(file)
}

function loadFontFile(file) {
  const format = getFontFormat(file.name)
  fontName.value = file.name
  fontBuffer.value = null
  sourceFormat.value = null
  downloadUrl.value = ''
  errorMsg.value = ''
  originSize.value = file.size
  convertedSize.value = 0
  if (!format) {
    errorMsg.value = t('fontConvert.noFile')
    return
  }

  file.arrayBuffer().then(async buffer => {
    try {
      await parseFontBuffer(buffer, format)
      fontBuffer.value = buffer
      sourceFormat.value = format
      // Smart default: converting FROM woff2 usually means going back to ttf.
      outputType.value = format === 'woff2' ? 'ttf' : 'woff2'
    } catch {
      errorMsg.value = t('fontConvert.error')
    }
  }).catch(() => {
    errorMsg.value = t('fontConvert.error')
  })
}

function clearAll() {
  fontBuffer.value = null
  fontName.value = ''
  sourceFormat.value = null
  originSize.value = 0
  convertedSize.value = 0
  downloadUrl.value = ''
  errorMsg.value = ''
  if (fontInputRef.value) fontInputRef.value.value = ''
}

async function convertFont() {
  if (!fontBuffer.value || !sourceFormat.value) return
  errorMsg.value = ''
  downloadUrl.value = ''
  convertedSize.value = 0
  loading.value = true
  progress.value = 20
  try {
    if (sourceFormat.value === 'woff2' || outputType.value === 'woff2') await ensureWoff2Support()
    const { Font } = await import('fonteditor-core')
    const font = Font.create(fontBuffer.value, {
      type: sourceFormat.value,
      hinting: true,
      compound2simple: true,
      combinePath: false
    })
    progress.value = 60
    const buffer = font.write({ type: outputType.value, hinting: true })
    const mime = outputType.value === 'ttf' ? 'font/ttf' : `font/${outputType.value}`
    const ext = `.${outputType.value}`
    const blob = new Blob([buffer], { type: mime })
    downloadName.value = fontName.value.replace(/\.\w+$/, '') + ext
    downloadUrl.value = URL.createObjectURL(blob)
    convertedSize.value = blob.size
    progress.value = 100
  } catch (e) {
    errorMsg.value = t('fontConvert.error')
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
}
</script>
