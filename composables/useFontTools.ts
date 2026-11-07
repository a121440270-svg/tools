export type FontFormat = 'ttf' | 'otf' | 'woff' | 'woff2'

// fonteditor-core is browser-only (and pulls in a wasm build). Importing it
// lazily keeps it out of the server render, so these pages can be prerendered.
async function loadFontEditor() {
  return import('fonteditor-core')
}

export const FONT_LANGUAGE_PRESETS = [
  { value: 'latin', label: 'Latin', range: 'U+0000-024F, U+1E00-1EFF' },
  { value: 'english', label: 'English', range: 'U+0020-007E, U+00A0-00FF' },
  { value: 'simplified-chinese', label: 'Simplified Chinese', range: 'U+3000-303F, U+4E00-9FFF' },
  { value: 'traditional-chinese', label: 'Traditional Chinese', range: 'U+3000-303F, U+4E00-9FFF' },
  { value: 'japanese', label: 'Japanese', range: 'U+3000-30FF, U+31F0-31FF, U+4E00-9FFF' },
  { value: 'korean', label: 'Korean', range: 'U+1100-11FF, U+3130-318F, U+AC00-D7AF' },
  { value: 'cyrillic', label: 'Cyrillic', range: 'U+0400-052F' },
  { value: 'arabic', label: 'Arabic', range: 'U+0600-06FF, U+0750-077F' },
  { value: 'greek', label: 'Greek', range: 'U+0370-03FF' }
]

let woff2Initialization: Promise<unknown> | undefined

export function getFontFormat(fileName: string): FontFormat | null {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension === 'ttf' || extension === 'otf' || extension === 'woff' || extension === 'woff2'
    ? extension
    : null
}

export async function ensureWoff2Support() {
  if (!woff2Initialization) {
    woff2Initialization = loadFontEditor().then(({ woff2 }) => woff2.init('/libs/woff2.wasm'))
  }
  await woff2Initialization
}

export async function parseFontBuffer(buffer: ArrayBuffer, format: FontFormat) {
  if (format === 'woff2') await ensureWoff2Support()

  const { Font } = await loadFontEditor()
  const font = Font.create(buffer, {
    type: format,
    hinting: true,
    compound2simple: true,
    combinePath: false
  })

  return { font, data: font.get() }
}

export function getMappedCodePoints(cmap: Record<string, number>) {
  return Object.keys(cmap)
    .map(codePoint => Number(codePoint))
    .filter(codePoint => Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff)
    .sort((left, right) => left - right)
}

export function formatUnicodeRanges(codePoints: number[]) {
  const sorted = Array.from(new Set(codePoints)).sort((left, right) => left - right)
  const ranges: string[] = []
  let start = sorted[0]
  let end = start

  for (const codePoint of sorted.slice(1)) {
    if (codePoint === end + 1) {
      end = codePoint
      continue
    }

    ranges.push(formatUnicodeRange(start, end))
    start = end = codePoint
  }

  if (start !== undefined) ranges.push(formatUnicodeRange(start, end))
  return ranges
}

function formatUnicodeRange(start: number, end: number) {
  const format = (value: number) => value.toString(16).toUpperCase().padStart(4, '0')
  return start === end ? `U+${format(start)}` : `U+${format(start)}-${format(end)}`
}

export function useSharedFontFile() {
  return useState<File | null>('font-tools-selected-file', () => null)
}

export function useSharedSubsetText() {
  return useState<string>('font-tools-subset-text', () => '')
}

export function parseUnicodeRanges(value: string) {
  const tokens = value.split(/[\s,;]+/).filter(Boolean)
  if (!tokens.length) return null

  const ranges: Array<[number, number]> = []
  for (const token of tokens) {
    const match = token.match(/^U\+([0-9a-f]{1,6})(?:-([0-9a-f]{1,6}))?$/i)
    if (!match) return null
    const start = Number.parseInt(match[1], 16)
    const end = Number.parseInt(match[2] || match[1], 16)
    if (start > end || end > 0x10ffff) return null
    ranges.push([start, end])
  }
  return ranges
}

export function getCodePointsInRanges(value: string, maximum = 100000) {
  const ranges = parseUnicodeRanges(value)
  if (!ranges) return null

  const codePoints: number[] = []
  for (const [start, end] of ranges) {
    if (end - start + 1 + codePoints.length > maximum) return null
    for (let codePoint = start; codePoint <= end; codePoint++) codePoints.push(codePoint)
  }
  return Array.from(new Set(codePoints)).sort((left, right) => left - right)
}