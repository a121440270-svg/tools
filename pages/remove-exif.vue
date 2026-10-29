<template>
  <ToolLandingLayout
    badge="Privacy tool"
    title="Remove EXIF metadata"
    description="Strip hidden metadata from photos before publishing, uploading, or sharing to reduce personal data exposure."
    primaryHref="#tool"
    primaryText="Clean metadata"
    secondaryHref="/image-info"
    secondaryText="Inspect metadata"
    :points="[
      'Upload JPG, PNG, or WebP photos',
      'Remove hidden EXIF and camera metadata',
      'Download the cleaned image in a new format'
    ]"
    :features="[
      { title: 'Privacy-first', text: 'Remove embedded account, location, and device data before sharing files online.' },
      { title: 'Bulk cleanup', text: 'Process multiple images in a single pass and export them in batches.' },
      { title: 'Browser-only', text: 'Everything is processed locally so your files stay on your machine.' }
    ]"
  >
    <ImageMetadataTool clean-exif />
  </ToolLandingLayout>
</template>