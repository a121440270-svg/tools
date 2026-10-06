<template>
  <div class="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">{{ $t('jsonFormatter.category') }}</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('jsonFormatter.title') }}</h1>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="btn-primary" @click="formatJson">{{ $t('jsonFormatter.format') }}</button>
        <button class="btn-secondary" @click="minifyJson">{{ $t('jsonFormatter.minify') }}</button>
        <button class="btn-secondary" @click="copyJson">{{ $t('jsonFormatter.copy') }}</button>
        <button class="btn-secondary" @click="pasteJson">{{ $t('jsonFormatter.paste') }}</button>
        <button class="btn-secondary" @click="clearJson">{{ $t('jsonFormatter.clear') }}</button>
        <button class="btn-secondary" @click="downloadJson">{{ $t('jsonFormatter.download') }}</button>
      </div>
    </div>

    <div class="grid gap-4">
      <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-2 flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('jsonFormatter.input') }}</label>
            <span class="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{{ $t('jsonFormatter.localOnly') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="loadSample">{{ $t('jsonFormatter.loadSample') }}</button>
          </div>
        </div>
        <div class="editor-fullscreen overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
          <div class="share-note-editor"><CodeMirrorEditor v-model="jsonText" language="json" :theme="editorTheme" :aria-label="$t('jsonFormatter.input')" /></div>
        </div>
      </div>

    </div>

    <div v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">
      {{ errorMessage }}
    </div>

    <section class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="mb-5">
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">FAQ</p>
        <h2 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{{ $t('jsonFormatter.faqTitle') }}</h2>
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
const { t, tm, rt } = useI18n()

const jsonText = ref(`{
  "name": "OnliTool",
  "features": ["JSON", "Format", "Validate"],
  "settings": {
    "darkMode": true,
    "autoSave": false
  }
}`)
const errorMessage = ref('')
const editorTheme = ref('light')
let themeObserver

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

const formatJson = () => {
  errorMessage.value = ''
  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed, null, 2)
    ElMessage.success(t('jsonFormatter.messages.formatted'))
  } catch (err) {
    errorMessage.value = t('jsonFormatter.invalidJson', { message: err.message })
  }
}

const minifyJson = () => {
  errorMessage.value = ''
  try {
    const parsed = JSON.parse(jsonText.value)
    jsonText.value = JSON.stringify(parsed)
    ElMessage.success(t('jsonFormatter.messages.minified'))
  } catch (err) {
    errorMessage.value = t('jsonFormatter.invalidJson', { message: err.message })
  }
}

const copyJson = async () => {
  if (!jsonText.value.trim()) {
    ElMessage.warning(t('jsonFormatter.messages.nothingToCopy'))
    return
  }

  try {
    await navigator.clipboard.writeText(jsonText.value)
    ElMessage.success(t('jsonFormatter.messages.copied'))
  } catch {
    ElMessage.error(t('jsonFormatter.messages.copyFailed'))
  }
}

const pasteJson = async () => {
  try {
    const text = await navigator.clipboard.readText()
    jsonText.value = text
    ElMessage.success(t('jsonFormatter.messages.pasted'))
  } catch {
    ElMessage.error(t('jsonFormatter.messages.pasteUnavailable'))
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

const downloadJson = () => {
  if (!jsonText.value.trim()) {
    ElMessage.warning(t('jsonFormatter.messages.nothingToDownload'))
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
    ElMessage.success(t('jsonFormatter.messages.downloaded'))
  } catch (err) {
    errorMessage.value = t('jsonFormatter.invalidJson', { message: err.message })
  }
}

const faqItems = computed(() => tm('jsonFormatter.faq').map(item => ({
  q: rt(item.q),
  a: rt(item.a)
})))

useToolSeo({
  title: () => t('jsonFormatter.seoTitle'),
  description: () => t('jsonFormatter.seoDescription'),
  keywords: () => t('jsonFormatter.seoKeywords'),
  applicationCategory: 'DeveloperApplication',
  featureList: () => [t('jsonFormatter.format'), t('jsonFormatter.minify'), t('jsonFormatter.download'), t('jsonFormatter.copy')],
  faqItems,
  audience: () => t('jsonFormatter.audience'),
  schemaProperties: () => ({ category: t('menu.desc') })
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
