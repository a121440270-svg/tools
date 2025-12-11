<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">{{ $t('menu.uppercase') }}</h1>
      <button class="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>

    <p class="text-gray-600 dark:text-gray-400 mb-8">
      {{ $t('uppercase.desc') }}
    </p>

    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
      <label class="block font-medium mb-2 dark:text-white">{{ $t('uppercase.inputLabel') }}</label>
      <textarea
        ref="area"
        v-model="text"
        @paste="handlePaste"
        :placeholder="$t('uppercase.placeholder')"
        class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none h-40 bg-white dark:bg-gray-900 dark:text-white"
      ></textarea>

      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center gap-4">
          <button
            @click="copyText"
            class="bg-primary text-white rounded px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            {{ $t('uppercase.copyBtn') }}
          </button>
          <button
            @click="clearText"
            class="border rounded px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ $t('uppercase.clearBtn') }}
          </button>
        </div>

        <div>
          <span v-if="status" :class="statusClass">{{ status }}</span>
        </div>
      </div>

      <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">{{ $t('uppercase.tip') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const text = ref('')
const status = ref('')
const statusType = ref('')
let timer = null

const area = ref(null)

const setStatus = (msg, type = 'success') => {
  clearTimeout(timer)
  status.value = msg
  statusType.value = type
  timer = setTimeout(() => {
    status.value = ''
    statusType.value = ''
  }, 3000)
}

const handlePaste = (e) => {
  try {
    // prevent the default insertion so we control content
    e.preventDefault()
    const pasted = (e.clipboardData && e.clipboardData.getData('text')) || ''
    if (!pasted) {
      setStatus('复制失败：未检测到文本', 'error')
      return
    }
    const upper = pasted.toUpperCase()
    text.value = upper
    // try copy to clipboard
    navigator.clipboard.writeText(upper).then(() => {
      setStatus('复制成功', 'success')
    }).catch((err) => {
      console.error('copy failed', err)
      setStatus('复制失败', 'error')
    })
  } catch (err) {
    console.error(err)
    setStatus('复制失败', 'error')
  }
}

const copyText = async () => {
  if (!text.value) {
    setStatus('没有文本可复制', 'error')
    return
  }
  try {
    await navigator.clipboard.writeText(text.value)
    setStatus('复制成功', 'success')
  } catch (err) {
    console.error(err)
    setStatus('复制失败', 'error')
  }
}

const clearText = () => {
  text.value = ''
  setStatus('', '')
}

const statusClass = computed(() => {
  if (!status.value) return 'text-sm'
  return statusType.value === 'success' ? 'text-sm text-green-500' : 'text-sm text-red-400'
})
</script>
