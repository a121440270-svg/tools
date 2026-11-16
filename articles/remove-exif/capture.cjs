const path = require('path')
const { chromium } = require('C:/Program Files/nodejs/node_modules/playwright')

const OUT = 'D:/code/tools/articles/remove-exif/assets'
const PHOTO = 'D:/code/tools/articles/image-info/assets/demo-photo-exif.jpg'

async function card(page, btnText) {
  const h = await page.evaluateHandle((t) => {
    const b = [...document.querySelectorAll('button')].find((x) => (x.innerText || '').trim() === t)
    if (!b) return null
    return b.closest('section') || b.parentElement.parentElement.parentElement
  }, btnText)
  const el = h.asElement()
  if (!el) throw new Error('card not found: ' + btnText)
  return el
}

async function addFile(page, name) {
  await page.setInputFiles('input[type=file]', PHOTO)
  await page.waitForTimeout(3500)
  console.log('added', name)
}

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 1.5 })

  // cover 900x383
  const cover = await browser.newPage({ viewport: { width: 900, height: 383 }, deviceScaleFactor: 1 })
  await cover.goto('http://127.0.0.1:8792/remove-exif/assets/cover.html', { waitUntil: 'networkidle' })
  await cover.screenshot({ path: path.join(OUT, 'cover.jpg'), type: 'jpeg', quality: 92 })
  await cover.close()
  console.log('cover')

  // remove-exif
  await page.goto('https://onlitools.com/zh/remove-exif', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('input[type=file]', { timeout: 60000 })
  await page.waitForTimeout(2500)
  const allow = page.locator('button', { hasText: /^Allow All$|^全部允许$/ })
  if (await allow.count()) {
    await allow.first().click({ timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1500)
  }
  await page.evaluate(() => document.querySelectorAll('[class*="cookie"]').forEach((el) => el.remove()))

  await addFile(page, 'exif-demo.jpg')
  let c = await card(page, '全部清除')
  await c.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await c.screenshot({ path: path.join(OUT, 'wx-01-detect.png') })
  console.log('shot detect')

  await page.locator('button', { hasText: /^移除元数据$/ }).first().click()
  await page.waitForFunction(() => /已完成/.test(document.body.innerText), null, { timeout: 120000 })
  await page.waitForTimeout(1200)
  c = await card(page, '全部清除')
  await c.screenshot({ path: path.join(OUT, 'wx-02-done.png') })
  console.log('shot done')

  // exif editor
  await page.goto('https://onlitools.com/zh/exif-editor', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('input[type=file]', { timeout: 60000 })
  await page.waitForTimeout(2500)
  await page.setInputFiles('input[type=file]', PHOTO)
  await page.waitForTimeout(3500)
  const form = await page.evaluateHandle(() => {
    const lab = [...document.querySelectorAll('label')].find((l) => /拍摄时间/.test(l.innerText || ''))
    let n = lab
    while (n && n.getBoundingClientRect().width < 500) n = n.parentElement
    return n
  })
  const f = form.asElement()
  await f.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await f.screenshot({ path: path.join(OUT, 'wx-03-editor.png') })
  console.log('shot editor')

  // image info
  await page.goto('https://onlitools.com/zh/image-info', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('input[type=file]', { timeout: 60000 })
  await page.waitForTimeout(2500)
  await page.setInputFiles('input[type=file]', PHOTO)
  await page.waitForTimeout(5000)
  const panel = await page.evaluateHandle(() => {
    const els = [...document.querySelectorAll('div, section')].filter((d) => /EXIF|GPS|图像|Image Width|尺寸/i.test(d.innerText || ''))
    els.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)
    const el = els.find((e) => e.getBoundingClientRect().width > 500 && e.getBoundingClientRect().height > 300)
    return el || null
  })
  const p = panel.asElement()
  if (p) {
    await p.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await p.screenshot({ path: path.join(OUT, 'wx-04-info.png') })
    console.log('shot info')
  } else {
    console.log('info panel not found')
  }

  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
