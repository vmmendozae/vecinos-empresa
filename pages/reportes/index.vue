<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="max-w-2xl w-full text-center px-6">

      <!-- Glow decoration -->
      <div class="relative mb-10 flex items-center justify-center">
        <div class="absolute w-64 h-64 rounded-full blur-3xl opacity-20" style="background: radial-gradient(circle, #7c4dca, transparent)" />
        <div class="relative w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl" style="background: linear-gradient(135deg, #1e1038, #2d1f52)">
          <BarChart3Icon class="w-12 h-12" style="color: #a78bfa" />
          <div class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style="background: #d4ed1a; color: #1a2e00">
            ✦
          </div>
        </div>
      </div>

      <!-- Heading -->
      <div class="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest" style="background: #1e1038; color: #a78bfa">
        <SparklesIcon class="w-3.5 h-3.5" />
        Próximamente
      </div>

      <h2 class="text-4xl font-extrabold text-slate-800 mt-4 mb-3 leading-tight">
        Análisis & Reportes
      </h2>
      <p class="text-slate-500 text-base leading-relaxed max-w-md mx-auto mb-10">
        Estamos construyendo un panel de inteligencia energética para que tomes decisiones con datos reales sobre tus sedes.
      </p>

      <!-- Feature cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div v-for="feature in features" :key="feature.title" class="bg-white rounded-xl border border-slate-200 p-5 text-left hover:border-purple-200 hover:shadow-sm transition-all">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3" :style="`background: ${feature.bg}`">
            <component :is="feature.icon" class="w-4.5 h-4.5" :style="`color: ${feature.color}`" />
          </div>
          <p class="text-sm font-semibold text-slate-700 mb-1">{{ feature.title }}</p>
          <p class="text-xs text-slate-400 leading-relaxed">{{ feature.desc }}</p>
        </div>
      </div>

      <!-- CTA -->
      <p class="text-xs text-slate-400">
        ¿Qué reporte necesitas primero?
        <a href="mailto:soporte@unergy.co" class="font-medium underline underline-offset-2" style="color: #7c4dca">Cuéntanos</a>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart3Icon, SparklesIcon, TrendingUpIcon, ZapIcon, LeafIcon, BuildingIcon } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

const features = [
  {
    title: 'Consumo por sede',
    desc: 'Evolución mensual de kWh por sede, comparativas y anomalías.',
    icon: TrendingUpIcon,
    bg: '#ede9fe',
    color: '#7c3aed',
  },
  {
    title: 'Ahorro solar',
    desc: 'Cuánto has ahorrado gracias a energía uGranja vs tarifa regular.',
    icon: LeafIcon,
    bg: '#dcfce7',
    color: '#16a34a',
  },
  {
    title: 'Ranking de sedes',
    desc: 'Qué sedes consumen más, tienen mejor % de asignación y mayor impacto.',
    icon: BuildingIcon,
    bg: '#fef3c7',
    color: '#d97706',
  },
]
</script>
