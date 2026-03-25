export type InvoiceStatus = 'Pagada' | 'Pendiente' | 'Vencida'

export interface Company {
  id: string
  name: string
  nit: string
  email: string
  created_at: string
}

export interface UGranja {
  id: string
  name: string
  location: string
  location_map_url: string | null
  photo_url: string | null
  connected_people: number
  generated_energy_kwh: number
  avoided_co2_kg: number
  saved_trees: number
  lat: number | null
  lng: number | null
  created_at: string
}

export interface Branch {
  id: string
  company_id: string
  name: string
  city: string
  opening_date: string | null
  nit: string | null
  unergy_subscribed: boolean
  ugranja_id: string | null
  ugranjas?: UGranja | null
  created_at: string
}

export interface Invoice {
  id: string
  branch_id: string
  status: InvoiceStatus
  energy_marketer: string
  invoice_number: string
  issue_date: string
  contract_number: string | null
  due_date: string
  billing_period_start: string
  billing_period_end: string
  total_kwh_consumption: number
  standard_kwh_rate: number
  unergy_kwh_rate: number | null
  unergy_kwh_consumed: number | null
  created_at: string
  branches?: Branch
}

export interface InvoiceWithSavings extends Invoice {
  savings: number
}

export interface UGranjaWithBranches extends UGranja {
  connectedBranches: Branch[]
}

export interface BillingFilters {
  search: string
  city: string
  status: string
  marketer: string
  unergyOnly: boolean
  period: string
}

export interface MonthlyStat {
  month: string
  consumption: number
  cost: number
  savings: number
}
