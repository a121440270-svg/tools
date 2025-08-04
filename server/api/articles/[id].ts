import { findArticleById } from '~/server/dao/article';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    return { error: 'Missing article id' };
  }
  const article = await findArticleById(Number(id));
  if (!article) {
    return { error: 'Article not found' };
  }
  return article[0];
});
