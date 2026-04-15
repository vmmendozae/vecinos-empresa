<template>
  <div class="bg-white rounded-xl border border-slate-200 px-4 py-3">
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div class="flex-1 min-w-52">
        <UInput
          v-model="filters.search"
          placeholder="Buscar sede o N° factura..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          color="white"
          class="w-full"
        />
      </div>

      <!-- Period filter -->
      <USelect
        v-model="filters.period"
        :options="periodOptions"
        placeholder="Período"
        size="sm"
        color="white"
        class="w-44"
      />

      <!-- City filter -->
      <USelect
        v-model="filters.city"
        :options="cityOptions"
        placeholder="Ciudad"
        size="sm"
        color="white"
        class="w-36"
      />

      <!-- Status filter -->
      <USelect
        v-model="filters.status"
        :options="statusOptions"
        placeholder="Estado"
        size="sm"
        color="white"
        class="w-36"
      />

      <!-- Marketer filter -->
      <USelect
        v-model="filters.marketer"
        :options="marketerOptions"
        placeholder="Comercializador"
        size="sm"
        color="white"
        class="w-44"
      />

      <!-- Unergy toggle -->
      <button
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all"
        :class="
          filters.unergyOnly
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
        "
        @click="filters.unergyOnly = !filters.unergyOnly"
      >
        <LeafIcon class="w-3.5 h-3.5" />
        Solo Unergy
      </button>

      <!-- Reset -->
      <UButton
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        icon="i-heroicons-x-mark"
        class="text-slate-400"
        @click="$emit('reset')"
      >
        Limpiar
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LeafIcon } from 'lucide-vue-next'
import type { BillingFilters } from '~/types/database'

const props = defineProps<{
  filters: BillingFilters
  cities: string[]
  marketers: string[]
  periods: { value: string; label: string }[]
}>()

defineEmits<{ reset: [] }>()

const periodOptions = computed(() => [
  { label: 'Todos los períodos', value: '' },
  ...props.periods,
])

const cityOptions = computed(() => [
  { label: 'Todas las ciudades', value: '' },
  ...props.cities.map((c) => ({ label: c, value: c })),
])

const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Pagada', value: 'Pagada' },
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'Vencida', value: 'Vencida' },
]

const marketerOptions = computed(() => [
  { label: 'Todos los comercializadores', value: '' },
  ...props.marketers.map((m) => ({ label: m, value: m })),
])

const hasActiveFilters = computed(
  () =>
    props.filters.search ||
    props.filters.city ||
    props.filters.status ||
    props.filters.marketer ||
    props.filters.unergyOnly ||
    props.filters.period,
)
</script>
