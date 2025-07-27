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

  document.head.appendChild(script1)
  document.head.appendChild(script2)
})


