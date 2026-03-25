<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
      @click="$emit('update:modelValue', false)"
    />
  </Transition>

  <!-- Panel -->
  <Transition name="panel">
    <div
      v-if="modelValue && invoice"
      class="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
      style="width: 480px"
    >
      <!-- ── Header ──────────────────────────────────────────────── -->
      <div class="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span :class="statusClass(invoice.status)" class="text-xs">
              <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" :class="statusDotClass(invoice.status)" />
              {{ invoice.status }}
            </span>
            <span
              v-if="invoice.branches?.unergy_subscribed"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
              style="background: #dcfce7; color: #15803d"
            >
              <LeafIcon class="w-3 h-3" /> Unergy Vecinos
            </span>
          </div>
          <p class="font-bold text-slate-800 text-base">{{ invoice.invoice_number }}</p>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ invoice.branches?.name }} · {{ invoice.branches?.city }}
          </p>
          <p class="text-xs text-slate-400 mt-1">
            Período {{ formatPeriod(invoice.billing_period_start, invoice.billing_period_end) }}
            · Vence {{ formatDate(invoice.due_date) }}
          </p>
        </div>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0 mt-0.5"
          @click="$emit('update:modelValue', false)"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- ── Scrollable content ──────────────────────────────────── -->
      <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        <!-- Regular energy breakdown -->
        <div>
          <h3 class="text-sm font-bold text-slate-800 mb-3">Desglose factura energía regular</h3>
          <div class="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            <!-- Consumption -->
            <div class="flex items-center justify-between px-4 py-3 bg-slate-50/50">
              <span class="text-sm text-slate-600">Consumo energía regular</span>
              <span class="text-sm font-semibold text-slate-800">
                {{ regularKwh.toLocaleString('es-CO', { maximumFractionDigits: 2 }) }}
                <span class="text-xs font-normal text-slate-400 ml-1">kWh</span>
              </span>
            </div>

            <!-- Rate sub-section -->
            <div class="px-4 py-2 bg-white">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide py-1.5">Tarifa energía regular</p>
              <div class="space-y-2 pl-2">
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span class="text-sm text-slate-600">Tarifa energía regular/kWh</span>
                  <span class="text-sm font-semibold text-slate-800">
                    {{ formatCurrency(invoice.standard_kwh_rate) }}
                    <span class="text-xs font-normal text-slate-400 ml-1">COP</span>
                  </span>
                </div>
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span class="text-sm text-slate-600">Total tarifa energía regular</span>
                  <span class="text-sm font-semibold text-slate-800">
                    {{ formatCurrency(regularSubtotal) }}
                    <span class="text-xs font-normal text-slate-400 ml-1">COP</span>
                  </span>
                </div>
                <div class="flex items-center justify-between py-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm text-slate-600">Contribución activa</span>
                    <span
                      class="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center cursor-help shrink-0"
                      title="Cargo regulado por la CREG para subsidio de usuarios estratos 1 y 2"
                    >
                      <span class="text-red-500 text-xs font-bold leading-none">!</span>
                    </span>
                  </div>
                  <span class="text-sm font-semibold text-slate-800">
                    {{ formatCurrency(contribucionActiva) }}
                    <span class="text-xs font-normal text-slate-400 ml-1">COP</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Regular total -->
            <div class="flex items-center justify-between px-4 py-3 bg-slate-50">
              <span class="text-sm font-bold text-slate-700">Total tarifa energía regular</span>
              <span class="text-sm font-bold text-slate-800">
                {{ formatCurrency(regularTotal) }}
                <span class="text-xs font-normal text-slate-400 ml-1">COP</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Solar energy breakdown (only if unergy + has solar consumption) -->
        <div v-if="invoice.branches?.unergy_subscribed && solarKwh > 0">
          <h3 class="text-sm font-bold text-slate-800 mb-3">Desglose factura energía solar</h3>
          <div class="rounded-xl border overflow-hidden divide-y" style="border-color: #bbf7d0">

            <!-- Consumption -->
            <div class="flex items-center justify-between px-4 py-3" style="background: #f0fdf7">
              <span class="text-sm text-emerald-700">Consumo energía solar</span>
              <span class="text-sm font-semibold text-emerald-800">
                {{ solarKwh.toLocaleString('es-CO', { maximumFractionDigits: 2 }) }}
                <span class="text-xs font-normal text-emerald-600 ml-1">kWh</span>
              </span>
            </div>

            <!-- Rate sub-section -->
            <div class="px-4 py-2 bg-white">
              <p class="text-xs font-semibold uppercase tracking-wide py-1.5" style="color: #4ade80">Tarifa energía solar</p>
              <div class="space-y-2 pl-2">
                <div class="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span class="text-sm text-slate-600">Tarifa energía solar/kWh</span>
                  <span class="text-sm font-semibold text-slate-800">
                    {{ formatCurrency(invoice.unergy_kwh_rate || 0) }}
                    <span class="text-xs font-normal text-slate-400 ml-1">COP</span>
                  </span>
                </div>
                <div class="flex items-center justify-between py-1.5">
                  <span class="text-sm text-slate-600">Total tarifa energía solar</span>
                  <span class="text-sm font-semibold text-slate-800">
                    {{ formatCurrency(solarTotal) }}
                    <span class="text-xs font-normal text-slate-400 ml-1">COP</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Solar total -->
            <div class="flex items-center justify-between px-4 py-3" style="background: #f0fdf7">
              <span class="text-sm font-bold" style="color: #15803d">Total tarifa energía solar</span>
              <span class="text-sm font-bold" style="color: #15803d">
                {{ formatCurrency(solarTotal) }}
                <span class="text-xs font-normal ml-1" style="color: #4ade80">COP</span>
              </span>
            </div>
          </div>

          <!-- Savings highlight -->
          <div
            v-if="invoice.savings > 0"
            class="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl"
            style="background: linear-gradient(135deg, #f0fdf7, #dcfce9); border: 1px solid #bbf7d0"
          >
            <TrendingDownIcon class="w-4 h-4 shrink-0" style="color: #00b85c" />
            <div>
              <p class="text-xs font-semibold" style="color: #15803d">Ahorro Unergy este período</p>
              <p class="text-sm font-bold" style="color: #00b85c">{{ formatCurrency(invoice.savings) }} COP</p>
            </div>
          </div>
        </div>

        <!-- Grand total -->
        <div class="rounded-xl border border-slate-200 px-4 py-4">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-700">Total factura</span>
            <span class="text-xl font-bold text-slate-800">
              {{ formatCurrency(grandTotal) }}
              <span class="text-sm font-normal text-slate-400 ml-1">COP</span>
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Energía regular + {{ invoice.branches?.unergy_subscribed && solarKwh > 0 ? 'solar + ' : '' }}contribución activa
          </p>
        </div>

      </div>

      <!-- ── Footer ──────────────────────────────────────────────── -->
      <div class="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50">
        <div v-if="invoice.status !== 'Pagada'" class="flex items-center gap-3">
          <button
            class="flex-1 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all"
            @click="$emit('update:modelValue', false)"
          >
            Cerrar
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 active:scale-95"
            style="background: #7c4dca"
            @click="$emit('pay', invoice)"
          >
            <CreditCardIcon class="w-4 h-4" />
            Pagar factura
          </button>
        </div>
        <div v-else class="flex items-center justify-center gap-2 py-2 text-sm font-medium text-emerald-600">
          <CheckCircleIcon class="w-4 h-4" />
          Factura pagada
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  XIcon, LeafIcon, TrendingDownIcon, CreditCardIcon, CheckCircleIcon,
} from 'lucide-vue-next'
import type { InvoiceWithSavings } from '~/types/database'

const props = defineProps<{
  modelValue: boolean
  invoice: InvoiceWithSavings | null
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'pay': [invoice: InvoiceWithSavings]
}>()

// ── Computed breakdown ───────────────────────────────────────────────────────
const regularKwh = computed(() => {
  if (!props.invoice) return 0
  return props.invoice.total_kwh_consumption - (props.invoice.unergy_kwh_consumed || 0)
})

const regularSubtotal = computed(() =>
  regularKwh.value * (props.invoice?.standard_kwh_rate || 0),
)

// "Contribución activa" — CREG-regulated charge, ~14.1% of energy subtotal
const contribucionActiva = computed(() =>
  Math.round(regularSubtotal.value * 0.141),
)

const regularTotal = computed(() =>
  regularSubtotal.value + contribucionActiva.value,
)

const solarKwh = computed(() => props.invoice?.unergy_kwh_consumed || 0)

const solarTotal = computed(() =>
  solarKwh.value * (props.invoice?.unergy_kwh_rate || 0),
)

const grandTotal = computed(() => regularTotal.value + solarTotal.value)

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(3)}M`
  return `$${Math.round(value).toLocaleString('es-CO')}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start + 'T00:00:00')
  const mo = s.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  return mo.charAt(0).toUpperCase() + mo.slice(1)
}

function statusClass(status: string) {
  return ({ Pagada: 'status-pagada', Pendiente: 'status-pendiente', Vencida: 'status-vencida' } as Record<string, string>)[status] || ''
}

function statusDotClass(status: string) {
  return ({ Pagada: 'bg-green-500', Pendiente: 'bg-yellow-500', Vencida: 'bg-red-500' } as Record<string, string>)[status] || 'bg-gray-400'
}
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
}
</style>
