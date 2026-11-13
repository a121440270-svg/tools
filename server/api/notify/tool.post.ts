import { createError, defineEventHandler, readBody, getRequestURL } from 'h3'
import { isToolAccessNotificationEnabled, sendWechatNotification } from '../../utils/wechatNotification'

type NotifyBody = {
  action?: 'enter' | 'leave'
  toolName?: string
  pageUrl?: string
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
  if (!isToolAccessNotificationEnabled(event)) return { success: true, skipped: true }

  try {
    await sendWechatNotification(event, {
      type: 'tool',
      action: body.action,
      toolName,
      pageUrl: pageUrl.toString()
    })
    return { success: true }
  } catch (error) {
    console.error('WeChat tool notification failed', error)
    return { success: false }
  }
})