<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
    <!-- Photo -->
    <div class="relative h-44 overflow-hidden bg-gradient-to-br from-emerald-100 to-green-200 shrink-0">
      <img
        v-if="granja.photo_url"
        :src="granja.photo_url"
        :alt="granja.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <SunIcon class="w-16 h-16 opacity-20" style="color: #00b85c" />
      </div>

      <div class="absolute top-3 left-3">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
          style="background: rgba(0,0,0,0.45); backdrop-filter: blur(4px)"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Activa
        </span>
      </div>

      <!-- Branch count badge -->
      <div class="absolute top-3 right-3">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
          style="background: rgba(0,184,92,0.85); backdrop-filter: blur(4px)"
        >
          <BuildingIcon class="w-3 h-3" />
          {{ granja.connectedBranches.length }}
          {{ granja.connectedBranches.length === 1 ? 'sede' : 'sedes' }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">
      <!-- Name & Location -->
      <div class="mb-4">
        <h3 class="font-bold text-slate-800 text-base leading-tight">{{ granja.name }}</h3>
        <div class="flex items-center gap-1 mt-1">
          <MapPinIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span class="text-xs text-slate-500">{{ granja.location }}</span>
          <a
            v-if="granja.location_map_url"
            :href="granja.location_map_url"
            target="_blank"
            rel="noopener noreferrer"
            class="ml-1 text-xs text-emerald-600 hover:underline"
          >
            Ver mapa
          </a>
        </div>
      </div>

      <!-- Impact stats (uGranja-level) -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div class="rounded-lg p-2.5 text-center" style="background: #f0fdf7; border: 1px solid #bbf7d8">
          <ZapIcon class="w-3.5 h-3.5 mx-auto mb-1" style="color: #00b85c" />
          <p class="text-sm font-bold tabular-nums" style="color: #15803d">{{ formatEnergy(granja.generated_energy_kwh) }}</p>
          <p class="text-xs mt-0.5" style="color: #16a34a">generados</p>
        </div>
        <div class="rounded-lg p-2.5 text-center" style="background: #fff7ed; border: 1px solid #fed7aa">
          <WindIcon class="w-3.5 h-3.5 mx-auto mb-1 text-orange-400" />
          <p class="text-sm font-bold text-orange-700 tabular-nums">{{ formatWeight(granja.avoided_co2_kg) }}</p>
          <p class="text-xs text-orange-600 mt-0.5">CO₂ evitado</p>
        </div>
        <div class="rounded-lg p-2.5 text-center" style="background: #f0fdf7; border: 1px solid #bbf7d8">
          <TreePineIcon class="w-3.5 h-3.5 mx-auto mb-1 text-green-500" />
          <p class="text-sm font-bold text-green-700 tabular-nums">{{ granja.saved_trees.toLocaleString('es-CO') }}</p>
          <p class="text-xs text-green-600 mt-0.5">árboles</p>
        </div>
      </div>

      <!-- Connected branches list -->
      <div class="border-t border-slate-100 pt-4 flex-1">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
          Sedes conectadas
        </p>

        <div v-if="granja.connectedBranches.length > 0" class="space-y-1.5">
          <div
            v-for="branch in granja.connectedBranches"
            :key="branch.id"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg"
            style="background: #f8fafc; border: 1px solid #e2e8f0"
          >
            <div
              class="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style="background: #7c4dca"
            >
              {{ branch.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-slate-700 truncate">{{ branch.name }}</p>
              <p class="text-xs text-slate-400">{{ branch.city }}</p>
            </div>
            <LeafIcon class="w-3 h-3 shrink-0" style="color: #00b85c" />
          </div>
        </div>

        <p v-else class="text-xs text-slate-400 italic">Sin sedes asignadas aún.</p>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span class="text-xs text-slate-400">uGranja Unergy®</span>
        <span
          class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style="background: #dcfce7; color: #15803d"
        >
          <LeafIcon class="w-3 h-3" />
          Energía limpia
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SunIcon, MapPinIcon, ZapIcon, WindIcon, TreePineIcon, LeafIcon, BuildingIcon } from 'lucide-vue-next'
import type { UGranjaWithBranches } from '~/types/database'

defineProps<{
  granja: UGranjaWithBranches
}>()

function formatEnergy(kwh: number): string {
  if (kwh >= 1_000_000) return `${(kwh / 1_000_000).toFixed(2)} GWh`
  if (kwh >= 1_000) return `${(kwh / 1_000).toFixed(0)} MWh`
  return `${kwh} kWh`
}

function formatWeight(kg: number): string {
  if (kg >= 1_000) return `${(kg / 1_000).toFixed(1)} t`
  return `${kg.toLocaleString('es-CO')} kg`
}
</script>
