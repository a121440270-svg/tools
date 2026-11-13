// Read the GSC Sitemaps table (poll until rows render).
// Usage: node read-sitemaps.mjs <TAB_ID> [domain]
import { connect, makeRpc, sleep, withTimeout, listTabs } from './cdp-lib.mjs'

const TAB_ID = process.argv[2]
const DOMAIN = process.argv[3] || 'example.com'
const RESOURCE = `sc-domain:${DOMAIN}`
const URL = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(RESOURCE)}`

if (!TAB_ID) { console.error('usage: node read-sitemaps.mjs <TAB_ID> [domain]'); process.exit(1) }

const tabs = await listTabs()
const tab = tabs.find((t) => t.id === TAB_ID)
if (!tab) { console.error('TAB NOT FOUND'); process.exit(1) }

const ws = await connect(tab.webSocketDebuggerUrl)
const rpc = makeRpc(ws)
await rpc('Runtime.enable').catch(() => {})
await rpc('Page.enable').catch(() => {})
await rpc('Page.bringToFront').catch(() => {})

const evalJs = async (expression, timeoutMs = 60000) => {
  const { result, exceptionDetails } = await withTimeout(
    rpc('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }), timeoutMs, 'eval')
  if (exceptionDetails) throw new Error('eval: ' + String(exceptionDetails.exception?.description || '').slice(0, 300))
  return result.value
}

await withTimeout(rpc('Page.navigate', { url: URL }), 60000, 'navigate')

// SPA: the table renders asynchronously -> poll, never read once
let rows = []
for (let i = 0; i < 15; i++) {
  await sleep(3000)
  rows = await evalJs(`Array.from(document.querySelectorAll('tr')).map((tr) => (tr.innerText || '').replace(/\\s+/g, ' ').trim()).filter((t) => /sitemap|站点地图|xml/i.test(t))`).catch(() => [])
  if (rows.length >= 3) break
}
if (rows.length < 3) { console.error('rows never rendered (still on skeleton?)'); process.exit(1) }

console.log('URL:', await evalJs('location.href'))
console.log('ROWS:')
rows.forEach((r) => console.log(' -', r.slice(0, 220)))

const alerts = await evalJs(`Array.from(document.querySelectorAll('[role=alert]')).map((el) => (el.innerText || '').replace(/\\s+/g, ' ').trim()).filter(Boolean)`).catch(() => [])
if (alerts.length) console.log('ALERTS:', JSON.stringify(alerts))
process.exit(0)
