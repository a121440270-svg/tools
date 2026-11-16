const fs = require('fs')
const path = require('path')
const { chromium } = require('C:/Program Files/nodejs/node_modules/playwright')

const OUT = 'D:/code/tools/articles/heic-to-jpg/assets'
const A = 'D:/code/tools/articles/image-info/assets'
const URL = 'https://onlitools.com/zh/heic-to-jpg'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } })

  await page.route('**/*', (route) => {
    const u = route.request().url()
    if (/doubleclick|googleads|googletagmanager|google-analytics|clarity\.ms|hotjar|sentry|posthog/i.test(u)) {
      return route.abort()
    }
    return route.continue()
  })

  const cdp = await page.context().newCDPSession(page)
  async function shotBox(selectorJs, file, scale = 1.5) {
    const box = await page.evaluate(selectorJs)
    if (!box) throw new Error('no box for ' + file)
    const res = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: box.x, y: box.y, width: box.width, height: box.height, scale },
    })
    fs.writeFileSync(file, Buffer.from(res.data, 'base64'))
    console.log('shot', path.basename(file), Math.round(box.width) + 'x' + Math.round(box.height))
  }

  // ---- cover
  const cover = await browser.newPage({ viewport: { width: 900, height: 383 }, deviceScaleFactor: 1 })
  await cover.goto('http://127.0.0.1:8792/heic-to-jpg/assets/cover.html', { waitUntil: 'networkidle' })
  await cover.screenshot({ path: path.join(OUT, 'cover.jpg'), type: 'jpeg', quality: 92 })
  await cover.close()
  console.log('cover ok')

  // ---- tool page
  let ok = false
  for (let i = 0; i < 4 && !ok; i++) {
    try {
      await page.goto(URL, { waitUntil: 'commit', timeout: 180000 })
      await page.waitForSelector('input[type=file]', { state: 'attached', timeout: 180000 })
      ok = true
    } catch (e) {
      console.log('retry', i + 1, String(e.message).slice(0, 70))
    }
  }
  if (!ok) throw new Error('site unreachable')
  await sleep(4000)

  const allow = page.locator('button', { hasText: /^Allow All$|^\u5168\u90e8\u5141\u8bb8$/ })
  if (await allow.count()) {
    await allow.first().click({ timeout: 6000 }).catch(() => {})
    await sleep(1500)
  }
  await page.evaluate(() => document.querySelectorAll('[class*="cookie"]').forEach((el) => el.remove()))

  // drop zone
  await shotBox(() => {
    const inp = document.querySelector('input[type=file]')
    let n = inp
    while (n && n.getBoundingClientRect().width < 500) n = n.parentElement
    if (!n) return null
    n.scrollIntoView({ block: 'center' })
    const r = n.getBoundingClientRect()
    return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }
  }, path.join(OUT, 'hx-01-drop.png'))

  // queue two heic files
  await page.setInputFiles('input[type=file]', [path.join(A, 'sample.heic'), path.join(A, 'sample2.heic')])
  await page.waitForFunction(() => /Ready|\u5c31\u7eea|\u5f85\u8f6c\u6362/.test(document.body.innerText), null, { timeout: 120000 })
  await sleep(2000)

  const cardBox = () => {
    const b = [...document.querySelectorAll('button')].find((x) => /^\u5168\u90e8\u6e05\u9664$|^\u6e05\u9664\u5168\u90e8$/.test((x.innerText || '').trim()))
    if (!b) return null
    const c = b.closest('section') || b.parentElement.parentElement.parentElement
    c.scrollIntoView({ block: 'center' })
    const r = c.getBoundingClientRect()
    return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }
  }
  await shotBox(cardBox, path.join(OUT, 'hx-02-queued.png'))

  const queueText = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /^\u5168\u90e8\u6e05\u9664$|^\u6e05\u9664\u5168\u90e8$/.test((x.innerText || '').trim()))
    const c = b.closest('section') || b.parentElement.parentElement.parentElement
    return c.innerText
  })

  // convert
  const btn = page.locator('button', { hasText: /^\u5f00\u59cb\u8f6c\u6362$|^\u8f6c\u6362$|^Convert/ }).first()
  await btn.click()
  await page.waitForFunction(() => /\u5df2\u5b8c\u6210|Done|\u4e0b\u8f7d/.test(document.body.innerText), null, { timeout: 300000 })
  await sleep(3000)
  await shotBox(cardBox, path.join(OUT, 'hx-03-done.png'))

  const doneText = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /^\u5168\u90e8\u6e05\u9664$|^\u6e05\u9664\u5168\u90e8$/.test((x.innerText || '').trim()))
    const c = b.closest('section') || b.parentElement.parentElement.parentElement
    return c.innerText
  })

  await browser.close()
  console.log('---QUEUE---')
  console.log(queueText)
  console.log('---DONE---')
  console.log(doneText)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
