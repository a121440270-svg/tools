import { findArticles } from '~/server/dao/article';
import { getCookie, getQuery, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const lang = getCookie(event, 'i18n_redirected') || 'en';
  console.log(lang)
  const query = getQuery(event); // 获取 URL 查询参数
  query.lang = lang; // 添加语言过滤条件
  console.log('查询条件:', query)
  const tools = await findArticles(query); // 直接传入 Partial<Tool>
  // return tools;
  console.log( '结果:', tools)
  return tools || []
});
