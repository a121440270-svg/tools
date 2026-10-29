<template>
  <ToolLandingLayout
    badge="Image decoder"
    title="Convert Base64 to image"
    description="Paste a Base64 string and recreate the original image in a supported format for previewing or downloading."
    primaryHref="#tool"
    primaryText="Decode now"
    secondaryHref="/image-to-base64"
    secondaryText="Encode image"
    :points="[
      'Paste Base64, data URLs, or raw image payloads',
      'Preview the decoded image immediately',
      'Download the output as PNG, JPG, or WebP'
    ]"
    :features="[
      { title: 'Decode quickly', text: 'Instantly rebuild an image from Base64 without external services.' },
      { title: 'Format choices', text: 'Export in PNG, JPG, or WebP depending on the workflow you need.' },
      { title: 'Safe validation', text: 'The tool checks for invalid payloads and large files before generating output.' }
    ]"
  >
    <ImageBase64Tool reverse />
  </ToolLandingLayout>
</template>