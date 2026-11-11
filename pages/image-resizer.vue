<template>
  <ToolLandingLayout
    badge="Image optimization"
    title="Resize images"
    description="Resize photos or graphics by exact dimensions, percentage, or maximum side length while preserving quality and ratio."
    seo-title="Photo Resizer — Resize Image in KB or MB Online"
    seo-description="Resize photos and set an output size target in KB or MB. Resize images by exact dimensions or percentage — free, no upload, runs in your browser."
    seo-keywords="photo resizer, resize image in kb, resize image to mb, image resizer online, resize photo to specific size"
    primaryHref="#tool"
    primaryText="Resize image"
    secondaryHref="/image-converter"
    secondaryText="Convert formats"
    :points="[
      'Resize by exact width and height',
      'Scale by percentage or max-edge settings',
      'Resize to a target file size in KB or MB',
      'Output PNG, JPG, or WebP without leaving the browser'
    ]"
    :features="[
      { title: 'Flexible resizing', text: 'Set exact dimensions, percentage scaling, or a maximum size cap.' },
      { title: 'Ratio control', text: 'Keep the current aspect ratio or adjust the output to your exact needs.' },
      { title: 'Resize by file size', text: 'Target KB or MB limits for forms and uploads — combine with the compressor for exact file sizes.' },
      { title: 'Web-ready exports', text: 'Generate optimized files for sharing, uploading, and embedding online.' }
    ]"
  >
    <ImageResizerTool />
  </ToolLandingLayout>
</template>