<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div>
        <h3 class="text-sm font-semibold text-slate-800">Ubicación de uGranjas</h3>
        <p class="text-xs text-slate-400 mt-0.5">Colombia · {{ ugranjas.length }} granjas activas</p>
      </div>
      <div class="flex items-center gap-2">
        <span
          v-for="granja in ugranjas"
          :key="granja.id"
          class="flex items-center gap-1.5 text-xs text-slate-500"
        >
          <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="background:#00b85c;box-shadow:0 0 0 2px #dcfce7" />
          {{ granja.name.replace('uGranja Solar ', '') }}
        </span>
      </div>
    </div>

    <!-- Map container -->
    <ClientOnly>
      <div ref="mapEl" class="w-full" style="height: 420px" />
      <template #fallback>
        <div class="w-full flex items-center justify-center bg-slate-50" style="height: 420px">
          <div class="flex flex-col items-center gap-2 text-slate-300">
            <MapIcon class="w-10 h-10" />
            <p class="text-sm">Cargando mapa...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { MapIcon } from 'lucide-vue-next'
import type { UGranjaWithBranches } from '~/types/database'

const props = defineProps<{ ugranjas: UGranjaWithBranches[] }>()

const mapEl = ref<HTMLElement | null>(null)

onMounted(async () => {
  await nextTick()
  if (!mapEl.value) return

  // Dynamic import to avoid SSR (CSS loaded globally via nuxt.config.ts)
  const L = (await import('leaflet')).default

  // Custom green dot marker
  function createMarker(granja: UGranjaWithBranches) {
    const icon = L.divIcon({
      html: `
        <div style="
          position:relative;
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          <div style="
            width:16px;height:16px;
            border-radius:50%;
            background:#00b85c;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.25), 0 0 0 4px rgba(0,184,92,0.18);
          "></div>
        </div>`,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -12],
    })
    return icon
  }

  const map = L.map(mapEl.value, {
    center: [5.0, -74.5],
    zoom: 6,
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false,
  })

  // CartoDB light tiles — limpio y corporativo
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    { subdomains: 'abcd', maxZoom: 19 },
  ).addTo(map)

  L.control.attribution({ position: 'bottomright', prefix: '© CartoDB · © OSM' }).addTo(map)

  // Add markers for each uGranja that has coordinates
  props.ugranjas.forEach((granja) => {
    if (granja.lat == null || granja.lng == null) return

    const marker = L.marker([granja.lat, granja.lng], { icon: createMarker(granja) })
      .addTo(map)

    // Build branch list rows
    const branchRows = granja.connectedBranches.length > 0
      ? granja.connectedBranches.map((b) => `
          <div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #f1f5f9">
            <div style="width:20px;height:20px;border-radius:5px;background:#7c4dca;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <span style="color:white;font-size:9px;font-weight:700">${b.name.charAt(0).toUpperCase()}</span>
            </div>
            <div style="overflow:hidden">
              <div style="font-size:11px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${b.name}</div>
              <div style="font-size:10px;color:#94a3b8">${b.city}</div>
            </div>
          </div>`).join('')
      : '<div style="font-size:11px;color:#94a3b8;padding:4px 0">Sin sedes asignadas</div>'

    // Rich popup
    marker.bindPopup(
      `<div style="font-family:Inter,sans-serif;min-width:240px;padding:4px 2px">
        <p style="font-weight:700;font-size:13px;color:#0f172a;margin:0 0 2px">${granja.name}</p>
        <p style="font-size:11px;color:#64748b;margin:0 0 10px;display:flex;align-items:center;gap:4px">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${granja.location}
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">
          <div style="background:#f0fdf7;border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:15px;font-weight:700;color:#15803d">${(granja.generated_energy_kwh / 1000).toFixed(0)} MWh</div>
            <div style="font-size:10px;color:#16a34a;margin-top:1px">generados</div>
          </div>
          <div style="background:#fff7ed;border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:15px;font-weight:700;color:#c2410c">${(granja.avoided_co2_kg / 1000).toFixed(1)}t</div>
            <div style="font-size:10px;color:#ea580c;margin-top:1px">CO₂ evitado</div>
          </div>
          <div style="background:#f0fdf7;border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:15px;font-weight:700;color:#15803d">${granja.saved_trees.toLocaleString('es-CO')}</div>
            <div style="font-size:10px;color:#16a34a;margin-top:1px">árboles</div>
          </div>
        </div>
        <div style="border-top:1px solid #f1f5f9;padding-top:8px">
          <p style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px">
            Sedes conectadas · ${granja.connectedBranches.length}
          </p>
          ${branchRows}
        </div>
      </div>`,
      { maxWidth: 280, className: 'unergy-popup' },
    )
  })

  // Fit map to markers if more than one
  const validGranjas = props.ugranjas.filter((g) => g.lat != null && g.lng != null)
  if (validGranjas.length > 1) {
    const bounds = L.latLngBounds(validGranjas.map((g) => [g.lat!, g.lng!]))
    map.fitBounds(bounds, { padding: [60, 60] })
  }
})
</script>

<style>
/* Leaflet popup custom styles */
.unergy-popup .leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  border: 1px solid #e2e8f0;
  padding: 0;
  overflow: hidden;
}
.unergy-popup .leaflet-popup-content {
  margin: 14px 14px;
}
.unergy-popup .leaflet-popup-tip {
  background: white;
}
.leaflet-control-zoom {
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
}
.leaflet-control-zoom a {
  color: #475569 !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
.leaflet-control-zoom a:hover {
  background: #f8fafc !important;
  color: #0f172a !important;
}
</style>
