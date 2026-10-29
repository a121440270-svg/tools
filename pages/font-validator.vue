<template>
  <main class="mx-auto max-w-5xl px-4 py-10">
    <header class="mb-7">
      <h1 class="mb-2 text-3xl font-bold">Font Validator</h1>
      <p class="text-gray-600">Check whether a font can be parsed and review its core tables and character mappings locally.</p>
    </header>

    <section class="border-y border-gray-200 py-5">
      <label class="mb-2 block text-sm font-semibold" for="font-file">Font file</label>
      <input id="font-file" type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFileChange" />
      <p class="mt-2 text-sm text-gray-500">TTF, OTF, WOFF, and WOFF2 are processed locally. {{ fileName }}</p>
      <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
    </section>

    <template v-if="fontData">
      <section class="grid grid-cols-2 gap-5 border-b border-gray-200 py-6 sm:grid-cols-4">
        <div><div class="text-xs uppercase text-gray-500">Status</div><strong :class="hasErrors ? 'text-red-700' : hasWarnings ? 'text-amber-700' : 'text-green-700'">{{ status }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Passed</div><strong>{{ passedCount }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Warnings</div><strong>{{ warningCount }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Errors</div><strong>{{ errorCount }}</strong></div>
      </section>

      <ul class="divide-y divide-gray-100">
        <li v-for="check in checks" :key="check.label" class="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div><strong>{{ check.label }}</strong><p class="mt-1 text-sm text-gray-600">{{ check.detail }}</p></div>
          <span class="shrink-0 text-sm font-semibold" :class="statusClass(check.status)">{{ check.status }}</span>
        </li>
      </ul>
      <p class="border-t border-gray-200 py-4 text-sm text-gray-500">This browser-based check covers parser and structural signals; it is not a complete OpenType conformance or security audit.</p>

      <nav class="flex flex-wrap gap-x-5 gap-y-2 py-5 text-sm">
        <NuxtLinkLocale to="/font-inspector" class="text-primary underline">Inspect font details</NuxtLinkLocale>
        <NuxtLinkLocale to="/font-size-analyzer" class="text-primary underline">Analyze font size</NuxtLinkLocale>
        <NuxtLinkLocale to="/font-compress" class="text-primary underline">Subset this font</NuxtLinkLocale>
      </nav>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getFontFormat, getMappedCodePoints, parseFontBuffer, useSharedFontFile } from '~/composables/useFontTools'

const sharedFontFile = useSharedFontFile()
const fileName = ref('')
const fontData = ref(null)
const errorMessage = ref('')
const mappedGlyphIds = computed(() => new Set(Object.values(fontData.value?.cmap || {})))
const glyphCount = computed(() => fontData.value?.maxp?.numGlyphs || fontData.value?.glyf?.length || 0)
const codePoints = computed(() => getMappedCodePoints(fontData.value?.cmap || {}))
const checks = computed(() => {
  if (!fontData.value) return []
  const data = fontData.value
  const outlinePresent = (Array.isArray(data.glyf) && data.glyf.length > 0) || Boolean(data.CFF || data.CFF2)
  const invalidGlyphMappings = Object.values(data.cmap || {}).filter(glyphId => !Number.isInteger(glyphId) || glyphId < 0 || (glyphCount.value > 0 && glyphId >= glyphCount.value)).length
  return [
    { label: 'Font structure parsed', detail: 'The font parser read the file without a structural parsing error.', status: 'Passed' },
    { label: 'Core tables', detail: 'Checks for head, hhea, and maxp tables.', status: ['head', 'hhea', 'maxp'].every(name => data[name]) ? 'Passed' : 'Error' },
    { label: 'Name table', detail: data.name?.fontFamily ? `Family name: ${data.name.fontFamily}` : 'No usable font family name was found.', status: data.name?.fontFamily ? 'Passed' : 'Warning' },
    { label: 'Unicode character mapping', detail: codePoints.value.length ? `${codePoints.value.length.toLocaleString()} mapped code points found.` : 'No mapped Unicode characters were found.', status: codePoints.value.length ? 'Passed' : 'Warning' },
    { label: 'Glyph outlines', detail: outlinePresent ? 'An outline table was detected.' : 'No supported glyf or CFF outline data was detected.', status: outlinePresent ? 'Passed' : 'Error' },
    { label: 'Character-to-glyph references', detail: invalidGlyphMappings ? `${invalidGlyphMappings.toLocaleString()} mapping entries reference invalid glyph IDs.` : `${mappedGlyphIds.value.size.toLocaleString()} distinct glyph IDs are referenced.`, status: invalidGlyphMappings ? 'Error' : 'Passed' }
  ]
})
const passedCount = computed(() => checks.value.filter(check => check.status === 'Passed').length)
const warningCount = computed(() => checks.value.filter(check => check.status === 'Warning').length)
const errorCount = computed(() => checks.value.filter(check => check.status === 'Error').length)
const hasErrors = computed(() => errorCount.value > 0)
const hasWarnings = computed(() => warningCount.value > 0)
const status = computed(() => hasErrors.value ? 'Error' : hasWarnings.value ? 'Warning' : 'Valid')

useToolSeo({
  title: 'Font Validator - Check TTF, OTF, WOFF & WOFF2 Files',
  description: 'Validate font parsing, core tables, glyph outlines, and Unicode mappings locally in your browser.',
  keywords: 'font validator, validate font file, TTF checker, OTF validator, WOFF2 validator'
})

function statusClass(value) {
  return value === 'Passed' ? 'text-green-700' : value === 'Warning' ? 'text-amber-700' : 'text-red-700'
}

async function loadFontFile(file) {
  errorMessage.value = ''
  fontData.value = null
  fileName.value = file.name
  const format = getFontFormat(file.name)
  if (!format) {
    errorMessage.value = 'Choose a TTF, OTF, WOFF, or WOFF2 font file.'
    return
  }
  try {
    const { data } = await parseFontBuffer(await file.arrayBuffer(), format)
    fontData.value = data
    sharedFontFile.value = file
  } catch {
    errorMessage.value = 'The font could not be parsed. Check that it is a valid, supported font file.'
  }
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) loadFontFile(file)
}

onMounted(() => {
  if (sharedFontFile.value) loadFontFile(sharedFontFile.value)
})
</script>