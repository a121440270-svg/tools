<template>
  <ToolLandingLayout
    badge="Vector conversion"
    title="Convert SVG to PNG or WebP"
    description="Upload a vector source file, set the export dimensions, and convert it to a raster image without extra software."
    primaryHref="#tool"
    primaryText="Convert SVG"
    secondaryHref="/"
    secondaryText="Explore other tools"
    :points="[
      'Upload SVG files locally from your computer',
      'Adjust width and height before conversion',
      'Download the final PNG or WebP output instantly'
    ]"
    :features="[
      { title: 'Safe SVG handling', text: 'The tool sanitizes the vector before rasterizing to reduce security risks.' },
      { title: 'Output controls', text: 'Choose custom export dimensions and delivery format for your workflow.' },
      { title: 'Fast local export', text: 'Everything is rendered in the browser and downloaded directly to your device.' }
    ]"
  >
    <ImageSvgConverterTool />
  </ToolLandingLayout>
</template>