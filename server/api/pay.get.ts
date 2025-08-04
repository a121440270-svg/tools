export default defineEventHandler(async (event) => {
  // const res = await $fetch('https://test-api.creem.io/v1/checkouts', {
  //   headers: { "x-api-key": `creem_test_8darAONLDAVz0WzRHqHnH` },
  //   method: 'POST',
  //   body: {
  //     product_id: 'prod_CKbVy0Z0qlFiJOW49Lv3g',
  //   }
  // });
  // const res = await $fetch('https://api.creem.io/v1/checkouts', {
  //   headers: { "x-api-key": `creem_6VDKMvuLMXCxi97LQaVsjE` },
  //   method: 'POST',
  //   body: {
  //     product_id: 'prod_7UQhI3nH8LPVKqwlgJdRrC',
  //   }
  // });
  const res = await $fetch('https://api.creem.io/v1/checkouts', {
    headers: { "x-api-key": `creem_7Liafq8VgFDL1VhzmeXy8x` },
    method: 'POST',
    body: {
      product_id: 'prod_5GNiWC5z27K9ulR3W7m5gm',
    }
  });
  return res ;
});
