// Monetag (rotating domains such as 5gvci.com / eechicha.com) was removed from
// this site, but visitors who allowed browser notifications while it was live
// still have Monetag's service worker registered on this origin
// (`/sw.js?...&p=<zone>&tg=0`) plus an active push subscription, so the
// notification ads keep arriving from the browser itself long after the tag is
// gone. Nothing on this site registers a service worker, so any registration
// found here is a leftover from that period and can be dropped.
const CLEANUP_KEY = 'legacy_push_cleanup_v1'

async function dropLegacyPush() {
  let registrations: readonly ServiceWorkerRegistration[] = []
  try {
    registrations = await navigator.serviceWorker.getRegistrations()
  } catch {
    return
  }

  let unregistered = 0
  for (const registration of registrations) {
    try {
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) await subscription.unsubscribe()
    } catch {
      // Push may be unavailable or the permission already revoked; unregistering
      // the worker still stops the notification ads.
    }
    try {
      if (await registration.unregister()) unregistered += 1
    } catch {
      // Ignore: the worker may already be redundant.
    }
  }

  if (unregistered > 0) {
    console.info(`[cleanup] removed ${unregistered} legacy service worker(s)`)
  }
  try {
    localStorage.setItem(CLEANUP_KEY, '1')
  } catch {
    // Storage may be blocked; the cleanup is simply retried next visit.
  }
}

export default defineNuxtPlugin(() => {
  if (import.meta.server || import.meta.dev) return
  if (!('serviceWorker' in navigator)) return

  try {
    if (localStorage.getItem(CLEANUP_KEY)) return
  } catch {
    // Without storage we cannot remember the result, so run the check anyway.
  }

  const run = () => {
    window.setTimeout(() => {
      void dropLegacyPush()
    }, 3000)
  }

  if (document.readyState === 'complete') run()
  else window.addEventListener('load', run, { once: true })
})
