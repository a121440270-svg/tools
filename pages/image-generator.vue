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
useHead({ title: t('agnesImage.title'), meta: [{ name: 'description', content: t('agnesImage.seoDesc') }] })
</script>
