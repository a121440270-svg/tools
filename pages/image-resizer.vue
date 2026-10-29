<template>
  <ToolLandingLayout
    badge="Image optimization"
    title="Resize images"
    description="Resize photos or graphics by exact dimensions, percentage, or maximum side length while preserving quality and ratio."
    primaryHref="#tool"
    primaryText="Resize image"
    secondaryHref="/image-converter"
    secondaryText="Convert formats"
    :points="[
      'Resize by exact width and height',
      'Scale by percentage or max-edge settings',
      'Output PNG, JPG, or WebP without leaving the browser'
    ]"
    :features="[
      { title: 'Flexible resizing', text: 'Set exact dimensions, percentage scaling, or a maximum size cap.' },
      { title: 'Ratio control', text: 'Keep the current aspect ratio or adjust the output to your exact needs.' },
      { title: 'Web-ready exports', text: 'Generate optimized files for sharing, uploading, and embedding online.' }
    ]"
  >
    <ImageResizerTool />
  </ToolLandingLayout>
</template>