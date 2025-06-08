// server/api/tools.post.ts
import { createTool } from '~/server/dao/tools';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, route, description } = body;
  await createTool({ name, route, description });
  return { success: true };
});
