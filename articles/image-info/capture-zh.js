async (page) => {
  await page.evaluate(() => window.scrollTo(0, 809))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'D:/code/tools/articles/image-info/assets/zh-01-tool.png' })

  await page.evaluate(() => window.scrollTo(0, 2003))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'D:/code/tools/articles/image-info/assets/zh-02-privacy.png' })

  await page.click('.technical-summary')
  await page.waitForTimeout(600)
  const top = await page.evaluate(() => document.querySelector('.technical-section').getBoundingClientRect().top + window.scrollY)
  await page.evaluate((y) => window.scrollTo(0, y - 120), top)
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'D:/code/tools/articles/image-info/assets/zh-03-technical.png' })

  return { techTop: top }
}
