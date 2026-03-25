<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-800">uGranjas Solares</h2>
        <p class="text-sm text-slate-400 mt-0.5">Granjas solares a las que tu empresa está suscrita</p>
      </div>
      <div
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
        style="background: #dcfce7; color: #15803d"
      >
        <LeafIcon class="w-3.5 h-3.5" />
        {{ ugranjas.length }} granjas activas
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-sm text-slate-400">Cargando uGranjas...</p>
      </div>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-xl border p-4 text-center" style="background:linear-gradient(135deg,#f3eeff,#ede0ff);border-color:#c4b5f4">
          <BuildingIcon class="w-5 h-5 mx-auto mb-2" style="color:#7c4dca" />
          <p class="text-2xl font-bold tabular-nums" style="color:#5b21b6">{{ totalConnectedBranches }}</p>
          <p class="text-xs mt-0.5" style="color:#6d28d9">Sedes conectadas</p>
        </div>
        <div class="rounded-xl border p-4 text-center" style="background:linear-gradient(135deg,#fefce8,#fef9c3);border-color:#fde047">
          <ZapIcon class="w-5 h-5 mx-auto mb-2 text-yellow-500" />
          <p class="text-2xl font-bold text-yellow-700 tabular-nums">{{ formatEnergy(totalGeneratedEnergy) }}</p>
          <p class="text-xs text-yellow-700 mt-0.5">Energía generada</p>
        </div>
        <div class="rounded-xl border p-4 text-center" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-color:#fed7aa">
          <WindIcon class="w-5 h-5 mx-auto mb-2 text-orange-500" />
          <p class="text-2xl font-bold text-orange-700 tabular-nums">{{ formatWeight(totalAvoidedCO2) }}</p>
          <p class="text-xs text-orange-700 mt-0.5">CO₂ evitado</p>
        </div>
        <div class="rounded-xl border p-4 text-center" style="background:linear-gradient(135deg,#f0fdf7,#dcfce9);border-color:#86efba">
          <TreePineIcon class="w-5 h-5 mx-auto mb-2 text-green-600" />
          <p class="text-2xl font-bold text-green-700 tabular-nums">{{ totalSavedTrees.toLocaleString('es-CO') }}</p>
          <p class="text-xs text-green-700 mt-0.5">Árboles salvados</p>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!ugranjas.length"
        class="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200"
      >
        <SunIcon class="w-12 h-12 text-slate-200 mb-3" />
        <p class="font-medium text-slate-500">Sin uGranjas asignadas</p>
        <p class="text-sm text-slate-400 mt-1">Tu empresa aún no está suscrita a ninguna uGranja</p>
      </div>

      <template v-else>
        <!-- Tabs -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <!-- Tab bar -->
          <div class="flex border-b border-slate-100">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative"
              :class="activeTab === tab.id
                ? 'text-slate-800'
                : 'text-slate-400 hover:text-slate-600'"
              @click="activeTab = tab.id"
            >
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
              <!-- Active indicator -->
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style="background: #7c4dca"
              />
            </button>
          </div>

          <!-- Tab: Mapa -->
          <div v-show="activeTab === 'map'" class="p-0">
            <UgranjaColombiaMap :ugranjas="ugranjas" />
          </div>

          <!-- Tab: Granjas -->
          <div v-show="activeTab === 'cards'" class="p-5">
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              <UgranjaCard
                v-for="granja in ugranjas"
                :key="granja.id"
                :granja="granja"
              />
            </div>
          </div>
        </div>

        <!-- Info banner -->
        <div
          class="flex items-start gap-4 p-5 rounded-xl border"
          style="background:#f0fdf7;border-color:#bbf7d8"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style="background:#00b85c20">
            <InfoIcon class="w-5 h-5" style="color:#00b85c" />
          </div>
          <div>
            <p class="text-sm font-semibold text-emerald-800">¿Cómo funciona una uGranja?</p>
            <p class="text-sm text-emerald-700 mt-1 leading-relaxed">
              Las uGranjas son granjas solares comunitarias operadas por Unergy. Al suscribirte,
              tu empresa recibe un porcentaje de su energía desde estas granjas a una tarifa
              considerablemente menor que la del comercializador tradicional, generando ahorros
              reales y reduciendo tu huella de carbono.
            </p>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  LeafIcon, ZapIcon, WindIcon, TreePineIcon,
  SunIcon, InfoIcon, BuildingIcon, MapIcon,
} from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

const {
  ugranjas, loading, fetchUGranjas,
  totalConnectedBranches, totalGeneratedEnergy, totalAvoidedCO2, totalSavedTrees,
} = useUGranjas()

onMounted(() => fetchUGranjas())

// ── Tabs ────────────────────────────────────────────────────────────────────
const activeTab = ref<'map' | 'cards'>('map')

const tabs = [
  { id: 'map' as const, label: 'Mapa', icon: MapIcon },
  { id: 'cards' as const, label: 'uGranjas', icon: SunIcon },
]

function formatEnergy(kwh: number): string {
  if (kwh >= 1_000_000) return `${(kwh / 1_000_000).toFixed(2)} GWh`
  if (kwh >= 1_000) return `${(kwh / 1_000).toFixed(0)} MWh`
  return `${kwh} kWh`
}

function formatWeight(kg: number): string {
  if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)} kt`
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)} t`
  return `${kg.toLocaleString('es-CO')} kg`
}
</script>
