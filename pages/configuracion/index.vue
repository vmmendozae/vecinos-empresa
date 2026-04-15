<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="max-w-md w-full text-center px-6">
      <div class="relative mb-8 flex items-center justify-center">
        <div class="absolute w-48 h-48 rounded-full blur-3xl opacity-20" style="background: radial-gradient(circle, #7c4dca, transparent)" />
        <div class="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl" style="background: linear-gradient(135deg, #1e1038, #2d1f52)">
          <SettingsIcon class="w-10 h-10" style="color: #a78bfa" />
        </div>
      </div>
      <div class="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest" style="background: #1e1038; color: #a78bfa">
        <SparklesIcon class="w-3.5 h-3.5" />
        Próximamente
      </div>
      <h2 class="text-3xl font-extrabold text-slate-800 mt-4 mb-3">Configuración</h2>
      <p class="text-slate-500 text-sm leading-relaxed">Gestión de usuarios, permisos, integraciones y preferencias de la cuenta.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SettingsIcon, SparklesIcon } from 'lucide-vue-next'
definePageMeta({ layout: 'dashboard' })
</script>
