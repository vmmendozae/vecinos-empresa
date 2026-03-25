/**
 * Setup script — crea tablas e inserta datos demo en Supabase
 * Uso: node scripts/setup-db.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gyepgqeejspozhocrpkj.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ─── Helper ────────────────────────────────────────────────────────────────
async function sql(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  return res
}

// ─── Seed via JS client (insert) ───────────────────────────────────────────
async function seedData() {
  console.log('\n📦 Insertando datos demo...\n')

  // COMPANIES
  const { error: e1 } = await supabase.from('companies').upsert([
    {
      id: 'a1b2c3d4-0000-0000-0000-000000000001',
      name: 'SportLife Colombia S.A.S.',
      nit: '900.234.567-8',
      email: 'admin@sportlife.com.co',
    },
  ])
  if (e1) { console.error('❌ companies:', e1.message); return }
  console.log('✅ companies')

  // UGRANJAS
  const { error: e2 } = await supabase.from('ugranjas').upsert([
    {
      id: 'b1000000-0000-0000-0000-000000000001',
      name: 'uGranja Solar Cundinamarca',
      location: 'Sopó, Cundinamarca',
      location_map_url: 'https://maps.google.com/?q=Sopó+Cundinamarca+Colombia',
      photo_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
      connected_people: 342,
      generated_energy_kwh: 1250000,
      avoided_co2_kg: 437500,
      saved_trees: 12500,
    },
    {
      id: 'b1000000-0000-0000-0000-000000000002',
      name: 'uGranja Solar Antioquia',
      location: 'Rionegro, Antioquia',
      location_map_url: 'https://maps.google.com/?q=Rionegro+Antioquia+Colombia',
      photo_url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800&q=80',
      connected_people: 215,
      generated_energy_kwh: 890000,
      avoided_co2_kg: 311500,
      saved_trees: 8900,
    },
  ])
  if (e2) { console.error('❌ ugranjas:', e2.message); return }
  console.log('✅ ugranjas')

  // BRANCHES
  const { error: e3 } = await supabase.from('branches').upsert([
    { id: 'c1000000-0000-0000-0000-000000000001', company_id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'SportLife Usaquén',   city: 'Bogotá D.C.',  opening_date: '2018-03-15', nit: '900.234.567-1', unergy_subscribed: true,  ugranja_id: 'b1000000-0000-0000-0000-000000000001' },
    { id: 'c1000000-0000-0000-0000-000000000002', company_id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'SportLife Chapinero', city: 'Bogotá D.C.',  opening_date: '2019-07-01', nit: '900.234.567-2', unergy_subscribed: true,  ugranja_id: 'b1000000-0000-0000-0000-000000000001' },
    { id: 'c1000000-0000-0000-0000-000000000003', company_id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'SportLife El Poblado',city: 'Medellín',     opening_date: '2020-01-10', nit: '900.234.567-3', unergy_subscribed: true,  ugranja_id: 'b1000000-0000-0000-0000-000000000002' },
    { id: 'c1000000-0000-0000-0000-000000000004', company_id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'SportLife Envigado',  city: 'Medellín',     opening_date: '2021-05-20', nit: '900.234.567-4', unergy_subscribed: false, ugranja_id: null },
    { id: 'c1000000-0000-0000-0000-000000000005', company_id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'SportLife Granada',   city: 'Cali',         opening_date: '2019-11-01', nit: '900.234.567-5', unergy_subscribed: false, ugranja_id: null },
    { id: 'c1000000-0000-0000-0000-000000000006', company_id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'SportLife Norte',     city: 'Barranquilla', opening_date: '2022-03-08', nit: '900.234.567-6', unergy_subscribed: false, ugranja_id: null },
  ])
  if (e3) { console.error('❌ branches:', e3.message); return }
  console.log('✅ branches (6 sedes)')

  // INVOICES
  const invoices = [
    // Usaquén (Enel-Codensa, Unergy ✓)
    { id: 'd1000000-0001-0000-0000-000000000001', branch_id: 'c1000000-0000-0000-0000-000000000001', status: 'Pagada',   energy_marketer: 'Enel-Codensa', invoice_number: 'ENL-2024-110001', issue_date: '2024-11-05', contract_number: 'CNT-USQ-2022-001', due_date: '2024-11-25', billing_period_start: '2024-10-01', billing_period_end: '2024-10-31', total_kwh_consumption: 42500, standard_kwh_rate: 650, unergy_kwh_rate: 380, unergy_kwh_consumed: 18000 },
    { id: 'd1000000-0001-0000-0000-000000000002', branch_id: 'c1000000-0000-0000-0000-000000000001', status: 'Pagada',   energy_marketer: 'Enel-Codensa', invoice_number: 'ENL-2024-120001', issue_date: '2024-12-05', contract_number: 'CNT-USQ-2022-001', due_date: '2024-12-26', billing_period_start: '2024-11-01', billing_period_end: '2024-11-30', total_kwh_consumption: 44200, standard_kwh_rate: 650, unergy_kwh_rate: 380, unergy_kwh_consumed: 19000 },
    { id: 'd1000000-0001-0000-0000-000000000003', branch_id: 'c1000000-0000-0000-0000-000000000001', status: 'Pendiente',energy_marketer: 'Enel-Codensa', invoice_number: 'ENL-2025-010001', issue_date: '2025-01-06', contract_number: 'CNT-USQ-2022-001', due_date: '2025-01-27', billing_period_start: '2024-12-01', billing_period_end: '2024-12-31', total_kwh_consumption: 43800, standard_kwh_rate: 650, unergy_kwh_rate: 380, unergy_kwh_consumed: 17500 },
    // Chapinero (Enel-Codensa, Unergy ✓)
    { id: 'd1000000-0002-0000-0000-000000000001', branch_id: 'c1000000-0000-0000-0000-000000000002', status: 'Pagada',   energy_marketer: 'Enel-Codensa', invoice_number: 'ENL-2024-110002', issue_date: '2024-11-05', contract_number: 'CNT-CHP-2022-002', due_date: '2024-11-25', billing_period_start: '2024-10-01', billing_period_end: '2024-10-31', total_kwh_consumption: 36000, standard_kwh_rate: 650, unergy_kwh_rate: 380, unergy_kwh_consumed: 15000 },
    { id: 'd1000000-0002-0000-0000-000000000002', branch_id: 'c1000000-0000-0000-0000-000000000002', status: 'Pagada',   energy_marketer: 'Enel-Codensa', invoice_number: 'ENL-2024-120002', issue_date: '2024-12-05', contract_number: 'CNT-CHP-2022-002', due_date: '2024-12-26', billing_period_start: '2024-11-01', billing_period_end: '2024-11-30', total_kwh_consumption: 37500, standard_kwh_rate: 650, unergy_kwh_rate: 380, unergy_kwh_consumed: 16000 },
    { id: 'd1000000-0002-0000-0000-000000000003', branch_id: 'c1000000-0000-0000-0000-000000000002', status: 'Pendiente',energy_marketer: 'Enel-Codensa', invoice_number: 'ENL-2025-010002', issue_date: '2025-01-06', contract_number: 'CNT-CHP-2022-002', due_date: '2025-01-27', billing_period_start: '2024-12-01', billing_period_end: '2024-12-31', total_kwh_consumption: 35800, standard_kwh_rate: 650, unergy_kwh_rate: 380, unergy_kwh_consumed: 14500 },
    // El Poblado (EPM, Unergy ✓)
    { id: 'd1000000-0003-0000-0000-000000000001', branch_id: 'c1000000-0000-0000-0000-000000000003', status: 'Pagada',   energy_marketer: 'EPM', invoice_number: 'EPM-2024-110001', issue_date: '2024-11-03', contract_number: 'CNT-POB-2021-001', due_date: '2024-11-23', billing_period_start: '2024-10-01', billing_period_end: '2024-10-31', total_kwh_consumption: 39500, standard_kwh_rate: 600, unergy_kwh_rate: 380, unergy_kwh_consumed: 17000 },
    { id: 'd1000000-0003-0000-0000-000000000002', branch_id: 'c1000000-0000-0000-0000-000000000003', status: 'Pagada',   energy_marketer: 'EPM', invoice_number: 'EPM-2024-120001', issue_date: '2024-12-03', contract_number: 'CNT-POB-2021-001', due_date: '2024-12-24', billing_period_start: '2024-11-01', billing_period_end: '2024-11-30', total_kwh_consumption: 41000, standard_kwh_rate: 600, unergy_kwh_rate: 380, unergy_kwh_consumed: 18500 },
    { id: 'd1000000-0003-0000-0000-000000000003', branch_id: 'c1000000-0000-0000-0000-000000000003', status: 'Vencida',  energy_marketer: 'EPM', invoice_number: 'EPM-2025-010001', issue_date: '2025-01-03', contract_number: 'CNT-POB-2021-001', due_date: '2025-01-20', billing_period_start: '2024-12-01', billing_period_end: '2024-12-31', total_kwh_consumption: 38200, standard_kwh_rate: 600, unergy_kwh_rate: 380, unergy_kwh_consumed: 16000 },
    // Envigado (EPM, sin Unergy)
    { id: 'd1000000-0004-0000-0000-000000000001', branch_id: 'c1000000-0000-0000-0000-000000000004', status: 'Pagada',   energy_marketer: 'EPM', invoice_number: 'EPM-2024-110002', issue_date: '2024-11-03', contract_number: 'CNT-ENV-2021-002', due_date: '2024-11-23', billing_period_start: '2024-10-01', billing_period_end: '2024-10-31', total_kwh_consumption: 28000, standard_kwh_rate: 600, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    { id: 'd1000000-0004-0000-0000-000000000002', branch_id: 'c1000000-0000-0000-0000-000000000004', status: 'Pendiente',energy_marketer: 'EPM', invoice_number: 'EPM-2024-120002', issue_date: '2024-12-03', contract_number: 'CNT-ENV-2021-002', due_date: '2024-12-24', billing_period_start: '2024-11-01', billing_period_end: '2024-11-30', total_kwh_consumption: 29500, standard_kwh_rate: 600, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    { id: 'd1000000-0004-0000-0000-000000000003', branch_id: 'c1000000-0000-0000-0000-000000000004', status: 'Vencida',  energy_marketer: 'EPM', invoice_number: 'EPM-2025-010002', issue_date: '2025-01-03', contract_number: 'CNT-ENV-2021-002', due_date: '2025-01-15', billing_period_start: '2024-12-01', billing_period_end: '2024-12-31', total_kwh_consumption: 27800, standard_kwh_rate: 600, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    // Granada (Emcali, sin Unergy)
    { id: 'd1000000-0005-0000-0000-000000000001', branch_id: 'c1000000-0000-0000-0000-000000000005', status: 'Pagada',   energy_marketer: 'Emcali', invoice_number: 'EMC-2024-110001', issue_date: '2024-11-08', contract_number: 'CNT-GRN-2020-001', due_date: '2024-11-28', billing_period_start: '2024-10-01', billing_period_end: '2024-10-31', total_kwh_consumption: 22000, standard_kwh_rate: 580, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    { id: 'd1000000-0005-0000-0000-000000000002', branch_id: 'c1000000-0000-0000-0000-000000000005', status: 'Pagada',   energy_marketer: 'Emcali', invoice_number: 'EMC-2024-120001', issue_date: '2024-12-08', contract_number: 'CNT-GRN-2020-001', due_date: '2024-12-29', billing_period_start: '2024-11-01', billing_period_end: '2024-11-30', total_kwh_consumption: 23500, standard_kwh_rate: 580, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    { id: 'd1000000-0005-0000-0000-000000000003', branch_id: 'c1000000-0000-0000-0000-000000000005', status: 'Pendiente',energy_marketer: 'Emcali', invoice_number: 'EMC-2025-010001', issue_date: '2025-01-08', contract_number: 'CNT-GRN-2020-001', due_date: '2025-01-29', billing_period_start: '2024-12-01', billing_period_end: '2024-12-31', total_kwh_consumption: 21800, standard_kwh_rate: 580, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    // Norte (Air-e, sin Unergy)
    { id: 'd1000000-0006-0000-0000-000000000001', branch_id: 'c1000000-0000-0000-0000-000000000006', status: 'Pagada',   energy_marketer: 'Air-e', invoice_number: 'AIR-2024-110001', issue_date: '2024-11-10', contract_number: 'CNT-NRT-2022-001', due_date: '2024-11-30', billing_period_start: '2024-10-01', billing_period_end: '2024-10-31', total_kwh_consumption: 19500, standard_kwh_rate: 700, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    { id: 'd1000000-0006-0000-0000-000000000002', branch_id: 'c1000000-0000-0000-0000-000000000006', status: 'Pagada',   energy_marketer: 'Air-e', invoice_number: 'AIR-2024-120001', issue_date: '2024-12-10', contract_number: 'CNT-NRT-2022-001', due_date: '2024-12-31', billing_period_start: '2024-11-01', billing_period_end: '2024-11-30', total_kwh_consumption: 20800, standard_kwh_rate: 700, unergy_kwh_rate: null, unergy_kwh_consumed: null },
    { id: 'd1000000-0006-0000-0000-000000000003', branch_id: 'c1000000-0000-0000-0000-000000000006', status: 'Pendiente',energy_marketer: 'Air-e', invoice_number: 'AIR-2025-010001', issue_date: '2025-01-10', contract_number: 'CNT-NRT-2022-001', due_date: '2025-01-31', billing_period_start: '2024-12-01', billing_period_end: '2024-12-31', total_kwh_consumption: 18900, standard_kwh_rate: 700, unergy_kwh_rate: null, unergy_kwh_consumed: null },
  ]

  const { error: e4 } = await supabase.from('invoices').upsert(invoices)
  if (e4) { console.error('❌ invoices:', e4.message); return }
  console.log('✅ invoices (18 facturas)')

  console.log('\n🎉 Seed completado exitosamente!\n')
  console.log('📊 Resumen:')
  console.log('   · 1 empresa   → SportLife Colombia S.A.S.')
  console.log('   · 2 uGranjas  → Cundinamarca + Antioquia')
  console.log('   · 6 sedes     → Bogotá(2), Medellín(2), Cali, Barranquilla')
  console.log('   · 18 facturas → Nov-Dic 2024 + Ene 2025')
  console.log('\n🔐 Usuario demo: admin@sportlife.com.co / SportLife2024!')
  console.log('   (Créalo en Supabase → Authentication → Users → Add user)\n')
}

seedData().catch(console.error)
