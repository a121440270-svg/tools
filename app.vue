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

provide(ID_INJECTION_KEY, {
  prefix: Math.random().toString(36).substr(2, 10),
  current: 0
})
</script>
