import {findArticlelByIdAndLang } from '~/server/dao/article';
import { getCookie, getQuery, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event); // 获取 URL 查询参数
  // 获取 id，可以来自查询参数或路由参数
  const id = Number((query as any)?.id ?? event.context?.params?.id);
  if (!id || Number.isNaN(id)) {
    console.warn('Missing or invalid id', query);
    return [];
  }
  // 获取语言优先级：查询参数 -> cookie -> 请求头 -> 默认 'en'
  const lang = (query as any)?.lang ?? getCookie(event, 'lang') ?? getHeader(event, 'accept-language') ?? 'en';
  console.log('查询条件:', { ...query, id, lang })
  const tools = await findArticlelByIdAndLang(id, lang); // 传入 id 和 lang 两个参数
  // return tools;
  console.log( '结果:', tools)
  return tools || []
});
