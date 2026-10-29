<template>
  <ToolLandingLayout
    badge="Image editor"
    title="Crop image"
    description="Trim any uploaded image to a precise crop, custom dimensions, or a popular ratio without leaving the browser."
    primaryHref="#tool"
    primaryText="Use the cropper"
    secondaryHref="/"
    secondaryText="Browse all tools"
    :points="[
      'Upload JPG, PNG, WEBP, or SVG files locally',
      'Choose a preset ratio or drag your own frame',
      'Export the cropped image instantly in-browser'
    ]"
    :features="[
      { title: 'Preset ratios', text: 'Quickly crop to social, avatar, product, and print-ready dimensions.' },
      { title: 'Custom framing', text: 'Adjust the selection precisely to keep only the exact part of the image you need.' },
      { title: 'Fast export', text: 'Download the final result immediately after cropping with minimal friction.' }
    ]"
  >
    <ImageCropperTool />
  </ToolLandingLayout>
</template>