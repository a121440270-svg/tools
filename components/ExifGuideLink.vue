<template>
  <NuxtLinkLocale to="/exif-guide" class="exif-guide-link">
    {{ $t('imageTools.exifGuide.link') }} →
  </NuxtLinkLocale>
</template>

<style scoped>
.exif-guide-link { display: inline-flex; margin-top: 12px; color: #176c59; font-size: 14px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.exif-guide-link:hover { color: #0e4f40; }
.dark .exif-guide-link { color: #7bd8b6; }
.dark .exif-guide-link:hover { color: #a4ebd0; }
</style>
