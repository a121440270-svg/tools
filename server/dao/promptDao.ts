import { selectCon, insert, update, remove } from '~/server/db/orm'

// Lightweight Prompt type for dao
export interface Prompt {
  id?: number
  title?: string
  ai_app?: string
  ai_app_id?: string
  content?: string
  instructions?: string
  created_at?: string
  updated_at?: string
}

const TABLE = 'prompt'

export async function findPrompts(opts: { page?: number, pageSize?: number, q?: string, lang?: string } = {}) {
  const { page = 1, pageSize = 10, q, lang = 'en' } = opts
  // join with prompt_l to return localized title/content
  const query = selectCon(TABLE).fromAlias('t')
    .join('prompt_l l', 't.id = l.id')
    .select(['t.id','l.title','l.content','t.ai_app','t.created_at','t.updated_at'])
  query.where('l.lang_code', '=', lang)
  if (q) {
    // search against localized title and content
    query.where('l.title', 'LIKE', `%${q}%`)
    // note: if you want OR semantics include additional whereGroup; simple implementation for now
  }
  query.orderBy('t.updated_at', 'DESC')
  query.limit(Number(pageSize)).offset((Number(page) - 1) * Number(pageSize))
  const list = await query.all<any>()

  const countQ = selectCon(TABLE).fromAlias('t').join('prompt_l l', 't.id = l.id')
  countQ.where('l.lang_code', '=', lang)
  if (q) countQ.where('l.title', 'LIKE', `%${q}%`)
  countQ.count()
  const [{ count } = { count: 0 }] = await countQ.all<{ count: number }>()

  return { list, total: count }
}

export function findPromptById(id: number, lang = 'en') {
  return selectCon(TABLE)
    .fromAlias('t')
    .join('prompt_l l', 't.id = l.id')
    .select(['t.id','l.title','l.content','l.instructions','t.ai_app','t.created_at','t.updated_at'])
    .where('t.id', '=', id)
    .where('l.lang_code', '=', lang)
    .one<any>()
}

export function createPrompt(payload: Partial<Prompt>) {
  const now = new Date().toISOString()
  const p: any = Object.assign({}, payload)
  p.created_at = now
  p.updated_at = now
  return insert(TABLE, p)
}

export function updatePrompt(id: number, payload: Partial<Prompt>) {
  const p: any = Object.assign({}, payload)
  p.updated_at = new Date().toISOString()
  return update(TABLE, p, { id })
}

export function deletePrompt(id: number) {
  return remove(TABLE, { id })
}
