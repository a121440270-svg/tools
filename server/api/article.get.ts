import { findArticles } from '~/server/dao/article';

export default defineEventHandler(async (event) => {
  const query = getQuery(event); // 获取 URL 查询参数
  console.log('查询条件:', query)
  const tools = await findArticles(query); // 直接传入 Partial<Tool>
  // return tools;
  console.log( '结果:', tools)
  return tools || []
});
