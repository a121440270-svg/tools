import { defineEventHandler } from 'h3'
import { select, update } from '../../db/orm'
import type { User } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { email, code } = query
  if (!email || !code) {
    return { error: '参数缺失' }
  }
    console.log("===================")
  console.log(JSON.stringify(email))
  console.log(JSON.stringify(code))
  const users = await select<User>('users', { email })
  console.log("===================")
  console.log(JSON.stringify(email))
  console.log(JSON.stringify(code))
  console.log(JSON.stringify(users))
  if (!users.length) {
    return { error: '用户不存在' }
  }
  if (users[0].active_code !== code) {
    return { error: '激活码错误' }
  }
  await update('users', { is_active: 1 }, { id: users[0].id })
  return { success: true }
}
)
