<template>
  <ToolLandingLayout
    badge="Image inspector"
    title="Inspect image metadata"
    description="View basic image details and metadata fields to confirm dimensions, format, and camera information without leaving the page."
    primaryHref="#tool"
    primaryText="Inspect image"
    secondaryHref="/remove-exif"
    secondaryText="Remove EXIF"
    :points="[
      'Upload one or more local images',
      'Review dimensions, format, and embedded metadata',
      'Check file details before sharing or publishing'
    ]"
    :features="[
      { title: 'Fast inspection', text: 'Open image details in a clean, readable layout for quick checks.' },
      { title: 'Metadata review', text: 'See camera, date, and other embedded fields that may be included in the file.' },
      { title: 'Portfolio workflow', text: 'Use it to audit assets before export or delivery to clients and teams.' }
    ]"
  >
    <ImageMetadataTool />
  </ToolLandingLayout>
</template>