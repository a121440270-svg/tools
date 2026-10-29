async (page) => {
  await page.evaluate(() => {
    const panel = document.querySelector('.info-panel')
    ;[...panel.children].forEach((el, i) => {
      el.style.display = i === 5 ? '' : 'none'
    })
    const details = document.querySelector('.technical-details')
    if (details) details.open = true
    const summary = document.querySelector('.technical-summary')
    if (summary) summary.style.display = 'none'
    const groups = [...document.querySelectorAll('.metadata-section')]
    groups.forEach((group, i) => {
      group.style.display = i === 2 ? '' : 'none'
    })
  })
  await page.waitForTimeout(500)
  await page.locator('.info-panel').screenshot({
    path: 'D:/code/tools/articles/image-info/assets/en-03-technical.png',
  })
  await page.evaluate(() => {
    const panel = document.querySelector('.info-panel')
    ;[...panel.children].forEach((el) => (el.style.display = ''))
    document.querySelectorAll('.metadata-section').forEach((el) => (el.style.display = ''))
  })
  return 'done'
}
