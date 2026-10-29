/**
 * Compose the article hero images from the demo photo.
 * Usage: node make-hero.cjs
 */
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const dir = __dirname
const src = path.join(dir, 'demo-photo-exif.jpg')

const variants = [
  {
    file: 'hero-zh.jpg',
    label: 'PHOTO / EXIF',
    title: '这张照片，暴露了你的位置',
    lines: ['GPS 46.6863, 7.8632', 'Xiaomi 14 Ultra', '2026-10-01 18:32', '作者 Lin Tao'],
    font: "'Microsoft YaHei', 'Noto Sans SC', sans-serif",
    titleSize: 52,
  },
  {
    file: 'hero-en.jpg',
    label: 'PHOTO / EXIF',
    title: 'This photo knows where you were',
    lines: ['GPS 46.6863, 7.8632', 'Xiaomi 14 Ultra', '2026-10-01 18:32', 'Artist Lin Tao'],
    font: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    titleSize: 46,
  },
]

async function main() {
  for (const v of variants) {
    const photo = await sharp(src).resize(1200, 750, { fit: 'cover' }).toBuffer()
    const chips = v.lines
      .map((line, i) => {
        const x = 64 + (i % 2) * 300
        const y = 566 + Math.floor(i / 2) * 48
        return `<rect x="${x}" y="${y}" width="280" height="36" rx="18" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.25)"/>
          <text x="${x + 16}" y="${y + 24}" font-family="${v.font}" font-size="15" fill="#f8fafc">${line}</text>`
      })
      .join('')

    const svg = `<svg width="1200" height="750" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0"/>
          <stop offset="0.45" stop-color="#020617" stop-opacity="0.35"/>
          <stop offset="1" stop-color="#020617" stop-opacity="0.88"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="750" fill="url(#fade)"/>
      <rect x="48" y="48" width="132" height="34" rx="17" fill="rgba(2,6,23,0.55)" stroke="rgba(255,255,255,0.2)"/>
      <text x="68" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="13" letter-spacing="3" fill="#67e8f9">${v.label}</text>
      <text x="64" y="470" font-family="${v.font}" font-size="${v.titleSize}" font-weight="700" fill="#ffffff">${v.title}</text>
      <text x="64" y="512" font-family="${v.font}" font-size="20" fill="#cbd5e1">${v.lines[0]} · ${v.lines[1]}</text>
      ${chips}
    </svg>`

    await sharp(photo)
      .composite([{ input: Buffer.from(svg) }])
      .jpeg({ quality: 90 })
      .toFile(path.join(dir, v.file))

    console.log('wrote', v.file)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
