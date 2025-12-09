import { defineEventHandler, readBody } from 'h3'
import { imgDao } from '../../dao/ImgDao'

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({})) as any
  const ids: number[] = Array.isArray(body?.ids) ? body.ids.map((v: any) => Number(v)).filter((n: number) => !isNaN(n)) : []
  if (!ids || ids.length === 0) {
    return { success: false, message: 'no ids provided' }
  }

  const r2 = event.context.cloudflare?.env?.imgbucket
  const results: any[] = []

  for (const id of ids) {
    try {
      const { success, record, error, code } = await imgDao.deleteById(id)
      if (!success) {
        results.push({ id, success: false, code, error })
        continue
      }
      // try delete object from R2 (best-effort)
      try {
        const path = record?.path
        if (path && r2) {
          if (typeof r2.delete === 'function') {
            await r2.delete(path)
          } else if (typeof r2.deleteObject === 'function') {
            await r2.deleteObject(path)
          }
        }
      } catch (e) {
        // best-effort; log and continue
        console.warn('r2 delete failed for', id, e)
      }
      results.push({ id, success: true })
    } catch (err) {
      console.error('batch delete error for', id, err)
      results.push({ id, success: false, error: (err as any)?.message || String(err) })
    }
  }

  const failed = results.filter(r => !r.success)
  if (failed.length > 0) {
    return { success: false, message: 'some failed', results }
  }
  return { success: true, message: 'all deleted', results }
})
