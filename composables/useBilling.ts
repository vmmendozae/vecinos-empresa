import type { Invoice, InvoiceWithSavings, BillingFilters, MonthlyStat } from '~/types/database'

export const useBilling = () => {
  const supabase = useSupabaseClient()

  const allInvoices = ref<InvoiceWithSavings[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = reactive<BillingFilters>({
    search: '',
    city: '',
    status: '',
    marketer: '',
    unergyOnly: false,
    period: '',
  })

  function calculateSavings(invoice: Invoice): number {
    if (!invoice.branches?.unergy_subscribed) return 0
    if (!invoice.unergy_kwh_consumed || !invoice.unergy_kwh_rate || !invoice.standard_kwh_rate) return 0
    return invoice.unergy_kwh_consumed * (invoice.standard_kwh_rate - invoice.unergy_kwh_rate)
  }

  async function fetchInvoices() {
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('invoices')
      .select(`
        *,
        branches (
          id,
          name,
          city,
          unergy_subscribed,
          ugranja_id,
          ugranjas (*)
        )
      `)
      .order('issue_date', { ascending: false })

    if (err) {
      error.value = err.message
    } else {
      allInvoices.value = (data || []).map((inv: Invoice) => ({
        ...inv,
        savings: calculateSavings(inv),
      }))
    }
    loading.value = false
  }

  const filteredInvoices = computed(() => {
    return allInvoices.value.filter((inv) => {
      const search = filters.search.toLowerCase()
      if (search) {
        const matchName = inv.branches?.name?.toLowerCase().includes(search)
        const matchInvoice = inv.invoice_number?.toLowerCase().includes(search)
        if (!matchName && !matchInvoice) return false
      }
      if (filters.city && inv.branches?.city !== filters.city) return false
      if (filters.status && inv.status !== filters.status) return false
      if (filters.marketer && inv.energy_marketer !== filters.marketer) return false
      if (filters.unergyOnly && !inv.branches?.unergy_subscribed) return false
      if (filters.period && !inv.billing_period_start.startsWith(filters.period)) return false
      return true
    })
  })

  const totalKwh = computed(() =>
    filteredInvoices.value.reduce((sum, inv) => sum + (inv.total_kwh_consumption || 0), 0),
  )

  const totalCost = computed(() =>
    filteredInvoices.value.reduce(
      (sum, inv) => sum + inv.total_kwh_consumption * inv.standard_kwh_rate,
      0,
    ),
  )

  const totalSavings = computed(() =>
    filteredInvoices.value.reduce((sum, inv) => sum + inv.savings, 0),
  )

  const availablePeriods = computed(() => {
    const map = new Map<string, string>()
    allInvoices.value.forEach((inv) => {
      const d = new Date(inv.billing_period_start + 'T00:00:00')
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
      map.set(key, label.charAt(0).toUpperCase() + label.slice(1))
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }))
  })

  const availableCities = computed(() => {
    const cities = [...new Set(allInvoices.value.map((inv) => inv.branches?.city).filter(Boolean))]
    return cities.sort() as string[]
  })

  const availableMarketers = computed(() => {
    const marketers = [...new Set(allInvoices.value.map((inv) => inv.energy_marketer).filter(Boolean))]
    return marketers.sort() as string[]
  })

  const monthlyStats = computed((): MonthlyStat[] => {
    const byMonth: Record<string, MonthlyStat> = {}

    allInvoices.value.forEach((inv) => {
      const date = new Date(inv.billing_period_start)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })

      if (!byMonth[key]) {
        byMonth[key] = { month: label, consumption: 0, cost: 0, savings: 0 }
      }
      byMonth[key].consumption += inv.total_kwh_consumption
      byMonth[key].cost += inv.total_kwh_consumption * inv.standard_kwh_rate
      byMonth[key].savings += inv.savings
    })

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
  })

  async function markAsPaid(ids: string[]) {
    const { error: err } = await supabase
      .from('invoices')
      .update({ status: 'Pagada' })
      .in('id', ids)

    if (!err) {
      ids.forEach((id) => {
        const inv = allInvoices.value.find((i) => i.id === id)
        if (inv) inv.status = 'Pagada'
      })
    }
    return { error: err }
  }

  function resetFilters() {
    filters.search = ''
    filters.city = ''
    filters.status = ''
    filters.marketer = ''
    filters.unergyOnly = false
    filters.period = ''
  }

  return {
    allInvoices,
    filteredInvoices,
    filters,
    loading,
    error,
    fetchInvoices,
    calculateSavings,
    totalKwh,
    totalCost,
    totalSavings,
    availablePeriods,
    availableCities,
    availableMarketers,
    monthlyStats,
    markAsPaid,
    resetFilters,
  }
}
