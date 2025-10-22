import { defineEventHandler, readBody } from 'h3'
import { select } from '../../db/orm'
import type { User } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, psw } = body
  if (!email || !psw) {
    return { error: '邮箱和密码必填' }
  }
  const users = await select<User>('users', { email, psw })
  if (users.length === 0) {
    return { error: '账号或密码错误' }
  }
  // 更新最后活跃时间
  // 可选：await update('users', { last_active_time: new Date().toISOString().slice(0, 19).replace('T', ' ') }, { id: users[0].id })
  
  // 不返回密码等敏感字段
    const user = users[0]
  const safeUser = { ...user } as any
  delete safeUser.psw
  return safeUser
})