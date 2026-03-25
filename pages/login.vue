<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden" style="background-color: #0f0a1e">
    <!-- Background glows -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full opacity-20"
        style="background: radial-gradient(circle, #7c4dca 0%, transparent 65%)"
      />
      <div
        class="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full opacity-15"
        style="background: radial-gradient(circle, #a78bfa 0%, transparent 65%)"
      />
      <!-- Subtle dot grid -->
      <div
        class="absolute inset-0 opacity-[0.04]"
        style="
          background-image: radial-gradient(circle, white 1px, transparent 1px);
          background-size: 32px 32px;
        "
      />
    </div>

    <div class="relative z-10 w-full max-w-md px-6">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-10">
        <!-- Brand mark -->
        <div
          class="h-16 rounded-2xl flex items-center justify-center mb-5"
        >
          <img src="public/logo-dark-v.png" class="h-12" alt="">
        </div>

        <!-- Wordmark -->
        <div class="text-center">
          <p class="text-sm mt-1.5" style="color: #6b5d8a">Plataforma de Gestión Energética Corporativa</p>
        </div>
      </div>

      <!-- Card -->
      <div
        class="rounded-2xl p-8"
        style="background: rgba(30, 16, 56, 0.8); border: 1px solid #2a1850; backdrop-filter: blur(12px)"
      >
        <h2 class="text-lg font-semibold text-white mb-1">Bienvenido</h2>
        <p class="text-sm mb-6" style="color: #6b5d8a">Ingresa tus credenciales para continuar</p>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: #c4b5f4">Correo corporativo</label>
            <UInput
              v-model="email"
              type="email"
              placeholder="empresa@unergy.io"
              icon="i-heroicons-envelope"
              size="lg"
              :disabled="loading"
              class="w-full"
              input-class="bg-white/5 border-white/10 text-white placeholder-[#4a3868] focus:border-[#7c4dca]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1.5" style="color: #c4b5f4">Contraseña</label>
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
              :trailing-icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              size="lg"
              :disabled="loading"
              class="w-full"
              input-class="bg-white/5 border-white/10 text-white placeholder-[#4a3868] focus:border-[#7c4dca]"
              @click:trailing="showPassword = !showPassword"
            />
          </div>

          <div v-if="errorMessage" class="flex items-center gap-2 p-3 rounded-lg" style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2)">
            <AlertCircleIcon class="w-4 h-4 text-red-400 shrink-0" />
            <span class="text-sm text-red-300">{{ errorMessage }}</span>
          </div>

          <UButton
            type="submit"
            size="lg"
            :loading="loading"
            class="w-full justify-center font-semibold text-white mt-2"
            style="background: #7c4dca; border-color: #7c4dca"
          >
            Ingresar a la plataforma
          </UButton>
        </form>

        <p class="text-center text-xs mt-6" style="color: #4a3868">
          ¿Problemas con tu acceso?
          <a href="mailto:soporte@unergy.io" class="hover:underline" style="color: #a78bfa">Contacta soporte</a>
        </p>
      </div>

      <p class="text-center text-xs mt-6" style="color: #2a1850">
        © {{ new Date().getFullYear() }} Unergy S.A.S. Todos los derechos reservados.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircleIcon } from 'lucide-vue-next'

definePageMeta({ layout: false })

const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value =
      error.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : error.message
    loading.value = false
  } else {
    await navigateTo('/facturacion')
  }
}
</script>
