<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTheme } from "@/composables/useTheme";
import BaseBadge from "@/components/ui/BaseBadge.vue";
import AppNav from "./AppNav.vue";
import logo from "@/assets/images/logo_prueba.png";

const auth = useAuthStore();
const router = useRouter();
const { theme, toggle } = useTheme();

const initials = computed(() => {
  const name = auth.username ?? "Usuario";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
});

function logout() {
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
      <div class="flex items-center gap-2.5">
        <img
          :src="logo"
          alt="Logo Pagos PE"
          class="size-9 rounded-xl object-contain"
        />
        <span
          class="hidden text-sm font-semibold text-secondary dark:text-white sm:block"
        >
          Prueba PE
        </span>
      </div>

      <div class="mx-auto hidden sm:block">
        <AppNav />
      </div>

      <div class="ml-auto flex items-center gap-3">
        <button
          class="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          :aria-label="
            theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'
          "
          @click="toggle"
        >
          <svg
            v-if="theme === 'dark'"
            class="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              stroke-linecap="round"
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
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
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            />
          </svg>
        </button>

        <div class="flex items-center gap-2.5">
          <span
            class="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
          >
            {{ initials }}
          </span>
          <div class="hidden text-right leading-tight sm:block">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100">
              {{ auth.username ?? "Usuario" }}
            </p>
            <BaseBadge tone="secondary">{{ auth.role }}</BaseBadge>
          </div>
        </div>

        <button
          class="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-danger-soft hover:text-danger"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          @click="logout"
        >
          <svg
            class="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7M13 16v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Navegación en móvil -->
    <div
      class="border-t border-slate-200/70 px-4 py-2 dark:border-slate-800 sm:hidden"
    >
      <AppNav />
    </div>
  </header>
</template>
