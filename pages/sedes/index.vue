<template>
  <div class="space-y-5">

    <!-- Page header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Sedes</h2>
        <p class="text-sm text-slate-400 mt-0.5">Administra las sedes de tu empresa</p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style="background: #7c4dca"
        @click="openCreate"
      >
        <PlusIcon class="w-4 h-4" />
        Nueva Sede
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style="border-color: #7c4dca; border-top-color: transparent" />
        <p class="text-sm text-slate-400">Cargando sedes...</p>
      </div>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: #f3eeff">
              <BuildingIcon class="w-4.5 h-4.5" style="color: #7c4dca" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
          </div>
          <p class="text-3xl font-bold text-slate-800 tabular-nums">{{ branches.length }}</p>
          <p class="text-xs text-slate-400 mt-0.5">sedes registradas</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: #dcfce7">
              <LeafIcon class="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unergy</span>
          </div>
          <p class="text-3xl font-bold text-slate-800 tabular-nums">{{ unergyCount }}</p>
          <p class="text-xs text-slate-400 mt-0.5">suscritas a energía solar</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: #fff7ed">
              <MapPinIcon class="w-4.5 h-4.5 text-orange-500" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ciudades</span>
          </div>
          <p class="text-3xl font-bold text-slate-800 tabular-nums">{{ cityCount }}</p>
          <p class="text-xs text-slate-400 mt-0.5">ciudades distintas</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: #fefce8">
              <SunIcon class="w-4.5 h-4.5 text-yellow-500" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">uGranjas</span>
          </div>
          <p class="text-3xl font-bold text-slate-800 tabular-nums">{{ ugranjaCount }}</p>
          <p class="text-xs text-slate-400 mt-0.5">con granja asignada</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-48">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar sede o ciudad..."
            class="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style="focus:ring-color: #7c4dca"
          />
        </div>

        <select
          v-model="filterCity"
          class="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 min-w-36"
        >
          <option value="">Todas las ciudades</option>
          <option v-for="city in availableCities" :key="city" :value="city">{{ city }}</option>
        </select>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <div
            class="relative w-9 h-5 rounded-full transition-colors duration-200"
            :style="filterUnergy ? 'background:#00b85c' : 'background:#cbd5e1'"
            @click="filterUnergy = !filterUnergy"
          >
            <div
              class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              :class="filterUnergy ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </div>
          <span class="text-sm text-slate-600 font-medium">Solo Unergy</span>
        </label>

        <button
          v-if="searchQuery || filterCity || filterUnergy"
          class="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          @click="resetFilters"
        >
          <XIcon class="w-3.5 h-3.5" />
          Limpiar
        </button>

        <span class="ml-auto text-xs text-slate-400 font-medium">
          {{ filteredBranches.length }} de {{ branches.length }} sedes
        </span>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50">
              <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sede</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ciudad</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIT</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Apertura</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">uGranja</th>
              <th class="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="branch in filteredBranches"
              :key="branch.id"
              class="hover:bg-slate-50/60 transition-colors group"
            >
              <!-- Name -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style="background: #7c4dca"
                  >
                    {{ branch.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-800">{{ branch.name }}</p>
                    <span
                      v-if="branch.unergy_subscribed"
                      class="inline-flex items-center gap-0.5 text-xs font-medium"
                      style="color: #16a34a"
                    >
                      <LeafIcon class="w-3 h-3" />
                      Unergy Vecinos
                    </span>
                  </div>
                </div>
              </td>

              <!-- City -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-1.5 text-slate-600">
                  <MapPinIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {{ branch.city }}
                </div>
              </td>

              <!-- NIT -->
              <td class="px-4 py-3.5 font-mono text-xs text-slate-500">
                {{ branch.nit || '—' }}
              </td>

              <!-- Opening date -->
              <td class="px-4 py-3.5 text-slate-500 text-xs">
                {{ branch.opening_date ? formatDate(branch.opening_date) : '—' }}
              </td>

              <!-- uGranja (read-only) -->
              <td class="px-4 py-3.5">
                <span
                  v-if="branch.ugranjas"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style="background: #fefce8; color: #854d0e"
                >
                  <SunIcon class="w-3 h-3" />
                  {{ branch.ugranjas.name.replace('uGranja Solar ', '') }}
                </span>
                <span v-else class="text-slate-300 text-xs">Sin asignar</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    title="Editar sede"
                    @click="openEdit(branch)"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Eliminar sede"
                    @click="openDelete(branch)"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="filteredBranches.length === 0">
              <td colspan="6" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background: #f3eeff">
                    <BuildingIcon class="w-7 h-7" style="color: #c4b5f4" />
                  </div>
                  <p class="font-medium text-slate-500">
                    {{ branches.length === 0 ? 'Sin sedes registradas' : 'Sin resultados' }}
                  </p>
                  <p class="text-sm text-slate-400">
                    {{ branches.length === 0 ? 'Crea tu primera sede para comenzar.' : 'Ajusta los filtros para ver sedes.' }}
                  </p>
                  <button
                    v-if="branches.length === 0"
                    class="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style="background: #7c4dca"
                    @click="openCreate"
                  >
                    <PlusIcon class="w-4 h-4" />
                    Nueva Sede
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ── Create / Edit Modal ───────────────────────────────────────────── -->
    <UModal v-model="showFormModal" :ui="{ width: 'sm:max-w-lg' }" prevent-close>
      <div class="rounded-2xl overflow-hidden bg-white">
        <!-- Header -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style="background: #f3eeff"
          >
            <component :is="editingBranch ? PencilIcon : PlusIcon" class="w-5 h-5" style="color: #7c4dca" />
          </div>
          <div>
            <p class="font-bold text-slate-800">{{ editingBranch ? 'Editar Sede' : 'Nueva Sede' }}</p>
            <p class="text-xs text-slate-400">{{ editingBranch ? `Actualizando ${editingBranch.name}` : 'Completa los datos de la nueva sede' }}</p>
          </div>
        </div>

        <!-- Form -->
        <div class="px-6 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <!-- Name -->
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Nombre <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ej: OXXO Chapinero"
                class="w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition"
                :class="formErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-purple-100 focus:border-purple-400'"
              />
              <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
            </div>

            <!-- City -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Ciudad <span class="text-red-400">*</span>
              </label>
              <CitySelect
                v-model="form.city"
                placeholder="Buscar ciudad..."
                :has-error="!!formErrors.city"
              />
              <p v-if="formErrors.city" class="text-xs text-red-500 mt-1">{{ formErrors.city }}</p>
            </div>

            <!-- NIT -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">NIT</label>
              <input
                v-model="form.nit"
                type="text"
                placeholder="900.123.456-7"
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition"
              />
            </div>

            <!-- Opening date -->
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fecha de Apertura</label>
              <input
                v-model="form.opening_date"
                type="date"
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition text-slate-700"
              />
            </div>
          </div>

          <!-- Unergy toggle -->
          <div
            class="flex items-center justify-between p-4 rounded-xl border transition-colors"
            :style="form.unergy_subscribed
              ? 'background: #f0fdf4; border-color: #bbf7d0'
              : 'background: #f8fafc; border-color: #e2e8f0'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :style="form.unergy_subscribed ? 'background: #dcfce7' : 'background: #f1f5f9'"
              >
                <LeafIcon class="w-4.5 h-4.5" :style="form.unergy_subscribed ? 'color: #16a34a' : 'color: #94a3b8'" />
              </div>
              <div>
                <p class="text-sm font-semibold" :class="form.unergy_subscribed ? 'text-emerald-800' : 'text-slate-700'">
                  Suscrita a Unergy Vecinos
                </p>
                <p class="text-xs" :class="form.unergy_subscribed ? 'text-emerald-600' : 'text-slate-400'">
                  {{ form.unergy_subscribed ? 'Recibe energía de uGranjas solares' : 'Sin suscripción activa' }}
                </p>
              </div>
            </div>
            <div
              class="relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0"
              :style="form.unergy_subscribed ? 'background: #22c55e' : 'background: #cbd5e1'"
              @click="form.unergy_subscribed = !form.unergy_subscribed"
            >
              <div
                class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                :class="form.unergy_subscribed ? 'translate-x-5' : 'translate-x-1'"
              />
            </div>
          </div>

          <!-- Save error -->
          <div v-if="saveError" class="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircleIcon class="w-4 h-4 text-red-500 shrink-0" />
            <p class="text-xs text-red-600">{{ saveError }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            class="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            @click="showFormModal = false"
          >
            Cancelar
          </button>
          <button
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style="background: #7c4dca"
            :disabled="saving"
            @click="submitForm"
          >
            <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <CheckIcon v-else class="w-4 h-4" />
            {{ saving ? 'Guardando...' : (editingBranch ? 'Guardar cambios' : 'Crear sede') }}
          </button>
        </div>
      </div>
    </UModal>

    <!-- ── Delete Confirm Modal ──────────────────────────────────────────── -->
    <UModal v-model="showDeleteModal" :ui="{ width: 'sm:max-w-sm' }">
      <div class="rounded-2xl overflow-hidden bg-white">
        <div class="px-6 pt-6 pb-5 text-center">
          <div class="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style="background: #fee2e2">
            <Trash2Icon class="w-7 h-7 text-red-500" />
          </div>
          <p class="font-bold text-slate-800 text-base mb-1">¿Eliminar esta sede?</p>
          <p class="text-sm text-slate-500 mb-1">
            <span class="font-semibold text-slate-700">{{ deletingBranch?.name }}</span>
          </p>
          <p class="text-xs text-slate-400">
            Esta acción no se puede deshacer. Las facturas asociadas también serán eliminadas.
          </p>

          <div v-if="deleteError" class="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-left">
            <AlertCircleIcon class="w-4 h-4 text-red-500 shrink-0" />
            <p class="text-xs text-red-600">{{ deleteError }}</p>
          </div>
        </div>

        <div class="flex gap-3 px-6 pb-6">
          <button
            class="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            @click="showDeleteModal = false"
          >
            Cancelar
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
            :disabled="deleting"
            @click="confirmDelete"
          >
            <span v-if="deleting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <Trash2Icon v-else class="w-4 h-4" />
            {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </UModal>

  </div>
</template>

<script setup lang="ts">
import {
  BuildingIcon,
  LeafIcon,
  MapPinIcon,
  SunIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
  PencilIcon,
  Trash2Icon,
  CheckIcon,
  AlertCircleIcon,
} from 'lucide-vue-next'
import type { Branch } from '~/types/database'
import type { BranchForm } from '~/composables/useSedes'

definePageMeta({ layout: 'dashboard' })

const {
  branches,
  filteredBranches,
  loading,
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  searchQuery,
  filterCity,
  filterUnergy,
  availableCities,
  resetFilters,
  unergyCount,
  cityCount,
  ugranjaCount,
} = useSedes()

onMounted(() => fetchBranches())

// ── Form modal ──────────────────────────────────────────────────────────────
const showFormModal = ref(false)
const editingBranch = ref<Branch | null>(null)
const saving = ref(false)
const saveError = ref('')

const emptyForm = (): BranchForm => ({
  name: '',
  city: '',
  nit: '',
  opening_date: '',
  unergy_subscribed: false,
})

const form = reactive<BranchForm>(emptyForm())
const formErrors = reactive({ name: '', city: '' })

function openCreate() {
  editingBranch.value = null
  Object.assign(form, emptyForm())
  formErrors.name = ''
  formErrors.city = ''
  saveError.value = ''
  showFormModal.value = true
}

function openEdit(branch: Branch) {
  editingBranch.value = branch
  Object.assign(form, {
    name: branch.name,
    city: branch.city,
    nit: branch.nit || '',
    opening_date: branch.opening_date || '',
    unergy_subscribed: branch.unergy_subscribed,
  })
  formErrors.name = ''
  formErrors.city = ''
  saveError.value = ''
  showFormModal.value = true
}

function validateForm(): boolean {
  formErrors.name = form.name.trim() ? '' : 'El nombre es requerido.'
  formErrors.city = form.city.trim() ? '' : 'La ciudad es requerida.'
  return !formErrors.name && !formErrors.city
}

async function submitForm() {
  if (!validateForm()) return
  saving.value = true
  saveError.value = ''

  const { error } = editingBranch.value
    ? await updateBranch(editingBranch.value.id, { ...form })
    : await createBranch({ ...form })

  saving.value = false

  if (error) {
    saveError.value = 'Error al guardar. Intenta de nuevo.'
  } else {
    showFormModal.value = false
    useToast().add({
      title: editingBranch.value ? 'Sede actualizada' : 'Sede creada',
      description: `${form.name} fue ${editingBranch.value ? 'actualizada' : 'creada'} correctamente.`,
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })
  }
}

// ── Delete modal ────────────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const deletingBranch = ref<Branch | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function openDelete(branch: Branch) {
  deletingBranch.value = branch
  deleteError.value = ''
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deletingBranch.value) return
  deleting.value = true
  deleteError.value = ''

  const { error } = await deleteBranch(deletingBranch.value.id)

  deleting.value = false

  if (error) {
    deleteError.value = 'No se pudo eliminar. Puede tener facturas asociadas.'
  } else {
    showDeleteModal.value = false
    useToast().add({
      title: 'Sede eliminada',
      description: `${deletingBranch.value.name} fue eliminada.`,
      color: 'green',
      icon: 'i-heroicons-check-circle',
    })
    deletingBranch.value = null
  }
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>
