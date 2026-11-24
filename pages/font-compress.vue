<template>
  <div class="max-w-3xl mx-auto py-10">
    <h1 class="text-3xl font-bold mb-4">{{ t('font.h1') }}</h1>
    <p class="mb-4 text-gray-600 text-base leading-7">
      {{ t('font.lead') }}
    </p>
    <ul class="mb-6 grid gap-2 text-sm text-gray-600 sm:grid-cols-3 dark:text-slate-300">
      <li class="rounded-lg border border-gray-200 px-3 py-2 dark:border-slate-700">✓ {{ t('font.trust.local') }}</li>
      <li class="rounded-lg border border-gray-200 px-3 py-2 dark:border-slate-700">✓ {{ t('font.trust.compare') }}</li>
      <li class="rounded-lg border border-gray-200 px-3 py-2 dark:border-slate-700">✓ {{ t('font.trust.formats') }}</li>
    </ul>
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
        <el-input v-if="inputMode === 'text'" v-model="charInput" type="textarea" :rows="3" :placeholder="t('font.input_placeholder')" />
        <el-input v-else-if="inputMode === 'range'" v-model="rangeInput" type="textarea" :rows="2" placeholder="U+0000-00FF, U+4E00-9FFF" />
        <el-select v-else v-model="selectedPreset" class="w-full" @change="applyPreset">
          <el-option v-for="preset in languagePresets" :key="preset.value" :label="t(`font.preset_${preset.value.replace(/-/g,'_')}`, preset.label)" :value="preset.value" />
        </el-select>
        <div class="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
          <span>{{ t('font.requested_chars') }}: {{ subsetAnalysis.requested.length }}</span>
          <span>{{ t('font.kept_chars') }}: {{ subsetAnalysis.selected.length }}</span>
          <span :class="missingCodePoints.length ? 'text-amber-600' : ''">{{ t('font.missing_chars') }}: {{ missingCodePoints.length }}</span>
          <span>{{ t('font.coverage') }}: {{ coveragePercent }}%</span>
        </div>
        <p v-if="rangeError" class="mt-1 text-xs text-red-600">{{ rangeError === 'too_large' ? t('font.range_too_large') : t('font.range_invalid') }}</p>
        <div v-if="fontBuffer && missingCodePoints.length" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          <p>{{ t('font.missing_warning', { count: missingCodePoints.length }) }}</p>
          <div class="mt-2 flex flex-wrap gap-1 font-mono text-xs">
            <span v-for="cp in missingPreview" :key="cp" class="rounded border border-amber-300 px-1.5 py-0.5 dark:border-amber-700" :title="formatCodePoint(cp)">{{ String.fromCodePoint(cp) }}</span>
            <span v-if="missingCodePoints.length > missingPreview.length" class="px-1">+{{ missingCodePoints.length - missingPreview.length }}</span>
          </div>
          <div class="mt-2 flex gap-3">
            <button type="button" class="underline" @click="copyMissingChars">{{ t('font.copy_missing') }}</button>
            <NuxtLinkLocale :to="{ path: '/font-unicode-checker' }" class="underline">{{ t('font.check_missing') }}</NuxtLinkLocale>
          </div>
        </div>
      </el-form-item>
      <el-form-item :label="t('font.upload_text')">
        <input type="file" accept=".txt" @change="onTextFileChange" ref="textInputRef" />
        <span v-if="textName" class="ml-2 text-green-600">{{ t('font.text_selected', { name: textName }) }}</span>
      </el-form-item>
      <el-form-item :label="t('font.output_type')">
        <el-radio-group v-model="outputType">
          <el-radio-button v-for="type in outputTypes" :key="type.value" :label="type.value">
            {{ type.label }}<span v-if="type.recommended" class="recommended-badge ml-1 text-[10px] font-semibold">({{ t('font.recommended') }})</span>
          </el-radio-button>
        </el-radio-group>
        <p class="mt-2 text-xs text-gray-500">{{ t('font.output_hint') }}</p>
      </el-form-item>
      <p class="mb-5 text-sm text-gray-500">{{ t('font.local_processing') }}</p>
      <el-form-item>
        <el-button type="primary" :disabled="!fontBuffer || !selectedCodePoints.length || loading || !!rangeError" @click="extractFont">{{ t('font.start') }}</el-button>
        <el-button size="default" class="ml-2" @click="clearAll">{{ t('font.clear') }}</el-button>
      </el-form-item>
      <p v-if="fontBuffer && !selectedCodePoints.length && !rangeError" class="text-xs text-amber-600">{{ t('font.no_keepable_chars') }}</p>
    </el-form>
    <el-progress v-if="loading" :percentage="progress" class="mb-4" />
    <div v-if="downloadUrl" class="mt-6 space-y-4">
      <el-alert type="success" show-icon :title="t('font.success')">
        <template #default>
          <a :href="downloadUrl" :download="downloadName" class="text-primary underline">{{ t('font.download') }}</a>
          <span class="ml-2 text-xs text-gray-400">{{ t('font.only_glyphs') }}</span>
          <span v-if="compressedSize" class="ml-4 text-xs text-gray-500">{{ t('font.compressed_size', { size: prettySize(compressedSize) }) }}</span>
        </template>
      </el-alert>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="border-l-2 border-gray-300 pl-3"><div class="text-xs text-gray-500">{{ t('font.original_size') }}</div><strong>{{ prettySize(originSize) }}</strong></div>
        <div class="border-l-2 border-green-600 pl-3"><div class="text-xs text-gray-500">{{ t('font.optimized_size') }}</div><strong>{{ prettySize(compressedSize) }}</strong></div>
        <div class="border-l-2 border-blue-600 pl-3"><div class="text-xs text-gray-500">{{ t('font.saved_size') }}</div><strong>{{ prettySize(originSize - compressedSize) }}</strong></div>
        <div class="border-l-2 border-amber-500 pl-3"><div class="text-xs text-gray-500">{{ t('font.reduction') }}</div><strong>{{ reductionPercentage }}%</strong></div>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
        <div class="rounded border border-gray-200 p-3 dark:border-slate-700"><div class="text-xs text-gray-500">{{ t('font.glyph_count') }}</div><strong>{{ originalGlyphCount.toLocaleString() }} → {{ remainingGlyphCount.toLocaleString() }}</strong></div>
        <div class="rounded border border-gray-200 p-3 dark:border-slate-700"><div class="text-xs text-gray-500">{{ t('font.requested_chars') }}</div><strong>{{ subsetAnalysis.requested.length }}</strong></div>
        <div class="rounded border border-gray-200 p-3 dark:border-slate-700"><div class="text-xs text-gray-500">{{ t('font.missing_chars') }}</div><strong :class="missingCodePoints.length ? 'text-amber-600' : ''">{{ missingCodePoints.length }}</strong></div>
        <div class="rounded border border-gray-200 p-3 dark:border-slate-700"><div class="text-xs text-gray-500">{{ t('font.coverage') }}</div><strong>{{ coveragePercent }}%</strong></div>
      </div>

      <div class="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
        <h2 class="text-lg font-semibold">{{ t('font.export_title') }}</h2>
        <p class="mt-1 text-sm text-gray-600 dark:text-slate-300">{{ t('font.export_desc') }}</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <label class="text-sm"><span class="mb-1 block text-gray-600 dark:text-slate-300">{{ t('font.font_family') }}</span><input v-model="exportFamily" class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
          <label class="text-sm"><span class="mb-1 block text-gray-600 dark:text-slate-300">{{ t('font.font_display') }}</span>
            <select v-model="exportDisplay" class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
              <option>swap</option><option>block</option><option>fallback</option><option>optional</option><option>auto</option>
            </select>
          </label>
          <label class="text-sm"><span class="mb-1 block text-gray-600 dark:text-slate-300">{{ t('font.sample_text') }}</span><input v-model="exportSample" class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" /></label>
        </div>
                <p class="mt-3 text-xs text-emerald-700 dark:text-emerald-300">{{ t('font.export_ready') }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <a :href="downloadUrl" :download="downloadName" class="rounded bg-primary px-3 py-2 text-sm text-white">{{ t('font.download') }}</a>
          <button type="button" class="rounded border border-gray-300 px-3 py-2 text-sm dark:border-slate-600" @click="copyCss">{{ t('font.copy_css') }}</button>
          <button type="button" class="rounded border border-gray-300 px-3 py-2 text-sm dark:border-slate-600" :disabled="zipLoading" @click="downloadZipPackage">{{ zipLoading ? '...' : t('font.download_zip') }}</button>
        </div>
        <p v-if="copyCssMessage" class="mt-2 text-sm text-green-600">{{ copyCssMessage }}</p>
        <p v-if="zipError" class="mt-2 text-sm text-red-600">{{ zipError }}</p>
      </div>
    </div>
    <div v-if="errorMsg" class="mt-4 text-red-600">{{ t('font.error', { msg: errorMsg }) }}</div>

    <nav class="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-4 text-sm">
      <NuxtLinkLocale to="/ttf-to-woff2" class="text-primary underline">{{ t('menu.ttfToWoff2') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-subsetter" class="text-primary underline">{{ t('menu.fontSubsetter') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/compress-woff2" class="text-primary underline">{{ t('menu.compressWoff2') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-inspector" class="text-primary underline">{{ t('font.tools.inspector') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-unicode-checker" class="text-primary underline">{{ t('font.tools.unicodeChecker') }}</NuxtLinkLocale>
    </nav>

    <section class="mt-10 space-y-8">
      <div class="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
        <h2 class="mb-2 text-xl font-semibold dark:text-slate-100">{{ t('font.section.subsetting_title') }}</h2>
        <p class="leading-7 text-gray-700 dark:text-slate-300">{{ t('font.section.subsetting_text') }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 p-5 dark:border-slate-700 dark:bg-slate-900/60">
        <h2 class="mb-3 text-xl font-semibold dark:text-slate-100">{{ t('font.section.steps_title') }}</h2>
        <ol class="list-decimal space-y-2 pl-5 leading-7 text-gray-700 dark:text-slate-300">
          <li>{{ t('font.section.steps_1') }}</li>
          <li>{{ t('font.section.steps_2') }}</li>
          <li>{{ t('font.section.steps_3') }}</li>
          <li>{{ t('font.section.steps_4') }}</li>
        </ol>
      </div>

      <div class="rounded-xl border border-gray-200 p-5 dark:border-slate-700 dark:bg-slate-900/60">
        <h2 class="mb-3 text-xl font-semibold dark:text-slate-100">{{ t('font.section.why_title') }}</h2>
        <p class="leading-7 text-gray-700 dark:text-slate-300">{{ t('font.section.why_text') }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 p-5 dark:border-slate-700">
        <h2 class="text-xl font-semibold mb-3 dark:text-slate-100">{{ t('font.section.faq_title') }}</h2>
        <div class="space-y-5 text-gray-700 dark:text-slate-300">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-slate-100">{{ t('font.section.faq_1_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_1_a') }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-slate-100">{{ t('font.section.faq_2_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_2_a') }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-slate-100">{{ t('font.section.faq_3_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_3_a') }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-slate-100">{{ t('font.section.faq_4_q') }}</h3>
            <p class="mt-1 leading-7">{{ t('font.section.faq_4_a') }}</p>
          </div>
        </div>
      </div>

      <!-- Related font tools: keeps crawl paths and link equity flowing between
           the pages of the font cluster. -->
      <div class="rounded-xl border border-gray-200 p-5 dark:border-slate-700">
        <h2 class="text-xl font-semibold mb-3 dark:text-slate-100">{{ t('font.section.related_title') }}</h2>
        <p class="mb-4 leading-7 text-gray-700 dark:text-slate-300">{{ t('font.section.related_desc') }}</p>
        <div class="flex flex-wrap gap-3">
          <NuxtLinkLocale to="/ttf-to-woff2" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-200">
            {{ t('menu.ttfToWoff2') }}
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
          <NuxtLinkLocale to="/font-unicode-checker" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-200">
            {{ t('menu.fontUnicodeChecker') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale to="/font-css-generator" class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-200">
            {{ t('menu.fontCssGenerator') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  FONT_LANGUAGE_PRESETS,
  analyzeSubsetSelection,
  codePointsToText,
  ensureWoff2Support,
  formatCodePoint,
  getFontFormat,
  getMappedCodePoints,
  getRequestedCodePointsFromRanges,
  getRequestedCodePointsFromText,
  parseFontBuffer,
  useSharedFontFile,
  useSharedSubsetText
} from '~/composables/useFontTools'

const { t } = useI18n()
const route = useRoute()
const { trackStart, trackSuccess, trackError } = useToolAnalytics('font-compress')
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
const outputType = ref('woff2')
const inputMode = ref('text')
const rangeInput = ref('')
const selectedPreset = ref('basic-latin')
const sourceFormat = ref(null)
const sourceCodePoints = ref([])
const originalGlyphCount = ref(0)
const remainingGlyphCount = ref(0)
const rangeError = ref('')
const exportFamily = ref('')
const exportDisplay = ref('swap')
const exportSample = ref('')
const copyCssMessage = ref('')
const zipLoading = ref(false)
const zipError = ref('')
const queryApplied = ref(false)

const fontInputRef = ref(null)
const textInputRef = ref(null)

const pageTitle = computed(() => t('font.title'))
const pageDescription = computed(() => t('font.seo_desc'))
const pageKeywords = computed(() => t('font.seo_keywords'))

useToolSeo({
  title: pageTitle,
  description: pageDescription,
  keywords: pageKeywords,
  featureList: computed(() => pageKeywords.value.split(',').map(item => item.trim()).filter(Boolean)),
  faqItems: computed(() => [1, 2, 3, 4].map((index) => ({
    q: t(`font.section.faq_${index}_q`),
    a: t(`font.section.faq_${index}_a`)
  }))),
  dateModified: '2026-11-10',
  schemaProperties: { category: 'Font Tools' }
})

const languagePresets = FONT_LANGUAGE_PRESETS
const outputTypes = [
  { value: 'woff2', label: 'WOFF2', recommended: true },
  { value: 'woff', label: 'WOFF', recommended: false },
  { value: 'ttf', label: 'TTF', recommended: false }
]

const requestedCodePoints = computed(() => {
  rangeError.value = ''
  if (inputMode.value === 'text') return getRequestedCodePointsFromText(charInput.value)
  const input = inputMode.value === 'preset'
    ? languagePresets.find(preset => preset.value === selectedPreset.value)?.range || ''
    : rangeInput.value
  const result = getRequestedCodePointsFromRanges(input)
  if (result.error) {
    rangeError.value = result.error
    return []
  }
  return result.codePoints
})

const subsetAnalysis = computed(() => {
  if (!fontBuffer.value) {
    const requested = requestedCodePoints.value
    return { requested, selected: requested, missing: [], coverage: 1 }
  }
  return analyzeSubsetSelection(requestedCodePoints.value, sourceCodePoints.value)
})

const selectedCodePoints = computed(() => subsetAnalysis.value.selected)
const missingCodePoints = computed(() => subsetAnalysis.value.missing)
const coveragePercent = computed(() => Math.round(subsetAnalysis.value.coverage * 1000) / 10)
const missingPreview = computed(() => missingCodePoints.value.slice(0, 60))

const reductionPercentage = computed(() => originSize.value && compressedSize.value
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

function revokeDownloadUrl() {
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
}

function defaultExportFamily(name) {
  const base = (name || 'subset-font').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return base || 'SubsetFont'
}

function loadFontFile(file) {
  const format = getFontFormat(file.name)
  sharedFontFile.value = file
  fontName.value = file.name
  fontBuffer.value = null
  sourceCodePoints.value = []
  revokeDownloadUrl()
  downloadUrl.value = ''
  errorMsg.value = ''
  originSize.value = file.size
  compressedSize.value = 0
  originalGlyphCount.value = 0
  remainingGlyphCount.value = 0
  exportFamily.value = defaultExportFamily(file.name)
  exportSample.value = charInput.value.slice(0, 80)
  copyCssMessage.value = ''
  zipError.value = ''
  if (!format) {
    errorMsg.value = 'Choose a TTF, OTF, WOFF, or WOFF2 font file.'
    return
  }

  sourceFormat.value = format
  trackStart({ input_format: format, input_size: file.size })
  file.arrayBuffer().then(async buffer => {
    try {
      const parsed = await parseFontBuffer(buffer, format)
      fontBuffer.value = buffer
      sourceCodePoints.value = getMappedCodePoints(parsed.data.cmap)
      originalGlyphCount.value = parsed.data.maxp?.numGlyphs || parsed.data.glyf.length
      exportFamily.value = parsed.data?.name?.fontFamily || exportFamily.value
    } catch {
      errorMsg.value = 'The selected font could not be read. Check that the file is valid and not password-protected.'
    }
  }).catch(() => {
    errorMsg.value = 'The selected font could not be read.'
  })
}

function applyQueryPreset() {
  if (queryApplied.value) return
  queryApplied.value = true
  const q = route.query
  if (typeof q.output === 'string' && ['ttf', 'woff', 'woff2'].includes(q.output)) outputType.value = q.output
  if (typeof q.mode === 'string' && ['text', 'range', 'preset'].includes(q.mode)) inputMode.value = q.mode
  if (typeof q.preset === 'string' && languagePresets.some(p => p.value === q.preset)) selectedPreset.value = q.preset
  if (typeof q.range === 'string') {
    rangeInput.value = q.range
    if (!q.mode) inputMode.value = 'range'
  }
  if (typeof q.text === 'string') {
    charInput.value = q.text
    inputMode.value = 'text'
  } else if (sharedSubsetText.value) {
    charInput.value = sharedSubsetText.value
    inputMode.value = 'text'
    sharedSubsetText.value = ''
  }
}

onMounted(() => {
  applyQueryPreset()
  if (sharedFontFile.value && !fontBuffer.value) loadFontFile(sharedFontFile.value)
})

watch(charInput, (value) => {
  if (!exportSample.value || exportSample.value === value.slice(0, 79)) exportSample.value = value.slice(0, 80)
})

function applyPreset() {
  inputMode.value = 'preset'
}

async function copyMissingChars() {
  if (!missingCodePoints.value.length) return
  try {
    await navigator.clipboard.writeText(codePointsToText(missingCodePoints.value))
    copyCssMessage.value = t('font.missing_copied')
    setTimeout(() => { if (copyCssMessage.value === t('font.missing_copied')) copyCssMessage.value = '' }, 1500)
  } catch {
    errorMsg.value = 'Clipboard access is unavailable in this browser.'
  }
}

function buildFontFaceCss() {
  const family = (exportFamily.value || defaultExportFamily(fontName.value)).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const formatMap = { ttf: 'truetype', otf: 'opentype', woff: 'woff', woff2: 'woff2' }
  const fmt = formatMap[outputType.value] || outputType.value
  return `@font-face {\n  font-family: '${family}';\n  src: url('./fonts/${downloadName.value}') format('${fmt}');\n  font-display: ${exportDisplay.value};\n  font-style: normal;\n  font-weight: 400;\n}\n`
}

async function copyCss() {
  try {
    await navigator.clipboard.writeText(buildFontFaceCss())
    copyCssMessage.value = t('font.css_copied')
    setTimeout(() => { if (copyCssMessage.value === t('font.css_copied')) copyCssMessage.value = '' }, 1500)
  } catch {
    errorMsg.value = 'Clipboard access is unavailable in this browser.'
  }
}

async function downloadZipPackage() {
  if (!downloadUrl.value) return
  zipLoading.value = true
  zipError.value = ''
  try {
    const { default: JSZip } = await import('jszip')
    const fontBlob = await fetch(downloadUrl.value).then(r => r.blob())
    const css = buildFontFaceCss()
    const sample = exportSample.value || charInput.value.slice(0, 80) || 'Sample Text'
    const family = (exportFamily.value || defaultExportFamily(fontName.value)).replace(/[<>&"]/g, '')
    const html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Font Subset Demo</title>\n<link rel="stylesheet" href="./font.css">\n<style>body{font-family:'${family}',sans-serif;padding:24px;line-height:1.6}</style>\n</head>\n<body>\n<h1>${family}</h1>\n<p>${sample.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</p>\n</body>\n</html>`
    const readme = `Generated locally by OnliTools Font Compressor\n\nRequested chars: ${subsetAnalysis.value.requested.length}\nKept chars: ${subsetAnalysis.value.selected.length}\nMissing chars: ${subsetAnalysis.value.missing.length}\nCoverage: ${coveragePercent.value}%\nOriginal size: ${prettySize(originSize.value)}\nSubset size: ${prettySize(compressedSize.value)}\n`
    const zip = new JSZip()
    const root = zip.folder('font-subset')
    root?.folder('fonts')?.file(downloadName.value, fontBlob)
    root?.file('font.css', css)
    root?.file('demo.html', html)
    root?.file('README.txt', readme)
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${defaultExportFamily(fontName.value)}-subset.zip`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    zipError.value = t('font.zip_failed')
  } finally {
    zipLoading.value = false
  }
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
  revokeDownloadUrl()
  downloadUrl.value = ''
  errorMsg.value = ''
  copyCssMessage.value = ''
  zipError.value = ''
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
  rangeInput.value = ''
  selectedPreset.value = 'basic-latin'
  inputMode.value = 'text'
  outputType.value = 'woff2'
  errorMsg.value = ''
  compressedSize.value = 0
  rangeError.value = ''
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
    const { Font } = await import('fonteditor-core')
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
    trackSuccess({
      input_format: sourceFormat.value,
      output_format: outputType.value,
      input_size: originSize.value,
      output_size: blob.size,
      glyphs_before: originalGlyphCount.value,
      glyphs_after: remainingGlyphCount.value
    })
  } catch (e) {
    trackError({ reason: 'subset_failed' })
    errorMsg.value = 'Font subsetting failed. The font may use unsupported tables or contain invalid data.'
  } finally {
    setTimeout(() => { loading.value = false }, 300)
  }
}

</script>

<style scoped>
.recommended-badge { color: #047857; }
:deep(.el-radio-button.is-active .recommended-badge) {
  color: #ecfdf5;
  background: rgba(255, 255, 255, 0.18);
  padding: 0 0.25rem;
  border-radius: 9999px;
}
</style>