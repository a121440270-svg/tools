<template>
  <main class="mx-auto max-w-5xl px-4 py-10">
    <header class="mb-7">
      <h1 class="mb-2 text-3xl font-bold">Font CSS Generator</h1>
      <p class="text-gray-600">Generate an @font-face rule and HTML example for a web font.</p>
    </header>

    <section class="grid gap-x-8 gap-y-5 border-y border-gray-200 py-6 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-sm font-semibold" for="font-file">Font file</label>
        <input id="font-file" type="file" accept=".ttf,.otf,.woff,.woff2" @change="onFileChange" />
        <p class="mt-2 break-all text-sm text-gray-500">{{ fileName || 'TTF, OTF, WOFF, or WOFF2' }}</p>
        <p class="mt-2 text-sm text-gray-500">The file is read locally to detect its format and family name; it is never uploaded.</p>
        <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-semibold" for="font-family">Font family</label>
          <el-input id="font-family" v-model="fontFamily" placeholder="MyFont" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold" for="font-weight">Font weight</label>
          <select id="font-weight" v-model.number="fontWeight" class="w-full rounded border border-gray-300 bg-white px-3 py-2">
            <option v-for="weight in weights" :key="weight" :value="weight">{{ weight }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold" for="font-style">Font style</label>
          <select id="font-style" v-model="fontStyle" class="w-full rounded border border-gray-300 bg-white px-3 py-2">
            <option v-for="style in styles" :key="style" :value="style">{{ style }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold" for="font-display">Font display</label>
          <select id="font-display" v-model="fontDisplay" class="w-full rounded border border-gray-300 bg-white px-3 py-2">
            <option v-for="display in displays" :key="display" :value="display">{{ display }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold" for="file-name">File name or URL</label>
          <el-input id="file-name" v-model="fontUrl" placeholder="./myfont.woff2" />
        </div>
      </div>
    </section>

    <section class="border-b border-gray-200 py-6">
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">CSS</h2>
        <el-button :disabled="!fontFamily.trim() || !fontUrl.trim()" @click="copyCss">Copy CSS</el-button>
      </div>
      <pre class="overflow-x-auto whitespace-pre-wrap break-words border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"><code>{{ cssOutput }}</code></pre>
      <p v-if="copyMessage" class="mt-2 text-sm text-green-700" role="status">{{ copyMessage }}</p>
    </section>

    <section class="border-b border-gray-200 py-6">
      <h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">HTML example</h2>
      <pre class="overflow-x-auto whitespace-pre-wrap break-words border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"><code>{{ htmlOutput }}</code></pre>
    </section>

    <nav class="flex flex-wrap gap-x-5 gap-y-2 py-5 text-sm">
      <NuxtLinkLocale to="/font-compress" class="text-primary underline">Create a font subset</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-size-analyzer" class="text-primary underline">Analyze font size</NuxtLinkLocale>
      <NuxtLinkLocale to="/font-inspector" class="text-primary underline">Inspect font details</NuxtLinkLocale>
    </nav>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getFontFormat, parseFontBuffer } from '~/composables/useFontTools'

const fileName = ref('')
const fontFamily = ref('')
const fontWeight = ref(400)
const fontStyle = ref('normal')
const fontDisplay = ref('swap')
const fontUrl = ref('')
const errorMessage = ref('')
const copyMessage = ref('')
const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
const styles = ['normal', 'italic', 'oblique']
const displays = ['auto', 'block', 'swap', 'fallback', 'optional']
const fontFormat = ref('woff2')
const cssFormat = computed(() => ({ ttf: 'truetype', otf: 'opentype', woff: 'woff', woff2: 'woff2' })[fontFormat.value])
const cssOutput = computed(() => `@font-face {\n  font-family: ${JSON.stringify(fontFamily.value.trim() || 'MyFont')};\n  src: url(${JSON.stringify(fontUrl.value.trim() || './myfont.woff2')}) format(${JSON.stringify(cssFormat.value)});\n  font-weight: ${fontWeight.value};\n  font-style: ${fontStyle.value};\n  font-display: ${fontDisplay.value};\n}`)
const htmlOutput = computed(() => `<p style="font-family: '${escapeHtmlAttribute(fontFamily.value.trim() || 'MyFont')}';">The quick brown fox jumps over the lazy dog.</p>`)

useToolSeo({
  title: 'Font CSS Generator - Generate @font-face CSS',
  description: 'Generate @font-face CSS and an HTML preview example for TTF, OTF, WOFF, and WOFF2 web fonts.',
  keywords: 'font CSS generator, @font-face generator, web font CSS, TTF CSS, WOFF2 CSS'
})

async function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  errorMessage.value = ''
  copyMessage.value = ''
  fileName.value = file.name
  fontUrl.value = `./${file.name}`
  const format = getFontFormat(file.name)
  if (!format) {
    errorMessage.value = 'Choose a TTF, OTF, WOFF, or WOFF2 font file.'
    return
  }
  fontFormat.value = format
  try {
    const { data } = await parseFontBuffer(await file.arrayBuffer(), format)
    if (!fontFamily.value.trim() && data.name?.fontFamily) fontFamily.value = data.name.fontFamily
  } catch {
    errorMessage.value = 'The file format was detected, but its font metadata could not be read.'
  }
}

function escapeHtmlAttribute(value) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

async function copyCss() {
  try {
    await navigator.clipboard.writeText(cssOutput.value)
    copyMessage.value = 'CSS copied.'
  } catch {
    copyMessage.value = 'Clipboard access is unavailable in this browser.'
  }
}
</script>