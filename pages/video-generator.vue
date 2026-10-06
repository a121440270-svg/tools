<template>
  <AgnesGenerator mode="video">
    <template #aside>
      <!-- Optional extra aside content for video mode -->
    </template>
  </AgnesGenerator>
</template>

<script setup>
import AgnesGenerator from '~/components/AgnesGenerator.vue'
const { t } = useI18n()
useToolSeo({
  title: () => t('agnesVideo.title'),
  description: () => t('agnesVideo.seoDesc')
})
</script>

