// server/api/tools.post.ts
import { createArticle } from '~/server/dao/article';

export default defineEventHandler(async (event) => {
  const lang = getHeader(event, 'accept-language')?.split(',')[0] || 'en';
  console.log(lang)
  const body = await readBody(event);
  if(null==body.title||''===body.title.trim()){
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    });
  }
  body.posted_time = new Date().toISOString();
  body.last_mod_time = new Date().toISOString();
  body.author_id = 1;
  await createArticle(body);
  return { success: true };
});
