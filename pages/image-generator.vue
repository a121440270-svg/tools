<template>
  <AgnesGenerator mode="image">
    <template #aside>
      <!-- Optional extra aside content for image mode could go here -->
    </template>
  </AgnesGenerator>
</template>

<script setup>
import AgnesGenerator from '~/components/AgnesGenerator.vue'
const { t } = useI18n()
useToolSeo({
  title: () => t('agnesImage.title'),
  description: () => t('agnesImage.seoDesc')
})
</script>
