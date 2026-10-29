<template>
  <ToolLandingLayout
    badge="Developer utility"
    title="Convert image to Base64"
    description="Turn a local image into a data URL, HTML snippet, or CSS background string for apps, demos, and web embeds."
    primaryHref="#tool"
    primaryText="Generate Base64"
    secondaryHref="/base64-to-image"
    secondaryText="Decode Base64"
    :points="[
      'Upload an image from your device',
      'Copy ready-to-use data URLs or snippets',
      'Keep everything local with no server upload'
    ]"
    :features="[
      { title: 'Multiple output formats', text: 'Generate raw data URLs, HTML img tags, or CSS background strings in one tap.' },
      { title: 'Quick preview', text: 'See the image result before copying the generated code.' },
      { title: 'Safe local processing', text: 'Everything is handled in the browser to protect user privacy and file content.' }
    ]"
  >
    <ImageBase64Tool />
  </ToolLandingLayout>
</template>