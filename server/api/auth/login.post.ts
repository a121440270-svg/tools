import * as schema from '@/server/db/schema';

// import { useDrizzle } from '~/server/db/drizzle'

// export default defineEventHandler(async (event) => {
//   const db = useDrizzle()
//   const { email, psw } = await readBody(event)
  
//   const user = await db.query.users.findFirst({
//     where: (users, { eq }) => eq(users.email, email)
//   })

//   if (!user || !await bcrypt.compare(psw, user.psw)) {
//     throw createError({ statusCode: 401, message: 'Invalid credentials' })
//   }

//   return user
// })