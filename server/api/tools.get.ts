import { findTools } from '~/server/db/tools';

export default defineEventHandler(async (event) => {
  const query = getQuery(event); // 获取 URL 查询参数
  const tools = await findTools(query); // 直接传入 Partial<Tool>
  // return tools;
  console.log('查询条件:', query, '结果:', tools)
  return tools || []
});