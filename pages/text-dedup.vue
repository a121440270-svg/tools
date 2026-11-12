<template>
  <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-6 reveal" style="--rd: 40ms">
      <p class="kicker">{{ $t('textDedup.category') }}</p>
      <h1 class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
        {{ $t('textDedup.title') }}
      </h1>
      <p class="mt-2 max-w-2xl text-base leading-6 text-slate-600 dark:text-slate-300">
        {{ $t('textDedup.description') }}
      </p>
    </header>

    <section class="reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900" style="--rd: 160ms">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
        <div class="flex items-center gap-2">
          <span class="flex h-2.5 w-2.5 rounded-full bg-primary" />
          <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{{ $t('textDedup.category') }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" type="button" :disabled="!outputText" @click="copyResult">{{ $t('textDedup.copy') }}</button>
          <button class="btn-secondary" type="button" @click="loadSample">{{ $t('textDedup.sample') }}</button>
          <button class="btn-secondary" type="button" @click="clearAll">{{ $t('common.clear') || $t('textDedup.clear') }}</button>
        </div>
      </div>

      <div class="space-y-5 p-4 sm:p-6">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('textDedup.inputLabel') }}</span>
          <textarea
            v-model="inputText"
            spellcheck="false"
            class="h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            :placeholder="$t('textDedup.placeholder')"
          />
        </label>

        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-slate-700 dark:text-white">{{ $t('textDedup.delimiterLabel') }}</span>
            <button class="text-sm text-primary hover:underline" type="button" @click="resetDelimiters">
              {{ $t('textDedup.delimiterReset') }}
            </button>
          </div>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <label v-for="delimiter in delimiterOptions" :key="delimiter.value" class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input v-model="selectedDelimiters" :value="delimiter.value" type="checkbox" class="rounded border-slate-300 text-primary focus:ring-primary/20 dark:border-slate-600">
              {{ $t(delimiter.label) }}
            </label>
          </div>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-3">
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input v-model="ignoreCase" type="checkbox" class="rounded border-slate-300 text-primary focus:ring-primary/20 dark:border-slate-600">
            {{ $t('textDedup.ignoreCase') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input v-model="removeEmptyLines" type="checkbox" class="rounded border-slate-300 text-primary focus:ring-primary/20 dark:border-slate-600">
            {{ $t('textDedup.removeEmptyLines') }}
          </label>
        </div>

        <div class="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          <span>{{ $t('textDedup.totalItems', { count: totalItemCount }) }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ $t('textDedup.uniqueItems', { count: uniqueItemCount }) }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ $t('textDedup.removedItems', { count: removedItemCount }) }}</span>
        </div>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('textDedup.outputLabel') }}</span>
          <textarea
            :value="outputText"
            readonly
            spellcheck="false"
            class="h-56 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            :placeholder="$t('textDedup.outputPlaceholder')"
          />
        </label>
      </div>
    </section>

    <section class="mt-10 reveal" style="--rd: 240ms">
      <h2 class="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ $t('textDedup.faqTitle') }}
      </h2>
      <dl class="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
        <div v-for="index in 3" :key="index" class="py-4">
          <dt class="font-semibold text-slate-800 dark:text-slate-100">{{ $t(`textDedup.faq${index}Question`) }}</dt>
          <dd class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ $t(`textDedup.faq${index}Answer`) }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const faqItems = computed(() => [1, 2, 3].map((index) => ({
  q: t(`textDedup.faq${index}Question`),
  a: t(`textDedup.faq${index}Answer`)
})))
useToolSeo({
  title: computed(() => t('textDedup.seoTitle')),
  description: computed(() => t('textDedup.seoDescription')),
  keywords: computed(() => t('textDedup.seoKeywords')),
  featureList: computed(() => [
    t('textDedup.seoFeatureDelimiters'),
    t('textDedup.seoFeatureCase'),
    t('textDedup.seoFeatureEmpty'),
    t('textDedup.seoFeatureLocal')
  ]),
  faqItems,
  type: 'WebApplication',
  applicationCategory: 'UtilitiesApplication'
})

const inputText = ref('')
const defaultDelimiters = ['line', 'whitespace', 'comma', 'semicolon']
const selectedDelimiters = ref([...defaultDelimiters])
const ignoreCase = ref(false)
const removeEmptyLines = ref(false)
const delimiterOptions = [
  { value: 'line', label: 'textDedup.delimiterLine' },
  { value: 'whitespace', label: 'textDedup.delimiterWhitespace' },
  { value: 'comma', label: 'textDedup.delimiterComma' },
  { value: 'semicolon', label: 'textDedup.delimiterSemicolon' },
  { value: 'symbols', label: 'textDedup.delimiterCommon' }
]

const sourceItems = computed(() => {
  if (!inputText.value) return []
  const hasLineDelimiter = selectedDelimiters.value.includes('line')

  const separators = {
    whitespace: '[^\\S\\r\\n]+',
    comma: '[,，、]',
    semicolon: '[;；]',
    symbols: '[|｜/\\\\:：]'
  }
  const pattern = selectedDelimiters.value
    .filter((delimiter) => delimiter !== 'line')
    .map((delimiter) => separators[delimiter])
    .filter(Boolean)
    .join('|')
  const lines = hasLineDelimiter ? inputText.value.split(/\r\n|\n|\r/) : [inputText.value]

  return lines.flatMap((line) => {
    if (hasLineDelimiter && !line.trim()) return removeEmptyLines.value ? [] : ['']
    if (!pattern) return [line]

    return line.split(new RegExp(pattern)).map((item) => item.trim()).filter((item) => item !== '')
  })
})
const uniqueItems = computed(() => {
  const seen = new Set()
  const result = []

  for (const item of sourceItems.value) {
    if (removeEmptyLines.value && item.trim() === '') continue
    const key = ignoreCase.value ? item.toLowerCase() : item
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
})

const outputText = computed(() => uniqueItems.value.join('\n'))
const totalItemCount = computed(() => sourceItems.value.length)
const uniqueItemCount = computed(() => uniqueItems.value.length)
const removedItemCount = computed(() => totalItemCount.value - uniqueItemCount.value)

const loadSample = () => {
  inputText.value = t('textDedup.sampleText')
}

const resetDelimiters = () => {
  selectedDelimiters.value = [...defaultDelimiters]
}

const clearAll = () => {
  inputText.value = ''
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success(t('textDedup.copied'))
  } catch (error) {
    console.error('Copy failed', error)
    ElMessage.error(t('common.copyFailed') || t('textDedup.copyFailed'))
  }
}
</script>
