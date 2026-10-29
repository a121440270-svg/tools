<template>
  <main class="mx-auto max-w-5xl px-4 py-10">
    <header class="mb-7">
      <h1 class="mb-2 text-3xl font-bold">Font Unicode Checker</h1>
      <p class="text-gray-600">Check whether a font maps the characters and Unicode code points your project needs.</p>
    </header>

    <section class="grid gap-8 border-y border-gray-200 py-5 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-sm font-semibold" for="font-file">Font file</label>
        <input id="font-file" type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFileChange" />
        <p class="mt-2 text-sm text-gray-500">TTF, OTF, WOFF, and WOFF2 are processed locally. {{ fileName }}</p>
      </div>
      <div>
        <label class="mb-2 block text-sm font-semibold">Check characters</label>
        <el-radio-group v-model="inputMode" class="mb-3">
          <el-radio-button label="text">Text</el-radio-button>
          <el-radio-button label="range">Unicode range</el-radio-button>
          <el-radio-button label="preset">Language preset</el-radio-button>
        </el-radio-group>
        <el-input v-if="inputMode === 'text'" v-model="textInput" type="textarea" :rows="3" placeholder="Hello 你好世界" />
        <el-input v-else-if="inputMode === 'range'" v-model="rangeInput" type="textarea" :rows="2" placeholder="U+0000-00FF, U+4E00-9FFF" />
        <el-select v-else v-model="selectedPreset" class="w-full">
          <el-option v-for="preset in languagePresets" :key="preset.value" :label="preset.label" :value="preset.value" />
        </el-select>
      </div>
    </section>

    <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
    <p v-if="rangeInputError" class="mt-4 text-sm text-red-600">Enter Unicode ranges such as U+0000-00FF or U+4E00.</p>

    <template v-if="fontData && results.length">
      <section class="grid grid-cols-2 gap-5 border-b border-gray-200 py-6 sm:grid-cols-4">
        <div><div class="text-xs uppercase text-gray-500">Characters</div><strong>{{ results.length.toLocaleString() }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Supported</div><strong>{{ supportedCount.toLocaleString() }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Missing</div><strong>{{ missingCount.toLocaleString() }}</strong></div>
        <div><div class="text-xs uppercase text-gray-500">Character coverage</div><strong>{{ coverage }}%</strong></div>
      </section>

      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 py-4">
        <p class="text-sm text-gray-600">{{ fontData.name.fontFamily || fileName }} · {{ fontFormat?.toUpperCase() }}</p>
        <div class="flex flex-wrap gap-4 text-sm">
          <button v-if="missingCharacters" type="button" class="text-primary underline" @click="copyMissing">Copy missing characters</button>
          <button type="button" class="text-primary underline" @click="createSubset">Create font subset</button>
        </div>
      </div>

      <p v-if="inputMode !== 'text'" class="border-b border-gray-200 py-3 text-sm text-amber-700">
        Unicode range coverage is not the same as complete language support; language needs depend on the text and shaping rules in use.
      </p>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead><tr class="border-b border-gray-200 text-xs uppercase text-gray-500"><th class="py-3 pr-4">Character</th><th class="py-3 pr-4">Unicode</th><th class="py-3 pr-4">Glyph ID</th><th class="py-3">Status</th></tr></thead>
          <tbody>
            <tr v-for="result in visibleResults" :key="result.codePoint" class="border-b border-gray-100">
              <td class="py-2 pr-4 font-mono text-base">{{ result.character }}</td>
              <td class="py-2 pr-4 font-mono">{{ result.unicode }}</td>
              <td class="py-2 pr-4 font-mono">{{ result.supported ? result.glyphId : '—' }}</td>
              <td class="py-2" :class="result.supported ? 'text-green-700' : 'text-red-700'">{{ result.supported ? 'Supported' : 'Missing' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="results.length > visibleResults.length" class="py-3 text-sm text-gray-500">Showing the first {{ visibleResults.length.toLocaleString() }} characters. Coverage totals include all {{ results.length.toLocaleString() }}.</p>
      </div>
    </template>
    <p v-else-if="fontData && !rangeInputError" class="mt-5 text-sm text-gray-500">Enter text, a Unicode range, or select a language preset to check this font.</p>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { FONT_LANGUAGE_PRESETS, getCodePointsInRanges, getFontFormat, parseFontBuffer, useSharedFontFile, useSharedSubsetText } from '~/composables/useFontTools'

const sharedFontFile = useSharedFontFile()
const sharedSubsetText = useSharedSubsetText()
const localePath = useLocalePath()
const fileName = ref('')
const fontFormat = ref(null)
const fontData = ref(null)
const errorMessage = ref('')
const inputMode = ref('text')
const textInput = ref('')
const rangeInput = ref('')
const selectedPreset = ref('english')
const languagePresets = FONT_LANGUAGE_PRESETS

const activeRange = computed(() => inputMode.value === 'preset'
  ? languagePresets.find(preset => preset.value === selectedPreset.value)?.range || ''
  : rangeInput.value)
const checkedCodePoints = computed(() => {
  if (inputMode.value === 'text') return Array.from(new Set(Array.from(textInput.value, character => character.codePointAt(0))))
    .filter(codePoint => codePoint !== undefined)
  return getCodePointsInRanges(activeRange.value)
})
const rangeInputError = computed(() => inputMode.value !== 'text' && checkedCodePoints.value === null)
const results = computed(() => {
  if (!fontData.value || !checkedCodePoints.value) return []
  const cmap = fontData.value.cmap
  return checkedCodePoints.value.map(codePoint => {
    const character = String.fromCodePoint(codePoint)
    const glyphId = cmap[String(codePoint)]
    return {
      character,
      codePoint,
      unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
      glyphId,
      supported: glyphId !== undefined && glyphId > 0
    }
  })
})
const visibleResults = computed(() => results.value.slice(0, 1000))
const supportedCount = computed(() => results.value.filter(result => result.supported).length)
const missingCount = computed(() => results.value.length - supportedCount.value)
const coverage = computed(() => results.value.length ? (supportedCount.value * 100 / results.value.length).toFixed(1) : '0.0')
const missingCharacters = computed(() => Array.from(new Set(results.value.filter(result => !result.supported).map(result => result.character))).join(''))
const checkedCharacters = computed(() => Array.from(new Set(results.value.map(result => result.character))).join(''))

useToolSeo({
  title: 'Font Unicode Checker - Check Character & Unicode Support',
  description: 'Check font character mappings, Unicode ranges, missing characters, and character coverage locally in your browser.',
  keywords: 'font Unicode checker, character coverage, missing glyph checker, Unicode range font test'
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

function createSubset() {
  sharedSubsetText.value = checkedCharacters.value
  navigateTo(localePath('/font-compress'))
}

async function copyMissing() {
  try {
    await navigator.clipboard.writeText(missingCharacters.value)
  } catch {
    errorMessage.value = 'Clipboard access is unavailable in this browser.'
  }
}

onMounted(() => {
  if (sharedFontFile.value) loadFontFile(sharedFontFile.value)
})
</script>
