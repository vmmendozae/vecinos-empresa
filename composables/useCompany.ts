import type { Company } from '~/types/database'

export const useCompany = () => {
  // useState = shared across all components, persists during navigation
  const company = useState<Company | null>('userCompany', () => null)
  const loading = useState<boolean>('userCompanyLoading', () => false)

  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function fetchCompany() {
    if (!user.value) return
    loading.value = true

    const { data } = await supabase
      .from('user_profiles')
      .select('company_id, role, companies(*)')
      .eq('id', user.value.id)
      .single()

    company.value = (data?.companies as unknown as Company) ?? null
    loading.value = false
  }

  const companyInitial = computed(() =>
    company.value?.name?.charAt(0)?.toUpperCase() ?? '?',
  )

  const companyName = computed(() => company.value?.name ?? '')

  return {
    company,
    loading,
    fetchCompany,
    companyInitial,
    companyName,
  }
}
