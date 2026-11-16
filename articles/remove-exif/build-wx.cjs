/**
 * Markdown -> WeChat 公众号 body HTML.
 * `{{IMG:name}}` tokens are swapped for <p><img src="{{IMG:<file>}}"></p>,
 * and the placeholders are later replaced with mmbiz.qpic.cn URLs.
 *
 * Usage: node build-wx.cjs zh-wechat.md zh-body.html
 */
const fs = require('fs')
const path = require('path')

const [, , input, output] = process.argv
const md = fs.readFileSync(input, 'utf8').replace(/\r\n/g, '\n')

const IMG = {
  cover: 'cover.jpg',
  detect: 'wx-01-detect.png',
  done: 'wx-02-done.png',
  editor: 'wx-03-editor.png',
  info: 'wx-04-info.png',
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(text) {
  const slots = []
  const stash = (html) => `\u0000${slots.push(html) - 1}\u0000`
  let s = text
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    stash(`<img src="{{IMG:${path.basename(src)}}}" alt="${esc(alt)}">`),
  )
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
    stash(`<a href="${href}">${esc(label)}</a>`),
  )
  s = esc(s)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)])
  return s
}

const lines = md.split('\n')
const out = []
let i = 0

while (i < lines.length) {
  const line = lines[i]
  if (!line.trim()) {
    i++
    continue
  }

  const token = /^\{\{IMG:(\w+)\}\}$/.exec(line.trim())
  if (token) {
    out.push(`<p><img src="{{IMG:${IMG[token[1]]}}}"></p>`)
    i++
    continue
  }

  if (/^---+$/.test(line.trim())) {
    out.push('<hr>')
    i++
    continue
  }

  const h = /^(#{1,3})\s+(.*)$/.exec(line)
  if (h) {
    const level = Math.min(h[1].length + 1, 3)
    out.push(`<h${level}>${inline(h[2])}</h${level}>`)
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
    !/^\{IMG/.test(lines[i]) &&
    !/^\{IMG:/.test(lines[i]) &&
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
console.log(
  JSON.stringify({
    bytes: body.length,
    images: [...body.matchAll(/\{\{IMG:([^}]+)\}\}/g)].map((m) => m[1]),
  }),
)
