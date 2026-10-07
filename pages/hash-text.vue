<template>
  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <header class="mb-6 reveal" style="--rd: 40ms">
      <p class="kicker">{{ $t('hashTool.category') || 'Text tools' }}</p>
      <h1 class="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
        {{ $t('hashTool.title') }}
      </h1>
      <p class="mt-2 max-w-2xl text-base leading-6 text-slate-600 dark:text-slate-300">
        {{ $t('hashTool.description') }}
      </p>
    </header>

    <section class="reveal overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900" style="--rd: 160ms">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
        <div class="flex items-center gap-2">
          <span class="flex h-2.5 w-2.5 rounded-full bg-primary" />
          <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Workspace</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" type="button" @click="clearAll">
            {{ $t('common.clear') || 'Clear' }}
          </button>
        </div>
      </div>

      <div class="space-y-6 p-4 sm:p-6">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('hashTool.inputLabel') }}</label>
          <textarea
            v-model="textToHash"
            class="h-36 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            :placeholder="$t('hashTool.placeholder')"
            @input="generateHashes"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-white">{{ $t('hashTool.encoding') }}</label>
          <div class="relative w-full max-w-xs">
            <select
              v-model="encoding"
              class="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              @change="generateHashes"
            >
              <option value="hex">{{ $t('hashTool.hex') }}</option>
              <option value="base64">Base64</option>
            </select>
            <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <div class="space-y-3">
          <div v-for="(hash, algorithm) in hashes" :key="algorithm" class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div class="w-28 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{{ algorithm }}</div>
            <div class="relative flex-1">
              <input
                type="text"
                :value="hash"
                readonly
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <button
                type="button"
                class="group absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                :title="$t('hashTool.copyTitle')"
                @click="copyHash(hash)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import CryptoJS from 'crypto-js'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const textToHash = ref('')
const encoding = ref('hex')

const hashes = reactive({
  MD5: '',
  SHA1: '',
  SHA256: '',
  SHA224: '',
  SHA512: '',
  SHA384: '',
})

const generateHashes = () => {
  if (!textToHash.value) {
    Object.keys(hashes).forEach((algorithm) => {
      hashes[algorithm] = ''
    })
    return
  }

  hashes.MD5 = CryptoJS.MD5(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA1 = CryptoJS.SHA1(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA256 = CryptoJS.SHA256(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA224 = CryptoJS.SHA224(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA512 = CryptoJS.SHA512(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA384 = CryptoJS.SHA384(textToHash.value).toString(CryptoJS[encoding.value])
}

const copyHash = async (hash) => {
  if (!hash) return
  try {
    await navigator.clipboard.writeText(hash)
    ElMessage.success(t('hashTool.copied') || 'Copied')
  } catch (err) {
    console.error('Could not copy text: ', err)
    ElMessage.error(t('common.copyFailed') || 'Copy failed')
  }
}

const clearAll = () => {
  textToHash.value = ''
  generateHashes()
}

onMounted(() => {
  generateHashes()
})
</script>