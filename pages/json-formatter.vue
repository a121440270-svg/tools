<template>
  <div :class="['mx-auto px-4 py-8 sm:px-6 lg:px-8', isFullscreen ? 'max-w-full' : 'max-w-6xl']">
    <div :class="['mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', isFullscreen ? 'rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80' : '']">
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">JSON Tool</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">JSON Formatter</h1>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="btn-primary" @click="formatJson">Format</button>
        <button class="btn-secondary" @click="minifyJson">Minify</button>
        <button class="btn-secondary" @click="copyJson">Copy</button>
        <button class="btn-secondary" @click="pasteJson">Paste</button>
        <button class="btn-secondary" @click="clearJson">Clear</button>
        <button class="btn-secondary" @click="toggleCompareMode">{{ compareMode ? 'Exit compare' : 'Compare JSON' }}</button>
        <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900">
          <span class="text-xs font-medium text-slate-500 dark:text-slate-300">Lang</span>
          <select v-model="selectedLanguage" class="border-0 bg-transparent text-sm text-slate-700 outline-none dark:text-slate-200">
            <option v-for="language in languageOptions" :key="language.value" :value="language.value">{{ language.label }}</option>
          </select>
        </div>
        <button class="btn-secondary" @click="toggleFullscreen">{{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}</button>
      </div>
    </div>

    <div v-if="compareMode" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">JSON diff</p>
          <h2 class="mt-1 text-xl font-bold text-slate-900 dark:text-white">Side-by-side comparison</h2>
        </div>
        <button class="btn-secondary" @click="loadCompareSample">Load sample diff</button>
      </div>

      <div class="mb-4 grid gap-3 md:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Modified</p>
          <p class="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{{ compareSummary.modified }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Added</p>
          <p class="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ compareSummary.added }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Removed</p>
          <p class="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{{ compareSummary.removed }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</p>
          <p class="mt-2 text-lg font-bold" :class="compareSummary.status === 'same' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
            {{ compareSummary.status === 'same' ? 'No change' : 'Changed' }}
          </p>
        </div>
      </div>

      <div class="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-200">
        {{ compareSummary.text }}
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
          <div class="mb-2 flex items-center justify-between px-1">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Base JSON</label>
            <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="compareLeftJson = jsonText">Use current</button>
          </div>
          <div class="h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <CodeMirrorEditor v-model="compareLeftJson" language="json" :theme="editorTheme" :diff-ranges="compareDiff.left" aria-label="Base JSON for comparison" />
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
          <div class="mb-2 flex items-center justify-between px-1">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Compared JSON</label>
            <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="compareRightJson = formattedOutput || jsonText">Use formatted</button>
          </div>
          <div class="h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <CodeMirrorEditor v-model="compareRightJson" language="json" :theme="editorTheme" :diff-ranges="compareDiff.right" aria-label="Compared JSON" />
          </div>
        </div>
      </div>

      <div v-if="compareError" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">
        {{ compareError }}
      </div>
    </div>

    <div v-else :class="['grid gap-4', isFullscreen ? 'lg:grid-cols-1' : 'lg:grid-cols-2']">
      <div ref="inputPanel" :class="['rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900', isFullscreen ? 'w-full' : '']">
        <div class="mb-2 flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Input</label>
            <span class="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Local Only</span>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="!isFullscreen" class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="loadSample">Load sample</button>
            <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="toggleFullscreen">{{ isFullscreen ? 'Exit' : 'Full' }}</button>
          </div>
        </div>
        <div class="code-editor overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950" :class="isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-[520px]'">
          <CodeMirrorEditor v-model="jsonText" :language="selectedLanguage" :theme="editorTheme" aria-label="JSON input" />
        </div>
      </div>

      <div v-if="!isFullscreen" class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-2 flex items-center justify-between px-1">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Output</label>
          <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="downloadJson">Download .json</button>
        </div>
        <div class="code-editor overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 h-[520px]">
          <CodeMirrorEditor :model-value="formattedOutput" language="json" :theme="editorTheme" readonly aria-label="Formatted JSON output" />
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <section v-if="!isFullscreen" class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="mb-5">
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">FAQ</p>
        <h2 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Frequently asked questions</h2>
      </div>

      <div class="space-y-4">
        <div v-for="item in faqItems" :key="item.q" class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">{{ item.q }}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ item.a }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

const inputPanel = ref(null)
const isFullscreen = ref(false)
const compareMode = ref(false)
const jsonText = ref(`{
  "name": "OnliTool",
  "features": ["JSON", "Format", "Validate"],
  "settings": {
    "darkMode": true,
    "autoSave": false
  }
}`)
const compareLeftJson = ref(`{
  "name": "OnliTool",
  "features": ["JSON", "Format", "Validate"],
  "settings": {
    "darkMode": true,
    "autoSave": false
  }
}`)
const compareRightJson = ref(`{
  "name": "OnliTool",
  "features": ["JSON", "Format", "Validate", "Compare"],
  "settings": {
    "darkMode": false,
    "autoSave": true,
    "theme": "dark"
  }
}`)

const errorMessage = ref('')
const compareError = ref('')
const selectedLanguage = ref('javascript')
const editorTheme = ref('light')
let themeObserver
const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'xml', label: 'XML' },
  { value: 'sql', label: 'SQL' }
]

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const toggleCompareMode = () => {
  compareMode.value = !compareMode.value
}

const formatJsonInput = (value) => {
  if (!value || !value.trim()) return ''
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value.trim()
  }
}

const buildDiffSets = (leftValue, rightValue) => {
  const leftRaw = formatJsonInput(leftValue)
  const rightRaw = formatJsonInput(rightValue)
  const leftLines = leftRaw ? leftRaw.split('\n') : ['']
  const rightLines = rightRaw ? rightRaw.split('\n') : ['']
  const maxLines = Math.max(leftLines.length, rightLines.length)
  const leftRanges = []
  const rightRanges = []

  for (let i = 0; i < maxLines; i += 1) {
    const leftLine = leftLines[i]
    const rightLine = rightLines[i]

    if (leftLine === rightLine) continue

    if (leftLine === undefined) {
      rightRanges.push({ startLine: i, endLine: i, type: 'added' })
      continue
    }

    if (rightLine === undefined) {
      leftRanges.push({ startLine: i, endLine: i, type: 'removed' })
      continue
    }

    leftRanges.push({ startLine: i, endLine: i, type: 'modified' })
    rightRanges.push({ startLine: i, endLine: i, type: 'modified' })
  }

  return { left: leftRanges, right: rightRanges }
}

const compareDiff = computed(() => buildDiffSets(compareLeftJson.value, compareRightJson.value))

const compareSummary = computed(() => {
  const left = formatJsonInput(compareLeftJson.value)
  const right = formatJsonInput(compareRightJson.value)

  if (!left && !right) {
    return { status: 'same', modified: 0, added: 0, removed: 0, text: 'Both JSON inputs are empty. Nothing to compare.' }
  }

  if (!left || !right) {
    return { status: 'changed', modified: 0, added: left ? 0 : 0, removed: 0, text: 'One side is empty. Compare result is not identical.' }
  }

  const leftLines = left.split('\n')
  const rightLines = right.split('\n')
  const maxLines = Math.max(leftLines.length, rightLines.length)
  let modified = 0
  let added = 0
  let removed = 0

  for (let i = 0; i < maxLines; i += 1) {
    const leftLine = leftLines[i]
    const rightLine = rightLines[i]

    if (leftLine === rightLine) continue
    if (leftLine === undefined) added += 1
    else if (rightLine === undefined) removed += 1
    else modified += 1
  }

  const total = modified + added + removed
  return {
    status: total === 0 ? 'same' : 'changed',
    modified,
    added,
    removed,
    text: total === 0
      ? 'The two JSON documents are identical.'
      : `Detected ${total} changed line${total > 1 ? 's' : ''} with ${modified} modifications, ${added} additions, and ${removed} removals.`
  }
})

onMounted(() => {
  const syncEditorTheme = () => {
    editorTheme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }

  syncEditorTheme()
  themeObserver = new MutationObserver(syncEditorTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => {
  themeObserver?.disconnect()
})

const isValid = computed(() => {
  if (!jsonText.value.trim()) return true
  try {
    JSON.parse(jsonText.value)
    return true
  } catch {
    return false
  }
})

const formattedOutput = computed(() => {
  if (!jsonText.value.trim()) return ''
  try {
    const parsed = JSON.parse(jsonText.value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return ''
  }
})

const formatJson = () => {
  errorMessage.value = ''
  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('JSON formatted successfully')
  } catch (err) {
    errorMessage.value = `Invalid JSON: ${err.message}`
  }
}

const minifyJson = () => {
  errorMessage.value = ''
  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed)
    ElMessage.success('JSON minified successfully')
  } catch (err) {
    errorMessage.value = `Invalid JSON: ${err.message}`
  }
}

const copyJson = async () => {
  if (!jsonText.value.trim()) {
    ElMessage.warning('Nothing to copy')
    return
  }

  try {
    await navigator.clipboard.writeText(jsonText.value)
    ElMessage.success('JSON copied to clipboard')
  } catch {
    ElMessage.error('Copy failed. Please copy manually.')
  }
}

const pasteJson = async () => {
  try {
    const text = await navigator.clipboard.readText()
    jsonText.value = text
    ElMessage.success('Pasted from clipboard')
  } catch {
    ElMessage.error('Paste not available in this browser')
  }
}

const clearJson = () => {
  jsonText.value = ''
  errorMessage.value = ''
}

const loadSample = () => {
  jsonText.value = `{
  "company": "OnliTool",
  "employees": [
    { "name": "Alice", "role": "Frontend" },
    { "name": "Bob", "role": "Designer" }
  ],
  "active": true,
  "meta": {
    "version": 1,
    "created_at": "2026-08-30"
  }
}`
  errorMessage.value = ''
}

const loadCompareSample = () => {
  compareLeftJson.value = `{
  "company": "OnliTool",
  "features": ["JSON", "Format"],
  "settings": {
    "darkMode": true,
    "autoSave": false,
    "timezone": "UTC"
  }
}`

  compareRightJson.value = `{
  "company": "OnliTool",
  "features": ["JSON", "Format", "Compare"],
  "settings": {
    "darkMode": false,
    "autoSave": true,
    "timezone": "UTC+8"
  }
}`
  compareError.value = ''
}

const downloadJson = () => {
  if (!jsonText.value.trim()) {
    ElMessage.warning('No JSON content to download')
    return
  }

  try {
    JSON.parse(jsonText.value)
    const blob = new Blob([jsonText.value], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('JSON file downloaded')
  } catch (err) {
    errorMessage.value = `Invalid JSON: ${err.message}`
  }
}

const faqItems = [
  {
    q: 'What is a JSON formatter?',
    a: 'A JSON formatter beautifies compact JSON into a readable, indented structure so you can inspect nested data and debug API responses faster.'
  },
  {
    q: 'Can I validate JSON before saving it?',
    a: 'Yes. This tool checks whether the input is valid JSON in real time and highlights invalid content before you copy or download the result.'
  },
  {
    q: 'Does this tool work locally in the browser?',
    a: 'Yes. All formatting and validation happen in your browser, so your JSON is not uploaded to a server.'
  },
  {
    q: 'Can I use the JSON editor in fullscreen mode?',
    a: 'Yes. The tool supports fullscreen editing so you can focus on large JSON payloads without distractions.'
  },
  {
    q: 'Can I minify JSON for production use?',
    a: 'Yes. Use the Minify action to remove whitespace and reduce file size while preserving valid JSON syntax.'
  }
]

watch([compareLeftJson, compareRightJson], () => {
  try {
    JSON.parse(compareLeftJson.value)
    JSON.parse(compareRightJson.value)
    compareError.value = ''
  } catch (err) {
    compareError.value = `Invalid JSON in comparison: ${err.message}`
  }
}, { immediate: true })

useHead({
  title: 'JSON Formatter Online - Fullscreen Format, Validate, Minify & Download JSON',
  meta: [
    { name: 'description', content: 'Free online JSON formatter, validator, minifier and beautifier with fullscreen editing. Format, validate, copy, paste, and download JSON instantly in your browser.' },
    { name: 'keywords', content: 'json formatter, json validator, json minify, format json, pretty print json, full screen json editor, fullscreen json formatter, json online tool' },
    { property: 'og:title', content: 'JSON Formatter Online - Fullscreen Format, Validate, Minify & Download JSON' },
    { property: 'og:description', content: 'Format, validate, minify and download JSON online for free with a browser-based fullscreen editor built for speed and privacy.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Formatter Online',
        description: 'Free online JSON formatter, validator, minifier and beautifier with fullscreen editing for developers and data teams.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        featureList: ['Format JSON', 'Validate JSON', 'Minify JSON', 'Download JSON', 'Copy JSON', 'Full Screen JSON Editor'],
        isAccessibleForFree: true,
        category: 'Developer Tools',
        audience: {
          '@type': 'Audience',
          audienceType: 'Developers, QA engineers, and data analysts'
        }
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a
          }
        }))
      })
    }
  ]
})
</script>

<style scoped>
.btn-primary,
.btn-secondary {
  @apply inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition;
}

.btn-primary {
  @apply bg-blue-600 text-white shadow-sm hover:bg-blue-500;
}

.btn-secondary {
  @apply border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700;
}

</style>
