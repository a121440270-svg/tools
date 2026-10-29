async (page) => {
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
    path: 'D:/code/tools/articles/image-info/assets/en-01-overview.png',
  })

  await setVisible([3, 4])
  await page.waitForTimeout(400)
  await page.locator('.info-panel').screenshot({
    path: 'D:/code/tools/articles/image-info/assets/en-02-privacy.png',
  })

  await page.evaluate(() => {
    const details = document.querySelector('.technical-details')
    if (details) details.open = true
    const summary = document.querySelector('.technical-summary')
    if (summary) summary.style.display = 'none'
  })
  await setVisible([5])
  await page.waitForTimeout(600)
  await page.locator('.info-panel').screenshot({
    path: 'D:/code/tools/articles/image-info/assets/en-03-technical.png',
  })

  await page.evaluate(() => {
    const panel = document.querySelector('.info-panel')
    ;[...panel.children].forEach((el) => (el.style.display = ''))
  })
  return 'done'
}
