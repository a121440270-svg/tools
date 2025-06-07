// import { useDrizzle } from '~/server/db/drizzle'
// import { users } from '@/server/db/schema';
// import { drizzle } from 'drizzle-orm/d1';

// // export default defineEventHandler(async (event) => {
// //   const db = useDrizzle()
// //   const result = await db.select().from(users)
// //   return Response.json(result);
// // });


// interface Env {
//   DB: D1Database; // 👈 这里要与你的 wrangler.toml 中绑定一致
// }
// export default defineEventHandler(async (event) => {
//   try{
//   // 获取环境变量（Cloudflare D1 绑定）
//   const env = process.env as unknown as { DB: D1Database };
//   const db = drizzle(env.DB, { schema: { users } });

//   const result = await db.select().from(users);
// console.log(result);
// console.log("hello world");
//   return result;
//   }catch(err){
//     console.log(err);
//     if (err instanceof Error) {
//       console.error('错误信息:', err.message);
//       console.error('堆栈信息:', err.stack);
//     } else {
//       console.error('未知异常:', err);
//     }
//   }
// });
