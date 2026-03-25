<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-800">Consumo vs Ahorro Mensual</h3>
        <p class="text-xs text-slate-400 mt-0.5">Comparativo por período de facturación</p>
      </div>
      <div class="flex items-center gap-4 text-xs">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:#6366f1" />
          <span class="text-slate-500">Gasto (COP M)</span>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm inline-block" style="background:#00b85c" />
          <span class="text-slate-500">Ahorro (COP M)</span>
        </span>
      </div>
    </div>

    <ClientOnly>
      <apexchart
        type="bar"
        height="240"
        :options="chartOptions"
        :series="series"
      />
      <template #fallback>
        <div class="h-60 flex items-center justify-center text-slate-300 text-sm">
          Cargando gráfico...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { MonthlyStat } from '~/types/database'

const props = defineProps<{
  stats: MonthlyStat[]
}>()

const series = computed(() => [
  {
    name: 'Gasto',
    data: props.stats.map((s) => Math.round(s.cost / 1_000_000)),
  },
  {
    name: 'Ahorro',
    data: props.stats.map((s) => Math.round(s.savings / 1_000_000)),
  },
])

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    animations: { enabled: true, speed: 400 },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '55%',
      dataLabels: { position: 'top' },
    },
  },
  colors: ['#6366f1', '#00b85c'],
  dataLabels: { enabled: false },
  stroke: { show: false },
  xaxis: {
    categories: props.stats.map((s) => s.month),
    labels: {
      style: { fontSize: '11px', colors: '#94a3b8' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `$${val}M`,
      style: { fontSize: '11px', colors: '#94a3b8' },
    },
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  legend: { show: false },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (val: number) => `$${val.toLocaleString('es-CO')}M COP`,
    },
  },
}))
</script>
