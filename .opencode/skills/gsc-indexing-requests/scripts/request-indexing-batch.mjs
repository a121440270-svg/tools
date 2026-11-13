// Batch "request indexing" in GSC URL Inspection — correct property context + resumable.
// Re-submitting from the wrong property page makes the panel load forever (the #1 failure).
//
// Usage:
//   node request-indexing-batch.mjs <TAB_ID> [MAX] --domain=example.com --urls=urls.json --state=state.json
// urls.json  : ["https://example.com/new-page", ...]   (priority order)
// state.json : { "done": [...], "failed": [...], "quotaHit": false }  (auto-created)
import { connect, makeRpc, sleep, withTimeout, listTabs } from './cdp-lib.mjs'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const argv = process.argv.slice(2)
const opt = (name, def) => {
  const a = argv.find((x) => x.startsWith(`--${name}=`))
  return a ? a.split('=').slice(1).join('=') : def
}
const pos = argv.filter((a) => !a.startsWith('--'))
const TAB_ID = pos[0]
const MAX = Number(pos[1] || 999)
const DOMAIN = opt('domain', 'example.com')
const URLS_FILE = opt('urls', 'urls.json')
const STATE_FILE = opt('state', 'gsc-req-state.json')

if (!TAB_ID) { console.error('usage: node request-indexing-batch.mjs <TAB_ID> [MAX] --domain=... --urls=... --state=...'); process.exit(1) }

const RESOURCE = `sc-domain:${DOMAIN}`
const OVERVIEW = `https://search.google.com/search-console?resource_id=${encodeURIComponent(RESOURCE)}`
const URLS = JSON.parse(readFileSync(URLS_FILE, 'utf8'))
const state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : { done: [], failed: [], quotaHit: false }
state.failed = [] // previous failures are usually environmental (wrong property context)
state.quotaHit = false

const tabs = await listTabs()
const tab = tabs.find((t) => t.id === TAB_ID)
if (!tab) { console.error('GSC tab not found; pass the right TAB_ID'); process.exit(1) }
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

const gotoOverview = async () => {
  await withTimeout(rpc('Page.navigate', { url: OVERVIEW }), 60000, 'navigate')
  for (let i = 0; i < 20; i++) {
    await sleep(1500)
    const ok = await evalJs(`!!Array.from(document.querySelectorAll('input')).find((el) => (el.getAttribute('aria-label') || '').startsWith('检查 ${DOMAIN}'))`).catch(() => false)
    if (ok) return true
  }
  return false
}

async function requestIndexing(url) {
  if (!(await gotoOverview())) return { error: 'search bar never appeared on overview' }

  const fill = await evalJs(`(async () => {
    const input = Array.from(document.querySelectorAll('input')).find((el) => (el.getAttribute('aria-label') || '').startsWith('检查 ${DOMAIN}'))
    if (!input) return { error: 'search input not found' }
    input.focus(); input.click()
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(input, ${JSON.stringify(url)})
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 800))
    for (const type of ['keydown', 'keypress', 'keyup']) {
      input.dispatchEvent(new KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }))
    }
    return { filled: true }
  })()`)
  if (fill.error) return fill

  // poll up to ~75s: button usually shows in 4-10s
  for (let i = 0; i < 25; i++) {
    await sleep(3000)
    const s = await evalJs(`(() => {
      const body = (document.body.innerText || '').replace(/[ \\t]+/g, ' ')
      const btn = Array.from(document.querySelectorAll('button,[role=button]')).find((el) => el.offsetParent !== null && (el.innerText || '').trim() === '请求编入索引')
      return { hasBtn: !!btn, quota: /配额|quota|已达上限|已超出/i.test(body) }
    })()`)
    if (s.hasBtn) break
    if (s.quota) return { quota: true }
    if (i === 24) return { error: 'request button never appeared' }
  }

  return evalJs(`(async () => {
    const btn = Array.from(document.querySelectorAll('button,[role=button]')).find((el) => el.offsetParent !== null && (el.innerText || '').trim() === '请求编入索引')
    if (!btn) return { error: 'btn vanished' }
    btn.click()
    let confirmed = false
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      const confirm = Array.from(document.querySelectorAll('[role=dialog] button,[role=dialog] [role=button],button,[role=button]'))
        .filter((b) => b.offsetParent !== null)
        .find((b) => /请求编入索引|确认|知道了/.test((b.innerText || '').trim()) && (b.innerText || '').trim() !== '取消')
      if (confirm && !confirmed) { confirm.click(); confirmed = true }
      const t = (document.body.innerText || '').replace(/[ \\t]+/g, ' ')
      if (t.includes('已请求编入索引')) return { requested: true, confirmed }
      if (/配额|quota|已达上限|已超出/i.test(t)) return { quota: true, confirmed }
    }
    return { requested: false, confirmed }
  })()`, 150000)
}

let processed = 0
for (const url of URLS) {
  if (state.done.includes(url)) { console.log('skip (done):', url); continue }
  if (state.quotaHit) { console.log('quota hit earlier, stopping'); break }
  if (processed >= MAX) { console.log('MAX reached, stopping'); break }
  console.log('\n=== requesting:', url)
  try {
    const r = await requestIndexing(url)
    console.log(JSON.stringify(r))
    if (r.requested) state.done.push(url)
    else if (r.quota) { state.quotaHit = true; state.failed.push(url) }
    else state.failed.push(url)
  } catch (e) {
    console.error('ERROR:', e.message)
    state.failed.push(url)
  }
  processed++
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 1))
  await sleep(6000)
}

console.log('\n=== SUMMARY ===')
console.log('done:', state.done.length, '| failed:', state.failed.length, '| quotaHit:', state.quotaHit)
console.log('done urls:', state.done.join(', ') || '(none)')
process.exit(0)
