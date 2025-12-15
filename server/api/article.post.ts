// server/api/tools.post.ts
import { createArticle,updateArticle } from '~/server/dao/articleDao';
import {  imgDao } from '../dao/imgDao';

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
  let id = Number(body.id)
  if (id && !Number.isNaN(id) && id > 0) {
     await updateArticle(body as any)
  }else{
    // 保存主表 Article
    const createdId = await createArticle(body as any);
    if (createdId === undefined || createdId === null) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create article' });
    }
    id = createdId;
  }
  await imgDao.linkImagesToTarget(id, 'article', body.relImgs);
  return { success: true,id:id };
});
