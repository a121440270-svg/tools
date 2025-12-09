import { imgDao } from '../../dao/ImgDao'

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'filename')// 注意这里路由只会匹配到第一个参数
  const id = Number(idParam) 
  if (!id || isNaN(id)) {
    return { status: 400, error: 'invalid id' }
  }

  // 查出记录，尝试删除存储（R2）对象
  const { success, record, error, code } = await imgDao.deleteById(id)

  // 如果 DAO 返回表示存在关联的错误，直接返回 409
  if (!success) {
    if (code === 409) {
      return { status: 409, success: false, error: error || '存在关联，不能删除' }
    }
    return { status: 400, success: false, error: error || '删除失败' }
  }

  // 成功删除 DB 记录后，异步尝试删除对象存储（best-effort）
  try {
    const path = record?.path
    const r2 = event.context.cloudflare?.env?.imgbucket
    if (path && r2) {
      try {
        if (typeof r2.delete === 'function') {
          await r2.delete(path)
        } else if (typeof r2.deleteObject === 'function') {
          await r2.deleteObject(path)
        }
      } catch (e) {
        console.warn('r2 delete failed', e)
      }
    }
  } catch (err) {
    console.warn('delete cleanup error', err)
  }

  return { status: 200, success: true }
})
