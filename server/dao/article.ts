import type { Article } from '../db/schema';
import { select, insert, update, remove, selectCon } from '../db/orm';


const TABLE = 'article';

export async function findArticles(where?: Partial<Article> & { page?: number, pageSize?: number, sort?: string }) {
  const query = selectCon('article');
  const { page = 1, pageSize = 10, sort = 'hits', ...filters } = where || {};

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
  return selectCon('article').where('id', '=', id).all<Article>();
}

export function createArticle(data: Pick<Article, 'content'> & Partial<Pick<Article, 'description'>>) {
  return insert<Article>(TABLE, data);
}
