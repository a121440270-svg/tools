import { defineEventHandler, readMultipartFormData } from 'h3'
import { insert, select } from '~/server/db/orm'
import type { Img } from '~/server/models/img'

export default defineEventHandler(async (event) => {
  // 解析 multipart/form-data
  const files = await readMultipartFormData(event)
  const file = files?.find(f => f.name === 'file')

  if (!file) {
    return { success: false, error: 'No file uploaded' }
  }

  // 获取 Cloudflare R2 绑定
  const r2 = event.context.cloudflare?.env?.imgbucket
  if (!r2) return { success: false, error: 'R2 binding not found' }

  // 生成唯一文件名
  const ext = file.filename?.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  // 上传到 R2（file.data 是 Buffer/Uint8Array）
  await r2.put(filename, file.data, { httpMetadata: { contentType: file.type } })

  // const url = `https://imgbucket.example.com/${filename}`

  const url = filename
  // 保存到 img 表
  const imgObj: Partial<Img> = {
    name: filename,
    path: url,
    type: file.type,
    relId: 0,
    alt: '',
    createAt: new Date().toISOString(),
    isDel: false
  }
  await insert<Img>('img', imgObj)
  // 查询刚插入的图片（按 path 唯一）
  const imgs = await select<Img>('img', { path: url })
  const img = imgs && imgs.length > 0 ? imgs[0] : null
  return { id: img?.id, name: filename }
})
