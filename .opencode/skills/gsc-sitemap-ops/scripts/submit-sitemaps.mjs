// Submit (or re-submit) sitemap URLs in GSC to force a re-read.
// Re-submitting the SAME url is the only way to trigger a re-read from the UI.
// Usage: node submit-sitemaps.mjs <TAB_ID> <sitemapUrl> [moreUrls...] [--domain=example.com]
import { connect, makeRpc, sleep, withTimeout, listTabs } from './cdp-lib.mjs'

const argv = process.argv.slice(2)
const domainArg = argv.find((a) => a.startsWith('--domain='))
const DOMAIN = domainArg ? domainArg.split('=')[1] : 'example.com'
const [TAB_ID, ...SUBMIT] = argv.filter((a) => !a.startsWith('--domain='))
if (!TAB_ID || !SUBMIT.length) { console.error('usage: node submit-sitemaps.mjs <TAB_ID> <sitemapUrl> [...] [--domain=example.com]'); process.exit(1) }

const RESOURCE = `sc-domain:${DOMAIN}`
const URL = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(RESOURCE)}`

const tabs = await listTabs()
const tab = tabs.find((t) => t.id === TAB_ID)
if (!tab) { console.error('TAB NOT FOUND'); process.exit(1) }

const ws = await connect(tab.webSocketDebuggerUrl)
const rpc = makeRpc(ws)
await rpc('Runtime.enable').catch(() => {})
await rpc('Page.enable').catch(() => {})
await rpc('Page.bringToFront').catch(() => {})

const evalJs = async (expression, timeoutMs = 90000) => {
  const { result, exceptionDetails } = await withTimeout(
    rpc('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }), timeoutMs, 'eval')
  if (exceptionDetails) throw new Error('eval: ' + String(exceptionDetails.exception?.description || '').slice(0, 300))
  return result.value
}

await withTimeout(rpc('Page.navigate', { url: URL }), 60000, 'navigate')
for (let i = 0; i < 15; i++) {
  await sleep(2000)
  const ready = await evalJs(`!!Array.from(document.querySelectorAll('input')).find((el) => /输入站点地图网址/.test(el.getAttribute('aria-label') || ''))`).catch(() => false)
  if (ready) break
}

for (const sm of SUBMIT) {
  console.log('\n=== SUBMIT:', sm)
  const r = await evalJs(`(async () => {
    const input = Array.from(document.querySelectorAll('input')).find((el) => el.offsetParent !== null && /输入站点地图网址/.test(el.getAttribute('aria-label') || ''))
    if (!input) return { error: 'sitemap input not found' }
    input.focus(); input.click()
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(input, ${JSON.stringify(sm)})
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 700))
    const btn = Array.from(document.querySelectorAll('button,[role=button]')).find((el) => el.offsetParent !== null && (el.innerText || '').trim() === '提交')
    if (!btn) return { error: 'submit button not found' }
    btn.click()
    await new Promise((r) => setTimeout(r, 6000))
    // Do NOT judge by body text: the table already contains 已提交/无法抓取.
    // Read the specific alert instead.
    const alerts = Array.from(document.querySelectorAll('[role=alert]')).map((el) => (el.innerText || '').replace(/\\s+/g, ' ').trim()).filter(Boolean)
    return { alerts }
  })()`)
  console.log(JSON.stringify(r))
  await sleep(3000)
}

// Re-read the table and report status per row
const rows = await evalJs(`Array.from(document.querySelectorAll('tr')).map((tr) => (tr.innerText || '').replace(/\\s+/g, ' ').trim()).filter((t) => /sitemap|站点地图|xml/i.test(t))`).catch(() => [])
console.log('\n=== TABLE AFTER SUBMIT ===')
rows.forEach((r) => console.log(' -', r.slice(0, 220)))
process.exit(0)
