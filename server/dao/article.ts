import type { Article } from '../db/schema';
import { select, insert, update, remove, selectCon } from '../db/orm';


const TABLE = 'article';

export function findArticles(where?: Partial<Article>) {
  const query = selectCon('article');
  if (where) {
    Object.entries(where).forEach(([k, v]) => {
      query.where(k, '=', v);
    });
  }
  return query.all<Article>();
}

export function findArticleById(id: number) {
  return selectCon('article').where('id', '=', id).all<Article>();
}

export function createArticle(data: Pick<Article, 'content'> & Partial<Pick<Article, 'description'>>) {
  return insert<Article>(TABLE, data);
}
