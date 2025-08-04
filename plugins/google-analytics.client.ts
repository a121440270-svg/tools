// plugins/google-analytics.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  const id = 'G-NP4XQJQRNQ' // 替换为你的 GA ID

  const script1 = document.createElement('script')
  script1.setAttribute('async', '')
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`

  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `
  const script3 = document.createElement('script')
  script3.setAttribute('async', '')
  script3.setAttribute('data-cfasync', 'false')
  script3.src = `https://eechicha.com/act/files/tag.min.js?z=9641647`

  // const script4 = document.createElement('script')
  // script4.setAttribute('async', '')
  // script4.setAttribute('data-cfasync', 'false')
  // script4.setAttribute('data-zone', '160318')
  // script4.src = `https://fpyf8.com/88/tag.min.js`

  document.head.appendChild(script1)
  document.head.appendChild(script2)
  document.head.appendChild(script3)
  // document.head.appendChild(script4)
})


