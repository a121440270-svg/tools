<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">{{ $t('jsonCompare.category') }}</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('jsonCompare.title') }}</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ $t('jsonCompare.description') }}</p>
      </div>
      <button class="btn-secondary" @click="loadSample">{{ $t('jsonCompare.loadSample') }}</button>
    </div>

    <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="item in summaryItems" :key="item.label" class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{{ item.label }}</p>
        <p class="mt-2 text-2xl font-bold" :class="item.className">{{ item.value }}</p>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <button
        v-for="filter in diffFilters"
        :key="filter.value"
        class="rounded-xl px-3 py-2 text-xs font-semibold transition"
        :class="activeFilter === filter.value
          ? 'bg-blue-600 text-white shadow-sm'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
        @click="activeFilter = filter.value"
      >
        {{ $t(filter.labelKey) }}
      </button>
    </div>

    <div class="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-200">
      {{ summary.text }}
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <section class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-2 flex items-center justify-between px-1">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('jsonCompare.base') }}</label>
          <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="leftJson = rightJson">{{ $t('jsonCompare.copyRight') }}</button>
        </div>
        <div class="h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
          <CodeMirrorEditor v-model="leftJson" language="json" :theme="editorTheme" :diff-ranges="filteredDiffRanges.left" :aria-label="$t('jsonCompare.base')" />
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-2 flex items-center justify-between px-1">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('jsonCompare.compared') }}</label>
          <button class="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400" @click="rightJson = leftJson">{{ $t('jsonCompare.copyLeft') }}</button>
        </div>
        <div class="h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
          <CodeMirrorEditor v-model="rightJson" language="json" :theme="editorTheme" :diff-ranges="filteredDiffRanges.right" :aria-label="$t('jsonCompare.compared')" />
        </div>
      </section>
    </div>

    <div v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
const { t } = useI18n()

const leftJson = ref(`{
  "company": "OnliTool",
  "features": ["JSON", "Format"],
  "settings": {
    "darkMode": true,
    "autoSave": false,
    "timezone": "UTC"
  }
}`)
const rightJson = ref(`{
  "company": "OnliTool",
  "features": ["JSON", "Format", "Compare"],
  "settings": {
    "darkMode": false,
    "autoSave": true,
    "timezone": "UTC+8"
  }
}`)
const editorTheme = ref('light')
const errorMessage = ref('')
const activeFilter = ref('all')
let themeObserver

const diffFilters = [
  { labelKey: 'jsonCompare.all', value: 'all' },
  { labelKey: 'jsonCompare.modified', value: 'modified' },
  { labelKey: 'jsonCompare.added', value: 'added' },
  { labelKey: 'jsonCompare.removed', value: 'removed' }
]

const normalizeJson = (value) => {
  if (!value || !value.trim()) return ''
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value.trim()
  }
}

const isObjectLike = (value) => value !== null && typeof value === 'object'
const deepEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right)

const formatPath = (segments) => {
  return segments.reduce((result, segment, index) => {
    if (typeof segment === 'number') {
      return `${result}[${segment}]`
    }
    return index === 0 ? segment : `${result}.${segment}`
  }, '')
}

const findLineNumber = (text, path) => {
  const lastKey = Array.isArray(path) ? path[path.length - 1] : path
  const keyName = typeof lastKey === 'number' ? '' : String(lastKey)
  const lines = text.split('\n')

  if (!keyName) return 0

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.includes(`"${keyName}"`) || line.includes(`${keyName}:`)) {
      return index
    }
  }

  return 0
}

const collectDiffs = (leftValue, rightValue, path = [], items = []) => {
  if (Array.isArray(leftValue) || Array.isArray(rightValue)) {
    const leftList = Array.isArray(leftValue) ? leftValue : []
    const rightList = Array.isArray(rightValue) ? rightValue : []
    const maxLength = Math.max(leftList.length, rightList.length)

    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = [...path, index]
      const leftItem = leftList[index]
      const rightItem = rightList[index]

      if (leftItem === undefined && rightItem !== undefined) {
        items.push({ type: 'added', path: formatPath(nextPath), key: String(index) })
      } else if (leftItem !== undefined && rightItem === undefined) {
        items.push({ type: 'removed', path: formatPath(nextPath), key: String(index) })
      } else if (leftItem !== undefined && rightItem !== undefined) {
        if (isObjectLike(leftItem) && isObjectLike(rightItem)) {
          collectDiffs(leftItem, rightItem, nextPath, items)
        } else if (!deepEqual(leftItem, rightItem)) {
          items.push({ type: 'modified', path: formatPath(nextPath), key: String(index) })
        }
      }
    }

    return items
  }

  if (isObjectLike(leftValue) || isObjectLike(rightValue)) {
    const leftObject = isObjectLike(leftValue) ? leftValue : {}
    const rightObject = isObjectLike(rightValue) ? rightValue : {}
    const allKeys = Array.from(new Set([...Object.keys(leftObject), ...Object.keys(rightObject)])).sort()

    for (const key of allKeys) {
      const nextPath = [...path, key]
      const leftItem = leftObject[key]
      const rightItem = rightObject[key]

      if (leftItem === undefined && rightItem !== undefined) {
        items.push({ type: 'added', path: formatPath(nextPath), key })
      } else if (leftItem !== undefined && rightItem === undefined) {
        items.push({ type: 'removed', path: formatPath(nextPath), key })
      } else if (leftItem !== undefined && rightItem !== undefined) {
        if (isObjectLike(leftItem) && isObjectLike(rightItem)) {
          collectDiffs(leftItem, rightItem, nextPath, items)
        } else if (!deepEqual(leftItem, rightItem)) {
          items.push({ type: 'modified', path: formatPath(nextPath), key })
        }
      }
    }
  }

  return items
}

const diffResult = computed(() => {
  const leftText = normalizeJson(leftJson.value)
  const rightText = normalizeJson(rightJson.value)

  if (!leftText && !rightText) {
    return { items: [], left: [], right: [] }
  }

  const leftParsed = (() => {
    try { return leftText ? JSON.parse(leftText) : null } catch { return null }
  })()
  const rightParsed = (() => {
    try { return rightText ? JSON.parse(rightText) : null } catch { return null }
  })()

  if (leftParsed === null || rightParsed === null) {
    return { items: [], left: [], right: [] }
  }

  const items = collectDiffs(leftParsed, rightParsed)

  const leftRanges = []
  const rightRanges = []

  for (const item of items) {
    const lineNumber = findLineNumber(item.type === 'added' ? rightText : leftText, item.path.split('.'))
    const range = { startLine: lineNumber, endLine: lineNumber, type: item.type }

    if (item.type === 'added') {
      rightRanges.push(range)
    } else if (item.type === 'removed') {
      leftRanges.push(range)
    } else {
      leftRanges.push({ ...range, type: 'modified' })
      rightRanges.push({ ...range, type: 'modified' })
    }
  }

  return { items, left: leftRanges, right: rightRanges }
})

const diffEntries = computed(() => diffResult.value.items)
const filteredDiffEntries = computed(() => {
  if (activeFilter.value === 'all') return diffEntries.value
  return diffEntries.value.filter((item) => item.type === activeFilter.value)
})

const filteredDiffRanges = computed(() => {
  const left = []
  const right = []

  for (const item of filteredDiffEntries.value) {
    const targetText = item.type === 'added' ? normalizeJson(rightJson.value) : normalizeJson(leftJson.value)
    const lineNumber = findLineNumber(targetText, item.path.split('.'))
    const range = { startLine: lineNumber, endLine: lineNumber, type: item.type === 'modified' ? 'modified' : item.type }

    if (item.type === 'added') {
      right.push(range)
    } else if (item.type === 'removed') {
      left.push(range)
    } else {
      left.push({ ...range, type: 'modified' })
      right.push({ ...range, type: 'modified' })
    }
  }

  return { left, right }
})

const summary = computed(() => {
  const counts = { modified: 0, added: 0, removed: 0 }

  for (const item of diffEntries.value) {
    counts[item.type] += 1
  }

  const total = counts.modified + counts.added + counts.removed

  return {
    modified: counts.modified,
    added: counts.added,
    removed: counts.removed,
    text: total === 0
      ? t('jsonCompare.identical')
      : t('jsonCompare.changedSummary', { total, ...counts })
  }
})

const summaryItems = computed(() => [
  { label: t('jsonCompare.modified'), value: summary.value.modified, className: 'text-blue-600 dark:text-blue-400' },
  { label: t('jsonCompare.added'), value: summary.value.added, className: 'text-emerald-600 dark:text-emerald-400' },
  { label: t('jsonCompare.removed'), value: summary.value.removed, className: 'text-red-600 dark:text-red-400' },
  { label: t('jsonCompare.status'), value: summary.value.modified + summary.value.added + summary.value.removed ? t('jsonCompare.changed') : t('jsonCompare.noChange'), className: summary.value.modified + summary.value.added + summary.value.removed ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400' }
])

const validate = () => {
  try {
    JSON.parse(leftJson.value)
    JSON.parse(rightJson.value)
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = t('jsonCompare.invalidJson', { message: error.message })
  }
}

watch([leftJson, rightJson], validate, { immediate: true })

const loadSample = () => {
  leftJson.value = `{
  "company": "OnliTool",
  "features": ["JSON", "Format"],
  "settings": {
    "darkMode": true,
    "autoSave": false,
    "timezone": "UTC"
  }
}`
  rightJson.value = `{
  "company": "OnliTool",
  "features": ["JSON", "Format", "Compare"],
  "settings": {
    "darkMode": false,
    "autoSave": true,
    "timezone": "UTC+8"
  }
}`
}

onMounted(() => {
  const syncTheme = () => {
    editorTheme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }
  syncTheme()
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => themeObserver?.disconnect())

useToolSeo({
  title: () => t('jsonCompare.seoTitle'),
  description: () => t('jsonCompare.seoDescription')
})
</script>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700;
}
</style>
