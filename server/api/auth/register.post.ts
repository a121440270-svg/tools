import { defineEventHandler, readBody } from 'h3'
import { select, insert } from '../../db/orm'
import type { User } from '../../db/schema'
import { randomBytes } from 'crypto'
import { sendMail } from '../../utils/sendMail' // 你需要实现此工具函数

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, psw, name } = body
  if (!email || !psw) {
    return { error: '邮箱和密码必填' }
  }
  // 检查邮箱是否已注册
  const exist = await select<User>('users', { email })
  if (exist.length > 0) {
    return { error: '该邮箱已注册' }
  }
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  // 生成激活码
  const active_code = randomBytes(16).toString('hex')
  await insert<User>('users', {
    email,
    psw,
    name: name || '佚名',
    create_time: now,
    last_active_time: now,
    avatar: 'noavatar.gif',
    paymentcode: 'nopaymentcode.png',
    is_active: 0,
    points: 0,
    amount: 0.00,
    active_code
  })
  // 发送激活邮件
  const site = 'OnliTool'
  const link = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/activate?email=${encodeURIComponent(email)}&code=${active_code}`
  await sendMail({
    to: email,
    subject: `${site}账号激活`,
    html: `<div>欢迎注册${site}，请点击下方链接激活账号：<br><a href="${link}">${link}</a><br>如果无法点击，请复制到浏览器打开。</div>`
  })
  return { success: true }
})
