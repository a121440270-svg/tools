// Google Analytics is only loaded after the visitor explicitly opts in to
// analytics cookies. The consent state is shared with components/PrivacyConsent.vue
// through the `cookie_consent` localStorage entry and the `consent-updated` event.
const GA_ID = 'G-NP4XQJQRNQ'
const CONSENT_KEY = 'cookie_consent'

type Consent = {
  necessary?: boolean
  analytics?: boolean
  ads?: boolean
}

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? (JSON.parse(raw) as Consent) : null
  } catch {
    return null
  }
}

let gaLoaded = false

function loadAnalytics() {
  if (gaLoaded) return
  gaLoaded = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  const inline = document.createElement('script')
  inline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });
  `
  document.head.appendChild(inline)
}

function syncConsent() {
  const consent = readConsent()
  if (consent?.analytics) loadAnalytics()
}

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  syncConsent()
  window.addEventListener('consent-updated', syncConsent)
})
