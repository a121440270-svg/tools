export default defineEventHandler(async (event) => {
    const timestamp = new Date().toISOString();

    console.log({
        path: event.path,
        timestamp,
    });

  
    if (event.path === '/api') {
        const itemsLength = Math.floor(Math.random() * 5) + 1;
        const items = Array.from({ length: itemsLength }, (_, i) => ({
            id: i + 1,
            name: `商品${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
            price: Math.floor(Math.random() * 10000)
        }));

        return {
            timestamp,
            data: {
                items,
                total: itemsLength
            }
        };
    }
    if (event.path === '/api/hello') {
        return {
            timestamp,
            data: {
                message: 'Hello World!'
            }
        };
    }
});
