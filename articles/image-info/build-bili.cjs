/**
 * Minimal Markdown -> HTML for Bilibili 专栏 body.
 * Handles: headings, paragraphs, bold, inline code, links, images, lists, fenced code, hr.
 * Images become {{IMG:<file>}} placeholders, later replaced with uploaded URLs.
 *
 * Usage: node build-bili.cjs <input.md> <output.html>
 */
const fs = require('fs')
const path = require('path')

const [, , input, output] = process.argv
const dir = path.dirname(path.resolve(input))
let md = fs.readFileSync(input, 'utf8').replace(/\r\n/g, '\n')

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(text) {
  const slots = []
  const stash = (html) => `\u0000${slots.push(html) - 1}\u0000`
  let s = text
  s = s.replace(/`([^`]+)`/g, (_, code) => stash(`<code>${esc(code)}</code>`))
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    stash(`<img src="${placeholder(src)}" alt="${esc(alt)}">`),
  )
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
    stash(`<a href="${href}" target="_blank">${esc(label)}</a>`),
  )
  s = esc(s)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)])
  return s
}

function placeholder(src) {
  return `{{IMG:${path.basename(src)}}}`
}

const lines = md.split('\n')
const out = []
let i = 0
let title = null

while (i < lines.length) {
  const line = lines[i]

  if (!line.trim()) {
    i++
    continue
  }

  if (/^```/.test(line)) {
    const buf = []
    i++
    while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++])
    i++
    out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`)
    continue
  }

  const h = /^(#{1,3})\s+(.*)$/.exec(line)
  if (h) {
    const level = h[1].length
    if (level === 1 && !title) {
      title = h[2].trim()
    } else {
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
    }
    i++
    continue
  }

  if (/^---+$/.test(line.trim())) {
    out.push('<hr>')
    i++
    continue
  }

  if (/^!\[/.test(line.trim())) {
    out.push(`<p>${inline(line.trim())}</p>`)
    i++
    continue
  }

  if (/^(\d+\.|-)\s+/.test(line)) {
    const ordered = /^\d+\./.test(line)
    const items = []
    while (i < lines.length && /^(\d+\.|-)\s+/.test(lines[i])) {
      items.push(`<li>${inline(lines[i].replace(/^(\d+\.|-)\s+/, ''))}</li>`)
      i++
    }
    out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`)
    continue
  }

  const buf = []
  while (
    i < lines.length &&
    lines[i].trim() &&
    !/^```/.test(lines[i]) &&
    !/^#{1,3}\s/.test(lines[i]) &&
    !/^(\d+\.|-)\s/.test(lines[i]) &&
    !/^---+$/.test(lines[i].trim())
  ) {
    buf.push(lines[i++])
  }
  out.push(`<p>${inline(buf.join(' '))}</p>`)
}

const body = out.join('\n')
fs.writeFileSync(output, body, 'utf8')
console.log(JSON.stringify({ title, bytes: body.length, images: [...body.matchAll(/\{\{IMG:([^}]+)\}\}/g)].map((m) => m[1]) }))
