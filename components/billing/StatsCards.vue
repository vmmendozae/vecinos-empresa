<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <!-- Total kWh -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <ZapIcon class="w-5 h-5 text-blue-500" />
      </div>
      <div class="min-w-0">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Consumo Total</p>
        <p class="text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">
          {{ formatKwh(totalKwh) }}
        </p>
        <p class="text-xs text-slate-400 mt-0.5">kWh · {{ invoiceCount }} facturas</p>
      </div>
    </div>

    <!-- Total Gasto -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div class="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
        <DollarSignIcon class="w-5 h-5 text-violet-500" />
      </div>
      <div class="min-w-0">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Gasto Total</p>
        <p class="text-2xl font-bold text-slate-800 mt-0.5 tabular-nums">
          {{ formatCurrency(totalCost) }}
        </p>
        <p class="text-xs text-slate-400 mt-0.5">COP · Tarifa comercializador</p>
      </div>
    </div>

    <!-- Ahorro Unergy -->
    <div
      class="rounded-xl border p-5 flex items-start gap-4"
      style="background: linear-gradient(135deg, #f0fdf7 0%, #dcfce9 100%); border-color: #bbf7d8"
    >
      <div
        class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style="background: #00b85c20"
      >
        <TrendingDownIcon class="w-5 h-5" style="color: #00b85c" />
      </div>
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wide" style="color: #15803d">
          Ahorro con Unergy
        </p>
        <p class="text-2xl font-bold mt-0.5 tabular-nums" style="color: #15803d">
          {{ formatCurrency(totalSavings) }}
        </p>
        <div class="flex items-center gap-1.5 mt-0.5">
          <LeafIcon class="w-3 h-3" style="color: #00b85c" />
          <p class="text-xs font-medium" style="color: #16a34a">
            {{ savingsPercent }}% de ahorro vs. comercializador
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ZapIcon, DollarSignIcon, TrendingDownIcon, LeafIcon } from 'lucide-vue-next'

const props = defineProps<{
  totalKwh: number
  totalCost: number
  totalSavings: number
  invoiceCount: number
}>()

const savingsPercent = computed(() => {
  if (!props.totalCost) return 0
  return Math.round((props.totalSavings / props.totalCost) * 100)
})

function formatKwh(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString('es-CO')
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${value.toLocaleString('es-CO')}`
}
</script>
