export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  if (to.path === '/login') {
    if (user.value) return navigateTo('/facturacion')
    return
  }

  if (to.path === '/') {
    return navigateTo(user.value ? '/facturacion' : '/login')
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
