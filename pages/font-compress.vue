<template>
  <div class="max-w-3xl mx-auto py-10">
    <h1 class="text-3xl font-bold mb-4">{{ t('font.h1') }}</h1>
    <p class="mb-4 text-gray-600 text-base leading-7">
      {{ t('font.lead') }}
    </p>
    <el-form :label-width="'100px'" class="mb-6">
      <el-form-item :label="t('font.upload')">
        <input type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFontFileChange" ref="fontInputRef" />
        <span v-if="fontName" class="ml-2 text-green-600">{{ t('font.selected', { name: fontName }) }}</span>
        <span v-if="originSize" class="ml-4 text-xs text-gray-500">{{ t('font.origin_size', { size: prettySize(originSize) }) }}</span>
      </el-form-item>
      <el-form-item :label="t('font.input_chars')">
        <el-radio-group v-model="inputMode" class="mb-3">
          <el-radio-button label="text">{{ t('font.custom_text') }}</el-radio-button>
          <el-radio-button label="range">{{ t('font.unicode_range') }}</el-radio-button>
          <el-radio-button label="preset">{{ t('font.language_preset') }}</el-radio-button>
        </el-radio-group>
        <el-input
          v-if="inputMode === 'text'"
          v-model="charInput"
          type="textarea"
          :rows="3"
          :placeholder="t('font.input_placeholder')"
        />
        <el-input
          v-else-if="inputMode === 'range'"
          v-model="rangeInput"
          type="textarea"
          :rows="2"
          placeholder="U+0000-00FF, U+4E00-9FFF"
        />
        <el-select v-else v-model="selectedPreset" class="w-full" @change="applyPreset">
          <el-option v-for="preset in languagePresets" :key="preset.value" :label="preset.label" :value="preset.value" />
        </el-select>
        <span class="ml-2 text-xs text-gray-500">{{ t('font.char_count', { count: selectedCodePoints.length }) }}</span>
      </el-form-item>
      <el-form-item :label="t('font.upload_text')">
        <input type="file" accept=".txt" @change="onTextFileChange" ref="textInputRef" />
        <span v-if="textName" class="ml-2 text-green-600">{{ t('font.text_selected', { name: textName }) }}</span>
      </el-form-item>
      <el-form-item :label="t('font.output_type')">
        <el-radio-group v-model="outputType">
          <el-radio-button label="ttf">TTF</el-radio-button>
          <el-radio-button label="woff">WOFF</el-radio-button>
          <el-radio-button label="woff2">WOFF2</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <p class="mb-5 text-sm text-gray-500">{{ t('font.local_processing') }}</p>
      <el-form-item>
        <el-button type="primary" :disabled="!fontBuffer || !selectedCodePoints.length || loading" @click="extractFont">
          {{ t('font.start') }}
        </el-button>
        <el-button size="default" class="ml-2" @click="clearAll">{{ t('font.clear') }}</el-button>
      </el-form-item>
    </el-form>
    <el-progress v-if="loading" :percentage="progress" class="mb-4" />
    <div v-if="downloadUrl" class="mt-6">
      <el-alert type="success" show-icon :title="t('font.success')">
        <template #default>
          <a :href="downloadUrl" :download="downloadName" class="text-primary underline">{{ t('font.download') }}</a>
          <span class="ml-2 text-xs text-gray-400">{{ t('font.only_glyphs') }}</span>
          <span v-if="compressedSize" class="ml-4 text-xs text-gray-500">{{ t('font.compressed_size', { size: prettySize(compressedSize) }) }}</span>
        </template>
      </el-alert>
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="border-l-2 border-gray-300 pl-3"><div class="text-xs text-gray-500">{{ t('font.original_size') }}</div><strong>{{ prettySize(originSize) }}</strong></div>
        <div class="border-l-2 border-green-600 pl-3"><div class="text-xs text-gray-500">{{ t('font.optimized_size') }}</div><strong>{{ prettySize(compressedSize) }}</strong></div>
        <div class="border-l-2 border-blue-600 pl-3"><div class="text-xs text-gray-500">{{ t('font.saved_size') }}</div><strong>{{ prettySize(originSize - compressedSize) }}</strong></div>
        <div class="border-l-2 border-amber-500 pl-3"><div class="text-xs text-gray-500">{{ t('font.reduction') }}</div><strong>{{ reductionPercentage }}%</strong></div>
      </div>
      <p class="mt-3 text-sm text-gray-600">{{ t('font.glyph_count') }}: {{ originalGlyphCount.toLocaleString() }} → {{ remainingGlyphCount.toLocaleString() }}</p>
    </div>
    <div v-if="errorMsg" class="mt-4 text-red-600">{{ t('font.error', { msg: errorMsg }) }}</div>

    <nav class="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-4 text-sm">
      <NuxtLink to="/font-inspector" class="text-primary underline">{{ t('font.tools.inspector') }}</NuxtLink>
      <NuxtLink to="/font-unicode-checker" class="text-primary underline">{{ t('font.tools.unicodeChecker') }}</NuxtLink>
    </nav>

    <section class="mt-10 space-y-8">
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 class="text-xl font-semibold mb-2">{{ t('font.section.subsetting_title') }}</h2>
        <p class="text-gray-700 leading-7">{{ t('font.section.subsetting_text') }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 p-5">
        <h2 class="text-xl font-semibold mb-3">{{ t('font.section.steps_title') }}</h2>
        <ol class="list-decimal pl-5 text-gray-700 leading-7 space-y-2">
          <li>{{ t('font.section.steps_1') }}</li>
          <li>{{ t('font.section.steps_2') }}</li>
          <li>{{ t('font.section.steps_3') }}</li>
          <li>{{ t('font.section.steps_4') }}</li>
        </ol>
      </div>

      <div class="rounded-xl border border-gray-200 p-5">
        <h2 class="text-xl font-semibold mb-3">{{ t('font.section.why_title') }}</h2>
        <p class="text-gray-700 leading-7">{{ t('font.section.why_text') }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 p-5">
        <h2 class="text-xl font-semibold mb-3">{{ t('font.section.faq_title') }}</h2>
        <div class="space-y-5 text-gray-700">
          <div>
            <h3 class="font-semibold text-gray-900">{{ t('font.section.faq_1_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_1_a') }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ t('font.section.faq_2_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_2_a') }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ t('font.section.faq_3_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_3_a') }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ t('font.section.faq_4_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_4_a') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Font } from 'fonteditor-core'
import { ensureWoff2Support, FONT_LANGUAGE_PRESETS, getFontFormat, getMappedCodePoints, parseFontBuffer, parseUnicodeRanges, useSharedFontFile, useSharedSubsetText } from '~/composables/useFontTools'
const { t } = useI18n()
const sharedFontFile = useSharedFontFile()
const sharedSubsetText = useSharedSubsetText()

const fontBuffer = ref(null)
const fontName = ref('')
const charInput = ref('')
const textName = ref('')
const downloadUrl = ref('')
const downloadName = ref('compressed.ttf')
const errorMsg = ref('')
const originSize = ref(0)
const compressedSize = ref(0)
const loading = ref(false)
const progress = ref(0)
const outputType = ref('ttf')
const inputMode = ref('text')
const rangeInput = ref('')
const selectedPreset = ref('latin')
const sourceFormat = ref(null)
const sourceCodePoints = ref([])
const originalGlyphCount = ref(0)
const remainingGlyphCount = ref(0)

const fontInputRef = ref(null)
const textInputRef = ref(null)

const pageTitle = computed(() => t('font.title'))
const pageDescription = computed(() => t('font.seo_desc'))
const pageKeywords = computed(() => t('font.seo_keywords'))

useHead({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { name: 'keywords', content: pageKeywords.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: pageTitle.value,
        description: pageDescription.value,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        featureList: pageKeywords.value
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        isAccessibleForFree: true,
        category: 'Font Tools'
      })
    }
  ]
})

const languagePresets = FONT_LANGUAGE_PRESETS

const selectedCodePoints = computed(() => {
  if (inputMode.value === 'text') {
    return Array.from(new Set(Array.from(charInput.value, character => character.codePointAt(0))))
      .filter(codePoint => codePoint !== undefined)
      .sort((left, right) => left - right)
  }

  const input = inputMode.value === 'preset'
    ? languagePresets.find(preset => preset.value === selectedPreset.value)?.range || ''
    : rangeInput.value
  return selectAvailableCodePoints(input, sourceCodePoints.value)
})

const reductionPercentage = computed(() => originSize.value
  ? (((originSize.value - compressedSize.value) / originSize.value) * 100).toFixed(1)
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
  sharedFontFile.value = file
  fontName.value = file.name
  fontBuffer.value = null
  sourceCodePoints.value = []
  downloadUrl.value = ''
  errorMsg.value = ''
  originSize.value = file.size
  compressedSize.value = 0
  originalGlyphCount.value = 0
  remainingGlyphCount.value = 0
  if (!format) {
    errorMsg.value = 'Choose a TTF, OTF, WOFF, or WOFF2 font file.'
    return
  }

  sourceFormat.value = format
  file.arrayBuffer().then(async buffer => {
    try {
      const parsed = await parseFontBuffer(buffer, format)
      fontBuffer.value = buffer
      sourceCodePoints.value = getMappedCodePoints(parsed.data.cmap)
      originalGlyphCount.value = parsed.data.maxp?.numGlyphs || parsed.data.glyf.length
    } catch {
      errorMsg.value = 'The selected font could not be read. Check that the file is valid and not password-protected.'
    }
  }).catch(() => {
    errorMsg.value = 'The selected font could not be read.'
  })
}

onMounted(() => {
  const route = useRoute()
  if (typeof route.query.text === 'string') {
    charInput.value = route.query.text
    inputMode.value = 'text'
  } else if (sharedSubsetText.value) {
    charInput.value = sharedSubsetText.value
    inputMode.value = 'text'
    sharedSubsetText.value = ''
  }
  if (sharedFontFile.value && !fontBuffer.value) loadFontFile(sharedFontFile.value)
})

function applyPreset() {
  inputMode.value = 'preset'
}

function selectAvailableCodePoints(value, availableCodePoints) {
  const ranges = []
  const parsedRanges = parseUnicodeRanges(value)
  if (!parsedRanges) return []
  ranges.push(...parsedRanges)
  return availableCodePoints.filter(codePoint => ranges.some(([start, end]) => codePoint >= start && codePoint <= end))
}

function onTextFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  textName.value = file.name
  const reader = new FileReader()
  reader.onload = function(evt) {
    // 合并后去重排序
    charInput.value += evt.target.result
  }
  reader.readAsText(file)
}

function clearFontFile() {
  sharedFontFile.value = null
  fontBuffer.value = null
  fontName.value = ''
  sourceFormat.value = null
  sourceCodePoints.value = []
  originalGlyphCount.value = 0
  remainingGlyphCount.value = 0
  originSize.value = 0
  compressedSize.value = 0
  downloadUrl.value = ''
  errorMsg.value = ''
  if (fontInputRef.value) fontInputRef.value.value = ''
}

function clearTextFile() {
  textName.value = ''
  if (textInputRef.value) textInputRef.value.value = ''
}

function clearAll() {
  clearFontFile()
  clearTextFile()
  charInput.value = ''
  downloadUrl.value = ''
  errorMsg.value = ''
  compressedSize.value = 0
}

async function extractFont() {
  errorMsg.value = ''
  downloadUrl.value = ''
  compressedSize.value = 0
  loading.value = true
  progress.value = 10
  try {
    progress.value = 25
    if (outputType.value === 'woff2') await ensureWoff2Support()
    const font = Font.create(fontBuffer.value, {
      type: sourceFormat.value,
      subset: selectedCodePoints.value,
      hinting: true,
      compound2simple: true,
      combinePath: false
    })
    progress.value = 65
    remainingGlyphCount.value = font.get().glyf.length
    const buffer = font.write({ type: outputType.value, hinting: true })
    const mime = outputType.value === 'ttf' ? 'font/ttf' : `font/${outputType.value}`
    const ext = `.${outputType.value}`
    const blob = new Blob([buffer], { type: mime })
    downloadName.value = 'compressed-' + fontName.value.replace(/\.\w+$/, ext)
    downloadUrl.value = URL.createObjectURL(blob)
    compressedSize.value = blob.size
    progress.value = 100
  } catch (e) {
    errorMsg.value = 'Font subsetting failed. The font may use unsupported tables or contain invalid data.'
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
}


</script>