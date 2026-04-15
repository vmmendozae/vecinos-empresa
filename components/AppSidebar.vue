<template>
  <aside
    class="flex flex-col w-64 shrink-0 h-full overflow-y-auto"
    style="background-color: #120a22"
  >
    <!-- Logo -->
    <div class="flex items-center justify-center px-5 h-16 border-b shrink-0" style="border-color: #2a1850">
      <div class="leading-tight">
       <img src="public/logo-dark-v.png" class="h-8" alt="">
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <p class="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style="color: #4a3868">
        Principal
      </p>

      <NuxtLink
        v-for="item in mainNav"
        :key="item.href"
        :to="item.href"
        class="sidebar-link"
        :class="{ active: route.path === item.href }"
      >
        <component :is="item.icon" class="w-4.5 h-4.5 shrink-0" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
          style="background: #2a1850; color: #d4ed1a; letter-spacing: 0.02em"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>

      <div class="my-3 border-t" style="border-color: #2a1850" />

      <p class="px-3 mb-2 text-xs font-semibold uppercase tracking-wider" style="color: #4a3868">
        Análisis
      </p>

      <NuxtLink
        v-for="item in secondaryNav"
        :key="item.href"
        :to="item.href"
        class="sidebar-link"
        :class="{ active: route.path === item.href }"
      >
        <component :is="item.icon" class="w-4.5 h-4.5 shrink-0" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Bottom: Company + User -->
    <div class="px-3 pb-4 space-y-2 shrink-0">
      <!-- Company badge -->
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background: #1e1038">
        <div
          class="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold text-white"
          style="background: #7c4dca"
        >
          {{ companyInitial }}
        </div>
        <div class="overflow-hidden">
          <p class="text-xs font-medium text-white truncate">{{ companyName || 'Cargando...' }}</p>
          <p class="text-xs truncate" style="color: #4a3868">{{ company?.nit || '' }}</p>
        </div>
      </div>

      <!-- User -->
      <div class="border-t pt-2" style="border-color: #2a1850">
        <button
          class="sidebar-link w-full justify-between"
          @click="handleLogout"
        >
          <div class="flex items-center gap-2">
            <UAvatar :alt="userEmail" size="xs" />
            <span class="text-xs truncate max-w-[130px]">{{ userEmail }}</span>
          </div>
          <LogOutIcon class="w-3.5 h-3.5 shrink-0 opacity-60" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboardIcon,
  SunIcon,
  BuildingIcon,
  FileBarChartIcon,
  SettingsIcon,
  LogOutIcon,
} from 'lucide-vue-next'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { company, companyInitial, companyName } = useCompany()

const userEmail = computed(() => user.value?.email || '')

const mainNav = [
  { href: '/sedes', label: 'Sedes', icon: BuildingIcon, badge: null },
  { href: '/facturacion', label: 'Facturación', icon: LayoutDashboardIcon, badge: null },
  { href: '/ugranjas', label: 'uGranjas', icon: SunIcon, badge: null },
]

const secondaryNav = [
  { href: '/reportes', label: 'Reportes', icon: FileBarChartIcon },
  { href: '/configuracion', label: 'Configuración', icon: SettingsIcon },
]

async function handleLogout() {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>
