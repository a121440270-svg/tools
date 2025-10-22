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
   if (!body || !body.id) {
     await updateArticle(body as any)
  }else{
    // 保存主表 Article
  await createArticle(body as any)
  }
  

  return { success: true };
});
