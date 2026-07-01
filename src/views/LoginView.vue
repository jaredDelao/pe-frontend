<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import loginImage from "@/assets/images/img_login.png";
import logoImage from "@/assets/images/logo_prueba.png";

const router = useRouter();
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);

const canSubmit = computed(
  () => username.value.trim().length > 0 && password.value.length > 0,
);

async function onSubmit() {
  if (!canSubmit.value || loading.value) return;
  loading.value = true;
  try {
    const { data } = await login(username.value.trim(), password.value);
    auth.setSession(data.token);
    router.push({ name: auth.homeRoute });
  } catch {
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <div class="relative hidden overflow-hidden lg:block">
      <!-- Imagen de fondo -->
      <img :src="loginImage" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <!-- Degradado para dar legibilidad al texto -->
      <div
        class="absolute inset-0 bg-linear-to-t from-brand-900/85 via-brand-900/45 to-brand-900/25"
      />

      <div class="relative z-10 flex h-full flex-col justify-between p-12 text-white">
        <div class="flex items-center gap-2.5">
          <img
          :src="logoImage"
          alt="Pagos PE"
          class="size-10 rounded-xl object-contain"
        />
          <span class="text-lg font-semibold">Prueba PE - Frontend</span>
        </div>

        <div class="max-w-sm">
          <h1 class="text-3xl font-bold leading-tight">
            Plataforma de transacciones
          </h1>
          <p class="mt-3 text-white/80">
            Operación de ventas, consultas, cancelaciones y devoluciones con
            control por rol.
          </p>
        </div>

        <p class="text-xs text-white/60">Realizado por Jared De la O</p>
      </div>
    </div>

    <!-- Formulario -->
    <div class="flex items-center justify-center p-6">
      <div class="w-full max-w-sm animate-fade-up">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
            Iniciar sesión
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Ingresa con tu usuario para continuar.
          </p>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <BaseInput
            v-model="username"
            label="Usuario"
            placeholder="supervisor / operador"
            autocomplete="username"
          />

          <BaseInput
            v-model="password"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
          >
            <template #suffix>
              <button
                type="button"
                class="text-slate-400 transition hover:text-slate-600"
                :aria-label="
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                "
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="showPassword"
                  class="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
                <svg
                  v-else
                  class="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </template>
          </BaseInput>

          <BaseButton
            type="submit"
            :loading="loading"
            :disabled="!canSubmit"
            block
            class="mt-2"
          >
            Entrar
          </BaseButton>
        </form>

        <p
          class="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        >
          <span class="font-medium text-slate-600 dark:text-slate-300"
            >Acceso de prueba:</span
          >
          usar <code class="font-mono">supervisor</code> para el rol Supervisor o
          cualquier otro usuario para Operador. La contraseña es libre.
        </p>
      </div>
    </div>
  </div>
</template>
