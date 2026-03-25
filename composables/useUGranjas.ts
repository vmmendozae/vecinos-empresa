import type { Branch, UGranja, UGranjaWithBranches } from '~/types/database'

export const useUGranjas = () => {
  const supabase = useSupabaseClient()

  const ugranjas = ref<UGranjaWithBranches[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUGranjas() {
    loading.value = true
    error.value = null

    // Fetch company branches that are linked to a uGranja (RLS filters to current company)
    const { data, error: err } = await supabase
      .from('branches')
      .select('*, ugranjas(*)')
      .not('ugranja_id', 'is', null)
      .order('name')

    if (err) {
      error.value = err.message
      loading.value = false
      return
    }

    // Group branches by uGranja
    const map = new Map<string, { ugranja: UGranja; branches: Branch[] }>()
    for (const branch of data || []) {
      if (!branch.ugranjas || !branch.ugranja_id) continue
      if (!map.has(branch.ugranja_id)) {
        map.set(branch.ugranja_id, {
          ugranja: branch.ugranjas as unknown as UGranja,
          branches: [],
        })
      }
      const entry = map.get(branch.ugranja_id)!
      // Omit nested ugranjas from branch to avoid circular ref
      const { ugranjas: _, ...cleanBranch } = branch
      entry.branches.push(cleanBranch as Branch)
    }

    ugranjas.value = Array.from(map.values())
      .map(({ ugranja, branches }) => ({ ...ugranja, connectedBranches: branches }))
      .sort((a, b) => a.name.localeCompare(b.name))

    loading.value = false
  }

  const totalConnectedBranches = computed(() =>
    ugranjas.value.reduce((sum, g) => sum + g.connectedBranches.length, 0),
  )

  const totalGeneratedEnergy = computed(() =>
    ugranjas.value.reduce((sum, g) => sum + (g.generated_energy_kwh || 0), 0),
  )

  const totalAvoidedCO2 = computed(() =>
    ugranjas.value.reduce((sum, g) => sum + (g.avoided_co2_kg || 0), 0),
  )

  const totalSavedTrees = computed(() =>
    ugranjas.value.reduce((sum, g) => sum + (g.saved_trees || 0), 0),
  )

  return {
    ugranjas,
    loading,
    error,
    fetchUGranjas,
    totalConnectedBranches,
    totalGeneratedEnergy,
    totalAvoidedCO2,
    totalSavedTrees,
  }
}
