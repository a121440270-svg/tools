// Verify deployed pages: HTTP 200 + non-empty unique <title> + self-referencing canonical.
// Works from Windows PowerShell (uses curl.exe through the SOCKS5 proxy, retries on proxy flakes).
//
// Usage:
//   node verify-pages.mjs <baseUrl> <slug1,slug2,...> [--locales=en,zh,ja,de,fr,ar] [--proxy=socks5h://127.0.0.1:4080]
import { execFileSync } from 'node:child_process'

const argv = process.argv.slice(2)
const opt = (n, d) => { const a = argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d }
const pos = argv.filter((a) => !a.startsWith('--'))
const BASE = (pos[0] || '').replace(/\/$/, '')
const SLUGS = (pos[1] || '').split(',').map((s) => s.trim()).filter(Boolean)
const LOCALES = opt('locales', 'en').split(',')
const PROXY = opt('proxy', 'socks5h://127.0.0.1:4080')

if (!BASE || !SLUGS.length) { console.error('usage: node verify-pages.mjs <baseUrl> <slug1,slug2> [--locales=en,zh]'); process.exit(1) }

const curl = (url, tries = 3) => {
  let lastErr = ''
  for (let i = 0; i < tries; i++) {
    try {
      // -w appends the status code; body on stdout
      return execFileSync('curl.exe', ['-sS', '--max-time', '30', '--proxy', PROXY, '-w', '\n__STATUS__%{http_code}', url], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
    } catch (e) { lastErr = String(e.message || e) }
  }
  return '__STATUS__000\n' + lastErr
}

const rows = []
const titles = new Map()

for (const locale of LOCALES) {
  for (const slug of SLUGS) {
    const url = locale === 'en' ? `${BASE}/${slug}` : `${BASE}/${locale}/${slug}`
    const raw = curl(url)
    const status = (raw.match(/__STATUS__(\d{3})/) || [])[1] || '000'
    const html = raw.split('\n__STATUS__')[0]
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || ''
    const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1] || ''
    const selfCanonical = canonical.replace(/\/$/, '') === url.replace(/\/$/, '')
    rows.push({ locale, slug, status, title, canonical, selfCanonical })
    if (title) {
      const key = title.trim()
      titles.set(key, [...(titles.get(key) || []), `${locale}/${slug}`])
    }
  }
}

let bad = 0
for (const r of rows) {
  const problems = []
  if (r.status !== '200') problems.push('HTTP ' + r.status)
  if (!r.title) problems.push('no title')
  if (!r.selfCanonical) problems.push('canonical=' + (r.canonical || '(none)'))
  if (problems.length) bad++
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${r.locale}/${r.slug}  ${problems.join(' | ')}`)
  console.log(`     title: ${r.title}`)
}

const dupes = [...titles.entries()].filter(([, v]) => v.length > 1)
if (dupes.length) {
  console.log('\nDUPLICATE TITLES:')
  dupes.forEach(([t, v]) => console.log(` - "${t}" -> ${v.join(', ')}`))
  bad += dupes.length
}

console.log(`\nchecked ${rows.length} urls, problems: ${bad}`)
process.exit(bad ? 1 : 0)
