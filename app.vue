<template>
  <NuxtLayout>
    <NuxtPage />
    <PrivacyConsent />
  </NuxtLayout>
</template>

<script setup>
import PrivacyConsent from '~/components/PrivacyConsent.vue'
import { ID_INJECTION_KEY } from 'element-plus'
import { provide } from 'vue'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

provide(ID_INJECTION_KEY, {
  prefix: Math.random().toString(36).substr(2, 10),
  current: 0
})

const route = useRoute()

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

onMounted(submitCurrentPage)
watch(() => route.fullPath, submitCurrentPage)
</script>
