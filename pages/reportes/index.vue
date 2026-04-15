<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Reportes</h2>
        <p class="text-sm text-slate-400 mt-0.5">Análisis de consumo, costos y oportunidades</p>
      </div>
      <!-- Period filter -->
      <select
        v-model="selectedPeriod"
        class="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-100"
      >
        <option value="">Todos los períodos</option>
        <option v-for="p in availablePeriods" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style="border-color:#7c4dca;border-top-color:transparent" />
    </div>

    <template v-else>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:#f3eeff">
              <ZapIcon class="w-4.5 h-4.5" style="color:#7c4dca" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Consumo total</span>
          </div>
          <p class="text-2xl font-bold text-slate-800 tabular-nums">{{ formatKwh(periodKwh) }}</p>
          <p class="text-xs text-slate-400 mt-0.5">kWh facturados</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:#fff7ed">
              <DollarSignIcon class="w-4.5 h-4.5 text-orange-500" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Costo total</span>
          </div>
          <p class="text-2xl font-bold text-slate-800 tabular-nums">{{ formatCurrency(periodCost) }}</p>
          <p class="text-xs text-slate-400 mt-0.5">en facturas</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:#dcfce7">
              <LeafIcon class="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ahorro solar</span>
          </div>
          <p class="text-2xl font-bold text-slate-800 tabular-nums">{{ formatCurrency(periodSavings) }}</p>
          <p class="text-xs text-slate-400 mt-0.5">vs tarifa regular</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:#fef9c3">
              <ZapIcon class="w-4.5 h-4.5 text-yellow-600" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prospectos</span>
          </div>
          <p class="text-2xl font-bold text-slate-800 tabular-nums">{{ prospectoCount }}</p>
          <p class="text-xs text-slate-400 mt-0.5">sedes sin solar</p>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Consumo mensual -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Consumo & Ahorro mensual</h3>
          <ClientOnly>
            <VueApexCharts
              type="bar"
              height="240"
              :options="consumoChartOptions"
              :series="consumoSeries"
            />
          </ClientOnly>
        </div>

        <!-- Por OR -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Consumo por OR</h3>
          <ClientOnly>
            <VueApexCharts
              v-if="orDonutSeries.length"
              type="donut"
              height="240"
              :options="orDonutOptions"
              :series="orDonutSeries"
            />
            <p v-else class="text-xs text-slate-400 text-center py-10">Sin datos de OR</p>
          </ClientOnly>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Top sedes por consumo -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Top sedes por consumo</h3>
          <div class="space-y-2.5">
            <div
              v-for="(item, i) in topSedes"
              :key="item.name"
              class="flex items-center gap-3"
            >
              <span class="text-xs font-bold text-slate-400 w-4 shrink-0 text-right">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-slate-700 truncate">{{ item.name }}</span>
                  <span class="text-xs text-slate-500 tabular-nums ml-2 shrink-0">{{ formatKwh(item.kwh) }}</span>
                </div>
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    style="background:#7c4dca"
                    :style="{ width: (item.kwh / topSedes[0].kwh * 100) + '%', background: '#7c4dca' }"
                  />
                </div>
              </div>
              <span v-if="item.savings > 0" class="text-xs font-semibold text-emerald-600 shrink-0 tabular-nums">
                -{{ formatCurrency(item.savings) }}
              </span>
            </div>
            <p v-if="!topSedes.length" class="text-xs text-slate-400 text-center py-6">Sin datos de facturas</p>
          </div>
        </div>

        <!-- Por Comercializador -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Consumo por comercializador</h3>
          <div class="space-y-2.5">
            <div
              v-for="item in byComercializador"
              :key="item.name"
              class="flex items-center gap-3"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-slate-700 truncate">{{ item.name }}</span>
                  <div class="flex items-center gap-2 ml-2 shrink-0">
                    <span class="text-xs text-slate-500 tabular-nums">{{ formatKwh(item.kwh) }}</span>
                    <span class="text-xs text-slate-400 tabular-nums">{{ formatCurrency(item.cost) }}</span>
                  </div>
                </div>
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    style="background:#f59e0b"
                    :style="{ width: (item.kwh / (byComercializador[0]?.kwh || 1) * 100) + '%', background: '#f59e0b' }"
                  />
                </div>
              </div>
            </div>
            <p v-if="!byComercializador.length" class="text-xs text-slate-400 text-center py-6">Sin datos de facturas</p>
          </div>
        </div>

      </div>

      <!-- Prospectos table -->
      <div v-if="prospectoSedes.length" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:#fef9c3">
            <ZapIcon class="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-700">Sedes prospecto</h3>
            <p class="text-xs text-slate-400">Mismo OR y comercializador · Sin solar · Con consumo</p>
          </div>
          <span class="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style="background:#fef9c3;color:#854d0e">{{ prospectoSedes.length }}</span>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sede</th>
              <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ciudad</th>
              <th class="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">OR / Comercializador</th>
              <th class="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">kWh prom.</th>
              <th class="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ahorro potencial</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="sede in prospectoSedes" :key="sede.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white" style="background:#7c4dca">
                    {{ sede.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-slate-800">{{ sede.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ sede.city }}</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ sede.or }}</td>
              <td class="px-4 py-3 text-right text-sm font-medium text-slate-700 tabular-nums">
                {{ sede.kwh_consumption ? sede.kwh_consumption.toLocaleString('es-CO') : '—' }} kWh
              </td>
              <td class="px-5 py-3 text-right">
                <span v-if="sede.kwh_consumption" class="text-xs font-semibold text-emerald-600 tabular-nums">
                  ~{{ formatCurrency(estimateSavings(sede.kwh_consumption)) }}
                </span>
                <span v-else class="text-slate-300 text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ZapIcon, LeafIcon, DollarSignIcon } from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'
import type { Branch } from '~/types/database'

definePageMeta({ layout: 'dashboard' })

const { allInvoices, loading, fetchInvoices, availablePeriods } = useBilling()
const { branches, fetchBranches } = useSedes()

onMounted(async () => {
  await Promise.all([fetchInvoices(), fetchBranches()])
})

const selectedPeriod = ref('')

// ── Filtered invoices by period ───────────────────────────────────────────
const periodInvoices = computed(() => {
  if (!selectedPeriod.value) return allInvoices.value
  return allInvoices.value.filter(inv =>
    inv.billing_period_start.startsWith(selectedPeriod.value),
  )
})

// ── KPIs ─────────────────────────────────────────────────────────────────
const periodKwh = computed(() =>
  periodInvoices.value.reduce((s, i) => s + (i.total_kwh_consumption || 0), 0),
)
const periodCost = computed(() =>
  periodInvoices.value.reduce((s, i) => s + i.total_kwh_consumption * i.standard_kwh_rate, 0),
)
const periodSavings = computed(() =>
  periodInvoices.value.reduce((s, i) => s + i.savings, 0),
)

// ── Prospectos ────────────────────────────────────────────────────────────
function isProspecto(b: Branch) {
  return !!b.or && !!b.comercializador && b.or === b.comercializador && !b.solar && !!b.kwh_consumption
}
const prospectoSedes = computed(() => branches.value.filter(isProspecto))
const prospectoCount = computed(() => prospectoSedes.value.length)

// Estimate ~15% savings if they joined Unergy (avg discount)
function estimateSavings(kwh: number) {
  return Math.round(kwh * 350 * 0.15) // ~$350/kWh avg rate, 15% discount
}

// ── Monthly chart ─────────────────────────────────────────────────────────
const monthlyData = computed(() => {
  const byMonth: Record<string, { label: string; kwh: number; savings: number }> = {}
  allInvoices.value.forEach(inv => {
    const d = new Date(inv.billing_period_start + 'T00:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
    if (!byMonth[key]) byMonth[key] = { label, kwh: 0, savings: 0 }
    byMonth[key].kwh += inv.total_kwh_consumption
    byMonth[key].savings += inv.savings
  })
  return Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
})

const consumoSeries = computed(() => [
  { name: 'Consumo kWh', data: monthlyData.value.map(m => Math.round(m.kwh)) },
  { name: 'Ahorro $', data: monthlyData.value.map(m => Math.round(m.savings)) },
])

const consumoChartOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  colors: ['#7c4dca', '#22c55e'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: monthlyData.value.map(m => m.label),
    labels: { style: { fontSize: '11px', colors: '#94a3b8' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: [
    { labels: { style: { fontSize: '11px', colors: '#94a3b8' }, formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) } },
    { opposite: true, labels: { style: { fontSize: '11px', colors: '#94a3b8' }, formatter: (v: number) => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}` } },
  ],
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  legend: { position: 'top', fontSize: '12px' },
  tooltip: { y: [{ formatter: (v: number) => `${v.toLocaleString('es-CO')} kWh` }, { formatter: (v: number) => formatCurrency(v) }] },
}))

// ── OR donut ──────────────────────────────────────────────────────────────
const orStats = computed(() => {
  const map: Record<string, number> = {}
  periodInvoices.value.forEach(inv => {
    const or = inv.branches?.['or' as keyof typeof inv.branches] as string || 'Sin OR'
    map[or] = (map[or] || 0) + (inv.total_kwh_consumption || 0)
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
})

const orDonutSeries = computed(() => orStats.value.map(([, v]) => Math.round(v)))
const orDonutOptions = computed(() => ({
  chart: { fontFamily: 'Inter, sans-serif' },
  labels: orStats.value.map(([k]) => k),
  colors: ['#7c4dca', '#a78bfa', '#c4b5f4', '#ddd6fe', '#ede9fe'],
  legend: { position: 'bottom', fontSize: '11px' },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '65%' } } },
  tooltip: { y: { formatter: (v: number) => `${v.toLocaleString('es-CO')} kWh` } },
}))

// ── Top sedes ─────────────────────────────────────────────────────────────
const topSedes = computed(() => {
  const map: Record<string, { name: string; kwh: number; savings: number }> = {}
  periodInvoices.value.forEach(inv => {
    const name = inv.branches?.name || 'Desconocida'
    if (!map[name]) map[name] = { name, kwh: 0, savings: 0 }
    map[name].kwh += inv.total_kwh_consumption || 0
    map[name].savings += inv.savings || 0
  })
  return Object.values(map).sort((a, b) => b.kwh - a.kwh).slice(0, 8)
})

// ── By Comercializador ────────────────────────────────────────────────────
const byComercializador = computed(() => {
  const map: Record<string, { name: string; kwh: number; cost: number }> = {}
  periodInvoices.value.forEach(inv => {
    const name = inv.energy_marketer || 'Desconocido'
    if (!map[name]) map[name] = { name, kwh: 0, cost: 0 }
    map[name].kwh += inv.total_kwh_consumption || 0
    map[name].cost += inv.total_kwh_consumption * inv.standard_kwh_rate
  })
  return Object.values(map).sort((a, b) => b.kwh - a.kwh)
})

// ── Formatters ────────────────────────────────────────────────────────────
function formatCurrency(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
  return `$${Math.round(v).toLocaleString('es-CO')}`
}
function formatKwh(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
  return v.toLocaleString('es-CO')
}
</script>
