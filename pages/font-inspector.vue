<template>
  <main class="mx-auto max-w-5xl px-4 py-10">
    <header class="mb-7">
      <h1 class="mb-2 text-3xl font-bold">Font Inspector</h1>
      <p class="text-gray-600">Inspect font names, metrics, glyph coverage, and parsed OpenType data locally in your browser.</p>
    </header>

    <section class="border-y border-gray-200 py-5">
      <label class="mb-2 block text-sm font-semibold" for="font-file">Font file</label>
      <input id="font-file" type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFileChange" />
      <p class="mt-2 text-sm text-gray-500">TTF, OTF, WOFF, and WOFF2 are processed locally. {{ fileName }}</p>
      <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
    </section>

    <template v-if="fontData">
      <section class="grid gap-x-8 gap-y-5 border-b border-gray-200 py-6 sm:grid-cols-2 lg:grid-cols-4">
        <div><div class="text-xs uppercase text-gray-500">Font family</div><strong>{{ fontData.name.fontFamily || 'Unknown' }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Format</div><strong>{{ formatLabel }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">File size</div><strong>{{ prettySize(fileSize) }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Glyphs</div><strong>{{ glyphCount.toLocaleString() }}</strong></div>
      </section>

      <section class="grid gap-8 border-b border-gray-200 py-6 md:grid-cols-2">
        <div>
          <h2 class="mb-4 text-lg font-semibold">Font names</h2>
          <dl class="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
            <div v-for="row in nameRows" :key="row.label" class="contents">
              <dt class="text-gray-500">{{ row.label }}</dt><dd class="break-words">{{ row.value || 'Not available' }}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 class="mb-4 text-lg font-semibold">Technical information</h2>
          <dl class="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
            <div v-for="row in metricRows" :key="row.label" class="contents">
              <dt class="text-gray-500">{{ row.label }}</dt><dd>{{ row.value }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="border-b border-gray-200 py-6">
        <div class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 class="text-lg font-semibold">Character coverage</h2>
          <div class="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
            <span>{{ mappedCodePoints.length.toLocaleString() }} mapped characters</span>
            <span>{{ unmappedGlyphCount.toLocaleString() }} unmapped glyphs</span>
          </div>
        </div>
        <p class="mb-3 break-words font-mono text-sm">{{ unicodeRanges.join(', ') || 'No Unicode mappings found' }}</p>
        <div class="max-h-28 overflow-auto break-all border-l-2 border-gray-300 pl-3 text-sm leading-7" aria-label="Sample mapped characters">{{ characterSample }}</div>
      </section>

      <section class="border-b border-gray-200 py-6">
        <h2 class="mb-1 text-lg font-semibold">Parsed OpenType data</h2>
        <p class="mb-4 text-sm text-gray-500">Table sizes are not exposed by this parser, so only detected tables are listed.</p>
        <div class="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="table in tables" :key="table.name" class="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm">
            <span class="font-mono">{{ table.name }}</span><span class="text-gray-500">{{ table.description }}</span>
          </div>
        </div>
      </section>

      <nav class="flex flex-wrap gap-x-5 gap-y-2 py-5 text-sm">
        <NuxtLinkLocale to="/font-compress" class="text-primary underline">Subset this font</NuxtLinkLocale>
        <NuxtLinkLocale to="/font-unicode-checker" class="text-primary underline">Check Unicode support</NuxtLinkLocale>
      </nav>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { formatUnicodeRanges, getFontFormat, getMappedCodePoints, parseFontBuffer, useSharedFontFile } from '~/composables/useFontTools'

const sharedFontFile = useSharedFontFile()
const fileName = ref('')
const fileSize = ref(0)
const fontFormat = ref(null)
const fontData = ref(null)
const errorMessage = ref('')

const mappedCodePoints = computed(() => fontData.value ? getMappedCodePoints(fontData.value.cmap) : [])
const unicodeRanges = computed(() => formatUnicodeRanges(mappedCodePoints.value))
const glyphCount = computed(() => fontData.value?.maxp?.numGlyphs || fontData.value?.glyf?.length || 0)
const unmappedGlyphCount = computed(() => {
  if (!fontData.value) return 0
  const mappedGlyphIds = new Set(Object.values(fontData.value.cmap))
  return Math.max(0, glyphCount.value - mappedGlyphIds.size)
})
const formatLabel = computed(() => fontFormat.value?.toUpperCase() || '')
const characterSample = computed(() => mappedCodePoints.value.slice(0, 400).map(codePoint => String.fromCodePoint(codePoint)).join(''))
const nameRows = computed(() => {
  const name = fontData.value?.name || {}
  return [
    { label: 'Subfamily', value: name.fontSubFamily },
    { label: 'Full name', value: name.fullName || [name.fontFamily, name.fontSubFamily].filter(Boolean).join(' ') },
    { label: 'PostScript name', value: name.postScriptName },
    { label: 'Version', value: name.version },
    { label: 'Copyright', value: name.copyright },
    { label: 'Trademark', value: name.trademark },
    { label: 'Designer', value: name.designer },
    { label: 'Manufacturer', value: name.manufacturer },
    { label: 'License', value: name.license }
  ]
})
const metricRows = computed(() => {
  const data = fontData.value || {}
  const head = data.head || {}
  const hhea = data.hhea || {}
  const os2 = data['OS/2'] || {}
  const post = data.post || {}
  return [
    { label: 'Units per em', value: head.unitsPerEm ?? head.unitsPerE ?? 'Not available' },
    { label: 'Ascender', value: hhea.ascent ?? 'Not available' },
    { label: 'Descender', value: hhea.descent ?? 'Not available' },
    { label: 'Line gap', value: hhea.lineGap ?? 'Not available' },
    { label: 'Weight class', value: os2.usWeightClass ?? 'Not available' },
    { label: 'Width class', value: os2.usWidthClass ?? 'Not available' },
    { label: 'Italic angle', value: post.italicAngle ?? 'Not available' },
    { label: 'Variable font', value: data.fvar ? 'Yes' : 'Not detected' }
  ]
})
const knownTables = {
  cmap: 'Character mapping', head: 'Font header', hhea: 'Horizontal header', hmtx: 'Horizontal metrics',
  maxp: 'Maximum profile', name: 'Naming records', 'OS/2': 'Style and metrics', post: 'PostScript data',
  glyf: 'Glyph outlines', loca: 'Glyph locations', CFF: 'Compact outlines', GSUB: 'Glyph substitution',
  GPOS: 'Glyph positioning', GDEF: 'Glyph definitions', kern: 'Kerning', fvar: 'Variable axes', STAT: 'Style attributes'
}
const tables = computed(() => Object.keys(knownTables)
  .filter(name => fontData.value && Object.prototype.hasOwnProperty.call(fontData.value, name))
  .map(name => ({ name, description: knownTables[name] })))

useToolSeo({
  title: 'Font Inspector - View TTF, OTF, WOFF & WOFF2 Font Information',
  description: 'Inspect font metadata, metrics, glyph counts, Unicode coverage, and parsed OpenType tables in your browser.',
  keywords: 'font inspector, font metadata viewer, OpenType tables, glyph count, TTF inspector'
})

async function loadFontFile(file) {
  errorMessage.value = ''
  fontData.value = null
  const format = getFontFormat(file.name)
  if (!format) {
    errorMessage.value = 'Choose a TTF, OTF, WOFF, or WOFF2 font file.'
    return
  }
  sharedFontFile.value = file
  fileName.value = file.name
  fileSize.value = file.size
  fontFormat.value = format
  try {
    const { data } = await parseFontBuffer(await file.arrayBuffer(), format)
    fontData.value = data
  } catch {
    errorMessage.value = 'The font could not be parsed. Check that it is a valid, supported font file.'
  }
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (file) loadFontFile(file)
}

function prettySize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

onMounted(() => {
  if (sharedFontFile.value) loadFontFile(sharedFontFile.value)
})
</script>
