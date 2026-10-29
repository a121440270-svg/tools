import { createError, defineEventHandler, getHeader, readBody, getRequestURL } from 'h3'

type NotifyBody = {
  action?: 'enter' | 'leave'
  toolName?: string
  pageUrl?: string
}

type WechatTokenResponse = {
  access_token?: string
  expires_in?: number
  errcode?: number
  errmsg?: string
}

const TOKEN_CACHE_ID = 1
const TOKEN_EXPIRY_BUFFER_SECONDS = 300
const WECHAT_APP_ID = 'wxce77dc78163d699a'
const WECHAT_APP_SECRET = '727a95377d0d5ca6dea5a732f3b64562'
const WECHAT_OPENID = 'olbaO5_wCSAcDe_HKFK1ERm0c3_I'
const WECHAT_TEMPLATE_ID = '-OueaZNBSTkhg0Zfp3btL1VHK9KXD9Lqe-AuzUhqJrM'

async function getAccessToken(db: ReturnType<typeof useDatabase>, appId: string, appSecret: string, forceRefresh = false) {
  const now = Math.floor(Date.now() / 1000)
  if (!forceRefresh) {
    const cachedRows = await db.prepare(
      'SELECT access_token, expires_at FROM wechat_access_token_cache WHERE id = ?'
    ).bind(TOKEN_CACHE_ID).all() as Array<{ access_token: string; expires_at: number }>
    const cached = cachedRows?.[0]
    if (cached && cached.expires_at > now) return cached.access_token
  }

  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(appSecret)}`
  )
  const result = await response.json() as WechatTokenResponse
  if (!response.ok || !result.access_token) {
    throw new Error(result.errmsg || `微信 access_token 获取失败：HTTP ${response.status}`)
  }

  const expiresAt = now + Math.max(60, (result.expires_in || 7200) - TOKEN_EXPIRY_BUFFER_SECONDS)
  await db.prepare(
    `INSERT INTO wechat_access_token_cache (id, access_token, expires_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(id) DO UPDATE SET access_token = excluded.access_token,
       expires_at = excluded.expires_at, updated_at = CURRENT_TIMESTAMP`
  ).bind(TOKEN_CACHE_ID, result.access_token, expiresAt).run()
  return result.access_token
}

async function sendTemplateMessage(token: string, toolName: string, action: 'enter' | 'leave', pageUrl: string, ip: string, region: string) {
  const message = action === 'enter' ? `有人使用${pageUrl}` : `离开${pageUrl}`
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      touser: WECHAT_OPENID,
      template_id: WECHAT_TEMPLATE_ID,
      url: pageUrl,
      topcolor: '#FF0000',
      data: {
        ip: { value: ip, color: '#173177' },
        region: { value: region, color: '#173177' },
        content: { value: `${message}`, color: '#2dc26b' },
        date: { value: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }), color: '#173177' }
      }
    })
  })
  const result = await response.json() as { errcode?: number; errmsg?: string }
  if (!response.ok || (result.errcode !== undefined && result.errcode !== 0)) {
    throw Object.assign(new Error(result.errmsg || `微信模板消息发送失败：HTTP ${response.status}`), { errcode: result.errcode })
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<NotifyBody>(event).catch(() => null)
  if (!body || (body.action !== 'enter' && body.action !== 'leave')) {
    throw createError({ statusCode: 400, statusMessage: '无效的通知类型' })
  }

  const toolName = typeof body.toolName === 'string' ? body.toolName.trim().slice(0, 100) : ''
  if (!toolName || typeof body.pageUrl !== 'string') {
    throw createError({ statusCode: 400, statusMessage: '工具名称或页面地址无效' })
  }

  let pageUrl: URL
  try {
    pageUrl = new URL(body.pageUrl)
  } catch {
    throw createError({ statusCode: 400, statusMessage: '页面地址无效' })
  }
  if (pageUrl.origin !== getRequestURL(event).origin || !['http:', 'https:'].includes(pageUrl.protocol)) {
    throw createError({ statusCode: 400, statusMessage: '只能通知本站页面' })
  }
  pageUrl.hash = ''
  if (pageUrl.hostname === 'localhost') return { success: true, skipped: true }

  const ip = getHeader(event, 'cf-connecting-ip')
    || getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || '未知'
  const cf = event.context.cf || event.context.cloudflare?.request?.cf
  const region = [cf?.city, cf?.region, cf?.country].filter(Boolean).join('，') || '未知'

  const db = useDatabase('myDatabase')
  try {
    let token = await getAccessToken(db, WECHAT_APP_ID, WECHAT_APP_SECRET)
    try {
      await sendTemplateMessage(token, toolName, body.action, pageUrl.toString(), ip, region)
    } catch (error) {
      if ((error as { errcode?: number }).errcode !== 40001) throw error
      await db.prepare('DELETE FROM wechat_access_token_cache WHERE id = ?').bind(TOKEN_CACHE_ID).run()
      token = await getAccessToken(db, WECHAT_APP_ID, WECHAT_APP_SECRET, true)
      await sendTemplateMessage(token, toolName, body.action, pageUrl.toString(), ip, region)
    }
    return { success: true }
  } catch (error) {
    console.error('WeChat tool notification failed', error)
    return { success: false }
  }
})