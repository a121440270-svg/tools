<template>
  <ToolLandingLayout
    badge="Design utility"
    title="Pick colors from any image"
    description="Upload a photo or graphic and sample individual pixels to discover exact hex, RGB, and HSL values."
    primaryHref="#tool"
    primaryText="Pick colors"
    secondaryHref="/"
    secondaryText="Browse more tools"
    :points="[
      'Upload an image from your device',
      'Click anywhere to sample the exact color',
      'Copy hex values for design and development work'
    ]"
    :features="[
      { title: 'Pixel precision', text: 'Sample the exact point you want and capture the spatial color in real time.' },
      { title: 'Dominant palette', text: 'Highlight the most common colors in the image for quick inspiration or branding work.' },
      { title: 'Copy-ready values', text: 'Use the generated hex, RGB, and HSL output immediately in a project.' }
    ]"
  >
    <ImageColorPickerTool />
  </ToolLandingLayout>
</template>