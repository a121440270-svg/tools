<script setup>
const { t } = useI18n()

useToolSeo({
  title: () => t('imageTools.exifGuide.seoTitle'),
  description: () => t('imageTools.exifGuide.seoDescription')
})
</script>

<template>
  <main class="exif-guide">
    <header>
      <span class="eyebrow">{{ t('imageTools.exifGuide.eyebrow') }}</span>
      <h1>{{ t('imageTools.exifGuide.title') }}</h1>
      <p>{{ t('imageTools.exifGuide.description') }}</p>
    </header>

    <div class="guide-sections">
      <section>
        <h2>{{ t('imageTools.exifGuide.whatTitle') }}</h2>
        <p>{{ t('imageTools.exifGuide.whatBody') }}</p>
      </section>
      <section>
        <h2>{{ t('imageTools.exifGuide.fieldsTitle') }}</h2>
        <p>{{ t('imageTools.exifGuide.fieldsBody') }}</p>
      </section>
      <section>
        <h2>{{ t('imageTools.exifGuide.toolsTitle') }}</h2>
        <p>{{ t('imageTools.exifGuide.viewBody') }}</p>
        <p>{{ t('imageTools.exifGuide.editBody') }}</p>
        <p>{{ t('imageTools.exifGuide.removeBody') }}</p>
      </section>
      <section>
        <h2>{{ t('imageTools.exifGuide.privacyTitle') }}</h2>
        <p>{{ t('imageTools.exifGuide.privacyBody') }}</p>
      </section>
      <section>
        <h2>{{ t('imageTools.exifGuide.limitsTitle') }}</h2>
        <p>{{ t('imageTools.exifGuide.limitsBody') }}</p>
      </section>
    </div>

    <nav class="tool-links" :aria-label="t('imageTools.metadataHub.title')">
      <NuxtLinkLocale to="/image-info">{{ t('imageTools.info.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/exif-editor">{{ t('imageTools.exifEditor.title') }}</NuxtLinkLocale>
      <NuxtLinkLocale to="/remove-exif">{{ t('imageTools.exif.title') }}</NuxtLinkLocale>
    </nav>
  </main>
</template>

<style scoped>
.exif-guide { max-width: 900px; margin: 0 auto; padding: 48px 24px 76px; color: #20302b; }
header { max-width: 760px; margin-bottom: 32px; }
.eyebrow { color: #176c59; font-size: 12px; font-weight: 700; text-transform: uppercase; }
h1 { margin: 10px 0; font-size: 36px; line-height: 1.15; }
header p, .guide-sections p { color: #5f6f68; line-height: 1.75; }
.guide-sections { display: grid; gap: 20px; }
.guide-sections section { border-top: 1px solid #d9e1dc; padding-top: 18px; }
h2 { margin: 0 0 8px; font-size: 20px; }
.guide-sections p { margin: 6px 0; }
.tool-links { display: flex; flex-wrap: wrap; gap: 12px 22px; margin-top: 30px; border-top: 1px solid #d9e1dc; padding-top: 20px; }
.tool-links a { color: #176c59; font-weight: 700; text-underline-offset: 3px; }
.dark .exif-guide { color: #e4ece8; }
.dark header p, .dark .guide-sections p { color: #b3c1bb; }
.dark .guide-sections section, .dark .tool-links { border-color: #3a4943; }
.dark .tool-links a { color: #7bd8b6; }
@media (max-width: 650px) { .exif-guide { padding: 30px 16px 54px; } h1 { font-size: 30px; } }
</style>
