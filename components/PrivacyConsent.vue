<template>
  <div v-if="show" class="privacy-consent-toast" :class="theme">
    <div class="toast-content">
      <button class="close-btn" @click="close" aria-label="Close">&times;</button>
      <h2>{{ $t('privacy.title') }}</h2>
      <p>{{ $t('privacy.desc') }}</p>
      <form>
        <label>
          <input type="checkbox" checked disabled />
          {{ $t('privacy.necessary') }}
        </label>
        <label>
          <input type="checkbox" v-model="analytics" />
          {{ $t('privacy.analytics') }}
        </label>
        <label>
          <input type="checkbox" v-model="ads" />
          {{ $t('privacy.ads') }}
        </label>
      </form>
      <div class="actions">
        <button type="button" @click="acceptAll">{{ $t('privacy.acceptAll') }}</button>
        <button type="button" @click="save">{{ $t('privacy.save') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
const show = ref(false)
const analytics = ref(false)
const ads = ref(false)
const theme = ref('light')

function updateTheme() {
  theme.value = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

onMounted(() => {
  const consent = localStorage.getItem('cookie_consent')
  if (!consent) show.value = true
  updateTheme()
  window.addEventListener('themechange', updateTheme)
  // 监听 body 属性变化（如用 nuxt-theme 或其它主题切换插件）
  const observer = new MutationObserver(updateTheme)
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] })
  onBeforeUnmount(() => {
    window.removeEventListener('themechange', updateTheme)
    observer.disconnect()
  })
})

function acceptAll() {
  analytics.value = true
  ads.value = true
  save()
}

function save() {
  localStorage.setItem('cookie_consent', JSON.stringify({
    necessary: true,
    analytics: analytics.value,
    ads: ads.value
  }))
  show.value = false
  location.reload()
}

function close() {
  show.value = false
}
</script>

<style scoped>
.privacy-consent-toast {
  position: fixed;
  right: 2em;
  bottom: 2em;
  z-index: 9999;
  max-width: 400px;
  min-width: 260px;
  width: 33vw;
  height: auto;
  min-height: 100px;
  border-radius: 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  transition: background 0.2s, color 0.2s;
  font-size: 15px;
}
.privacy-consent-toast.light {
  background: #fff;
  color: #222;
  border: 1px solid #eee;
}
.privacy-consent-toast.dark {
  background: #23272f;
  color: #f3f3f3;
  border: 1px solid #444;
}
.toast-content {
  padding: 1.2em 1.2em 1em 1.2em;
  position: relative;
}
.toast-content h2 {
  margin: 0 0 0.5em 0;
  font-size: 1.1em;
}
.toast-content p {
  margin: 0 0 1em 0;
  font-size: 0.98em;
}
form label {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
  font-size: 0.97em;
}
.actions {
  margin-top: 1em;
  display: flex;
  gap: 1em;
  justify-content: flex-end;
}
.actions button {
  border: none;
  border-radius: 4px;
  padding: 0.4em 1.1em;
  font-size: 0.97em;
  cursor: pointer;
  background: #3182ce;
  color: #fff;
  transition: background 0.2s;
}
.privacy-consent-toast.light .actions button {
  background: #3182ce;
}
.privacy-consent-toast.dark .actions button {
  background: #2563eb;
}
.actions button:hover {
  opacity: 0.92;
}
.close-btn {
  position: absolute;
  top: 0.7em;
  right: 1em;
  background: none;
  border: none;
  font-size: 1.5em;
  color: inherit;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.close-btn:focus {
  outline: 2px solid #3182ce;
}
</style>
