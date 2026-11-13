import { getHeader, type H3Event } from 'h3'

type WechatBindings = {
  WECHAT_APP_ID?: string
  WECHAT_APP_SECRET?: string
  WECHAT_OPENID?: string
  WECHAT_TEMPLATE_ID?: string
  WECHAT_NOTIFY_TOOL_ACCESS?: string
  WECHAT_NOTIFY_FEATURE_REQUEST?: string
}

type WechatNotification =
  | { type: 'tool'; action: 'enter' | 'leave'; toolName: string; pageUrl: string }
  | { type: 'feature-request'; message: string; email: string; pageUrl: string }

type WechatTokenResponse = {
  access_token?: string
  expires_in?: number
  errcode?: number
  errmsg?: string
}

const TOKEN_CACHE_ID = 1
const TOKEN_EXPIRY_BUFFER_SECONDS = 300

function getBindings(event: H3Event): WechatBindings {
  const cloudflareEnv = event.context.cloudflare?.env as WechatBindings | undefined
  if (cloudflareEnv) return cloudflareEnv
  if (typeof process === 'undefined') return {}
  return {
    WECHAT_APP_ID: process.env.WECHAT_APP_ID,
    WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET,
    WECHAT_OPENID: process.env.WECHAT_OPENID,
    WECHAT_TEMPLATE_ID: process.env.WECHAT_TEMPLATE_ID,
    WECHAT_NOTIFY_TOOL_ACCESS: process.env.WECHAT_NOTIFY_TOOL_ACCESS,
    WECHAT_NOTIFY_FEATURE_REQUEST: process.env.WECHAT_NOTIFY_FEATURE_REQUEST
  }
}

export function isToolAccessNotificationEnabled(event: H3Event): boolean {
  return getBindings(event).WECHAT_NOTIFY_TOOL_ACCESS === 'true'
}

export function isFeatureRequestNotificationEnabled(event: H3Event): boolean {
  return getBindings(event).WECHAT_NOTIFY_FEATURE_REQUEST !== 'false'
}

async function getAccessToken(
  db: ReturnType<typeof useDatabase>,
  appId: string,
  appSecret: string,
  forceRefresh = false
) {
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

async function sendTemplateMessage(
  event: H3Event,
  token: string,
  templateId: string,
  notification: WechatNotification
) {
  const ip = getHeader(event, 'cf-connecting-ip')
    || getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || '未知'
  const cf = event.context.cf || event.context.cloudflare?.request?.cf
  const region = [cf?.city, cf?.region, cf?.country].filter(Boolean).join('，') || '未知'
  const content = notification.type === 'tool'
    ? notification.action === 'enter' ? `有人使用${notification.pageUrl}` : `离开${notification.pageUrl}`
    : `收到新需求：${notification.message.slice(0, 300)}`

  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      touser: getBindings(event).WECHAT_OPENID,
      template_id: templateId,
      url: notification.pageUrl,
      topcolor: '#FF0000',
      data: {
        ip: { value: ip, color: '#173177' },
        region: { value: notification.type === 'feature-request' && notification.email ? `邮箱：${notification.email}` : region, color: '#173177' },
        content: { value: content, color: '#2dc26b' },
        date: { value: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }), color: '#173177' }
      }
    })
  })
  const result = await response.json() as { errcode?: number; errmsg?: string }
  if (!response.ok || (result.errcode !== undefined && result.errcode !== 0)) {
    throw Object.assign(new Error(result.errmsg || `微信模板消息发送失败：HTTP ${response.status}`), { errcode: result.errcode })
  }
}

export async function sendWechatNotification(event: H3Event, notification: WechatNotification) {
  const env = getBindings(event)
  const { WECHAT_APP_ID: appId, WECHAT_APP_SECRET: appSecret, WECHAT_OPENID: openId, WECHAT_TEMPLATE_ID: templateId } = env
  if (!appId || !appSecret || !openId || !templateId) {
    throw new Error('微信通知未配置完整的 WECHAT_APP_ID、WECHAT_APP_SECRET、WECHAT_OPENID 和 WECHAT_TEMPLATE_ID')
  }

  const db = useDatabase('myDatabase')
  let token = await getAccessToken(db, appId, appSecret)
  try {
    await sendTemplateMessage(event, token, templateId, notification)
  } catch (error) {
    if ((error as { errcode?: number }).errcode !== 40001) throw error
    await db.prepare('DELETE FROM wechat_access_token_cache WHERE id = ?').bind(TOKEN_CACHE_ID).run()
    token = await getAccessToken(db, appId, appSecret, true)
    await sendTemplateMessage(event, token, templateId, notification)
  }
}
