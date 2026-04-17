import type { Branch } from '~/types/database'

export interface BranchForm {
  name: string
  city: string
  nit: string
  opening_date: string
  unergy_subscribed: boolean
  or: string
  comercializador: string
  kwh_consumption: number | null
  asignacion_pct: number | null
  solar: boolean
  notes: string
  labels: string[]
}

export const useSedes = () => {
  const supabase = useSupabaseClient()
  const { company, fetchCompany } = useCompany()

  const branches = ref<Branch[]>([])
  const loading = ref(false)

  async function fetchBranches() {
    loading.value = true
    const { data } = await supabase
      .from('branches')
      .select('*, ugranjas(*)')
      .order('name')
    branches.value = (data || []) as Branch[]
    loading.value = false
  }

  async function createBranch(form: BranchForm) {
    if (!company.value?.id) await fetchCompany()
    if (!company.value?.id) {
      return { error: { message: 'No se pudo obtener la empresa del usuario.' } }
    }

    const { data, error } = await supabase
      .from('branches')
      .insert({
        name: form.name,
        city: form.city,
        nit: form.nit || null,
        opening_date: form.opening_date || null,
        unergy_subscribed: form.unergy_subscribed,
        company_id: company.value.id,
        or: form.or || null,
        comercializador: form.comercializador || null,
        kwh_consumption: form.kwh_consumption ?? null,
        asignacion_pct: form.asignacion_pct ?? null,
        solar: form.solar,
        notes: form.notes || null,
        labels: form.labels,
      })
      .select('*, ugranjas(*)')
      .single()

    if (!error && data) {
      branches.value = [...branches.value, data as Branch].sort((a, b) =>
        a.name.localeCompare(b.name),
      )
    }
    return { error }
  }

  async function updateBranch(id: string, form: BranchForm) {
    const { data, error } = await supabase
      .from('branches')
      .update({
        name: form.name,
        city: form.city,
        nit: form.nit || null,
        opening_date: form.opening_date || null,
        unergy_subscribed: form.unergy_subscribed,
        or: form.or || null,
        comercializador: form.comercializador || null,
        kwh_consumption: form.kwh_consumption ?? null,
        asignacion_pct: form.asignacion_pct ?? null,
        solar: form.solar,
        notes: form.notes || null,
        labels: form.labels,
      })
      .eq('id', id)
      .select('*, ugranjas(*)')
      .single()

    if (!error && data) {
      const idx = branches.value.findIndex((b) => b.id === id)
      if (idx !== -1) branches.value[idx] = data as Branch
    }
    return { error }
  }

  async function deleteBranch(id: string) {
    const { error } = await supabase.from('branches').delete().eq('id', id)
    if (!error) {
      branches.value = branches.value.filter((b) => b.id !== id)
    }
    return { error }
  }

  // Filtered view
  const searchQuery = ref('')
  const filterCity = ref('')
  const filterOR = ref('')
  const filterComercializador = ref('')
  const filterUnergy = ref(false)
  const filterSolar = ref(false)
  const filterAsignacionFuera = ref(false)
  const filterProspecto = ref(false)

  function isProspecto(b: Branch) {
    return (
      !!b.or &&
      !!b.comercializador &&
      b.or.trim().toLowerCase() === b.comercializador.trim().toLowerCase() &&
      !b.solar &&
      !!b.kwh_consumption
    )
  }

  const filteredBranches = computed(() => {
    return branches.value.filter((b) => {
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        if (
          !b.name.toLowerCase().includes(q) &&
          !(b.city || '').toLowerCase().includes(q) &&
          !(b.nit || '').toLowerCase().includes(q)
        ) return false
      }
      if (filterCity.value && (b.city || '').trim().toLowerCase() !== filterCity.value.trim().toLowerCase()) return false
      if (filterOR.value && (b.or || '').trim().toLowerCase() !== filterOR.value.trim().toLowerCase()) return false
      if (filterComercializador.value && (b.comercializador || '').trim().toLowerCase() !== filterComercializador.value.trim().toLowerCase()) return false
      if (filterUnergy.value && !b.unergy_subscribed) return false
      if (filterSolar.value && !b.solar) return false
      if (filterAsignacionFuera.value) {
        const pct = b.asignacion_pct
        if (pct == null || (pct >= 70 && pct <= 80)) return false
      }
      if (filterProspecto.value && !isProspecto(b) && !b.labels?.includes('Prospecto')) return false
      return true
    })
  })

  // Deduplicate options case-insensitively, keep canonical (first seen) form
  const availableCities = computed(() => {
    const seen = new Map<string, string>()
    branches.value.forEach((b) => {
      if (b.city) {
        const key = b.city.trim().toLowerCase()
        if (!seen.has(key)) seen.set(key, b.city.trim())
      }
    })
    return [...seen.values()].sort((a, b) => a.localeCompare(b, 'es'))
  })

  const availableORs = computed(() => {
    const seen = new Map<string, string>()
    branches.value.forEach((b) => {
      if (b.or) {
        const key = b.or.trim().toLowerCase()
        if (!seen.has(key)) seen.set(key, b.or.trim())
      }
    })
    return [...seen.values()].sort((a, b) => a.localeCompare(b)) as string[]
  })

  const availableComercializadores = computed(() => {
    const seen = new Map<string, string>()
    branches.value.forEach((b) => {
      if (b.comercializador) {
        const key = b.comercializador.trim().toLowerCase()
        if (!seen.has(key)) seen.set(key, b.comercializador.trim())
      }
    })
    return [...seen.values()].sort((a, b) => a.localeCompare(b)) as string[]
  })

  type GroupBy = '' | 'or' | 'comercializador' | 'city' | 'labels'
  const groupBy = ref<GroupBy>('')

  const groupedBranches = computed(() => {
    if (!groupBy.value) return null
    // Use canonical Map: normalized key → { displayLabel, branches[] }
    const groups = new Map<string, { label: string; branches: Branch[] }>()

    for (const b of filteredBranches.value) {
      let pairs: { key: string; label: string }[]

      if (groupBy.value === 'labels') {
        const effective = [...(b.labels ?? [])]
        if (isProspecto(b) && !effective.includes('Prospecto')) effective.unshift('Prospecto')
        pairs = effective.length
          ? effective.map((l) => ({ key: l.toLowerCase(), label: l }))
          : [{ key: 'sin etiqueta', label: 'Sin etiqueta' }]
      } else {
        const raw = (b[groupBy.value as keyof Branch] as string | null | undefined) ?? ''
        const label = raw.trim() || `Sin ${groupBy.value}`
        pairs = [{ key: label.toLowerCase(), label }]
      }

      for (const { key, label } of pairs) {
        if (!groups.has(key)) groups.set(key, { label, branches: [] })
        groups.get(key)!.branches.push(b)
      }
    }

    return [...groups.values()]
      .sort((a, b) => a.label.localeCompare(b.label, 'es'))
      .map((g) => [g.label, g.branches] as [string, Branch[]])
  })

  const hasActiveFilters = computed(() =>
    !!searchQuery.value || !!filterCity.value || !!filterOR.value ||
    !!filterComercializador.value || filterUnergy.value || filterSolar.value ||
    filterAsignacionFuera.value || filterProspecto.value,
  )

  // Stats
  const unergyCount = computed(() => branches.value.filter((b) => b.unergy_subscribed).length)
  const cityCount = computed(() => new Set(branches.value.map((b) => b.city?.trim().toLowerCase()).filter(Boolean)).size)
  const ugranjaCount = computed(() => branches.value.filter((b) => b.ugranja_id).length)
  const solarCount = computed(() => branches.value.filter((b) => b.solar).length)

  function resetFilters() {
    searchQuery.value = ''
    filterCity.value = ''
    filterOR.value = ''
    filterComercializador.value = ''
    filterUnergy.value = false
    filterSolar.value = false
    filterAsignacionFuera.value = false
    filterProspecto.value = false
  }

  return {
    branches,
    filteredBranches,
    loading,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    searchQuery,
    filterCity,
    filterOR,
    filterComercializador,
    filterUnergy,
    filterSolar,
    filterAsignacionFuera,
    filterProspecto,
    groupBy,
    groupedBranches,
    availableCities,
    availableORs,
    availableComercializadores,
    hasActiveFilters,
    resetFilters,
    unergyCount,
    cityCount,
    ugranjaCount,
    solarCount,
  }
}
