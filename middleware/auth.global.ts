export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (to.path === '/login') {
    if (session) return navigateTo('/facturacion')
    return
  }

  if (to.path === '/') {
    return navigateTo(session ? '/sedes' : '/login')
  }

  if (!session) {
    return navigateTo('/login')
  }
})
