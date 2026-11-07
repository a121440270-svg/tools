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
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <label for="share-expiry" class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ t('remoteShare.expiry') }}</label>
          <select v-if="!isViewingSharedContent" id="share-expiry" v-model="expiresIn" class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <option value="never">{{ t('remoteShare.expiryNever') }}</option>
            <option value="1d">{{ t('remoteShare.expiryOneDay') }}</option>
            <option value="7d">{{ t('remoteShare.expirySevenDays') }}</option>
            <option value="30d">{{ t('remoteShare.expiryThirtyDays') }}</option>
          </select>
          <span v-if="isViewingSharedContent && sharedExpiresAt" class="text-xs text-slate-500 dark:text-slate-400">
            {{ sharedExpiresAt === NEVER_EXPIRES ? t('remoteShare.noExpiry') : t('remoteShare.expiresAt', { date: formatExpiry(sharedExpiresAt) }) }}
          </span>
          <span v-else-if="saved && sharedExpiresAt" class="text-xs text-slate-500 dark:text-slate-400">
            {{ sharedExpiresAt === NEVER_EXPIRES ? t('remoteShare.savedNoExpiry') : t('remoteShare.expiresAt', { date: formatExpiry(sharedExpiresAt) }) }}
          </span>
          <span v-else-if="!isViewingSharedContent && saved && expiresIn === 'never'" class="text-xs text-slate-500 dark:text-slate-400">{{ t('remoteShare.savedNoExpiry') }}</span>
          <span v-else-if="!isViewingSharedContent" class="text-xs text-slate-500 dark:text-slate-400">{{ t('remoteShare.expiryAfterSave', { duration: expiryLabel(expiresIn) }) }}</span>
        </div>
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
            <option value="sql">SQL</option>
            <option value="text">{{ t('remoteShare.plainText') }}</option>
          </select>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('remoteShare.commands') }}</span>
          <button class="editor-tool-button" type="button" :disabled="sharedLoading || creating" :title="t('remoteShare.refreshTitle')" @click="refreshContent">{{ t('remoteShare.refresh') }}</button>
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

const { t } = useI18n()

useToolSeo({
  title: () => `${t('remoteShare.seoTitle')} - ${t('home.tools.shareNote.name')}`,
  description: () => t('remoteShare.seoDescription'),
  keywords: () => t('remoteShare.seoKeywords'),
  applicationCategory: 'DeveloperApplication',
  featureList: () => [t('remoteShare.seoLinkFeature'), t('remoteShare.seoQrFeature')],
  schemaProperties: () => ({
    name: t('home.tools.shareNote.name'),
    description: t('remoteShare.seoDescription')
  })
})

const slug = ref('')
const content = ref('')
const language = ref('shell')
const creating = ref(false)
const errorMessage = ref('')
const saved = ref(false)
const expiresIn = ref<ShareExpiry>('never')
const sharedExpiresAt = ref<number | null>(null)
const qrDataUrl = ref('')
const editorTheme = ref<'dark' | 'light'>('light')
const editorFullscreen = ref(true)
let themeObserver: MutationObserver | null = null
const storageKey = 'opsdrop-temp-note'
const legacyStorageKeys = [
  'opsdrop-temp-note-code',
  'opsdrop-temp-note-saved-code',
  'opsdrop-temp-note-content',
  'opsdrop-temp-note-language',
  'opsdrop-temp-note-saved-content',
  'opsdrop-temp-note-saved-language'
]
const route = useRoute()
const shareBaseUrl = computed(() => {
  if (typeof window === 'undefined') return 'https://onlitools.com/send-script-to-remote-user?share='
  return `${window.location.origin}/send-script-to-remote-user?share=`
})
const shareUrl = computed(() => `${shareBaseUrl.value}${slug.value}`)
const shared = ref<any | null>(null)
const sharedLoading = ref(false)
const sharedError = ref('')
const isOwnerMode = ref(true)
const isViewingSharedContent = computed(() => typeof route.query.share === 'string' && Boolean(route.query.share) && !isOwnerMode.value)
const savedSlug = ref('')
const savedContentSnapshot = ref<string | null>(null)
const savedLanguageSnapshot = ref<string | null>(null)
const savedExpirySnapshot = ref<ShareExpiry | null>(null)

type ShareExpiry = 'never' | '1d' | '7d' | '30d'
const NEVER_EXPIRES = Number.MAX_SAFE_INTEGER
const expirySeconds: Record<ShareExpiry, number> = {
  never: 0,
  '1d': 86400,
  '7d': 604800,
  '30d': 2592000
}

function isShareExpiry(value: unknown): value is ShareExpiry {
  return value === 'never' || value === '1d' || value === '7d' || value === '30d'
}

function expiryLabel(value: ShareExpiry) {
  return t(`remoteShare.expiry${value === 'never' ? 'Never' : value === '1d' ? 'OneDay' : value === '7d' ? 'SevenDays' : 'ThirtyDays'}`)
}

function formatExpiry(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp)
}

function readLegacyValue(baseKey: string, linkCode: string) {
  return linkCode ? localStorage.getItem(`${baseKey}:${linkCode}`) : null
}

function hasOwnLink(linkCode: string) {
  return Boolean(linkCode) && savedSlug.value === linkCode
}

function isSavedDraft(linkCode: string, draftContent: string, draftLanguage: string) {
  if (!hasOwnLink(linkCode)) return false
  if (savedExpirySnapshot.value !== null && savedExpirySnapshot.value !== expiresIn.value) return false
  if (savedExpirySnapshot.value === null && expiresIn.value !== 'never') return false
  return savedContentSnapshot.value === null ||
    (savedContentSnapshot.value === draftContent &&
      savedLanguageSnapshot.value === draftLanguage &&
      savedExpirySnapshot.value === expiresIn.value)
}

function clearLegacyStorage() {
  const keysToRemove: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key && key !== storageKey && (
      key.startsWith('opsdrop-temp-note-') ||
      legacyStorageKeys.some(baseKey => key === baseKey || key.startsWith(`${baseKey}:`))
    )) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

function persistDraft() {
  if (typeof window === 'undefined' || !isOwnerMode.value) return
  clearLegacyStorage()
  localStorage.setItem(storageKey, JSON.stringify({
    slug: slug.value,
    savedSlug: savedSlug.value,
    content: content.value,
    language: language.value,
    expiresIn: expiresIn.value,
    savedContent: savedContentSnapshot.value,
    savedLanguage: savedLanguageSnapshot.value,
    savedExpiry: savedExpirySnapshot.value
  }))
}

function restoreDraft() {
  const storedValue = localStorage.getItem(storageKey)
  if (storedValue) {
    try {
      const state = JSON.parse(storedValue)
      if (state && typeof state === 'object') {
        slug.value = typeof state.slug === 'string' ? state.slug : makeSlug()
        savedSlug.value = typeof state.savedSlug === 'string' ? state.savedSlug : ''
        content.value = typeof state.content === 'string' ? state.content : ''
        language.value = typeof state.language === 'string' ? state.language : 'shell'
        expiresIn.value = isShareExpiry(state.expiresIn) ? state.expiresIn : 'never'
        savedContentSnapshot.value = typeof state.savedContent === 'string' ? state.savedContent : null
        savedLanguageSnapshot.value = typeof state.savedLanguage === 'string' ? state.savedLanguage : null
        savedExpirySnapshot.value = isShareExpiry(state.savedExpiry) ? state.savedExpiry : null
        saved.value = isSavedDraft(slug.value, content.value, language.value)
        clearLegacyStorage()
        return
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  }

  const legacySlug = localStorage.getItem('opsdrop-temp-note-code') || makeSlug()
  savedSlug.value = localStorage.getItem('opsdrop-temp-note-saved-code') || ''
  slug.value = legacySlug
  content.value = readLegacyValue('opsdrop-temp-note-content', legacySlug)
    ?? readLegacyValue('opsdrop-temp-note-content', savedSlug.value)
    ?? localStorage.getItem('opsdrop-temp-note-content')
    ?? ''
  language.value = readLegacyValue('opsdrop-temp-note-language', legacySlug)
    ?? readLegacyValue('opsdrop-temp-note-language', savedSlug.value)
    ?? localStorage.getItem('opsdrop-temp-note-language')
    ?? 'shell'
  expiresIn.value = 'never'
  savedContentSnapshot.value = readLegacyValue('opsdrop-temp-note-saved-content', savedSlug.value)
  savedLanguageSnapshot.value = readLegacyValue('opsdrop-temp-note-saved-language', savedSlug.value)
  savedExpirySnapshot.value = null
  saved.value = isSavedDraft(slug.value, content.value, language.value)
  persistDraft()
}

function loadDraft(linkCode: string) {
  const storedValue = localStorage.getItem(storageKey)
  if (!storedValue) return

  try {
    const state = JSON.parse(storedValue)
    if (state?.slug !== linkCode) return
    content.value = typeof state.content === 'string' ? state.content : ''
    language.value = typeof state.language === 'string' ? state.language : 'shell'
    saved.value = isSavedDraft(linkCode, content.value, language.value)
  } catch {
    localStorage.removeItem(storageKey)
  }
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
    sharedExpiresAt.value = response.expiresAt
    slug.value = response.id
    content.value = response.content || ''
    language.value = response.language || 'shell'
    saved.value = isOwnerMode.value && isSavedDraft(response.id, response.content, response.language)
  } catch (error: any) {
    shared.value = null
    sharedExpiresAt.value = null
    sharedError.value = error?.statusCode === 410 || error?.data?.statusCode === 410
      ? t('remoteShare.linkExpired')
      : error?.data?.message || t('remoteShare.expired')
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

async function refreshContent() {
  const shareId = typeof route.query.share === 'string' && !isOwnerMode.value
    ? route.query.share
    : saved.value ? slug.value : ''

  if (shareId) {
    await loadSharedShare(shareId)
    return
  }

  loadDraft(slug.value)
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
  expiresIn.value = 'never'
  sharedExpiresAt.value = null
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
  const payload = { title: t('remoteShare.eyebrow'), slug: slug.value, content: content.value, language: language.value, expiresIn: expiresIn.value }
  const existingSlug = savedSlug.value
  try {
    const response = await $fetch<{ id: string; expiresAt: number }>(
      existingSlug ? `/api/shares/${existingSlug}` : '/api/shares',
      { method: existingSlug ? 'PUT' : 'POST', body: payload } as any
    )
    savedSlug.value = response.id
    savedContentSnapshot.value = content.value
    savedLanguageSnapshot.value = language.value
    savedExpirySnapshot.value = expiresIn.value
    sharedExpiresAt.value = response.expiresAt
    saved.value = true
    persistDraft()
    ElMessage.success(t('remoteShare.savedMessage'))
    return true
  } catch (error: any) {
    const message = error?.data?.message || error?.statusMessage || t('remoteShare.createFailed')
    errorMessage.value = message
    ElMessage.error(message)
    return false
  } finally { creating.value = false }
}

onMounted(async () => {
  restoreDraft()
  const shareId = typeof route.query.share === 'string' ? route.query.share : ''
  isOwnerMode.value = !shareId || hasOwnLink(shareId)
  const syncEditorTheme = () => { editorTheme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light' }
  syncEditorTheme()
  themeObserver = new MutationObserver(syncEditorTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  if (shareId) {
    await loadSharedShare(shareId)
  }
})

onBeforeUnmount(() => { themeObserver?.disconnect() })

watch(slug, (value: string) => {
  const normalized = value.toLowerCase()
  if (normalized !== value) {
    slug.value = normalized
    return
  }
  if (shared.value && value === shared.value.id) {
    return
  }
  saved.value = isSavedDraft(value, content.value, language.value)
  persistDraft()
})

watch([content, language, expiresIn], ([contentValue, languageValue, expiryValue]: [string, string, ShareExpiry]) => {
  if (typeof window !== 'undefined' && slug.value && isOwnerMode.value) {
    expiresIn.value = expiryValue
    saved.value = isSavedDraft(slug.value, contentValue, languageValue)
    persistDraft()
  }
})

</script>