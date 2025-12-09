import { findPrompts } from '~/server/dao/promptDao'

export default defineEventHandler(async (event) => {
  const url = new URL(event.node.req.url || '', `http://${event.node.req.headers.host || 'localhost'}`)
  const page = Number(url.searchParams.get('page') || '1')
  const pageSize = Number(url.searchParams.get('pageSize') || '10')
  const q = url.searchParams.get('q') || undefined
  const lang = url.searchParams.get('lang') || 'en'
  const res = await findPrompts({ page, pageSize, q, lang })
  return res
})
