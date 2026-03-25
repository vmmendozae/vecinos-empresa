<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <!-- Table header -->
    <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
      <p class="text-sm font-semibold text-slate-700">
        Facturas
        <span class="ml-1.5 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {{ invoices.length }}
        </span>
      </p>
      <button class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
        <DownloadIcon class="w-3.5 h-3.5" />
        Exportar CSV
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/50">
            <!-- Select all -->
            <th class="px-4 py-3 w-10">
              <input
                type="checkbox"
                class="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                :checked="allSelected"
                :indeterminate="someSelected"
                @change="toggleAll"
              />
            </th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Sede</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ciudad</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Comercializador</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">N° Factura</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Período</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Vencimiento</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">kWh</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Total</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ahorro Unergy</th>
            <th class="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="invoice in invoices"
            :key="invoice.id"
            class="transition-colors cursor-pointer group"
            :class="{
              'hover:bg-slate-50/60': !selectedIds.has(invoice.id),
              'opacity-60': invoice.status === 'Pagada',
              'bg-emerald-50/30 hover:bg-emerald-50/50': invoice.branches?.unergy_subscribed,
              'bg-blue-50/40 hover:bg-blue-50/60': selectedIds.has(invoice.id),
            }"
            @click="$emit('open-detail', invoice)"
          >
            <!-- Checkbox -->
            <td class="px-4 py-3 w-10" @click.stop>
              <input
                type="checkbox"
                class="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                :class="invoice.status === 'Pagada' ? 'cursor-not-allowed' : 'cursor-pointer'"
                :checked="selectedIds.has(invoice.id)"
                :disabled="invoice.status === 'Pagada'"
                @change="toggleRow(invoice.id, invoice.status)"
              />
            </td>

            <!-- Status -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="statusClass(invoice.status)">
                <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" :class="statusDotClass(invoice.status)" />
                {{ invoice.status }}
              </span>
            </td>

            <!-- Branch name -->
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span class="font-medium text-slate-800">{{ invoice.branches?.name }}</span>
                <span
                  v-if="invoice.branches?.unergy_subscribed"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium"
                  style="background: #dcfce7; color: #15803d"
                >
                  <LeafIcon class="w-3 h-3" />
                  Unergy
                </span>
              </div>
            </td>

            <!-- City -->
            <td class="px-4 py-3 text-slate-600 whitespace-nowrap">{{ invoice.branches?.city }}</td>

            <!-- Marketer -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-600">
                {{ invoice.energy_marketer }}
              </span>
            </td>

            <!-- Invoice number -->
            <td class="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
              {{ invoice.invoice_number }}
            </td>

            <!-- Billing period -->
            <td class="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">
              {{ formatPeriod(invoice.billing_period_start, invoice.billing_period_end) }}
            </td>

            <!-- Due date -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="invoice.status === 'Vencida' ? 'text-red-600 font-medium' : 'text-slate-600'">
                {{ formatDate(invoice.due_date) }}
              </span>
            </td>

            <!-- kWh -->
            <td class="px-4 py-3 text-right text-slate-700 font-medium tabular-nums whitespace-nowrap">
              {{ invoice.total_kwh_consumption.toLocaleString('es-CO') }}
            </td>

            <!-- Total -->
            <td class="px-4 py-3 text-right text-slate-700 font-semibold tabular-nums whitespace-nowrap">
              {{ formatCurrency(invoice.total_kwh_consumption * invoice.standard_kwh_rate) }}
            </td>

            <!-- Savings -->
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <span
                v-if="invoice.savings > 0"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style="background: #dcfce7; color: #15803d"
              >
                <TrendingDownIcon class="w-3 h-3" />
                {{ formatCurrency(invoice.savings) }}
              </span>
              <span v-else class="text-slate-300 text-xs">—</span>
            </td>

            <!-- Row actions -->
            <td class="px-3 py-3 whitespace-nowrap" @click.stop>
              <div class="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  title="Ver detalle"
                  @click="$emit('open-detail', invoice)"
                >
                  <EyeIcon class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="invoice.status !== 'Pagada'"
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-all"
                  style="color: #7c4dca"
                  title="Pagar factura"
                  @click="$emit('pay-single', invoice)"
                >
                  <CreditCardIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="invoices.length === 0">
            <td colspan="12" class="px-4 py-12 text-center text-slate-400">
              <div class="flex flex-col items-center gap-2">
                <FileTextIcon class="w-8 h-8 text-slate-200" />
                <p class="font-medium text-slate-500">Sin resultados</p>
                <p class="text-xs text-slate-400">Ajusta los filtros para ver facturas</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LeafIcon, TrendingDownIcon, DownloadIcon, FileTextIcon, CreditCardIcon, EyeIcon } from 'lucide-vue-next'
import type { InvoiceWithSavings } from '~/types/database'

const props = defineProps<{
  invoices: InvoiceWithSavings[]
}>()

const emit = defineEmits<{
  'update:selected': [ids: string[]]
  'open-detail': [invoice: InvoiceWithSavings]
  'pay-single': [invoice: InvoiceWithSavings]
}>()

const selectedIds = ref<Set<string>>(new Set())

const payableInvoices = computed(() => props.invoices.filter((i) => i.status !== 'Pagada'))

const allSelected = computed(
  () => payableInvoices.value.length > 0 && payableInvoices.value.every((i) => selectedIds.value.has(i.id)),
)
const someSelected = computed(
  () => payableInvoices.value.some((i) => selectedIds.value.has(i.id)) && !allSelected.value,
)

function toggleAll() {
  if (allSelected.value) {
    payableInvoices.value.forEach((i) => selectedIds.value.delete(i.id))
  } else {
    payableInvoices.value.forEach((i) => selectedIds.value.add(i.id))
  }
  emit('update:selected', [...selectedIds.value])
}

function toggleRow(id: string, status: string) {
  if (status === 'Pagada') return
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
  selectedIds.value = new Set(selectedIds.value)
  emit('update:selected', [...selectedIds.value])
}

// Clear selection when invoices list changes (e.g. filter applied)
watch(
  () => props.invoices,
  () => {
    const currentIds = new Set(props.invoices.map((i) => i.id))
    const next = new Set([...selectedIds.value].filter((id) => currentIds.has(id)))
    selectedIds.value = next
    emit('update:selected', [...next])
  },
)

function statusClass(status: string) {
  return ({ Pagada: 'status-pagada', Pendiente: 'status-pendiente', Vencida: 'status-vencida' } as Record<string, string>)[status] || ''
}

function statusDotClass(status: string) {
  return ({ Pagada: 'bg-green-500', Pendiente: 'bg-yellow-500', Vencida: 'bg-red-500' } as Record<string, string>)[status] || 'bg-gray-400'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const mo = s.toLocaleDateString('es-CO', { month: 'short' })
  return `${mo.charAt(0).toUpperCase() + mo.slice(1)} ${s.getFullYear()}`
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${Math.round(value).toLocaleString('es-CO')}`
}
</script>
