// Minimal CDP driver for the debug Chrome (port 9222). Copy next to your script.
export const DEBUG = 'http://127.0.0.1:9222'
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
export const withTimeout = (p, ms, label) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout: ' + label)), ms))])

export function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    ws.addEventListener('open', () => resolve(ws))
    ws.addEventListener('error', () => reject(new Error('ws error: ' + wsUrl)))
  })
}

export function makeRpc(ws) {
  let id = 0
  const pending = new Map()
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    }
  })
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id
      pending.set(msgId, { resolve, reject })
      ws.send(JSON.stringify({ id: msgId, method, params }))
    })
}

export async function listTabs() {
  const res = await fetch(`${DEBUG}/json`)
  return (await res.json()).filter((t) => t.type === 'page')
}

export async function newTab(url = 'about:blank') {
  // Chrome requires PUT for /json/new
  await fetch(`${DEBUG}/json/new?${new URLSearchParams({ url })}`, { method: 'PUT' })
  await sleep(1500)
  return findTabByUrl(url === 'about:blank' ? 'about:blank' : url)
}

export async function findTabByUrl(substr) {
  const tabs = await listTabs()
  return tabs.find((t) => t.url.includes(substr))
}

// Convenience: attach + evalJs + navigate + polling helper
export async function attach(tabIdOrUrlSubstr) {
  const tabs = await listTabs()
  const tab = tabs.find((t) => t.id === tabIdOrUrlSubstr) || tabs.find((t) => t.url.includes(tabIdOrUrlSubstr))
  if (!tab) throw new Error('tab not found: ' + tabIdOrUrlSubstr)
  const ws = await connect(tab.webSocketDebuggerUrl)
  const rpc = makeRpc(ws)
  await rpc('Page.enable').catch(() => {})
  await rpc('Runtime.enable').catch(() => {})
  await rpc('Page.bringToFront').catch(() => {})

  const evalJs = async (expression, timeoutMs = 60000) => {
    const { result, exceptionDetails } = await withTimeout(
      rpc('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }),
      timeoutMs, 'eval')
    if (exceptionDetails) throw new Error('eval: ' + String(exceptionDetails.exception?.description || '').slice(0, 300))
    return result.value
  }
  const navigate = async (url, settleMs = 3000) => {
    await withTimeout(rpc('Page.navigate', { url }), 60000, 'navigate')
    await sleep(settleMs)
  }
  // poll(fn, tries, intervalMs) -> first truthy value or null
  const poll = async (fn, tries = 15, intervalMs = 2000) => {
    for (let i = 0; i < tries; i++) {
      const v = await fn(i).catch(() => null)
      if (v) return v
      await sleep(intervalMs)
    }
    return null
  }
  return { tab, ws, rpc, evalJs, navigate, poll }
}
