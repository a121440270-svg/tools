export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const { id } = getRouterParams(event)

  switch (event.method) {
    case 'GET':
      return db.select().from(tables.pageLang).where(eq(tables.pageLang.id, id)).get()
    
    case 'PUT':
      const body = await readBody(event)
      return db.update(tables.pageLang)
        .set(body)
        .where(eq(tables.pageLang.id, id))
        .returning()

    case 'DELETE':
      return db.delete(tables.pageLang)
        .where(eq(tables.pageLang.id, id))
        .returning()
  }
})