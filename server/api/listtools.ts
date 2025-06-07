export default defineEventHandler(async(event)=> {

    const db = useDatabase("myDatabase");

    // const users = await db.sql`SELECT * FROM tools`;
    
    // return users.rows;
    const results  = await db.prepare(
        "SELECT * FROM tools WHERE name = ?",
      )
        .bind("QR Generator")
        .all();
    return results;

})