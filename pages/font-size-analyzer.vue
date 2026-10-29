<template>
  <main class="mx-auto max-w-5xl px-4 py-10">
    <header class="mb-7">
      <h1 class="mb-2 text-3xl font-bold">Font Size Analyzer</h1>
      <p class="text-gray-600">Analyze font size, glyph coverage, and available OpenType data locally in your browser.</p>
    </header>

    <section class="border-y border-gray-200 py-5">
      <label class="mb-2 block text-sm font-semibold" for="font-file">Font file</label>
      <input id="font-file" type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFileChange" />
      <p class="mt-2 text-sm text-gray-500">TTF, OTF, WOFF, and WOFF2 are processed locally. {{ fileName }}</p>
      <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
    </section>

    <template v-if="fontData">
      <section class="grid grid-cols-2 gap-5 border-b border-gray-200 py-6 sm:grid-cols-5">
        <div><div class="text-xs uppercase text-gray-500">File size</div><strong>{{ prettySize(fileSize) }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Format</div><strong>{{ fontFormat.toUpperCase() }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Glyphs</div><strong>{{ glyphCount.toLocaleString() }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Mapped characters</div><strong>{{ mappedCodePoints.length.toLocaleString() }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Tables detected</div><strong>{{ tables.length }}</strong></div>
      </section>

      <section class="grid gap-8 border-b border-gray-200 py-6 md:grid-cols-2">
        <div>
          <h2 class="mb-3 text-lg font-semibold">Font structure</h2>
          <p class="mb-4 text-sm text-gray-600">The current browser parser does not expose reliable per-table byte sizes, so no table-size estimates are shown.</p>
          <div class="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <div v-for="table in tables" :key="table.name" class="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm">
              <span class="font-mono">{{ table.name }}</span><span class="text-gray-500">{{ table.description }}</span>
            </div>
          </div>
        </div>
        <div>
          <h2 class="mb-3 text-lg font-semibold">Potential optimization</h2>
          <ul class="space-y-3 text-sm">
            <li class="border-l-2 border-green-600 pl-3"><strong>Font subsetting · High impact</strong><p class="mt-1 text-gray-600">Keep only the characters your project uses to remove unused glyphs.</p></li>
            <li class="border-l-2 border-blue-600 pl-3"><strong>WOFF2 · High impact for web delivery</strong><p class="mt-1 text-gray-600">Convert a web font to WOFF2 where your delivery workflow supports it.</p></li>
            <li class="border-l-2 border-gray-400 pl-3"><strong>Table cleanup · Not measured</strong><p class="mt-1 text-gray-600">This analyzer cannot determine whether individual tables can be safely removed.</p></li>
          </ul>
        </div>
      </section>

      <nav class="flex flex-wrap gap-x-5 gap-y-2 py-5 text-sm">
        <NuxtLinkLocale to="/font-compress" class="text-primary underline">Subset this font</NuxtLinkLocale>
        <NuxtLinkLocale to="/font-inspector" class="text-primary underline">Inspect font details</NuxtLinkLocale>
        <NuxtLinkLocale to="/font-unicode-checker" class="text-primary underline">Check Unicode support</NuxtLinkLocale>
      </nav>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getFontFormat, getMappedCodePoints, parseFontBuffer, useSharedFontFile } from '~/composables/useFontTools'

const sharedFontFile = useSharedFontFile()
const fileName = ref('')
const fileSize = ref(0)
const fontFormat = ref('')
const fontData = ref(null)
const errorMessage = ref('')
const mappedCodePoints = computed(() => fontData.value ? getMappedCodePoints(fontData.value.cmap || {}) : [])
const glyphCount = computed(() => fontData.value?.maxp?.numGlyphs || fontData.value?.glyf?.length || 0)
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
  title: 'Font Size Analyzer - Analyze TTF, OTF & WOFF2 Font Size',
  description: 'Analyze font file size, glyph count, character mappings, and OpenType tables locally in your browser.',
  keywords: 'font size analyzer, font glyph count, font character mapping, OpenType table analyzer'
})

async function loadFontFile(file) {
  errorMessage.value = ''
  fontData.value = null
  const format = getFontFormat(file.name)
  if (!format) {
    errorMessage.value = 'Choose a TTF, OTF, WOFF, or WOFF2 font file.'
    return
  }
  fileName.value = file.name
  fileSize.value = file.size
  fontFormat.value = format
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

function prettySize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

onMounted(() => {
  if (sharedFontFile.value) loadFontFile(sharedFontFile.value)
})
</script>