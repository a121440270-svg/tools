<template>
  <div :class="['mx-auto px-4 py-8 sm:px-6 lg:px-8', editorFullscreen ? 'max-w-full' : 'max-w-6xl']">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">{{ t('remoteShare.eyebrow') }}</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('remoteShare.title') }}</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ t('remoteShare.description') }}</p>
      </div>
      <p class="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">{{ t('remoteShare.expiryNotice') }}</p>
    </div>

    <div v-if="sharedLoading" class="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/60 dark:bg-blue-500/10 dark:text-blue-300">{{ t('remoteShare.loading') }}</div>
    <div v-if="isViewingSharedContent" class="mb-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
      <span>{{ t('remoteShare.visitorMode') }}</span>
      <button type="button" class="font-semibold underline" @click="createOwnShare">{{ t('remoteShare.createOwn') }}</button>
    </div>
    <form class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900" @submit.prevent="createShare">
      <div class="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
          <label class="shrink-0 text-sm font-medium text-slate-700 dark:text-slate-200">{{ t('remoteShare.shareLink') }}</label>
          <div class="flex min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 lg:max-w-[620px] dark:border-slate-700 dark:bg-slate-900">
            <span class="shrink-0 text-sm text-slate-500 dark:text-slate-400">{{ shareBaseUrl }}</span>
            <input v-model="slug" :readonly="isViewingSharedContent" class="min-w-0 flex-1 border-0 bg-transparent px-1 py-1.5 text-sm text-slate-800 outline-none dark:text-slate-100" type="text" maxlength="48" pattern="[a-z0-9][a-z0-9-]{2,47}" :aria-label="t('remoteShare.shareCodeLabel')" />
          </div>
          <div v-if="!isViewingSharedContent" class="flex flex-wrap gap-2">
            <button class="share-action-button share-action-primary" type="submit" :disabled="creating" :title="t('remoteShare.saveTitle')">{{ creating ? t('remoteShare.saving') : t('remoteShare.save') }}</button>
            <button class="share-action-button" type="button" :disabled="creating" :title="t('remoteShare.copyTitle')" @click="copyShareLink">{{ t('remoteShare.copy') }}</button>
            <button class="share-action-button" type="button" :disabled="creating" :title="t('remoteShare.qrTitle')" @click="generateQrCode">{{ t('remoteShare.qr') }}</button>
          </div>
        </div>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ saved ? savedLabel : defaultExpiryLabel }} {{ expiryLabel }}.</p>
      </div>
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ t('remoteShare.content') }}</label>
        <label class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{{ t('remoteShare.language') }}</span>
          <select v-model="language" :disabled="isViewingSharedContent" class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" :aria-label="t('remoteShare.contentFormat')">
            <option value="shell">Shell / Bash</option>
            <option value="powershell">PowerShell</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="text">{{ t('remoteShare.plainText') }}</option>
          </select>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('remoteShare.commands') }}</span>
          <button class="editor-tool-button" type="button" @click="toggleEditorFullscreen">{{ editorFullscreen ? t('remoteShare.exitFullscreen') : t('remoteShare.fullscreen') }}</button>
        </div>
      </div>
      <div v-if="sharedError" class="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-300">{{ sharedError }}</div>
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700" :class="{ 'editor-fullscreen': editorFullscreen }">
        <div class="share-note-editor"><CodeMirrorEditor v-model="content" :language="language" :theme="editorTheme" :readonly="isViewingSharedContent" :aria-label="t('remoteShare.shareContent')" /></div>
      </div>
      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">{{ errorMessage }}</p>
    </form>

    <div v-if="qrDataUrl" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" :aria-label="t('remoteShare.qrDialog')" @click.self="qrDataUrl = ''">
      <div class="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl dark:bg-slate-900">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('remoteShare.qrDialog') }}</h2>
          <button class="text-2xl leading-none text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" type="button" :aria-label="t('remoteShare.closeQr')" @click="qrDataUrl = ''">&times;</button>
        </div>
        <img :src="qrDataUrl" :alt="t('remoteShare.qrAlt')" class="mx-auto h-56 w-56 rounded-lg bg-white p-3" />
        <p class="mt-4 break-all text-xs text-slate-500 dark:text-slate-400">{{ shareUrl }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'
import { useToolSeo } from '~/composables/useToolSeo'

const { locale, t } = useI18n()

useToolSeo({
  title: () => t('remoteShare.seoTitle'),
  description: () => t('remoteShare.seoDescription'),
  keywords: () => t('remoteShare.seoKeywords'),
  applicationCategory: 'DeveloperApplication',
  schemaProperties: {
    name: 'OpsDrop Remote Script Handoff',
    description: 'Send scripts, commands and configuration to remote users with a temporary share link. Built for IT support, sysadmins and DevOps.'
  }
})

const slug = ref('')
const content = ref('')
const language = ref('shell')
const creating = ref(false)
const errorMessage = ref('')
const saved = ref(false)
const expiresAt = ref<number | null>(null)
const qrDataUrl = ref('')
const editorTheme = ref<'dark' | 'light'>('light')
const editorFullscreen = ref(false)
let themeObserver: MutationObserver | null = null
const slugStorageKey = 'opsdrop-temp-note-code'
const savedSlugStorageKey = 'opsdrop-temp-note-saved-code'
const contentStorageKey = 'opsdrop-temp-note-content'
const languageStorageKey = 'opsdrop-temp-note-language'
const savedContentStorageKey = 'opsdrop-temp-note-saved-content'
const savedLanguageStorageKey = 'opsdrop-temp-note-saved-language'
const route = useRoute()
const shareBaseUrl = computed(() => {
  if (typeof window === 'undefined') return 'https://onlitools.com/send-script-to-remote-user?share='
  return `${window.location.origin}/send-script-to-remote-user?share=`
})
const shareUrl = computed(() => `${shareBaseUrl.value}${slug.value}`)
const expiryLabel = computed(() => expiresAt.value ? new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(expiresAt.value) : t('remoteShare.expiryAfterSave'))
const savedLabel = computed(() => t('remoteShare.savedExpiry'))
const defaultExpiryLabel = computed(() => t('remoteShare.defaultExpiry'))
const shared = ref<any | null>(null)
const sharedLoading = ref(false)
const sharedError = ref('')
const isOwnerMode = ref(true)
const isViewingSharedContent = computed(() => Boolean(shared.value) && !isOwnerMode.value)

function getStorageKey(baseKey: string, linkCode: string) {
  return `${baseKey}:${linkCode}`
}

function hasOwnLink(linkCode: string) {
  return typeof window !== 'undefined' && localStorage.getItem(savedSlugStorageKey) === linkCode
}

function isSavedDraft(linkCode: string, draftContent: string, draftLanguage: string) {
  if (!hasOwnLink(linkCode)) return false
  const savedContent = localStorage.getItem(getStorageKey(savedContentStorageKey, linkCode))
  const savedLanguage = localStorage.getItem(getStorageKey(savedLanguageStorageKey, linkCode))
  return savedContent === null || (savedContent === draftContent && savedLanguage === draftLanguage)
}

function loadDraft(linkCode: string) {
  if (typeof window === 'undefined' || !linkCode) return
  content.value = localStorage.getItem(getStorageKey(contentStorageKey, linkCode)) || localStorage.getItem(contentStorageKey) || ''
  language.value = localStorage.getItem(getStorageKey(languageStorageKey, linkCode)) || localStorage.getItem(languageStorageKey) || 'shell'
  saved.value = isSavedDraft(linkCode, content.value, language.value)
}

async function loadSharedShare(shareId: string) {
  if (!shareId || !/^[a-z0-9][a-z0-9-]{2,47}$/.test(shareId)) {
    sharedError.value = t('remoteShare.invalid')
    return
  }

  sharedLoading.value = true
  sharedError.value = ''

  try {
    const response = await $fetch<{
      id: string
      content: string
      language: string
      expiresAt: number
    }>(`/api/shares/${shareId}`)
    shared.value = response
    slug.value = response.id
    content.value = response.content || ''
    language.value = response.language || 'shell'
    expiresAt.value = Number(response.expiresAt) || Date.now() + 259200000
    saved.value = false
  } catch (error: any) {
    shared.value = null
    sharedError.value = error?.data?.message || t('remoteShare.expired')
  } finally {
    sharedLoading.value = false
  }
}

function makeSlug() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(values, value => alphabet[value % alphabet.length]).join('')
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error(t('remoteShare.copyFailed'))
}

async function copyShareLink() {
  if (!saved.value) {
    ElMessage.info(t('remoteShare.savingFirst'))
    if (!await createShare()) return
  }
  if (!slug.value) return
  try {
    await copyText(shareUrl.value)
    ElMessage.success(t('remoteShare.copied'))
  } catch {
    const message = t('remoteShare.copyFailed')
    errorMessage.value = message
    ElMessage.error(message)
  }
}

function toggleEditorFullscreen() {
  editorFullscreen.value = !editorFullscreen.value
}

function createOwnShare() {
  const nextUrl = new URL(window.location.href)
  nextUrl.searchParams.delete('share')
  window.history.replaceState(window.history.state, '', nextUrl)

  shared.value = null
  isOwnerMode.value = true
  sharedError.value = ''
  errorMessage.value = ''
  qrDataUrl.value = ''
  slug.value = makeSlug()
  content.value = ''
  language.value = 'shell'
  saved.value = false
  expiresAt.value = Date.now() + 259200000
}

async function generateQrCode() {
  if (!saved.value) {
    ElMessage.info(t('remoteShare.savingFirst'))
    if (!await createShare()) return
  }
  if (!slug.value) {
    ElMessage.error(t('remoteShare.enterCode'))
    return
  }
  try {
    qrDataUrl.value = await QRCode.toDataURL(shareUrl.value, { width: 240, margin: 1 })
  } catch {
    ElMessage.error(t('remoteShare.qrFailed'))
  }
}

async function createShare(): Promise<boolean> {
  if (!content.value.trim()) {
    ElMessage.error(t('remoteShare.emptyContent'))
    return false
  }
  if (!/^[a-z0-9][a-z0-9-]{2,47}$/.test(slug.value)) {
    const message = t('remoteShare.invalidCode')
    errorMessage.value = message
    ElMessage.error(message)
    return false
  }
  creating.value = true
  errorMessage.value = ''
  const payload = { title: t('remoteShare.eyebrow'), slug: slug.value, content: content.value, language: language.value, ttl: 259200, autoExtend: true }
  const ownsSlug = hasOwnLink(slug.value)
  try {
    await $fetch(ownsSlug ? `/api/shares/${slug.value}` : '/api/shares', { method: ownsSlug ? 'PUT' : 'POST', body: payload } as any)
    saved.value = true
    expiresAt.value = Date.now() + 259200000
    localStorage.setItem(slugStorageKey, slug.value)
    localStorage.setItem(savedSlugStorageKey, slug.value)
    localStorage.setItem(getStorageKey(contentStorageKey, slug.value), content.value)
    localStorage.setItem(getStorageKey(languageStorageKey, slug.value), language.value)
    localStorage.setItem(getStorageKey(savedContentStorageKey, slug.value), content.value)
    localStorage.setItem(getStorageKey(savedLanguageStorageKey, slug.value), language.value)
    ElMessage.success(t('remoteShare.savedMessage', { expiry: expiryLabel.value }))
    return true
  } catch (error: any) {
    const message = error?.data?.message || error?.statusMessage || t('remoteShare.createFailed')
    errorMessage.value = message
    ElMessage.error(message)
    return false
  } finally { creating.value = false }
}

onMounted(async () => {
  const shareId = typeof route.query.share === 'string' ? route.query.share : ''
  isOwnerMode.value = !shareId || hasOwnLink(shareId)
  slug.value = localStorage.getItem(slugStorageKey) || makeSlug()
  loadDraft(slug.value)
  expiresAt.value = Date.now() + 259200000
  const syncEditorTheme = () => { editorTheme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light' }
  syncEditorTheme()
  themeObserver = new MutationObserver(syncEditorTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  if (shareId) {
    await loadSharedShare(shareId)
  }
})

onBeforeUnmount(() => { themeObserver?.disconnect() })

watch(slug, (value: string, previousValue: string) => {
  const normalized = value.toLowerCase()
  if (normalized !== value) {
    slug.value = normalized
    return
  }
  if (previousValue && typeof window !== 'undefined') {
    localStorage.setItem(getStorageKey(contentStorageKey, previousValue), content.value)
    localStorage.setItem(getStorageKey(languageStorageKey, previousValue), language.value)
  }

  if (shared.value && value === shared.value.id) {
    if (typeof window !== 'undefined' && value) localStorage.setItem(slugStorageKey, value)
    return
  }

  loadDraft(value)
  if (typeof window !== 'undefined' && value) localStorage.setItem(slugStorageKey, value)
})

watch([content, language], ([contentValue, languageValue]: [string, string]) => {
  if (typeof window !== 'undefined' && slug.value) {
    localStorage.setItem(getStorageKey(contentStorageKey, slug.value), contentValue)
    localStorage.setItem(getStorageKey(languageStorageKey, slug.value), languageValue)
    saved.value = isSavedDraft(slug.value, contentValue, languageValue)
  }
})

</script>