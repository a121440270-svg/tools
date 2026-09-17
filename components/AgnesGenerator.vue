<template>
  <div class="mx-auto max-w-5xl py-6">
    <div class="mb-5 flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.24em] text-primary">{{ title }}</p>
        <h1 class="mt-1 text-2xl font-bold dark:text-white">{{ title }}</h1>
      </div>
      <button
        class="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
        @click="clearChat"
      >
        Clear
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col">
        <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/60">
          <div class="flex flex-wrap gap-2">
            <div v-if="isImage" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              Size: <span class="font-medium text-gray-900 dark:text-white">{{ imageSize }}</span>
            </div>
            <div v-if="isVideo" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              Size: <span class="font-medium text-gray-900 dark:text-white">{{ videoWidth }}×{{ videoHeight }}</span>
            </div>
            <div v-if="isVideo" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              Frames: <span class="font-medium text-gray-900 dark:text-white">{{ videoFrames }}</span>
            </div>
            <div v-if="isVideo" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              FPS: <span class="font-medium text-gray-900 dark:text-white">{{ videoFps }}</span>
            </div>
          </div>
        </div>

        <div class="chat-panel px-4 py-5 sm:px-6 flex-1 overflow-auto">
          <div v-for="(message, index) in messages" :key="`${message.role}-${index}`" class="mb-4 flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
            <div class="max-w-[85%]" :class="message.role === 'user' ? 'items-end' : 'items-start'">
              <div class="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400" :class="message.role === 'user' ? 'text-right' : 'text-left'">
                {{ message.role === 'user' ? 'You' : 'Assistant' }}
              </div>

              <div
                class="rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm"
                :class="message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'"
              >
                <p v-if="message.text" class="whitespace-pre-wrap">{{ message.text }}</p>

                <div v-if="message.type === 'image' && message.url" class="mt-3">
                  <img :src="message.url" class="w-full rounded-xl border border-gray-200 object-cover dark:border-gray-700" />
                  <a
                    :href="message.url"
                    :download="message.downloadName || 'agnes-generated-image.png'"
                    class="mt-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 fill-current" aria-hidden="true">
                      <path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z"/>
                    </svg>
                    Download
                  </a>
                </div>

                <video v-if="message.type === 'video' && message.url" :src="message.url" controls class="mt-3 max-h-[420px] w-full rounded-xl bg-black"></video>
              </div>
            </div>
          </div>

          <div v-if="loading" class="mb-4 flex justify-start">
            <div class="max-w-[80%]">
              <div class="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-400">Assistant</div>
              <div class="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                <span class="typing-dot" />
                <span class="typing-dot" />
                <span class="typing-dot" />
              </div>
            </div>
          </div>

          <div v-if="error" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {{ error }}
          </div>
        </div>

        <div class="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/30">
          <div class="flex items-end gap-3">
            <textarea
              v-model="prompt"
              rows="1"
              class="min-h-[58px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              :placeholder="isImage ? 'Describe the scene, style or product you want to generate...' : 'Describe the motion, scene, or story you want to generate...'"
              @keydown.enter.exact.prevent="submitPrompt"
              @keydown.shift.enter.prevent="prompt += '\n'"
            ></textarea>
            <button
              class="h-[58px] rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading || !prompt.trim()"
              @click="submitPrompt"
            >
              {{ loading ? 'Generating...' : 'Generate' }}
            </button>
          </div>

          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">{{ footnote }}</p>
        </div>
      </div>

      <div class="md:col-span-1">
        <slot name="aside">
          <div class="overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-4 sticky top-8">
            <div v-if="isImage" class="mb-4">
              <div class="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Size</div>
              <select v-model="imageSize" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                <option value="1K">1K</option>
                <option value="2K">2K</option>
                <option value="3K">3K</option>
                <option value="4K">4K</option>
                <option value="1024x768">1024x768</option>
              </select>
            </div>

            <div v-if="isImage" class="mb-4">
              <div class="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Ratio</div>
              <select v-model="imageRatio" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                <option value="1:1">1:1</option>
                <option value="3:4">3:4</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="2:3">2:3</option>
                <option value="3:2">3:2</option>
                <option value="21:9">21:9</option>
              </select>
            </div>

            <div v-if="isImage" class="mb-4">
              <div class="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Output</div>
              <select v-model="imageOutput" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                <option value="url">URL</option>
                <option value="b64">Base64</option>
              </select>
            </div>

            <div v-if="isVideo" class="mb-4 grid gap-3">
              <label class="block">
                <span class="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Width</span>
                <input v-model.number="videoWidth" type="number" min="256" step="32" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </label>
              <label class="block mt-3">
                <span class="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Height</span>
                <input v-model.number="videoHeight" type="number" min="256" step="32" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </label>
              <label class="block mt-3">
                <span class="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Frames</span>
                <input v-model.number="videoFrames" type="number" min="1" step="1" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </label>
              <label class="block mt-3">
                <span class="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-gray-500">FPS</span>
                <input v-model.number="videoFps" type="number" min="1" max="60" step="1" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </label>
            </div>

            <div class="mb-4">
              <div class="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Reference image</div>
              <input v-model="referenceImage" type="url" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="https://.../image.jpg" />
            </div>

            <div class="mb-4">
              <div class="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Negative prompt</div>
              <input v-model="negativePrompt" type="text" class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="Avoid artifacts, blurry details..." />
            </div>

            <div class="flex gap-3">
              <button
                class="flex-1 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                :disabled="loading || !prompt.trim()"
                @click="submitPrompt"
              >
                {{ loading ? 'Generating...' : 'Generate' }}
              </button>
              <button class="rounded-2xl border px-4 py-2 text-sm" @click="clearChat">Clear</button>
            </div>

            <p class="mt-4 text-xs text-gray-500">{{ footnote }}</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from '#app'

const props = defineProps({ mode: { type: String, default: 'image' } })
const route = useRoute()
const { t } = useI18n()

const isImage = computed(() => props.mode === 'image')
const isVideo = computed(() => props.mode === 'video')

const prompt = ref('')
const negativePrompt = ref('')
const referenceImage = ref('')
const imageSize = ref('1K')
const imageRatio = ref('1:1')
const imageOutput = ref('url')

const videoWidth = ref(1152)
const videoHeight = ref(768)
const videoFrames = ref(121)
const videoFps = ref(24)

const loading = ref(false)
const error = ref('')
const messages = ref([
  {
    role: 'assistant',
    type: 'text',
    text: isImage.value
      ? t('agnesImage.title')
      : t('agnesVideo.title')
  }
])

const title = computed(() => (isImage.value ? t('agnesImage.title') : t('agnesVideo.title')))
const footnote = computed(() => (isImage.value ? t('agnesImage.footnote') : t('agnesVideo.footnote')))

onMounted(() => {
  const incomingPrompt = typeof route.query.prompt === 'string' ? route.query.prompt : ''
  if (incomingPrompt && !prompt.value) {
    prompt.value = incomingPrompt
  }

  if (import.meta.client) {
    const storedImage = sessionStorage.getItem('agnes-id-photo-ref')
    if (storedImage && !referenceImage.value) {
      referenceImage.value = storedImage
    }
    sessionStorage.removeItem('agnes-id-photo-ref')
  }
})

const clearChat = () => {
  messages.value = [
    {
      role: 'assistant',
      type: 'text',
      text: isImage.value ? t('agnesImage.title') : t('agnesVideo.title')
    }
  ]
  error.value = ''
  prompt.value = ''
}

const addAssistantMessage = (payload) => {
  messages.value.push(payload)
}

const resolveImageUrl = (result) => {
  if (!result || typeof result !== 'object') return ''

  const directUrl = result?.metadata?.url || result?.url || result?.image_url || result?.output_url || ''
  if (directUrl) return directUrl

  const firstData = result?.data?.[0] || result?.images?.[0] || result?.result?.[0] || {}
  if (firstData?.url) return firstData.url
  if (firstData?.b64_json) return `data:image/png;base64,${firstData.b64_json}`

  return ''
}

const submitPrompt = async () => {
  const text = prompt.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', type: 'text', text })
  prompt.value = ''
  loading.value = true
  error.value = ''

  try {
    const payload = isImage.value
      ? {
          type: 'image',
          prompt: text,
          negative_prompt: negativePrompt.value || undefined,
          image: referenceImage.value || undefined,
          size: imageSize.value,
          ratio: imageRatio.value,
          output: imageOutput.value
        }
      : {
          type: 'video',
          prompt: text,
          negative_prompt: negativePrompt.value || undefined,
          image: referenceImage.value || undefined,
          width: videoWidth.value,
          height: videoHeight.value,
          num_frames: videoFrames.value,
          frame_rate: videoFps.value,
          mode: 'ti2vid'
        }

    const data = await $fetch('/api/agnes/generate', {
      method: 'POST',
      body: payload
    })

    const result = data?.result || data || {}
    const url = resolveImageUrl(result)
    const imageDownloadName = `agnes-generated-${Date.now()}.png`
    const messageType = isImage.value ? 'image' : result?.status === 'video' || url ? 'video' : 'text'
    const messageText = result?.status ? `${isVideo.value ? 'Video' : 'Image'} status: ${result.status}` : (isImage.value ? 'Image generation succeeded.' : 'Video generation succeeded.')

    addAssistantMessage({ role: 'assistant', type: messageType, text: messageText, url, downloadName: imageDownloadName })

    if (result?.status === 'failed') {
      error.value = (isVideo.value ? 'Video' : 'Image') + ' generation failed. Please check your prompt and try again.'
    }
  } catch (e) {
    const msg = e?.data?.statusMessage || e?.message || 'Request failed.'
    error.value = msg
    addAssistantMessage({ role: 'assistant', type: 'text', text: msg })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.chat-panel {
  max-height: 70vh;
  min-height: 420px;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.04), rgba(148, 163, 184, 0.01));
}

.typing-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 2px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.6;
  animation: pulse 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.45;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
