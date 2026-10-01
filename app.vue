<template>
  <NuxtLayout>
    <NuxtPage />
    <PrivacyConsent />
  </NuxtLayout>
</template>

<script setup lang="ts">
import PrivacyConsent from '~/components/PrivacyConsent.vue'
import { ID_INJECTION_KEY } from 'element-plus'
import { provide } from 'vue'
import { nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

provide(ID_INJECTION_KEY, {
  prefix: Math.random().toString(36).substr(2, 10),
  current: 0
})

const route = useRoute()
const nonToolRoutePrefixes = ['/about', '/admin', '/auth', '/blog', '/pay', '/profile', '/prompts']
const localePrefix = /^\/(zh|ja|de|fr|ar)(?=\/|$)/
let activeToolPage: { name: string; url: string } | null = null

function getToolPage(path: string) {
  const normalizedPath = path.replace(localePrefix, '') || '/'
  if (normalizedPath === '/' || nonToolRoutePrefixes.some(prefix => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
    return null
  }

  const name = document.querySelector('h1')?.textContent?.trim() || document.title.trim() || normalizedPath.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || '未知'
  return { name, url: window.location.href }
}

function notifyTool(action: 'enter' | 'leave', page: { name: string; url: string }) {
  return $fetch('/api/notify/tool', {
    method: 'POST',
    body: { action, toolName: page.name, pageUrl: page.url }
  }).catch(error => console.debug('Tool notification skipped', error))
}

function notifyOnPageHide() {
  if (!activeToolPage) return
  const payload = JSON.stringify({
    action: 'leave',
    toolName: activeToolPage.name,
    pageUrl: activeToolPage.url
  })
  const body = new Blob([payload], { type: 'application/json' })
  if (!navigator.sendBeacon('/api/notify/tool', body)) {
    void fetch('/api/notify/tool', { method: 'POST', body, keepalive: true })
  }
}

function notifyOnPageShow(event: PageTransitionEvent) {
  if (event.persisted && activeToolPage) void notifyTool('enter', activeToolPage)
}

async function trackToolRoute(path: string) {
  await nextTick()
  const nextPage = getToolPage(path)
  if (activeToolPage?.url === nextPage?.url) return
  if (activeToolPage) await notifyTool('leave', activeToolPage)
  activeToolPage = nextPage
  if (nextPage) void notifyTool('enter', nextPage)
}

async function submitCurrentPage() {
  try {
    await $fetch('/api/seo/baidu-submit', {
      method: 'POST',
      body: { url: window.location.href }
    })
  } catch (error) {
    console.debug('Baidu page submission skipped', error)
  }
}

onMounted(() => {
  submitCurrentPage()
  void trackToolRoute(route.path)
  window.addEventListener('pagehide', notifyOnPageHide)
  window.addEventListener('pageshow', notifyOnPageShow)
})
watch(() => route.fullPath, submitCurrentPage)
watch(() => route.path, trackToolRoute, { flush: 'post' })
onBeforeUnmount(() => {
  window.removeEventListener('pagehide', notifyOnPageHide)
  window.removeEventListener('pageshow', notifyOnPageShow)
})
</script>
