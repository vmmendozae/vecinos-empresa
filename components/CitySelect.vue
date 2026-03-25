<template>
  <div ref="containerRef" class="relative">
    <div
      class="flex items-center gap-2 px-3.5 py-2.5 text-sm border rounded-lg transition cursor-text"
      :class="[
        open ? 'ring-2 ring-purple-100 border-purple-400' : 'border-slate-200 hover:border-slate-300',
        hasError ? 'border-red-300 ring-2 ring-red-100' : '',
      ]"
      @click="openDropdown"
    >
      <MapPinIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="modelValue || placeholder"
        class="flex-1 outline-none bg-transparent text-slate-700 placeholder-slate-400 text-sm min-w-0"
        :class="{ 'placeholder-slate-700': modelValue && !query }"
        @input="open = true"
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.escape="close"
        @keydown.tab="close"
      />
      <ChevronDownIcon
        class="w-4 h-4 text-slate-400 shrink-0 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </div>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="open && filtered.length > 0"
        class="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
        style="max-height: 220px"
      >
        <div class="overflow-y-auto" style="max-height: 220px">
          <button
            v-for="(city, idx) in filtered"
            :key="city"
            type="button"
            class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
            :class="idx === highlightedIdx
              ? 'bg-purple-50 text-purple-800 font-medium'
              : 'text-slate-700 hover:bg-slate-50'"
            @mousedown.prevent="selectCity(city)"
            @mouseenter="highlightedIdx = idx"
          >
            <span class="flex-1 truncate">{{ city }}</span>
            <CheckIcon v-if="modelValue === city" class="w-3.5 h-3.5 shrink-0 text-purple-500" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- No results -->
    <Transition name="dropdown">
      <div
        v-if="open && query && filtered.length === 0"
        class="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg px-4 py-3 text-sm text-slate-400"
      >
        Sin resultados para "{{ query }}"
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { MapPinIcon, ChevronDownIcon, CheckIcon } from 'lucide-vue-next'
import { COLOMBIA_CITIES } from '~/utils/colombiaCities'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  hasError?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const open = ref(false)
const query = ref('')
const highlightedIdx = ref(0)

const filtered = computed(() => {
  const q = query.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (!q) return COLOMBIA_CITIES
  return COLOMBIA_CITIES.filter((c) =>
    c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q),
  )
})

function openDropdown() {
  open.value = true
  nextTick(() => inputRef.value?.focus())
}

function close() {
  open.value = false
  query.value = ''
  highlightedIdx.value = 0
}

function selectCity(city: string) {
  emit('update:modelValue', city)
  close()
}

function selectHighlighted() {
  if (filtered.value[highlightedIdx.value]) {
    selectCity(filtered.value[highlightedIdx.value])
  }
}

function moveDown() {
  if (highlightedIdx.value < filtered.value.length - 1) highlightedIdx.value++
}

function moveUp() {
  if (highlightedIdx.value > 0) highlightedIdx.value--
}

// Reset highlight when filter changes
watch(filtered, () => { highlightedIdx.value = 0 })

// Click outside to close
onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})

function handleOutsideClick(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close()
  }
}
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
