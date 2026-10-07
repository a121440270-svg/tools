<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-6 reveal" style="--rd: 40ms">
      <p class="kicker">{{ $t('tokenTool.category') || 'Security' }}</p>
      <h1 class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
        {{ $t('tokenTool.title') }}
      </h1>
      <p class="mt-2 max-w-2xl text-base leading-6 text-slate-600 dark:text-slate-300">
        {{ $t('tokenTool.description') }}
      </p>
    </header>

    <section class="reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900" style="--rd: 160ms">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
        <div class="flex items-center gap-2">
          <span class="flex h-2.5 w-2.5 rounded-full bg-primary" />
          <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Generator</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" type="button" @click="copyToken">{{ $t('tokenTool.copy') }}</button>
          <button class="btn-primary" type="button" @click="generateToken">{{ $t('tokenTool.generate') }}</button>
        </div>
      </div>

      <div class="space-y-6 p-4 sm:p-6">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('tokenTool.outputLabel') }}</label>
          <input
            v-model="token"
            readonly
            type="text"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            :placeholder="$t('tokenTool.placeholder')"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('tokenTool.length') }}</label>
            <div class="flex items-center gap-3">
              <input v-model.number="length" type="range" min="4" max="128" step="1" class="h-2 w-full flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700" />
              <span class="w-12 rounded-lg bg-slate-100 px-2 py-1 text-center font-mono text-sm dark:bg-slate-800 dark:text-white">{{ length }}</span>
            </div>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('tokenTool.type') }}</label>
            <div class="relative">
              <select
                v-model="type"
                class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="alphanumeric">{{ $t('tokenTool.alphanumeric') }}</option>
                <option value="hex">{{ $t('tokenTool.hex') }}</option>
                <option value="base64">{{ $t('tokenTool.base64') }}</option>
              </select>
              <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const token = ref('')
const length = ref(32)
const type = ref('alphanumeric')

const generateToken = () => {
  const chars = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    hex: '0123456789abcdef',
    base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  }
  let result = ''
  const charSet = chars[type.value] || chars.alphanumeric
  const array = new Uint32Array(length.value)
  window.crypto.getRandomValues(array)
  for (let i = 0; i < length.value; i++) {
    result += charSet[array[i] % charSet.length]
  }
  token.value = result
}

const copyToken = async () => {
  if (!token.value) return
  try {
    await navigator.clipboard.writeText(token.value)
    ElMessage.success(t('tokenTool.copied') || 'Copied')
  } catch (err) {
    console.error('Copy failed', err)
    ElMessage.error(t('common.copyFailed') || 'Copy failed')
  }
}

onMounted(() => {
  generateToken()
})
</script>