/**
 * Tiny static server for local assets: CORS-enabled, no caching.
 * Usage: node static-server.cjs <root-dir> [port]
 *
 * Needed because:
 *  - Playwright blocks file:// URLs
 *  - the Bilibili editor page (https) has to fetch image bytes from 127.0.0.1,
 *    which requires Access-Control-Allow-Origin on the response
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const root = path.resolve(process.argv[2] || process.cwd())
const port = Number(process.argv[3] || 8792)

const types = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const file = path.join(root, urlPath)
    if (!file.startsWith(root)) {
      res.writeHead(403).end('forbidden')
      return
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end('not found')
        return
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      })
      res.end(data)
    })
  })
  .listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`))
