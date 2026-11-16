const path = require('path')
const { chromium } = require('C:/Program Files/nodejs/node_modules/playwright')

const OUT = 'D:/code/tools/articles/image-converter/assets'
const FILES = {
  photo: 'D:/code/tools/articles/image-info/assets/demo-photo-exif.jpg',
  png: 'D:/code/tools/articles/image-info/assets/en-01-overview.png',
  heic: 'D:/code/tools/articles/image-info/assets/sample.heic',
  png2: 'D:/code/tools/articles/image-info/assets/zh-03-technical.png',
}

async function cardFrom(page, text) {
  const handle = await page.evaluateHandle((t) => {
    const btn = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').trim() === t)
    if (!btn) return null
    return btn.closest('section') || btn.parentElement.parentElement.parentElement
  }, text)
  const el = handle.asElement()
  if (!el) throw new Error(`card not found for ${text}`)
  return el
}

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 }, deviceScaleFactor: 1.5 })

  // hero (1200x750 @1x)
  const heroPage = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 1 })
  await heroPage.goto('http://127.0.0.1:8792/image-converter/assets/hero-en.html', { waitUntil: 'networkidle' })
  await heroPage.screenshot({ path: path.join(OUT, 'hero-en.jpg'), type: 'jpeg', quality: 90 })
  await heroPage.close()
  console.log('hero')

  await page.goto('https://onlitools.com/image-converter', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('.drop-zone', { timeout: 60000 })
  await page.waitForTimeout(2500)

  const allow = page.locator('button', { hasText: /^Allow All$/ })
  if (await allow.count()) {
    await allow.first().click({ timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(1500)
  }
  await page.evaluate(() => {
    document.querySelectorAll('[class*="cookie"]').forEach((el) => el.remove())
  })

  const drop = await page.locator('.drop-zone').first().elementHandle()
  await drop.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await drop.screenshot({ path: path.join(OUT, 'conv-01-dropzone.png') })
  console.log('shot 1')

  await page.setInputFiles('input[type=file]', [FILES.photo, FILES.png, FILES.heic])
  await page.waitForFunction(() => /Ready/.test(document.body.innerText), null, { timeout: 60000 })
  await page.waitForTimeout(900)
  let card = await cardFrom(page, 'Clear all')
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await card.screenshot({ path: path.join(OUT, 'conv-02-queued.png') })
  console.log('shot 2')

  await page.selectOption('select#output-format', 'image/webp')
  await page.locator('button', { hasText: /^Convert images$/ }).first().click()
  await page.waitForFunction(
    () => {
      const t = document.body.innerText
      return (t.match(/Done/g) || []).length >= 3 || /Failed/.test(t)
    },
    null,
    { timeout: 240000 },
  )
  await page.waitForTimeout(1500)
  card = await cardFrom(page, 'Download all')
  await card.screenshot({ path: path.join(OUT, 'conv-03-done.png') })
  console.log('shot 3')

  await page.locator('button', { hasText: /^Clear all$/ }).first().click()
  await page.waitForTimeout(1000)
  await page.setInputFiles('input[type=file]', [FILES.png2])
  await page.waitForFunction(() => /Ready/.test(document.body.innerText), null, { timeout: 60000 })
  await page.selectOption('select#output-format', 'image/avif')
  await page.locator('button', { hasText: /^Convert images$/ }).first().click()
  await page.waitForFunction(() => /Failed|cannot encode/i.test(document.body.innerText), null, { timeout: 60000 })
  await page.waitForTimeout(1000)
  card = await cardFrom(page, 'Clear all')
  await card.screenshot({ path: path.join(OUT, 'conv-04-avif.png') })
  console.log('shot 4')

  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
