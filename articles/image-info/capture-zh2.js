async (page) => {
  await page.selectOption('select', 'zh')
  await page.waitForURL('**/zh/image-info', { timeout: 60000 })
  await page.waitForSelector('input[type=file]', { timeout: 30000 })
  await page.setInputFiles('input[type=file]', 'D:/code/tools/articles/image-info/assets/demo-photo-exif.jpg')
  await page.waitForSelector('.thumbnail-list button', { timeout: 30000 })
  await page.waitForTimeout(1500)

  const setVisible = (keep) =>
    page.evaluate((keep) => {
      const panel = document.querySelector('.info-panel')
      ;[...panel.children].forEach((el, i) => {
        el.style.display = keep.includes(i) ? '' : 'none'
      })
    }, keep)

  await setVisible([0, 1])
  await page.waitForTimeout(400)
  await page.locator('.info-panel').screenshot({
    path: 'D:/code/tools/articles/image-info/assets/zh-01-overview.png',
  })

  await setVisible([3, 4])
  await page.waitForTimeout(400)
  await page.locator('.info-panel').screenshot({
    path: 'D:/code/tools/articles/image-info/assets/zh-02-privacy.png',
  })

  await page.evaluate(() => {
    const details = document.querySelector('.technical-details')
    if (details) details.open = true
    const summary = document.querySelector('.technical-summary')
    if (summary) summary.style.display = 'none'
    const groups = [...document.querySelectorAll('.metadata-section')]
    groups.forEach((group, i) => {
      group.style.display = i === 2 ? '' : 'none'
    })
  })
  await setVisible([5])
  await page.waitForTimeout(500)
  await page.locator('.info-panel').screenshot({
    path: 'D:/code/tools/articles/image-info/assets/zh-03-technical.png',
  })

  await page.evaluate(() => {
    const panel = document.querySelector('.info-panel')
    ;[...panel.children].forEach((el) => (el.style.display = ''))
    document.querySelectorAll('.metadata-section').forEach((el) => (el.style.display = ''))
  })
  return { url: page.url() }
}
