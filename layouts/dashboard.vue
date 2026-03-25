<template>
  <div class="flex h-screen overflow-hidden bg-slate-100">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main content -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Top header -->
      <header class="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shrink-0">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-semibold text-slate-800">{{ pageTitle }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500">{{ userEmail }}</span>
          <UAvatar :alt="userEmail" size="sm" class="ring-2 ring-emerald-500/30" />
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const { fetchCompany } = useCompany()

const userEmail = computed(() => user.value?.email || '')

const pageTitles: Record<string, string> = {
  '/facturacion': 'Facturación',
  '/ugranjas': 'uGranjas',
  '/sedes': 'Sedes',
  '/reportes': 'Reportes',
}

const pageTitle = computed(() => pageTitles[route.path] || 'Dashboard')

onMounted(() => fetchCompany())
</script>
