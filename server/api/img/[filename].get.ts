// /api/file?name=xxx.jpg - 用于读取 R2 上的图片并返回
export default defineEventHandler(async (event) => {
   const name = getRouterParam(event, 'filename') 
  if (!name) return new Response('Not Found', { status: 404 })

  // 获取 R2 绑定
  const r2 = event.context.cloudflare?.env?.imgbucket
  if (!r2) return new Response('R2 binding not found', { status: 500 })

  // 获取文件内容
  const obj = await r2.get(name)
  if (!obj || !obj.body) return new Response('File not found', { status: 404 })

  // 返回图片流
  return new Response(obj.body, {
    status: 200,
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400'
    }
  })
})

