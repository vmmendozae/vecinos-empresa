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
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <!-- Row 1: search + dropdowns -->
        <div class="flex flex-wrap items-center gap-3 px-4 py-3">
          <!-- Search -->
          <div class="relative flex-1 min-w-52">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar sede, ciudad o NIT..."
              class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition text-slate-700"
            />
          </div>

          <!-- Ciudad -->
          <select
            v-model="filterCity"
            class="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-100 min-w-36 transition"
          >
            <option value="">Todas las ciudades</option>
            <option v-for="city in availableCities" :key="city" :value="city">{{ city }}</option>
          </select>

          <!-- OR -->
          <select
            v-model="filterOR"
            class="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-100 min-w-28 transition"
            :class="filterOR ? 'border-purple-300 bg-purple-50 text-purple-700' : ''"
          >
            <option value="">Todos los OR</option>
            <option v-for="o in availableORs" :key="o" :value="o">{{ o }}</option>
          </select>

          <!-- Comercializador -->
          <select
            v-model="filterComercializador"
            class="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-100 min-w-40 transition"
            :class="filterComercializador ? 'border-purple-300 bg-purple-50 text-purple-700' : ''"
          >
            <option value="">Todos los comercializadores</option>
            <option v-for="c in availableComercializadores" :key="c" :value="c">{{ c }}</option>
          </select>

          <!-- Agrupar por -->
          <div class="flex items-center gap-1.5 ml-auto">
            <LayersIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              v-model="groupBy"
              class="px-2 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
              :class="groupBy ? 'border-purple-300 text-purple-700 bg-purple-50' : 'border-slate-200 text-slate-600'"
            >
              <option value="">Sin agrupar</option>
              <option value="or">OR</option>
              <option value="comercializador">Comercializador</option>
              <option value="city">Ciudad</option>
              <option value="labels">Estado</option>
            </select>
          </div>

          <!-- Count + clear -->
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 font-medium whitespace-nowrap">
              {{ filteredBranches.length }} de {{ branches.length }} sedes
            </span>
            <button
              v-if="hasActiveFilters"
              class="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"
              @click="resetFilters"
            >
              <XIcon class="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        </div>

        <!-- Row 2: toggles -->
        <div class="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50/60 border-t border-slate-100">
          <!-- Unergy toggle -->
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
            :class="filterUnergy
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'"
            @click="filterUnergy = !filterUnergy"
          >
            <LeafIcon class="w-3.5 h-3.5" />
            Solo Unergy
          </button>

          <!-- Solar toggle -->
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
            :class="filterSolar
              ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'"
            @click="filterSolar = !filterSolar"
          >
            <SunIcon class="w-3.5 h-3.5" />
            Solar propio
          </button>

          <!-- Prospectos -->
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
            :class="filterProspecto
              ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'"
            @click="filterProspecto = !filterProspecto"
          >
            <ZapIcon class="w-3.5 h-3.5" />
            Solo Prospectos
          </button>

          <!-- Asignación fuera de rango -->
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
            :class="filterAsignacionFuera
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'"
            @click="filterAsignacionFuera = !filterAsignacionFuera"
          >
            <span class="w-2 h-2 rounded-full" :class="filterAsignacionFuera ? 'bg-amber-400' : 'bg-slate-300'" />
            % Asignación fuera de rango
          </button>

          <!-- Active filter chips -->
          <div class="flex items-center gap-2 ml-1 flex-wrap">
            <span
              v-if="filterCity"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
            >
              <MapPinIcon class="w-3 h-3" />
              {{ filterCity }}
              <button class="hover:text-purple-900" @click="filterCity = ''"><XIcon class="w-3 h-3" /></button>
            </span>
            <span
              v-if="filterOR"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
            >
              OR: {{ filterOR }}
              <button class="hover:text-purple-900" @click="filterOR = ''"><XIcon class="w-3 h-3" /></button>
            </span>
            <span
              v-if="filterComercializador"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
            >
              {{ filterComercializador }}
              <button class="hover:text-purple-900" @click="filterComercializador = ''"><XIcon class="w-3 h-3" /></button>
            </span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table class="text-sm" style="min-width:1200px;width:100%">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/50">
              <th class="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sede</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ciudad</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">OR</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Comercializador</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">kWh prom.</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">% Asig.</th>
              <th class="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Solar</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">uGranja</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notas</th>
              <th class="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-for="item in tableRows" :key="item.uid">
              <!-- Group header row -->
              <tr v-if="item.type === 'group'" class="bg-slate-50 border-y border-slate-200">
                <td colspan="11" class="px-5 py-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ item.key }}</span>
                    <span class="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">{{ item.count }}</span>
                  </div>
                </td>
              </tr>

            <template v-if="item.type === 'branch'" v-for="branch in [item.branch]" :key="item.uid">

              <!-- ── VIEW ROW ── -->
              <tr
                v-if="editingInlineId !== branch.id"
                class="hover:bg-slate-50/60 transition-colors group"
              >
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-white" style="background:#7c4dca">
                      {{ branch.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-slate-800">{{ branch.name }}</p>
                      <span v-if="branch.unergy_subscribed" class="inline-flex items-center gap-0.5 text-xs font-medium" style="color:#16a34a">
                        <LeafIcon class="w-3 h-3" /> Unergy Vecinos
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex flex-wrap gap-1">
                    <template v-for="label in effectiveLabels(branch)" :key="label">
                      <span
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                        :style="LABEL_MAP[label]?.style"
                        :title="label === 'Prospecto' && isAutoProspecto(branch) && !branch.labels?.includes('Prospecto') ? 'Asignado automáticamente: mismo OR y comercializador, sin solar, con consumo' : ''"
                      >
                        <span v-if="LABEL_MAP[label]?.icon" class="text-xs">{{ LABEL_MAP[label].icon }}</span>
                        {{ label }}
                      </span>
                    </template>
                    <span v-if="!effectiveLabels(branch).length" class="text-slate-300 text-xs">—</span>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1.5 text-slate-600">
                    <MapPinIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {{ branch.city }}
                  </div>
                </td>
                <td class="px-4 py-3.5 text-xs text-slate-600">{{ branch.or || '—' }}</td>
                <td class="px-4 py-3.5 text-xs text-slate-600">{{ branch.comercializador || '—' }}</td>
                <td class="px-4 py-3.5 text-right">
                  <span v-if="branch.kwh_consumption" class="text-sm font-medium text-slate-700 tabular-nums">{{ branch.kwh_consumption.toLocaleString('es-CO') }}</span>
                  <span v-else class="text-slate-300 text-xs">—</span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <template v-if="branch.asignacion_pct != null">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums" :class="branch.asignacion_pct >= 70 && branch.asignacion_pct <= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                      <span v-if="branch.asignacion_pct < 70 || branch.asignacion_pct > 80" class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
                      {{ branch.asignacion_pct }}%
                    </span>
                    <p v-if="branch.kwh_consumption" class="text-xs text-slate-400 tabular-nums mt-0.5">
                      {{ Math.round(branch.kwh_consumption * branch.asignacion_pct / 100).toLocaleString('es-CO') }} kWh
                    </p>
                  </template>
                  <span v-else class="text-slate-300 text-xs">—</span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span v-if="branch.solar" class="inline-flex items-center justify-center w-7 h-7 rounded-full" style="background:#fef9c3">
                    <SunIcon class="w-4 h-4 text-yellow-500" />
                  </span>
                  <span v-else class="text-slate-200 text-lg leading-none">·</span>
                </td>
                <td class="px-4 py-3.5">
                  <span v-if="branch.ugranjas" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style="background:#fefce8;color:#854d0e">
                    <SunIcon class="w-3 h-3" />
                    {{ branch.ugranjas.name.replace('uGranja Solar ', '') }}
                  </span>
                  <span v-else class="text-slate-300 text-xs">Sin asignar</span>
                </td>
                <td class="px-4 py-3.5 max-w-xs">
                  <p v-if="branch.notes" class="text-xs text-slate-500 leading-relaxed" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">{{ branch.notes }}</p>
                  <span v-else class="text-slate-300 text-xs">—</span>
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all" title="Editar inline" @click="startInlineEdit(branch)">
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Eliminar sede" @click="openDelete(branch)">
                      <Trash2Icon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- ── EDIT ROW ── -->
              <tr v-else class="bg-purple-50/40 border-l-2" style="border-left-color:#7c4dca">
                <!-- Nombre -->
                <td class="px-2 py-2">
                  <input v-model="inlineForm.name" class="w-full min-w-0 px-2 py-1 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 font-medium" placeholder="Nombre" />
                </td>
                <!-- Labels dropdown -->
                <td class="px-2 py-2">
                  <div class="relative" v-click-outside="() => showLabelDropdown = false">
                    <button
                      type="button"
                      class="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-200 min-w-0"
                      @click="showLabelDropdown = !showLabelDropdown"
                    >
                      <span v-if="inlineForm.labels.length" class="truncate text-slate-600">{{ inlineForm.labels.length }} etiqueta{{ inlineForm.labels.length > 1 ? 's' : '' }}</span>
                      <span v-else class="text-slate-400">Etiquetas</span>
                      <ChevronDownIcon class="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                    </button>
                    <div
                      v-if="showLabelDropdown"
                      class="absolute z-50 top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 overflow-hidden"
                    >
                      <button
                        v-for="label in LABEL_OPTIONS" :key="label"
                        type="button"
                        class="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors"
                        @click="inlineForm.labels.includes(label) ? inlineForm.labels.splice(inlineForm.labels.indexOf(label),1) : inlineForm.labels.push(label)"
                      >
                        <span class="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all" :style="inlineForm.labels.includes(label) ? 'background:#7c4dca;border-color:#7c4dca' : 'border-color:#cbd5e1'">
                          <CheckIcon v-if="inlineForm.labels.includes(label)" class="w-2.5 h-2.5 text-white" />
                        </span>
                        <span class="px-1.5 py-0.5 rounded-full font-medium" :style="LABEL_MAP[label]?.style">{{ label }}</span>
                      </button>
                    </div>
                  </div>
                </td>
                <!-- Ciudad -->
                <td class="px-2 py-2">
                  <CitySelect v-model="inlineForm.city" placeholder="Ciudad" />
                </td>
                <!-- OR -->
                <td class="px-2 py-2">
                  <select v-model="inlineForm.or" class="w-full px-1.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                    <option value="">—</option>
                    <option v-for="o in OR_OPTIONS" :key="o" :value="o">{{ o }}</option>
                  </select>
                </td>
                <!-- Comercializador -->
                <td class="px-2 py-2">
                  <select v-model="inlineForm.comercializador" class="w-full px-1.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                    <option value="">—</option>
                    <option v-for="c in COMERCIALIZADOR_OPTIONS" :key="c" :value="c">{{ c }}</option>
                  </select>
                </td>
                <!-- kWh -->
                <td class="px-2 py-2">
                  <input v-model.number="inlineForm.kwh_consumption" type="number" min="0" placeholder="0" class="w-full px-1.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-right" />
                </td>
                <!-- % Asig -->
                <td class="px-2 py-2">
                  <div class="relative">
                    <input v-model.number="inlineForm.asignacion_pct" type="number" min="0" max="100" placeholder="0" class="w-full px-1.5 py-1 pr-5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 text-right" :class="inlineForm.asignacion_pct != null && (inlineForm.asignacion_pct < 70 || inlineForm.asignacion_pct > 80) ? 'border-amber-300 focus:ring-amber-200' : 'border-slate-200 focus:ring-purple-200'" />
                    <span class="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </td>
                <!-- Solar -->
                <td class="px-2 py-2 text-center">
                  <button type="button" class="w-7 h-7 rounded-full flex items-center justify-center mx-auto transition-all" :style="inlineForm.solar ? 'background:#fef9c3' : 'background:#f1f5f9'" @click="inlineForm.solar = !inlineForm.solar">
                    <SunIcon class="w-3.5 h-3.5" :class="inlineForm.solar ? 'text-yellow-500' : 'text-slate-300'" />
                  </button>
                </td>
                <!-- uGranja (read-only) -->
                <td class="px-2 py-2">
                  <span v-if="branch.ugranjas" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style="background:#fefce8;color:#854d0e">
                    <SunIcon class="w-3 h-3" />{{ branch.ugranjas.name.replace('uGranja Solar ','') }}
                  </span>
                  <span v-else class="text-slate-300 text-xs">—</span>
                </td>
                <!-- Notas -->
                <td class="px-2 py-2" style="min-width:280px">
                  <textarea v-model="inlineForm.notes" rows="3" placeholder="Notas..." class="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 resize-y leading-relaxed" />
                </td>
                <!-- Acciones inline -->
                <td class="px-2 py-2">
                  <div class="flex items-center gap-1">
                    <button class="w-7 h-7 flex items-center justify-center rounded-lg text-white transition-all hover:opacity-90" style="background:#7c4dca" title="Guardar" :disabled="inlineSaving" @click="saveInlineEdit(branch.id)">
                      <span v-if="inlineSaving" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <CheckIcon v-else class="w-3.5 h-3.5" />
                    </button>
                    <button class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-all" title="Cancelar" @click="cancelInlineEdit">
                      <XIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

            </template>
            </template>

            <!-- Empty state -->
            <tr v-if="filteredBranches.length === 0">
              <td colspan="11" class="px-4 py-16 text-center">
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
            <PlusIcon class="w-5 h-5" style="color: #7c4dca" />
          </div>
          <div>
            <p class="font-bold text-slate-800">Nueva Sede</p>
            <p class="text-xs text-slate-400">Completa los datos de la nueva sede</p>
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

          <!-- OR + Comercializador -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">OR</label>
              <select
                v-model="form.or"
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 bg-white text-slate-700 transition"
              >
                <option value="">Sin asignar</option>
                <option v-for="o in OR_OPTIONS" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Comercializador</label>
              <select
                v-model="form.comercializador"
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 bg-white text-slate-700 transition"
              >
                <option value="">Sin asignar</option>
                <option v-for="c in COMERCIALIZADOR_OPTIONS" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <!-- kWh + % Asignación -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Consumo kWh (promedio)</label>
              <input
                v-model.number="form.kwh_consumption"
                type="number"
                min="0"
                placeholder="Ej: 12500"
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                % de Asignación
                <span class="normal-case font-normal text-slate-400">(ideal 70–80%)</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.asignacion_pct"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Ej: 75"
                  class="w-full px-3.5 py-2.5 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 transition bg-white"
                  :class="form.asignacion_pct != null && (form.asignacion_pct < 70 || form.asignacion_pct > 80)
                    ? 'border-amber-300 focus:ring-amber-100 focus:border-amber-400'
                    : 'border-slate-200 focus:ring-purple-100 focus:border-purple-400'"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
              <p
                v-if="form.asignacion_pct != null && (form.asignacion_pct < 70 || form.asignacion_pct > 80)"
                class="text-xs text-amber-600 mt-1 flex items-center gap-1"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Fuera del rango recomendado (70–80%)
              </p>
            </div>
          </div>

          <!-- Solar propio toggle -->
          <div
            class="flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer"
            :style="form.solar
              ? 'background: #fefce8; border-color: #fde68a'
              : 'background: #f8fafc; border-color: #e2e8f0'"
            @click="form.solar = !form.solar"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :style="form.solar ? 'background: #fef08a' : 'background: #f1f5f9'"
              >
                <SunIcon class="w-4.5 h-4.5" :style="form.solar ? 'color: #ca8a04' : 'color: #94a3b8'" />
              </div>
              <div>
                <p class="text-sm font-semibold" :class="form.solar ? 'text-yellow-800' : 'text-slate-700'">
                  Proyecto solar propio
                </p>
                <p class="text-xs" :class="form.solar ? 'text-yellow-600' : 'text-slate-400'">
                  {{ form.solar ? 'Esta sede genera energía solar propia' : 'Sin generación solar propia' }}
                </p>
              </div>
            </div>
            <div
              class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
              :style="form.solar ? 'background: #eab308' : 'background: #cbd5e1'"
            >
              <div
                class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                :class="form.solar ? 'translate-x-5' : 'translate-x-1'"
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

          <!-- Etiquetas de estado -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Estado / Etiquetas</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="label in LABEL_OPTIONS"
                :key="label"
                type="button"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-all"
                :style="form.labels.includes(label)
                  ? LABEL_MAP[label].style + 'border-color: currentColor; opacity:1;'
                  : 'background:#f8fafc;color:#94a3b8;border-color:#e2e8f0;'"
                @click="form.labels.includes(label)
                  ? form.labels.splice(form.labels.indexOf(label), 1)
                  : form.labels.push(label)"
              >
                <span v-if="LABEL_MAP[label].icon">{{ LABEL_MAP[label].icon }}</span>
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Notas -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Notas
            </label>
            <textarea
              v-model="form.notes"
              rows="4"
              placeholder="Observaciones, condiciones especiales, contactos, etc."
              class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition bg-white text-slate-700 resize-none leading-relaxed"
            />
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
            {{ saving ? 'Guardando...' : 'Crear sede' }}
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
  ChevronDownIcon,
  ZapIcon,
  LayersIcon,
} from 'lucide-vue-next'

const vClickOutside = {
  mounted(el: any, binding: { value: () => void }) {
    el._clickOutside = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) binding.value()
    }
    document.addEventListener('mousedown', el._clickOutside)
  },
  unmounted(el: any) {
    document.removeEventListener('mousedown', el._clickOutside)
  },
}

const OR_OPTIONS = ['AIR-E', 'CARIBEMAR - AFINIA', 'ENEL', 'EPM', 'ESSA']
const COMERCIALIZADOR_OPTIONS = [
  'AFINIA', 'AIR-E', 'AIR-E - SOLARIS', 'ENEL', 'EPM',
  'ESSA', 'NEU ENERGY', 'NEU ENERGY - SOLARIS', 'QI ENERGY', 'VATIA',
]

const LABEL_MAP: Record<string, { style: string; icon?: string }> = {
  'Prospecto':        { style: 'background:#fef9c3;color:#854d0e;border:1px solid #fde68a', icon: '⚡' },
  'En negociación':   { style: 'background:#dbeafe;color:#1e40af;' },
  'Contactado':       { style: 'background:#dcfce7;color:#166534;' },
  'Descartado':       { style: 'background:#fee2e2;color:#991b1b;' },
  'Pendiente visita': { style: 'background:#fce7f3;color:#9d174d;' },
  'Contrato enviado': { style: 'background:#ede9fe;color:#5b21b6;' },
  'Alta prioridad':   { style: 'background:#ffedd5;color:#9a3412;', icon: '🔥' },
}
const LABEL_OPTIONS = Object.keys(LABEL_MAP)

function isAutoProspecto(branch: Branch): boolean {
  return (
    !!branch.or &&
    !!branch.comercializador &&
    branch.or === branch.comercializador &&
    !branch.solar &&
    !!branch.kwh_consumption
  )
}

function effectiveLabels(branch: Branch): string[] {
  const labels = [...(branch.labels ?? [])]
  if (isAutoProspecto(branch) && !labels.includes('Prospecto')) {
    labels.unshift('Prospecto')
  }
  return labels
}
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
} = useSedes()

onMounted(() => fetchBranches())

type TableRow =
  | { type: 'group'; key: string; count: number; uid: string }
  | { type: 'branch'; branch: typeof filteredBranches.value[0]; uid: string }

const tableRows = computed((): TableRow[] => {
  if (!groupedBranches.value) {
    return filteredBranches.value.map(branch => ({ type: 'branch', branch, uid: branch.id }))
  }
  const rows: TableRow[] = []
  for (const [key, branches] of groupedBranches.value) {
    rows.push({ type: 'group', key, count: branches.length, uid: `g-${key}` })
    for (const branch of branches) {
      rows.push({ type: 'branch', branch, uid: `${key}-${branch.id}` })
    }
  }
  return rows
})

// ── Create modal ────────────────────────────────────────────────────────────
const showFormModal = ref(false)
const saving = ref(false)
const saveError = ref('')

const emptyForm = (): BranchForm => ({
  name: '',
  city: '',
  nit: '',
  opening_date: '',
  unergy_subscribed: false,
  or: '',
  comercializador: '',
  kwh_consumption: null,
  asignacion_pct: null,
  solar: false,
  notes: '',
  labels: [],
})

const form = reactive<BranchForm>(emptyForm())
const formErrors = reactive({ name: '', city: '' })

function openCreate() {
  Object.assign(form, emptyForm())
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
  const { error } = await createBranch({ ...form })
  saving.value = false
  if (error) {
    saveError.value = 'Error al guardar. Intenta de nuevo.'
  } else {
    showFormModal.value = false
    useToast().add({ title: 'Sede creada', description: `${form.name} fue creada correctamente.`, color: 'green', icon: 'i-heroicons-check-circle' })
  }
}

// ── Inline edit ──────────────────────────────────────────────────────────────
const editingInlineId = ref<string | null>(null)
const inlineSaving = ref(false)
const inlineForm = reactive<BranchForm>(emptyForm())
const showLabelDropdown = ref(false)

function startInlineEdit(branch: Branch) {
  showLabelDropdown.value = false
  editingInlineId.value = branch.id
  Object.assign(inlineForm, {
    name: branch.name,
    city: branch.city,
    nit: branch.nit || '',
    opening_date: branch.opening_date || '',
    unergy_subscribed: branch.unergy_subscribed,
    or: branch.or || '',
    comercializador: branch.comercializador || '',
    kwh_consumption: branch.kwh_consumption ?? null,
    asignacion_pct: branch.asignacion_pct ?? null,
    solar: branch.solar ?? false,
    notes: branch.notes || '',
    labels: [...(branch.labels ?? [])],
  })
}

function cancelInlineEdit() {
  editingInlineId.value = null
}

async function saveInlineEdit(id: string) {
  inlineSaving.value = true
  const { error } = await updateBranch(id, { ...inlineForm })
  inlineSaving.value = false
  if (!error) {
    editingInlineId.value = null
    useToast().add({ title: 'Sede actualizada', color: 'green', icon: 'i-heroicons-check-circle' })
  } else {
    useToast().add({ title: 'Error al guardar', color: 'red', icon: 'i-heroicons-x-circle' })
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
