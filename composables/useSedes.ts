import type { Branch } from '~/types/database'

export interface BranchForm {
  name: string
  city: string
  nit: string
  opening_date: string
  unergy_subscribed: boolean
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
  const filterUnergy = ref(false)

  const filteredBranches = computed(() => {
    return branches.value.filter((b) => {
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        if (!b.name.toLowerCase().includes(q) && !b.city.toLowerCase().includes(q)) return false
      }
      if (filterCity.value && b.city !== filterCity.value) return false
      if (filterUnergy.value && !b.unergy_subscribed) return false
      return true
    })
  })

  const availableCities = computed(() => {
    const cities = [...new Set(branches.value.map((b) => b.city))].sort()
    return cities
  })

  // Stats
  const unergyCount = computed(() => branches.value.filter((b) => b.unergy_subscribed).length)
  const cityCount = computed(() => new Set(branches.value.map((b) => b.city)).size)
  const ugranjaCount = computed(() => branches.value.filter((b) => b.ugranja_id).length)

  function resetFilters() {
    searchQuery.value = ''
    filterCity.value = ''
    filterUnergy.value = false
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
    filterUnergy,
    availableCities,
    resetFilters,
    unergyCount,
    cityCount,
    ugranjaCount,
  }
}
