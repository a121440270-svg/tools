<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-medium dark:text-white">Hash text</h1>
      <button class="text-gray-300 hover:text-primary dark:text-gray-600 dark:hover:text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>

    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Hash a text string using the function you need: MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3 or RIPEMD160
    </p>

    <div class="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg border dark:border-gray-700">
      <div class="mb-6">
        <label class="block font-medium mb-2 dark:text-white">Your text to hash:</label>
        <textarea
          v-model="textToHash"
          class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none h-32 bg-white dark:bg-gray-900 dark:text-white"
          placeholder="Your string to hash..."
          @input="generateHashes"
        ></textarea>
      </div>

      <div class="mb-6">
        <label class="block font-medium mb-2 dark:text-white">Digest encoding</label>
        <div class="relative">
          <select
            v-model="encoding"
            class="w-full appearance-none bg-white dark:bg-gray-900 dark:text-white border dark:border-gray-700 rounded-lg py-2 px-4 pr-8"
            @change="generateHashes"
          >
            <option value="hex">Hexadecimal (base 16)</option>
            <option value="base64">Base64</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="(hash, algorithm) in hashes" :key="algorithm" class="flex flex-col sm:flex-row sm:items-center">
          <div class="w-24 font-medium py-2 text-gray-700 dark:text-gray-300">{{ algorithm }}</div>
          <div class="flex-1 relative">
            <input
              type="text"
              :value="hash"
              readonly
              class="w-full px-4 py-2 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white"
            />
            <button
              @click="copyHash(hash)"
              class="absolute right-2 top-1/2 transform -translate-y-1/2"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 hover:text-primary dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import CryptoJS from 'crypto-js'

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
    Object.keys(hashes).forEach(algorithm => {
      hashes[algorithm] = ''
    })
    return
  }

  // 生成各种类型的哈希
  hashes.MD5 = CryptoJS.MD5(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA1 = CryptoJS.SHA1(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA256 = CryptoJS.SHA256(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA224 = CryptoJS.SHA224(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA512 = CryptoJS.SHA512(textToHash.value).toString(CryptoJS[encoding.value])
  hashes.SHA384 = CryptoJS.SHA384(textToHash.value).toString(CryptoJS[encoding.value])
}

const copyHash = (hash) => {
  if (!hash) return

  navigator.clipboard.writeText(hash)
    .then(() => {
      console.log('Copied to clipboard')
    })
    .catch((err) => {
      console.error('Could not copy text: ', err)
    })
}

onMounted(() => {
  generateHashes()
})
</script>
