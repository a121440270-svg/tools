import { useUser } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  defineNuxtRouteMiddleware((to) => {
    const user = useUser().value
    const protectedRoutes = ['/blog/post', '/profile']
    
    if (!user?.id && protectedRoutes.includes(to.path)) {
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.path)}`)
    }
  })
})