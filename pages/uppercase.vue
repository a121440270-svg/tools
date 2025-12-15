<template>
  <div class="max-w-2xl mx-auto py-10">
      <div class="header-row">
        <div>
          <h1 class="text-2xl font-bold mb-4">{{ $t('menu.uppercase') || '文本转大写工具' }}</h1>
          <p class="mb-4 text-gray-600 dark:text-gray-300">{{ $t('uppercase.desc') || '粘贴文本后自动转换为大写并复制到剪贴板' }}</p>
        </div>

        <div class="theme-toggle-wrap">
          <button class="theme-toggle" @click="toggleTheme" :aria-pressed="isDark">
            <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 3v2M12 19v2M4.22 4.22 5.64 5.64M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="io-grid">
        <div class="panel">
          <label class="label">{{ $t('uppercase.inputLabel') || '输入文本' }}</label>
          <textarea
            ref="area"
            v-model="text"
            @paste="handlePaste"
            @input="onInput"
            :placeholder="$t('uppercase.placeholder') || '请在此处粘贴或输入文本...'
            "
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none h-40 bg-white dark:bg-gray-900 dark:text-white"
          ></textarea>
        </div>

        <div class="panel">
          <label class="label">{{ $t('uppercase.outputLabel') || '大写文本' }}</label>
          <textarea
            :value="uppercaseText"
            readonly
            class="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none h-40 bg-gray-50 dark:bg-gray-900 dark:text-white font-semibold"
            placeholder="转换后的大写文本将显示在这里..."
          ></textarea>
        </div>
      </div>

      <div class="button-row">
        <button @click="copyText" class="btn primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          {{ $t('uppercase.copyBtn') || '复制到剪贴板' }}
        </button>

        <button @click="clearText" class="btn ghost">
          {{ $t('uppercase.clearBtn') || '清空' }}
        </button>

        <div class="status-container">
          <div v-if="status" :class="['status-message', statusType]">{{ status }}</div>
        </div>
      </div>

      <div class="instructions">
        <h3>使用说明</h3>
        <ul>
          <li>在输入框中粘贴或输入文本</li>
          <li>文本将自动转换为大写并显示在右侧</li>
          <li>点击"复制到剪贴板"复制转换后的文本</li>
          <li>点击"清空"清除输入内容</li>
        </ul>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHead, useRoute, useRuntimeConfig } from '#imports'
const { t, locale } = useI18n()

const text = ref('')
const status = ref('')
const statusType = ref('')
let timer = null

const area = ref(null)

const uppercaseText = computed(() => (text.value || '').toUpperCase())

// theme handling (SSR-safe)
const isDark = ref(false)

const readPref = () => {
  try {
    if (typeof window === 'undefined') return false
    const stored = window.localStorage && window.localStorage.getItem && window.localStorage.getItem('site-theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    // fallback to system preference (if available)
    if (window.matchMedia) return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch (e) {
    // ignore and default to light
  }
  return false
}

const applyTheme = (dark) => {
  try {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (!root) return
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  } catch (e) {
    // ignore
  }
}

// initialize theme on client only
onMounted(() => {
  const pref = readPref()
  isDark.value = pref
  applyTheme(pref)
})

// --- SEO / i18n-aware head tags ---
const route = useRoute()
const runtime = useRuntimeConfig()

const siteName = runtime.public?.site?.name || runtime.public?.siteName || 'Online Tools'
const supportedLocales = ['en', 'zh', 'fr', 'es', 'de']

const pageTitle = computed(() => `${t('menu.uppercase') || 'Uppercase'} — ${siteName}`)
const pageDescription = computed(() => t('uppercase.desc') || 'Convert text to uppercase online and copy to clipboard quickly.')
const keywords = computed(() => `${t('menu.uppercase') || 'uppercase'}, text, convert, online tool, clipboard`)

// build canonical / alternate URLs if siteUrl is configured
const canonicalUrl = (() => {
  try {
    const base = runtime.public?.site?.url || runtime.public?.siteUrl || ''
    if (!base) return undefined
    // use route.path for relative
    return new URL(route.fullPath || route.path, base).toString()
  } catch (e) {
    return undefined
  }
})()

const alternates = supportedLocales.map(code => {
  try {
    const base = runtime.public?.site?.url || runtime.public?.siteUrl || ''
    const href = base ? new URL(route.fullPath || route.path, base).toString().replace(/(^https?:\/\/[^/]+)(.*)$/, `$1/${code}$2`) : undefined
    return href ? { rel: 'alternate', hreflang: code, href } : null
  } catch (e) { return null }
}).filter(Boolean)

useHead({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { name: 'keywords', content: keywords.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    canonicalUrl ? { property: 'og:url', content: canonicalUrl } : null,
    { name: 'twitter:card', content: 'summary' }
  ].filter(Boolean),
  link: [
    canonicalUrl ? { rel: 'canonical', href: canonicalUrl } : null,
    ...alternates
  ].filter(Boolean),
  htmlAttrs: {
    lang: locale.value || 'en'
  },
  script: canonicalUrl ? [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': pageTitle.value,
        'description': pageDescription.value,
        'url': canonicalUrl
      })
    }
  ] : []
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  try { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem('site-theme', isDark.value ? 'dark' : 'light') } catch (e) {}
}

const setStatus = (msg, type = 'success') => {
  clearTimeout(timer)
  status.value = msg
  statusType.value = type
  if (msg) {
    timer = setTimeout(() => {
      status.value = ''
      statusType.value = ''
    }, 4000)
  }
}

const handlePaste = (e) => {
  try {
    // we still allow default so mobile paste works; but capture clipboard if available
    const pasted = (e.clipboardData && e.clipboardData.getData('text')) || ''
    if (!pasted) return
    // set raw text (so user can still edit) — uppercase will be shown in output
    text.value = pasted
    // try to copy uppercase to clipboard immediately
    const upper = pasted.toUpperCase()
    navigator.clipboard && navigator.clipboard.writeText(upper).then(() => {
      setStatus('复制成功', 'success')
    }).catch(() => {
      // ignore; user can still press copy
    })
  } catch (err) {
    console.error(err)
  }
}

const onInput = () => {
  // clear any existing status when user types
  if (!text.value) setStatus('', '')
}

const copyText = async () => {
  if (!uppercaseText.value) {
    setStatus('没有文本可复制', 'error')
    return
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(uppercaseText.value)
    } else {
      // fallback for old browsers
      const ta = document.createElement('textarea')
      ta.value = uppercaseText.value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setStatus('复制成功', 'success')
  } catch (err) {
    console.error(err)
    setStatus('复制失败', 'error')
  }
}

const clearText = () => {
  text.value = ''
  setStatus('', '')
  area.value && area.value.focus()
}
</script>

<style scoped>
.title { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 6px; }
.desc { color: #6b7280; margin-bottom: 18px; }

.io-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.panel { display: flex; flex-direction: column; }
.label { font-weight: 600; margin-bottom: 8px; color: #374151; }
.input-area, .output-area { display: block; }

.button-row { display:flex; align-items:center; gap:12px; margin-top:18px; }
.btn { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px; font-weight:600; cursor:pointer; border:none; }
.btn .icon{ width:18px; height:18px; }
.btn.primary { background: linear-gradient(90deg,#6a11cb,#2575fc); color:#fff; box-shadow: 0 8px 20px rgba(38, 50, 150, 0.12); }
.btn.primary:hover { transform: translateY(-2px); }
.btn.ghost { background:#f3f4f6; color:#374151; }

.status-container { margin-left:auto; }
.status-message { padding:8px 12px; border-radius:8px; font-weight:600; }
.status-message.success { background:#e8f5e9; color:#2e7d32; }
.status-message.error { background:#ffebee; color:#c62828; }

.instructions {
  margin-top:20px;
  /* do not use a white background; let it be subtle in light mode */
  background: transparent;
  padding:12px;
  border-radius:10px;
  border: 1px solid #e5e7eb;
  color: #374151;
  font-size:14px;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.instructions h3 { margin-bottom:8px; }
.instructions ul { padding-left:18px; color:#6b7280; }
.instructions strong { color: #111827; }

/* dark mode overrides when a parent (usually <html>) has .dark */
/* removed dark gradient — keep root background controlled by app's layout/theme */

/* container card removed; no page-level card background to override */

:deep(.dark) .desc { color: #9ca3af; }
:deep(.dark) .label { color: #cbd5e1; }
:deep(.dark) .input-area, :deep(.dark) .output-area {
  background: #071024;
  border-color: #1f2937;
  color: #e6eef8;
}
:deep(.dark) .output-area { background: #061026; }
:deep(.dark) .btn.ghost { background: #0f1724; color: #cbd5e1; }
:deep(.dark) .status-message.success { background:#052a10; color:#86efac; }
:deep(.dark) .status-message.error { background:#2b0606; color:#ff9b9b; }

:deep(.dark) .instructions {
  background: rgba(255,255,255,0.03);
  color:#cbd5e1;
  border-color: rgba(255,255,255,0.04);
}
:deep(.dark) .instructions ul { color: #9ca3af; }
:deep(.dark) .instructions strong { color: #e6eef8; }

.header-row { display:flex; justify-content:space-between; align-items:center; gap:12px; }
.theme-toggle-wrap { display:flex; align-items:center; }
.theme-toggle { background:transparent; border:1px solid rgba(0,0,0,0.06); padding:8px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; }
.theme-toggle .icon { width:18px; height:18px; color:#374151; }
:deep(.dark) .theme-toggle { border-color: rgba(255,255,255,0.06); }
:deep(.dark) .theme-toggle .icon { color:#e5e7eb; }

@media (max-width: 880px) {
  .io-grid { grid-template-columns: 1fr; }
  /* no container card padding to adjust */
  .button-row { flex-direction: column; align-items: stretch; }
  .status-container { margin-left: 0; }
}
</style>
