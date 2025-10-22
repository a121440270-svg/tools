// server/api/tools.post.ts
import { createArticle,updateArticle } from '~/server/dao/article';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if(null==body.title||''===body.title.trim()){
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    });
  }
    if (!body) {
    throw new Error('updateArticle requires body with id')
  }
  const id = Number(body.id)
  if (id && !Number.isNaN(id) && id > 0) {
     await updateArticle(body as any)
  }else{
    // 保存主表 Article
  await createArticle(body as any)
  }
  

  return { success: true };
});
