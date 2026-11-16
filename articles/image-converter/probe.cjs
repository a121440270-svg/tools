const { chromium } = require('C:/Program Files/nodejs/node_modules/playwright')
const F = {
  photo: 'D:/code/tools/articles/image-info/assets/demo-photo-exif.jpg',
  png: 'D:/code/tools/articles/image-info/assets/en-01-overview.png',
}

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1240, height: 1100 } })
  await page.goto('https://onlitools.com/image-converter', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('.drop-zone')
  await page.waitForTimeout(2500)
  await page.setInputFiles('input[type=file]', [F.photo, F.png])
  await page.waitForTimeout(2500)
  const info = await page.evaluate(() => {
    const all = [...document.querySelectorAll('div, section, form')]
    const hits = all
      .map((n) => {
        const r = n.getBoundingClientRect()
        const t = n.textContent || ''
        return {
          tag: n.tagName,
          cls: (n.className || '').toString().slice(0, 45),
          w: Math.round(r.width),
          h: Math.round(r.height),
          convTo: /Convert to/.test(t),
          convImg: /Convert images/.test(t),
          len: t.length,
        }
      })
      .filter((x) => x.convTo && x.convImg)
    return { hits: hits.slice(0, 8), count: hits.length }
  })
  console.log(JSON.stringify(info, null, 2))
  await browser.close()
})()
