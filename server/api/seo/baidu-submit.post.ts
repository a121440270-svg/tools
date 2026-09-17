import { createError, readBody } from 'h3'

const BAIDU_SITE = 'https://onlitools.com'
const BAIDU_PUSH_TOKEN = 'kuDrOzY6VOUDe1lw'

function normalizeUrl(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url?: string }>(event).catch(() => ({ url: undefined }))
  const url = normalizeUrl(body?.url)
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: '无效的页面地址' })
  }

  const siteUrl = new URL(BAIDU_SITE)
  const submittedUrl = new URL(url)
  if (submittedUrl.hostname !== siteUrl.hostname) {
    throw createError({ statusCode: 400, statusMessage: '只能提交本站地址' })
  }

  const db = useDatabase('myDatabase')
  const insertResult = await db.prepare(
    `INSERT OR IGNORE INTO baidu_url_submissions (url, status)
     VALUES (?, 'pending')`
  ).bind(url).run() as any

  if (Number(insertResult?.meta?.changes || 0) === 0) {
    const existingRows = await db.prepare(
      'SELECT status FROM baidu_url_submissions WHERE url = ?'
    ).bind(url).all() as Array<{ status?: string }>
    const existing = existingRows?.[0]
    if (existing?.status !== 'failed') {
      return { success: true, submitted: false, duplicate: true }
    }
    await db.prepare(
      `UPDATE baidu_url_submissions
       SET status = 'pending', error = NULL, updateAt = CURRENT_TIMESTAMP
       WHERE url = ? AND status = 'failed'`
    ).bind(url).run()
  }

  try {
    const response = await fetch(
      `http://data.zz.baidu.com/urls?site=${url}&token=kuDrOzY6VOUDe1lw`,
      {
        method: 'POST',
        headers: {
          'User-Agent': 'curl/7.12.1',
          'Content-Type': 'text/plain'
        },
        body: url
      }
    )
    const responseText = await response.text()
    let result: any = {}
    try {
      result = JSON.parse(responseText)
    } catch {
      result = { message: responseText }
    }
    if (!response.ok || typeof result.success !== 'number') {
      throw new Error(result.message || `百度接口返回 HTTP ${response.status}`)
    }

    await db.prepare(
      `UPDATE baidu_url_submissions
       SET status = 'success', baiduSuccess = ?, remain = ?, error = NULL,
           updateAt = CURRENT_TIMESTAMP
       WHERE url = ?`
    ).bind(result.success, result.remain ?? null, url).run()

    return { success: true, submitted: true, remain: result.remain }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await db.prepare(
      `UPDATE baidu_url_submissions
       SET status = 'failed', error = ?, updateAt = CURRENT_TIMESTAMP
       WHERE url = ?`
    ).bind(message.slice(0, 1000), url).run()
    console.error('Baidu URL submission failed', { url, error: message })
    return { success: false, submitted: false, error: message }
  }
})