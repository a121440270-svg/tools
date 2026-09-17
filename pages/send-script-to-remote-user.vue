<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Remote Script Handoff</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Send a script to a remote user in seconds</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Share scripts, commands and configs with a temporary link.</p>
      </div>
      <p class="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">Links expire after 3 days. Continued visits automatically extend the link while it is being used.</p>
    </div>

    <div v-if="sharedLoading" class="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/60 dark:bg-blue-500/10 dark:text-blue-300">Loading shared content...</div>
    <div v-if="isViewingSharedContent" class="mb-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300">
      <span>Visitor mode · read-only shared content</span>
      <NuxtLink to="/send-script-to-remote-user" class="font-semibold underline">Create your own share</NuxtLink>
    </div>
    <form class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900" @submit.prevent="createShare">
      <div class="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
          <label class="shrink-0 text-sm font-medium text-slate-700 dark:text-slate-200">Share link</label>
          <div class="flex min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 lg:max-w-[620px] dark:border-slate-700 dark:bg-slate-900">
            <span class="shrink-0 text-sm text-slate-500 dark:text-slate-400">{{ shareBaseUrl }}</span>
            <input v-model="slug" :readonly="isViewingSharedContent" class="min-w-0 flex-1 border-0 bg-transparent px-1 py-1.5 text-sm text-slate-800 outline-none dark:text-slate-100" type="text" maxlength="48" pattern="[a-z0-9][a-z0-9-]{2,47}" aria-label="Share link code" />
          </div>
          <div v-if="!isViewingSharedContent" class="flex flex-wrap gap-2">
            <button class="share-action-button share-action-primary" type="submit" :disabled="creating" title="Save the link and content">{{ creating ? 'Saving...' : 'Save' }}</button>
            <button class="share-action-button" type="button" :disabled="creating" title="Save the link and copy it" @click="copyShareLink">Copy</button>
            <button class="share-action-button" type="button" :disabled="creating" title="Save the link and generate a QR code" @click="generateQrCode">QR code</button>
          </div>
        </div>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ saved ? savedLabel : defaultExpiryLabel }} {{ expiryLabel }}.</p>
      </div>
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-200">Content</label>
        <label class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Language</span>
          <select v-model="language" :disabled="isViewingSharedContent" class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" aria-label="Content format">
            <option value="shell">Shell / Bash</option>
            <option value="powershell">PowerShell</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="text">Plain text</option>
          </select>
        </label>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500 dark:text-slate-400">Commands, scripts, configs</span>
          <button class="editor-tool-button" type="button" @click="toggleEditorFullscreen">{{ editorFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}</button>
        </div>
      </div>
      <div v-if="sharedError" class="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-300">{{ sharedError }}</div>
      <div ref="editorFrame" class="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700" :class="{ 'editor-fullscreen': editorFullscreen }">
        <div class="share-note-editor"><CodeMirrorEditor v-model="content" :language="language" :theme="editorTheme" :readonly="isViewingSharedContent" aria-label="Share content" /></div>
      </div>
      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-300">{{ errorMessage }}</p>
    </form>

    <div v-if="qrDataUrl" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Share link QR code" @click.self="qrDataUrl = ''">
      <div class="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl dark:bg-slate-900">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Share link QR code</h2>
          <button class="text-2xl leading-none text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" type="button" aria-label="Close QR code" @click="qrDataUrl = ''">&times;</button>
        </div>
        <img :src="qrDataUrl" alt="QR code for the share link" class="mx-auto h-56 w-56 rounded-lg bg-white p-3" />
        <p class="mt-4 break-all text-xs text-slate-500 dark:text-slate-400">{{ shareUrl }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'

useHead({
  title: 'OpsDrop | Share Scripts, Commands & Configs Instantly',
  meta: [
    { name: 'description', content: 'Send scripts, commands and configuration to remote users with a temporary share link. No signup, no installation. Built for IT support, sysadmins and DevOps.' },
    { name: 'keywords', content: 'send script to remote user, share script with customer, share commands with customer, share bash script, share powershell script, share linux commands, share config online, temporary technical handoff' },
    { property: 'og:title', content: 'OpsDrop | Share Scripts, Commands & Configs Instantly' },
    { property: 'og:description', content: 'Send scripts, commands and configuration to remote users with a temporary share link. No signup required.' },
    { property: 'og:type', content: 'website' }
  ],
  link: [{ rel: 'canonical', href: 'https://onlitools.com/send-script-to-remote-user' }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'OpsDrop Remote Script Handoff', url: 'https://onlitools.com/send-script-to-remote-user', applicationCategory: 'DeveloperApplication', description: 'Send scripts, commands and configuration to remote users with a temporary share link. Built for IT support, sysadmins and DevOps.' }) }]
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
const editorFrame = ref<HTMLElement | null>(null)
let themeObserver: MutationObserver | null = null
const slugStorageKey = 'opsdrop-temp-note-code'
const savedSlugStorageKey = 'opsdrop-temp-note-saved-code'
const contentStorageKey = 'opsdrop-temp-note-content'
const languageStorageKey = 'opsdrop-temp-note-language'
const savedContentStorageKey = 'opsdrop-temp-note-saved-content'
const savedLanguageStorageKey = 'opsdrop-temp-note-saved-language'
const route = useRoute()
const { locale } = useI18n()
const shareBaseUrl = computed(() => {
  if (typeof window === 'undefined') return 'https://onlitools.com/send-script-to-remote-user?share='
  return `${window.location.origin}/send-script-to-remote-user?share=`
})
const shareUrl = computed(() => `${shareBaseUrl.value}${slug.value}`)
const isChinese = computed(() => String(locale.value).toLowerCase().startsWith('zh'))
const expiryLabel = computed(() => expiresAt.value ? new Intl.DateTimeFormat(isChinese.value ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(expiresAt.value) : (isChinese.value ? '保存后 3 天' : '3 days after saving'))
const savedLabel = computed(() => isChinese.value ? '已保存，过期时间：' : 'Saved. Expires')
const defaultExpiryLabel = computed(() => isChinese.value ? '默认过期时间：' : 'Default expiry:')
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
    sharedError.value = 'This shared link is invalid.'
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
    sharedError.value = error?.data?.message || 'This link does not exist, or it has already expired.'
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
  if (!copied) throw new Error('Copy command failed')
}

async function copyShareLink() {
  if (!saved.value) {
    ElMessage.info('Content is not saved yet. Saving it first...')
    if (!await createShare()) return
  }
  if (!slug.value) return
  try {
    await copyText(shareUrl.value)
    ElMessage.success('Share link copied')
  } catch {
    const message = 'Copy failed. Please copy the link manually.'
    errorMessage.value = message
    ElMessage.error(message)
  }
}

async function toggleEditorFullscreen() {
  if (!editorFrame.value) return
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    editorFullscreen.value = false
    return
  }
  try {
    await editorFrame.value.requestFullscreen()
  } catch {
    editorFullscreen.value = !editorFullscreen.value
  }
}

async function generateQrCode() {
  if (!saved.value) {
    ElMessage.info('Content is not saved yet. Saving it first...')
    if (!await createShare()) return
  }
  if (!slug.value) {
    ElMessage.error('Enter a link code before generating a QR code.')
    return
  }
  try {
    qrDataUrl.value = await QRCode.toDataURL(shareUrl.value, { width: 240, margin: 1 })
  } catch {
    ElMessage.error('The QR code could not be generated. Please try again.')
  }
}

async function createShare(): Promise<boolean> {
  if (!content.value.trim()) {
    ElMessage.error('Add some script, command, or configuration before saving.')
    return false
  }
  if (!/^[a-z0-9][a-z0-9-]{2,47}$/.test(slug.value)) {
    const message = 'The link code must be 3-48 characters using lowercase letters, numbers, or hyphens.'
    errorMessage.value = message
    ElMessage.error(message)
    return false
  }
  creating.value = true
  errorMessage.value = ''
  const payload = { title: 'Remote script handoff', slug: slug.value, content: content.value, language: language.value, ttl: 259200, autoExtend: true }
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
    ElMessage.success(`Share link saved. Expires ${expiryLabel.value}.`)
    return true
  } catch (error: any) {
    const message = error?.data?.message || error?.statusMessage || 'Unable to create the share. Please try again.'
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
  document.addEventListener('fullscreenchange', () => { editorFullscreen.value = document.fullscreenElement === editorFrame.value })

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