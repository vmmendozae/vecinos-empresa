<template>
  <div class="space-y-5 pb-28">
    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Facturación Energética</h2>
        <p class="text-sm text-slate-400 mt-0.5">Gestiona las facturas de energía de todas tus sedes</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
        <RefreshCwIcon class="w-3.5 h-3.5" />
        Actualizado hace 2 min
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-sm text-slate-400">Cargando facturas...</p>
      </div>
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <BillingStatsCards
        :total-kwh="totalKwh"
        :total-cost="totalCost"
        :total-savings="totalSavings"
        :invoice-count="filteredInvoices.length"
      />

      <!-- Chart full width -->
      <BillingBillingChart :stats="monthlyStats" />

      <!-- Filters -->
      <BillingFilterBar
        :filters="filters"
        :cities="availableCities"
        :marketers="availableMarketers"
        :periods="availablePeriods"
        @reset="resetFilters"
      />

      <!-- Table -->
      <BillingInvoicesTable
        :invoices="filteredInvoices"
        @update:selected="onSelectionChange"
        @open-detail="openDetail"
        @pay-single="paySingle"
      />
    </template>

    <!-- ── Pay action bar (floating bottom) ─────────────────────────────── -->
    <Transition name="paybar">
      <div
        v-if="selectedIds.length > 0"
        class="fixed bottom-0 left-64 right-0 z-50 px-6 py-4"
        style="background: linear-gradient(to top, rgba(15,23,42,0.08) 0%, transparent 100%)"
      >
        <div
          class="max-w-5xl mx-auto flex items-center justify-between gap-4 px-5 py-4 rounded-2xl shadow-2xl border"
          style="background: #0b1120; border-color: #1a2540"
        >
          <!-- Left: selection info -->
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style="background: #00b85c20"
            >
              <CheckSquareIcon class="w-5 h-5" style="color: #00b85c" />
            </div>
            <div>
              <p class="text-sm font-semibold text-white">
                {{ selectedIds.length }} {{ selectedIds.length === 1 ? 'factura seleccionada' : 'facturas seleccionadas' }}
              </p>
              <p class="text-xs" style="color: #64748b">
                Total a pagar:
                <span class="font-semibold text-white ml-1">{{ formatCurrency(selectedTotal) }}</span>
              </p>
            </div>
          </div>

          <!-- Right: actions -->
          <div class="flex items-center gap-3">
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
              @click="clearSelection"
            >
              Cancelar
            </button>
            <button
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style="background: #00b85c"
              @click="handlePay"
            >
              <CreditCardIcon class="w-4 h-4" />
              Pagar {{ formatCurrency(selectedTotal) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Invoice detail panel -->
    <BillingInvoiceDetailPanel
      v-model="showDetailPanel"
      :invoice="detailInvoice"
      @pay="paySingle"
    />

    <!-- Pay modal -->
    <UModal v-model="showPayModal" :ui="{ width: 'sm:max-w-lg' }" prevent-close>
      <!-- ── CONFIRM STATE ─────────────────────────────────────── -->
      <div v-if="payState === 'confirm'" class="rounded-2xl overflow-hidden">

        <!-- Dark header with savings highlight -->
        <div class="px-6 pt-6 pb-5" style="background: linear-gradient(135deg, #0f172a 0%, #1a2e1a 100%)">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(0,184,92,0.2)">
              <ZapIcon class="w-5 h-5" style="color: #00b85c" />
            </div>
            <div>
              <p class="font-bold text-white text-base">Confirmar pago</p>
              <p class="text-xs" style="color: #64748b">
                {{ selectedIds.length }} {{ selectedIds.length === 1 ? 'factura' : 'facturas' }} · {{ formatCurrency(selectedTotal) }}
              </p>
            </div>
          </div>

          <!-- Savings card — only if there are savings -->
          <div
            v-if="selectedSavings > 0"
            class="rounded-xl px-5 py-4"
            style="background: rgba(0,184,92,0.12); border: 1px solid rgba(0,184,92,0.25)"
          >
            <p class="text-xs font-semibold uppercase tracking-widest mb-1" style="color: #4ade80">
              Ahorro Unergy en este pago
            </p>
            <p class="text-4xl font-bold tabular-nums" style="color: #00b85c">
              {{ formatCurrency(selectedSavings) }}
            </p>
            <p class="text-xs mt-1.5" style="color: #4ade80; opacity: 0.7">
              vs. tarifa de red estándar — ¡estás pagando menos y siendo más sostenible!
            </p>
          </div>
        </div>

        <!-- Invoice list -->
        <div class="bg-white divide-y divide-slate-100 max-h-52 overflow-y-auto">
          <div
            v-for="inv in selectedInvoices"
            :key="inv.id"
            class="flex items-center justify-between px-5 py-3"
          >
            <div>
              <p class="text-sm font-medium text-slate-700">{{ inv.branches?.name }}</p>
              <p class="text-xs text-slate-400">{{ inv.invoice_number }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-700">
                {{ formatCurrency(inv.total_kwh_consumption * inv.standard_kwh_rate) }}
              </p>
              <span
                v-if="inv.savings > 0"
                class="text-xs font-medium"
                style="color: #00b85c"
              >
                −{{ formatCurrency(inv.savings) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            class="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
            @click="showPayModal = false"
          >
            Cancelar
          </button>
          <button
            class="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style="background: #00b85c"
            :disabled="paying"
            @click="confirmPay"
          >
            <span v-if="paying" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <CheckCircleIcon v-else class="w-4 h-4" />
            {{ paying ? 'Procesando...' : `Pagar ${formatCurrency(selectedTotal)}` }}
          </button>
        </div>
      </div>

      <!-- ── SUCCESS STATE ──────────────────────────────────────── -->
      <div v-else class="rounded-2xl overflow-hidden">
        <div class="px-8 py-10 text-center" style="background: linear-gradient(160deg, #0f172a 0%, #1a2e1a 100%)">
          <!-- Animated checkmark ring -->
          <div class="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style="background: rgba(0,184,92,0.15); border: 2px solid rgba(0,184,92,0.4)">
            <CheckCircleIcon class="w-10 h-10" style="color: #00b85c" />
          </div>
          <p class="text-2xl font-bold text-white mb-1">¡Pago exitoso!</p>
          <p class="text-sm mb-6" style="color: #64748b">
            {{ paidCount }} {{ paidCount === 1 ? 'factura marcada' : 'facturas marcadas' }} como pagada{{ paidCount === 1 ? '' : 's' }}
          </p>

          <!-- Savings summary -->
          <div
            v-if="paidSavings > 0"
            class="rounded-xl px-5 py-4 mb-6"
            style="background: rgba(0,184,92,0.12); border: 1px solid rgba(0,184,92,0.25)"
          >
            <p class="text-xs font-semibold uppercase tracking-widest mb-1.5" style="color: #4ade80">
              Ahorro conseguido
            </p>
            <p class="text-4xl font-bold tabular-nums" style="color: #00b85c">
              {{ formatCurrency(paidSavings) }}
            </p>
            <p class="text-xs mt-2" style="color: #4ade80; opacity: 0.8">
              Cada peso ahorrado es energía solar que tu empresa ya está usando.
              Juntos construimos un futuro más limpio.
            </p>
          </div>

          <p class="text-xs" style="color: #334155">
            Total pagado: <span class="font-semibold text-white">{{ formatCurrency(paidTotal) }}</span>
          </p>
        </div>
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button
            class="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style="background: #00b85c"
            @click="closeSuccess"
          >
            Entendido
          </button>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { RefreshCwIcon, CheckSquareIcon, CreditCardIcon, CheckCircleIcon, ZapIcon } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

const {
  filteredInvoices,
  allInvoices,
  filters,
  loading,
  fetchInvoices,
  totalKwh,
  totalCost,
  totalSavings,
  availableCities,
  availableMarketers,
  availablePeriods,
  monthlyStats,
  resetFilters,
  markAsPaid,
} = useBilling()

onMounted(() => fetchInvoices())

// ── Detail panel ───────────────────────────────────────────────────────────
const showDetailPanel = ref(false)
const detailInvoice = ref<(typeof allInvoices.value)[0] | null>(null)

function openDetail(invoice: (typeof allInvoices.value)[0]) {
  detailInvoice.value = invoice
  showDetailPanel.value = true
}

function paySingle(invoice: (typeof allInvoices.value)[0]) {
  showDetailPanel.value = false
  selectedIds.value = [invoice.id]
  payState.value = 'confirm'
  showPayModal.value = true
}

// ── Selection ───────────────────────────────────────────────────────────────
const selectedIds = ref<string[]>([])
const showPayModal = ref(false)
const paying = ref(false)
const payState = ref<'confirm' | 'success'>('confirm')
const paidCount = ref(0)
const paidTotal = ref(0)
const paidSavings = ref(0)

function onSelectionChange(ids: string[]) {
  selectedIds.value = ids
}

function clearSelection() {
  selectedIds.value = []
}

const selectedInvoices = computed(() =>
  allInvoices.value.filter((inv) => selectedIds.value.includes(inv.id)),
)

const selectedTotal = computed(() =>
  selectedInvoices.value.reduce(
    (sum, inv) => sum + inv.total_kwh_consumption * inv.standard_kwh_rate,
    0,
  ),
)

const selectedSavings = computed(() =>
  selectedInvoices.value.reduce((sum, inv) => sum + inv.savings, 0),
)

function handlePay() {
  payState.value = 'confirm'
  showPayModal.value = true
}

async function confirmPay() {
  paying.value = true

  // Snapshot values before clearing selection
  const ids = [...selectedIds.value]
  const total = selectedTotal.value
  const savings = selectedSavings.value
  const count = ids.length

  const { error } = await markAsPaid(ids)

  paying.value = false

  if (!error) {
    paidCount.value = count
    paidTotal.value = total
    paidSavings.value = savings
    payState.value = 'success'
    clearSelection()
  }
}

function closeSuccess() {
  showPayModal.value = false
  payState.value = 'confirm'
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${Math.round(value).toLocaleString('es-CO')}`
}
</script>

<style scoped>
.paybar-enter-active,
.paybar-leave-active {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}
.paybar-enter-from,
.paybar-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
