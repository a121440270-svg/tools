<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">Token generator</h1>
      <button class="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>

    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Generate random string with the chars you want, uppercase or lowercase letters, numbers and/or symbols.
    </p>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div class="flex items-center justify-between">
          <label class="font-medium dark:text-white">Uppercase (ABC...)</label>
          <div
            class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer"
            @click="toggleUppercase"
          >
            <div
              class="absolute inset-0 m-0.5 w-5 h-5 transition duration-200 ease-in-out transform rounded-full"
              :class="[uppercase ? 'translate-x-6 bg-primary' : 'translate-x-0 bg-white dark:bg-gray-400']"
            ></div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="font-medium dark:text-white">Numbers (123...)</label>
          <div
            class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer"
            @click="toggleNumbers"
          >
            <div
              class="absolute inset-0 m-0.5 w-5 h-5 transition duration-200 ease-in-out transform rounded-full"
              :class="[numbers ? 'translate-x-6 bg-primary' : 'translate-x-0 bg-white dark:bg-gray-400']"
            ></div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="font-medium dark:text-white">Lowercase (abc...)</label>
          <div
            class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer"
            @click="toggleLowercase"
          >
            <div
              class="absolute inset-0 m-0.5 w-5 h-5 transition duration-200 ease-in-out transform rounded-full"
              :class="[lowercase ? 'translate-x-6 bg-primary' : 'translate-x-0 bg-white dark:bg-gray-400']"
            ></div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="font-medium dark:text-white">Symbols (!-:...)</label>
          <div
            class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer"
            @click="toggleSymbols"
          >
            <div
              class="absolute inset-0 m-0.5 w-5 h-5 transition duration-200 ease-in-out transform rounded-full"
              :class="[symbols ? 'translate-x-6 bg-primary' : 'translate-x-0 bg-white dark:bg-gray-400']"
            ></div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <label class="font-medium dark:text-white">Length ({{ length }})</label>
        </div>
        <input
          type="range"
          min="4"
          max="128"
          v-model="length"
          class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div class="mb-6">
        <textarea
          v-model="generatedToken"
          class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none h-24 bg-white dark:bg-gray-900 dark:text-white"
          readonly
        ></textarea>
      </div>

      <div class="flex justify-end gap-4">
        <button
          @click="copyToClipboard"
          class="px-4 py-2 border dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
        >
          Copy
        </button>
        <button
          @click="generateToken"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const uppercase = ref(true)
const lowercase = ref(true)
const numbers = ref(true)
const symbols = ref(false)
const length = ref(64)
const generatedToken = ref('')

const toggleUppercase = () => {
  uppercase.value = !uppercase.value
  if (!uppercase.value && !lowercase.value && !numbers.value && !symbols.value) {
    lowercase.value = true
  }
}

const toggleLowercase = () => {
  lowercase.value = !lowercase.value
  if (!uppercase.value && !lowercase.value && !numbers.value && !symbols.value) {
    uppercase.value = true
  }
}

const toggleNumbers = () => {
  numbers.value = !numbers.value
  if (!uppercase.value && !lowercase.value && !numbers.value && !symbols.value) {
    lowercase.value = true
  }
}

const toggleSymbols = () => {
  symbols.value = !symbols.value
  if (!uppercase.value && !lowercase.value && !numbers.value && !symbols.value) {
    lowercase.value = true
  }
}

const generateToken = () => {
  let chars = ''

  if (uppercase.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (lowercase.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (numbers.value) chars += '0123456789'
  if (symbols.value) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?'

  if (chars === '') {
    lowercase.value = true
    chars = 'abcdefghijklmnopqrstuvwxyz'
  }

  let result = ''
  const charsLength = chars.length

  for (let i = 0; i < length.value; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength))
  }

  generatedToken.value = result
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedToken.value)
    .then(() => {
      // 可以添加复制成功的提示
      console.log('Copied to clipboard')
    })
    .catch((err) => {
      console.error('Could not copy text: ', err)
    })
}

// 当选项改变时重新生成
watch([uppercase, lowercase, numbers, symbols, length], () => {
  generateToken()
})

// 组件加载时生成初始令牌
onMounted(() => {
  generateToken()
})
</script>
