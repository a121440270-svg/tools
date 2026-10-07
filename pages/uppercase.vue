<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-6 reveal" style="--rd: 40ms">
      <p class="kicker">{{ $t('caseTool.category') || 'Text tools' }}</p>
      <h1 class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
        {{ $t('caseTool.title') || $t('home.tools.uppercase.name') }}
      </h1>
      <p class="mt-2 max-w-2xl text-base leading-6 text-slate-600 dark:text-slate-300">
        {{ $t('caseTool.description') || $t('home.tools.uppercase.description') }}
      </p>
    </header>

    <section class="reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900" style="--rd: 160ms">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
        <div class="flex items-center gap-2">
          <span class="flex h-2.5 w-2.5 rounded-full bg-primary" />
          <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Converter</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" type="button" @click="copyResult">{{ $t('caseTool.copy') || $t('common.copy') }}</button>
          <button class="btn-secondary" type="button" @click="clearAll">{{ $t('common.clear') || 'Clear' }}</button>
        </div>
      </div>

      <div class="space-y-5 p-4 sm:p-6">
        <textarea
          v-model="inputText"
          class="h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          :placeholder="$t('caseTool.placeholder')"
        />
        <div class="flex flex-wrap gap-2">
          <button v-for="action in actions" :key="action.key" class="btn-secondary" type="button" @click="apply(action.key)">{{ action.label }}</button>
        </div>
        <textarea
          v-model="outputText"
          readonly
          class="h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          :placeholder="$t('caseTool.outputPlaceholder')"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const inputText = ref('')
const transformType = ref('uppercase')

const outputText = computed(() => {
  const text = inputText.value
  switch (transformType.value) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'capitalize':
      return text.replace(/\b\w/g, (char) => char.toUpperCase())
    case 'title':
      return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase())
    case 'alternating':
      return text.split('').map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase())).join('')
    case 'inverse':
      return text.split('').map((char) => (char === char.toUpperCase() && char !== char.toLowerCase()) ? char.toLowerCase() : (char === char.toLowerCase() && char !== char.toUpperCase()) ? char.toUpperCase() : char).join('')
    case 'camel':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '')
    case 'pascal':
      return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '')
    case 'snake':
      return text.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase()
    case 'kebab':
      return text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()
    default:
      return text
  }
})

const actions = computed(() => [
  { key: 'uppercase', label: t('caseTool.uppercase') || 'UPPERCASE' },
  { key: 'lowercase', label: t('caseTool.lowercase') || 'lowercase' },
  { key: 'capitalize', label: t('caseTool.capitalize') || 'Capitalize Words' },
  { key: 'title', label: t('caseTool.titleCase') || 'Title Case' },
  { key: 'sentence', label: t('caseTool.sentenceCase') || 'Sentence case' },
  { key: 'alternating', label: t('caseTool.alternating') || 'aLtErNaTiNg' },
  { key: 'inverse', label: t('caseTool.inverse') || 'InVeRsE' },
  { key: 'camel', label: t('caseTool.camelCase') || 'camelCase' },
  { key: 'pascal', label: t('caseTool.pascalCase') || 'PascalCase' },
  { key: 'snake', label: t('caseTool.snakeCase') || 'snake_case' },
  { key: 'kebab', label: t('caseTool.kebabCase') || 'kebab-case' }
])

const apply = (type) => {
  transformType.value = type
}

const copyResult = async () => {
  if (!outputText.value) return
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success(t('caseTool.copied') || 'Copied')
  } catch (err) {
    console.error('Copy failed', err)
    ElMessage.error(t('common.copyFailed') || 'Copy failed')
  }
}

const clearAll = () => {
  inputText.value = ''
}
</script>