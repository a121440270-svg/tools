<template>
  <ToolLandingLayout
    badge="HEIC converter"
    title="Convert HEIC to JPG"
    description="Open HEIC or HEIF photos from iPhone and other devices, then convert them into JPG, PNG, or WebP instantly."
    primaryHref="#tool"
    primaryText="Convert HEIC"
    secondaryHref="/image-converter"
    secondaryText="More format tools"
    :points="[
      'Upload HEIC or HEIF files from Apple devices',
      'Choose a common output format like JPG or PNG',
      'Download converted images right away'
    ]"
    :features="[
      { title: 'Apple photo support', text: 'Convert iPhone and iPad image exports to a browser-friendly format.' },
      { title: 'Quick output choices', text: 'Switch from HEIC to JPG, PNG, or WebP without extra software.' },
      { title: 'Local processing', text: 'Convert files directly in the browser so they never leave your device.' }
    ]"
  >
    <ImageConverterTool heic-only />
  </ToolLandingLayout>
</template>