<template>
  <div class="target-page">
    <div class="container">
      <span class="eyebrow">{{ $t('imageTarget.eyebrow', { format }) }}</span>
      <h1>{{ $t('imageTarget.title', { format, size }) }}</h1>
      <p class="lead">{{ $t('imageTarget.description', { format, size }) }}</p>

      <div class="cta-row">
        <NuxtLinkLocale :to="{ path: '/image-compress', query: { size: 500 } }" class="primary-btn">{{ $t('imageTarget.compressNow') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/image-compress-to-1mb" class="secondary-btn">1MB</NuxtLinkLocale>
      </div>

      <div class="info-box">
        <h2>{{ $t('imageTarget.whyTitle', { size }) }}</h2>
        <p>{{ $t('imageTarget.whyDescription') }}</p>
      </div>

      <div class="faq-box">
        <h2>{{ $t('imageTarget.faqTitle') }}</h2>
        <div class="faq-item">
          <h3>{{ $t('imageTarget.question1', { format, size }) }}</h3>
          <p>{{ $t('imageTarget.answer1') }}</p>
        </div>
        <div class="faq-item">
          <h3>{{ $t('imageTarget.question2') }}</h3>
          <p>{{ $t('imageTarget.answer2') }}</p>
        </div>
        <div class="faq-item">
          <h3>{{ $t('imageTarget.question3') }}</h3>
          <p>{{ $t('imageTarget.answer3') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { t } = useI18n()
const size = '500KB'
const format = computed(() => t('imageTarget.formatImages'))
const faqItems = computed(() => [
  { q: t('imageTarget.question1', { format: format.value, size }), a: t('imageTarget.answer1') },
  { q: t('imageTarget.question2'), a: t('imageTarget.answer2') },
  { q: t('imageTarget.question3'), a: t('imageTarget.answer3') }
])

useToolSeo({
  title: () => t('imageTarget.seoTitle', { format: format.value, size }),
  description: () => t('imageTarget.seoDescription', { format: format.value, size }),
  keywords: () => t('imageTarget.seoKeywords', { format: format.value, size }),
  faqItems
})
</script>

<style scoped>
.target-page { max-width: 980px; margin: 0 auto; padding: 3rem 1rem 4rem; }
.container { background: rgb(var(--card)); border: 1px solid rgb(var(--border)); border-radius: 20px; padding: 2rem; }
.eyebrow { display: inline-block; margin-bottom: 1rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgb(var(--primary)); }
h1 { margin: 0 0 0.8rem; font-size: clamp(2rem, 3vw, 3rem); line-height: 1.1; }
.lead { font-size: 1.05rem; line-height: 1.7; color: rgb(100, 116, 139); margin-bottom: 1.5rem; }
.cta-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 2rem; }
.primary-btn, .secondary-btn { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; border-radius: 10px; padding: 0.8rem 1.2rem; font-weight: 600; }
.primary-btn { background: rgb(var(--primary)); color: rgb(var(--primary-foreground)); }
.secondary-btn { border: 1px solid rgb(var(--border)); color: rgb(var(--foreground)); background: transparent; }
.info-box, .faq-box { border-top: 1px solid rgb(var(--border)); padding-top: 1.5rem; margin-top: 1.5rem; }
h2 { margin: 0 0 0.8rem; font-size: 1.3rem; }
.faq-item { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgb(var(--border)); }
.faq-item h3 { margin: 0 0 0.5rem; font-size: 1rem; }
.faq-item p, .info-box p { margin: 0; line-height: 1.7; color: rgb(100, 116, 139); }
</style>
