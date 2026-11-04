<template>
  <div class="fixed bottom-5 right-5 z-40">
    <button
      class="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      @click="dialogOpen = true"
    >
      <span aria-hidden="true">💡</span>
      {{ $t('jsonCompare.feedbackButton') }}
    </button>
  </div>

  <div
    v-if="dialogOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
    @click.self="closeDialog"
  >
    <section
      class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-request-title"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="feature-request-title" class="text-xl font-bold text-slate-900 dark:text-white">{{ $t('jsonCompare.feedbackTitle') }}</h2>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ $t('jsonCompare.feedbackDescription') }}</p>
        </div>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          :aria-label="$t('jsonCompare.feedbackClose')"
          @click="closeDialog"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div v-if="submitted" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" role="status">
        {{ $t('jsonCompare.feedbackSuccess') }}
      </div>
      <form v-else class="space-y-4" @submit.prevent="submitRequest">
        <div>
          <label for="feature-request-message" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{{ $t('jsonCompare.feedbackMessageLabel') }}</label>
          <textarea
            id="feature-request-message"
            v-model="message"
            class="min-h-36 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            :placeholder="$t('jsonCompare.feedbackMessagePlaceholder')"
            minlength="10"
            maxlength="3000"
            required
          />
        </div>
        <div>
          <label for="feature-request-email" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {{ $t('jsonCompare.feedbackEmailLabel') }}
            <span class="font-normal text-slate-500 dark:text-slate-400">{{ $t('jsonCompare.feedbackOptional') }}</span>
          </label>
          <input
            id="feature-request-email"
            v-model="email"
            type="email"
            maxlength="254"
            autocomplete="email"
            class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            :placeholder="$t('jsonCompare.feedbackEmailPlaceholder')"
          >
        </div>
        <div class="feature-request-honeypot" aria-hidden="true">
          <label for="feature-request-website">Website</label>
          <input id="feature-request-website" v-model="website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400" role="alert">{{ errorMessage }}</p>
        <div class="flex justify-end gap-3 pt-1">
          <button type="button" class="feature-request-secondary" @click="closeDialog">{{ $t('jsonCompare.feedbackCancel') }}</button>
          <button
            type="submit"
            class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitting"
          >
            {{ submitting ? $t('jsonCompare.feedbackSubmitting') : $t('jsonCompare.feedbackSubmit') }}
          </button>
        </div>
      </form>
      <div v-if="submitted" class="mt-5 flex justify-end">
        <button type="button" class="feature-request-secondary" @click="closeDialog">{{ $t('jsonCompare.feedbackClose') }}</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const { t } = useI18n()
const dialogOpen = ref(false)
const message = ref('')
const email = ref('')
const website = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

const closeDialog = () => {
  if (submitting.value) return
  dialogOpen.value = false
  submitted.value = false
  errorMessage.value = ''
  message.value = ''
  email.value = ''
  website.value = ''
}

const submitRequest = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        message: message.value,
        email: email.value,
        website: website.value,
        pageUrl: window.location.href
      }
    })
    submitted.value = true
  } catch {
    errorMessage.value = t('jsonCompare.feedbackError')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feature-request-secondary {
  @apply inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700;
}

.feature-request-honeypot {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
