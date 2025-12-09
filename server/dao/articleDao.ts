import type { Article,ArticleL } from '../db/schema';
import { insert, update, selectCon } from '~/server/db/orm';


const TABLE = 'article';

export async function findArticles(where?: Partial<Article> & { page?: number, pageSize?: number, sort?: string
  , title?: string, content?: string, lang?: string }) {
  const query = selectCon('article')
  .select(['t.id','t.hits','t.type','t.chapter','t.posted_time',
    't.last_mod_time','t.author_id','t.toc_id','t.status','t.fee','l.title','l.content','l.slug'])
  .fromAlias('t')
  .join('article_l l', 't.id = l.article_id');
  const { page = 1, pageSize = 10, sort = 'hits', ...filters } = where || {};

  query.where('l.lang_code', '=', where?.lang || 'en');
  query.where('published_at', '<=',(new Date()).toISOString());
  delete filters.lang;
  // 添加 where 条件
  Object.entries(filters).forEach(([k, v]) => {
    query.where(k, '=', v);
  });

  // 排序字段白名单
  const sortFields = ['hits', 'posted_time', 'id'];
  const orderBy = sortFields.includes(sort) ? sort : 'hits';
  query.orderBy(orderBy, 'DESC');

  // 分页
  query.limit(Number(pageSize)).offset((Number(page) - 1) * Number(pageSize));

  // 查询数据
  const list = await query.all<Article>();

  // 统计总数
  const countQuery = selectCon('article');
  Object.entries(filters).forEach(([k, v]) => {
    countQuery.where(k, '=', v);
  });
  countQuery.count();
  const [{ count }] = await countQuery.all<{ count: number }>();

  return { list, total: count };
}

export function findArticleById(id: number) {
  return selectCon('article')
  .select(['t.id','t.hits','t.type','t.chapter','t.posted_time',
    't.last_mod_time','t.author_id','t.toc_id','t.status','t.fee','l.title','l.content'])
  .fromAlias('t')
  .join('article_l l', 't.id = l.article_id')
  .where('t.id', '=', id).all<Article>();
}
export async function findArticleByIdAndLang(id: number,lang: string) {
  const article = await selectCon('article').where('id', '=', id).one<Article>();
  const articlel = await selectCon('article_l')
                .where('article_id', '=', id)
                .where('lang_code', '=', lang).one<ArticleL>();
  return { article:article,articlel:articlel };
}
export async function findArticlelByIdAndLang(id: number,lang: string) {
  return await selectCon('article_l')
                .where('article_id', '=', id)
                .where('lang_code', '=', lang).one<ArticleL>();
}
export async function createArticle(body: any) {
  // prepare Article and ArticleL instances with sensible defaults
    const now = new Date().toISOString()
    // parse publishTime safely — only set published_at when a valid date is provided
    let publishedAt: string | undefined = undefined
    if (body && body.publishTime) {
      const _d = new Date(body.publishTime)
      if (!Number.isNaN(_d.getTime())) publishedAt = _d.toISOString()
    }

    const article: Partial<Article> = {
      hits: 0,
      type: body.type ?? 'original',
      chapter: body.chapter ?? 0,
      posted_time: now,
      last_mod_time: now,
      author_id: 1,
      published_at: publishedAt
    }
  if(!body.id){
    article.last_mod_time = now
  }else{
    article.posted_time = now
    article.last_mod_time = now
  }
    const articleL: Partial<ArticleL> = {
      lang_code: (body.lang_code || body.language[0] || 'en'),
      title: '',
      content: '',
      keywords: body.keywords || '',
      description: body.metaDescription || body.description || ''
    }
  
    // map properties from body into article/articleL when names match
    Object.keys(body).forEach((k) => {
      const v = body[k]
      if (Object.prototype.hasOwnProperty.call(article, k)) {
        ;(article as any)[k] = v
      }
      if (Object.prototype.hasOwnProperty.call(articleL, k)) {
        ;(articleL as any)[k] = v
      }
    })
  
    // ensure posted_time/last_mod_time and author
    article.posted_time = article.posted_time || now
    article.last_mod_time = article.last_mod_time || now
    article.author_id = article.author_id || 1
  
    const insertRes = await insert<Article>(TABLE, article) as any;
    // try to extract inserted id from common return shapes (results[0].id, insertId) or fall back to article.id
    let id: number | undefined;
    if (insertRes && Array.isArray(insertRes.results) && insertRes.results.length > 0 && insertRes.results[0] && typeof insertRes.results[0].id === 'number') {
      id = insertRes.results[0].id;
    } else if (insertRes && typeof insertRes.insertId === 'number') {
      id = insertRes.insertId;
    } else if ((article as any).id && typeof (article as any).id === 'number') {
      id = (article as any).id;
    }


  // 尝试保存多语言表（如果表存在）——best-effort，不要阻塞主流程
  try {
    // 优先使用 article.id，其次使用 insert 返回的 id（如果有）
    if (typeof (article as any).id === 'number') {
      articleL.article_id = (article as any).id;
    } else if (typeof id === 'number') {
      articleL.article_id = id;
    } else {
      // leave undefined if we couldn't determine id
      articleL.article_id = undefined as any;
    }
    await insert<ArticleL>('article_l', articleL as any)
  } catch (e) {
    // 如果没有 article_l 表或插入失败，记录但不抛出
    console.warn('insert article_l failed', e)
  }
  return id;
}

export async function updateArticle(body: any) {
  if (!body) {
    throw new Error('updateArticle requires body with id')
  }
  const id = Number(body.id)
  if (!id || Number.isNaN(id) || id <= 0) {
    throw new Error('updateArticle requires body.id > 0')
  }
  const now = new Date().toISOString()

  // prepare updatable article fields (use same keys as createArticle defaults)
  // parse publishTime safely for updates as well
  let publishedAt: string | undefined = undefined
  if (body && body.publishTime) {
    const _d = new Date(body.publishTime)
    if (!Number.isNaN(_d.getTime())) publishedAt = _d.toISOString()
  }

  const articleDefaults: Partial<Article> = {
    hits: 0,
    type: body.type ?? 'original',
    chapter: body.chapter ?? 0,
    last_mod_time: now,
    author_id: 1,
    published_at: publishedAt
  }

  const articleUpdate: Record<string, any> = {}
  // map only known keys from body into update object
  Object.keys(articleDefaults).forEach(k => {
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      articleUpdate[k] = (body as any)[k]
    }
  })
  // always update last_mod_time
  articleUpdate.last_mod_time = now

  // perform article update
  try {
    await update<Article>(TABLE, articleUpdate, { id })
  } catch (e) {
    console.error('update article failed', e)
    throw e
  }

  // handle localized row
  const lang = (body.lang_code || (Array.isArray(body.language) ? body.language[0] : body.language) || 'en')
  const articleLDefaults: Partial<ArticleL> = {
    lang_code: lang,
    title: '',
    content: '',
    keywords: body.keywords || '',
    description: body.metaDescription || body.description || ''
  }

  // build article_l payload from body
  const articleLPayload: Record<string, any> = {
    lang_code: lang,
    title: body.title || undefined,
    content: body.content || undefined,
    keywords: body.keywords || undefined,
    description: body.metaDescription || body.description || undefined,
    article_id: id
  }

  // check if localized row exists
  try {
    const exist = await selectCon('article_l').where('article_id', '=', id).where('lang_code', '=', lang).one<ArticleL>()
    if (exist) {
      // prepare update object only with provided fields
      const updateL: Record<string, any> = {}
      Object.keys(articleLPayload).forEach(k => {
        if (articleLPayload[k] !== undefined && k !== 'article_id') updateL[k] = articleLPayload[k]
      })
      if (Object.keys(updateL).length > 0) {
        await update<ArticleL>('article_l', updateL, { article_id: id, lang_code: lang })
      }
    } else {
      // create new localized row
      const insertL: any = {}
      Object.keys(articleLDefaults).forEach(k => insertL[k] = (articleLPayload[k] !== undefined ? articleLPayload[k] : (articleLDefaults as any)[k]))
      insertL.article_id = id
      await insert<ArticleL>('article_l', insertL)
    }
  } catch (e) {
    console.warn('update/insert article_l failed', e)
  }

  return { success: true, id }
}
