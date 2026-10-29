<script setup>
const { t } = useI18n()
const tools = [
  { path: '/image-info', key: 'imageTools.info' },
  { path: '/metadata-analyzer', key: 'imageTools.metadataAnalyzer' },
  { path: '/exif-editor', key: 'imageTools.exifEditor' },
  { path: '/remove-exif', key: 'imageTools.exif' },
  { path: '/image-metadata-remover', key: 'imageTools.metadataRemover' },
  { path: '/gps-remover', key: 'imageTools.gpsRemover' },
  { path: '/image-privacy', key: 'imageTools.privacyCleaner' }
]

useToolSeo({
  title: () => t('imageTools.metadataHub.seoTitle'),
  description: () => t('imageTools.metadataHub.seoDescription')
})
</script>

<template>
  <main class="metadata-hub">
    <header>
      <span>{{ t('imageTools.metadataHub.eyebrow') }}</span>
      <h1>{{ t('imageTools.metadataHub.title') }}</h1>
      <p>{{ t('imageTools.metadataHub.description') }}</p>
      <ExifGuideLink />
    </header>
    <nav class="tool-list" :aria-label="t('imageTools.metadataHub.title')">
      <NuxtLinkLocale v-for="tool in tools" :key="tool.path" :to="tool.path">
        <strong>{{ t(`${tool.key}.title`) }}</strong>
        <span>{{ t(`${tool.key}.description`) }}</span>
        <span class="open-tool">{{ t('imageTools.metadataHub.openTool') }} →</span>
      </NuxtLinkLocale>
    </nav>
  </main>
</template>

<style scoped>
.metadata-hub { max-width: 1080px; margin: 0 auto; padding: 48px 24px 76px; color: #20302b; }
header { max-width: 720px; margin-bottom: 30px; }
header > span { color: #176c59; font-size: 12px; font-weight: 700; text-transform: uppercase; }
h1 { margin: 10px 0; font-size: 36px; line-height: 1.15; }
header p { margin: 0; color: #5f6f68; line-height: 1.7; }
.tool-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid #d9e1dc; }
.tool-list a { display: grid; align-content: start; gap: 9px; min-width: 0; border-bottom: 1px solid #d9e1dc; padding: 20px 16px 20px 0; color: inherit; text-decoration: none; }
.tool-list a:nth-child(odd) { margin-right: 24px; }
.tool-list a:hover strong { color: #176c59; }
.tool-list strong { font-size: 18px; }
.tool-list span { color: #5f6f68; font-size: 14px; line-height: 1.55; }
.tool-list .open-tool { color: #176c59; font-weight: 700; }
.dark .metadata-hub { color: #e4ece8; }
.dark .tool-list { border-color: #3a4943; }
.dark .tool-list a { border-color: #3a4943; }
.dark .metadata-hub header p, .dark .tool-list span { color: #b3c1bb; }
.dark .tool-list .open-tool { color: #7bd8b6; }
@media (max-width: 650px) { .metadata-hub { padding: 30px 16px 54px; } h1 { font-size: 30px; } .tool-list { grid-template-columns: 1fr; } .tool-list a:nth-child(odd) { margin-right: 0; } }
</style>