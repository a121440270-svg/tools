<template>
  <div class="target-page">
    <div class="container">
      <span class="eyebrow">{{ $t('reduceImage.eyebrow') }}</span>
      <h1>{{ $t('reduceImage.title', { size }) }}</h1>
      <p class="lead">{{ $t('reduceImage.description', { size }) }}</p>
      <div class="cta-row">
        <NuxtLinkLocale :to="{ path: '/image-compress', query: { size: 2000 } }" class="primary-btn">{{ $t('reduceImage.compressNow') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/reduce-image-size-to-250kb" class="secondary-btn">250KB</NuxtLinkLocale>
      </div>
      <div class="info-box">
        <h2>{{ $t('reduceImage.whyTitle', { size }) }}</h2>
        <p>{{ $t('reduceImage.whyDescription') }}</p>
      </div>
      <div class="faq-box">
        <h2>{{ $t('reduceImage.faqTitle') }}</h2>
        <div class="faq-item">
          <h3>{{ $t('reduceImage.question1', { size }) }}</h3>
          <p>{{ $t('reduceImage.answer1') }}</p>
        </div>
        <div class="faq-item">
          <h3>{{ $t('reduceImage.question2') }}</h3>
          <p>{{ $t('reduceImage.answer2') }}</p>
        </div>
        <div class="faq-item">
          <h3>{{ $t('reduceImage.question3') }}</h3>
          <p>{{ $t('reduceImage.answer3') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { t } = useI18n()
const size = '2MB'

const faqItems = computed(() => [
  { q: t('reduceImage.question1', { size }), a: t('reduceImage.answer1') },
  { q: t('reduceImage.question2'), a: t('reduceImage.answer2') },
  { q: t('reduceImage.question3'), a: t('reduceImage.answer3') }
])

useToolSeo({
  title: () => t('reduceImage.seoTitle', { size }),
  description: () => t('reduceImage.seoDescription', { size }),
  keywords: () => t('reduceImage.seoKeywords', { size }),
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
