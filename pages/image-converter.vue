<template>
  <ToolLandingLayout
    badge="Image conversion"
    title="Convert image formats"
    description="Convert JPG, PNG, WebP, AVIF, and HEIC files between popular formats in a few clicks while keeping everything local."
    primaryHref="#tool"
    primaryText="Convert files"
    secondaryHref="/image-resizer"
    secondaryText="Resize images"
    :points="[
      'Upload multiple images at once',
      'Choose the output format you need',
      'Download the converted result in-browser'
    ]"
    :features="[
      { title: 'Batch conversion', text: 'Process several images in one session for faster workflows.' },
      { title: 'Multiple formats', text: 'Switch between JPG, PNG, WebP, AVIF, and HEIC formats.' },
      { title: 'No upload required', text: 'Everything happens locally in the browser to protect file privacy.' }
    ]"
  >
    <ImageConverterTool />
  </ToolLandingLayout>
</template>