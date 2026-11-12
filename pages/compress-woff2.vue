<template>
  <div class="target-page">
    <div class="container">
      <span class="eyebrow">{{ t('compressFontTarget.eyebrow', { format }) }}</span>
      <h1>{{ t('compressFontTarget.title', { format }) }}</h1>
      <p class="lead">{{ t('compressFontTarget.description', { format }) }}</p>
      <div class="cta-row">
        <NuxtLinkLocale to="/font-compress" class="primary-btn">{{ t('compressFontTarget.compressNow', { format }) }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/compress-woff" class="secondary-btn">WOFF</NuxtLinkLocale>
      </div>
      <div class="info-box">
        <h2>{{ t('compressFontTarget.whyTitle', { format }) }}</h2>
        <p>{{ t('compressFontTarget.whyDescription') }}</p>
      </div>
      <div class="faq-box">
        <h2>{{ t('compressFontTarget.faqTitle') }}</h2>
        <div class="faq-item">
          <h3>{{ t('compressFontTarget.question1', { format }) }}</h3>
          <p>{{ t('compressFontTarget.answer1', { format }) }}</p>
        </div>
        <div class="faq-item">
          <h3>{{ t('compressFontTarget.question2', { format }) }}</h3>
          <p>{{ t('compressFontTarget.answer2', { format }) }}</p>
        </div>
        <div class="faq-item">
          <h3>{{ t('compressFontTarget.question3', { format }) }}</h3>
          <p>{{ t('compressFontTarget.answer3', { format }) }}</p>
        </div>
      </div>
      <div class="related-box">
        <h2>{{ t('fontConvert.related') }}</h2>
        <div class="flex flex-wrap gap-3">
          <NuxtLinkLocale to="/font-compress" class="mini-link">{{ t('menu.ttf') }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/ttf-to-woff2" class="mini-link">{{ t('menu.ttfToWoff2') }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/font-subsetter" class="mini-link">{{ t('menu.fontSubsetter') }}</NuxtLinkLocale>
          <NuxtLinkLocale to="/compress-woff" class="mini-link">WOFF</NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const { t } = useI18n()
const format = 'WOFF2'
const faqItems = computed(() => [
  { q: t('compressFontTarget.question1', { format }), a: t('compressFontTarget.answer1', { format }) },
  { q: t('compressFontTarget.question2', { format }), a: t('compressFontTarget.answer2', { format }) },
  { q: t('compressFontTarget.question3', { format }), a: t('compressFontTarget.answer3', { format }) }
])

useToolSeo({
  title: () => t('compressFontTarget.seoTitle', { format }),
  description: () => t('compressFontTarget.seoDescription', { format }),
  keywords: () => t('compressFontTarget.seoKeywords', { format }),
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
.info-box, .faq-box, .related-box { border-top: 1px solid rgb(var(--border)); padding-top: 1.5rem; margin-top: 1.5rem; }
h2 { margin: 0 0 0.8rem; font-size: 1.3rem; }
.faq-item { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgb(var(--border)); }
.faq-item h3 { margin: 0 0 0.5rem; font-size: 1rem; }
.faq-item p, .info-box p { margin: 0; line-height: 1.7; color: rgb(100, 116, 139); }
.mini-link { border: 1px solid rgb(var(--border)); border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.875rem; text-decoration: none; color: rgb(var(--foreground)); }
.mini-link:hover { border-color: rgb(var(--primary)); color: rgb(var(--primary)); }
</style>
