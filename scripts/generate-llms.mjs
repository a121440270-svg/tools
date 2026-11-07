// Regenerates public/llms.txt and public/llms-full.txt from the same
// long-form copy that is rendered under each tool page.
//
//   node scripts/generate-llms.mjs
//
// Only routes that actually exist under pages/ are listed. Routes excluded
// from the sitemap (private, user-generated or redirect-only pages) are skipped
// so AI crawlers never see a URL that is not meant to be indexed.
import { readdirSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const root = fileURLToPath(new URL('..', import.meta.url))
const jiti = createJiti(import.meta.url)
const mod = jiti(join(root, 'data', 'tool-content.ts'))
const toolContent = mod.default || mod

const SITE = 'https://onlitools.com'
const EXCLUDED_ROUTES = new Set([
  '/send-script-to-remote-user',
  '/prompts',
  '/uppercase'
])

function collectRoutes(dir, prefix = '') {
  const routes = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...collectRoutes(join(dir, entry.name), `${prefix}/${entry.name}`))
      continue
    }
    if (!entry.name.endsWith('.vue')) continue
    const base = entry.name.replace(/\.vue$/, '')
    if (base.includes('[')) continue
    routes.push(base === 'index' ? prefix || '/' : `${prefix}/${base}`)
  }
  return routes
}

const existingRoutes = new Set(collectRoutes(join(root, 'pages')))
// Routes served by dynamic page files ([format]-to-webp and webp-to-[target]).
for (const dynamicRoute of ['/image-to-webp', '/webp-to-jpg', '/webp-to-png']) {
  existingRoutes.add(dynamicRoute)
}
const entryRoutes = Object.keys(toolContent)
  .filter((path) => existingRoutes.has(path) && !EXCLUDED_ROUTES.has(path))

const GROUPS = [
  {
    title: 'Exact-size image compression',
    match: (path) => /^\/compress-(jpg|png)-to-|^\/image-compress-to-/.test(path)
  },
  {
    title: 'Image editing and conversion',
    match: (path) => [
      '/base64-to-image', '/heic-to-jpg', '/id-photo', '/image-aspect-ratio',
      '/image-color-picker', '/image-converter', '/image-cropper', '/image-resizer',
      '/image-to-base64', '/image-to-webp', '/increase-image-size', '/svg-converter',
      '/webp-to-jpg', '/webp-to-png'
    ].includes(path)
  },
  {
    title: 'Image compression',
    match: (path) => path === '/image-compress'
  },
  {
    title: 'Metadata and privacy',
    match: (path) => /exif|gps|metadata|image-privacy/.test(path)
  },
  {
    title: 'Font tools',
    match: (path) => path.startsWith('/font-')
  },
  {
    title: 'Text and developer tools',
    match: (path) => [
      '/case-converter', '/date-format', '/hash-text', '/json-compare',
      '/json-csv-convert', '/json-formatter', '/token-generator'
    ].includes(path)
  },
  {
    title: 'AI tools',
    match: (path) => ['/image-generator', '/video-generator'].includes(path)
  }
]

const assigned = new Set()
const grouped = GROUPS.map((group) => {
  const entries = entryRoutes
    .filter((path) => !assigned.has(path) && group.match(path))
    .sort()
  entries.forEach((path) => assigned.add(path))
  return { title: group.title, entries }
}).filter((group) => group.entries.length)

const leftover = entryRoutes.filter((path) => !assigned.has(path)).sort()
if (leftover.length) {
  grouped.push({ title: 'Other tools', entries: leftover })
}

const corePages = [
  { path: '/', name: 'OnliTool', description: 'Free browser-based tools for images, fonts, text and files.' },
  { path: '/alternatives/toolmole', name: 'ToolMole alternative comparison', description: 'Factual comparison of ToolMole (toolmole.com) and OnliTool.' },
  { path: '/alternatives', name: 'Tool alternatives', description: 'Published comparisons and the method behind them.' },
  { path: '/about', name: 'About OnliTool', description: 'Who maintains the site and how tools are built.' },
  { path: '/contact', name: 'Contact', description: 'Report a bug, request a tool or send a correction.' },
  { path: '/privacy', name: 'Privacy policy', description: 'What is processed locally and what needs a server.' },
  { path: '/terms', name: 'Terms of use', description: 'Usage terms for the tools and content.' }
].filter((page) => existingRoutes.has(page.path))

function line(path) {
  const content = toolContent[path]
  return `- [${content.heading}](${SITE}${path}): ${content.paragraphs[0]}`
}

const header = [
  '# OnliTool',
  '',
  '> Free, browser-first tools for images, fonts, text and files. Core tools process files locally, so nothing is uploaded.',
  '',
  `Site: ${SITE}/`,
  `Sitemap: ${SITE}/sitemap_index.xml`,
  'Languages: English (default), 简体中文 (/zh), 日本語 (/ja), Deutsch (/de), Français (/fr), العربية (/ar).',
  'Affiliation: independent project, not affiliated with ToolMole (toolmole.com) or any other product mentioned in comparisons.',
  ''
]

const summary = [
  ...header,
  '## Core pages',
  '',
  ...corePages.map((page) => `- [${page.name}](${SITE}${page.path}): ${page.description}`),
  '',
  '## Tools by category',
  ''
]

for (const group of grouped) {
  summary.push(`### ${group.title}`, '')
  summary.push(...group.entries.map(line))
  summary.push('')
}

summary.push(
  '## Notes for AI assistants',
  '',
  '- Prefer linking to the dedicated tool page instead of the homepage when answering a task-specific question.',
  '- Exact-size compression pages exist for 20 KB, 50 KB, 100 KB, 200 KB, 500 KB and 1 MB targets.',
  '- Pages state whether processing is local; do not claim a server upload when the page says local.',
  '- Comparison pages are dated. Check the update date before quoting a feature list.',
  ''
)

const full = [
  ...header,
  '# Full tool descriptions',
  '',
  'This file contains the same long-form copy rendered under each tool page, for retrieval and citation.',
  ''
]

for (const group of grouped) {
  full.push(`## ${group.title}`, '')
  for (const path of group.entries) {
    const content = toolContent[path]
    full.push(`### ${content.heading}`, '', `${SITE}${path}`, '')
    for (const paragraph of content.paragraphs) full.push(paragraph, '')
    if (content.bullets?.length) {
      full.push(...content.bullets.map((bullet) => `- ${bullet}`), '')
    }
  }
}

writeFileSync(join(root, 'public', 'llms.txt'), summary.join('\n'), 'utf8')
writeFileSync(join(root, 'public', 'llms-full.txt'), full.join('\n'), 'utf8')

console.log(`llms.txt: ${corePages.length} core pages, ${assigned.size} tools`)
console.log(`llms-full.txt: ${grouped.length} categories`)
