export default defineEventHandler(async(event)=> {
    try {
        const db = useDatabase("myDatabase");
        const results = await db.prepare(
            "SELECT * FROM tools WHERE name = ?",
        )
            .bind("QR Generator")
            .all();
        return results;
    } catch (error) {
        console.error("Database error:", error);
        // Return default tools if database is unavailable
        return {
            success: false,
            message: "Database not initialized. Please run migrations.",
            tools: [
                { id: 1, name: 'QR Generator', description: 'Generate QR codes', route: '/qr' },
                { id: 2, name: 'URL Shortener', description: 'Shorten URLs', route: '/url-shortener' }
            ]
        };
    }
})