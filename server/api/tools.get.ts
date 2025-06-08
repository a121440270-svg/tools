// import { findTools } from '~/server/db/tools';

// export default defineEventHandler(async (event) => {
//   const query = getQuery(event); // 获取 URL 查询参数
//   console.log('查询条件:', query)
//   const tools = await findTools(query); // 直接传入 Partial<Tool>
//   // return tools;
//   console.log( '结果:', tools)
//   return tools || []
// });

import { selectCon } from '../db/orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const builder = selectCon('tools');

  if (query.name) builder.where('name', 'LIKE', `%${query.name}%`);
  if (query.keywords) builder.orWhere('description', 'LIKE', `%${query.keywords}%`);
  if (query.route) builder.where('route', '=', query.route);

  builder.groupBy('route').limit(10).offset(0);
  return await builder.all();
});