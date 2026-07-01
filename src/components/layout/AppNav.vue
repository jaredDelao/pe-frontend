<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface NavItem {
  name: string
  label: string
}

const auth = useAuthStore()

const items = computed<NavItem[]>(() => {
  if (auth.isSupervisor) {
    return [
      { name: 'cancelacion', label: 'Cancelación' },
      { name: 'devolucion', label: 'Devolución' },
    ]
  }
  return [
    { name: 'venta', label: 'Venta' },
    { name: 'consultas', label: 'Consultas' },
  ]
})
</script>

<template>
  <nav
    class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
    aria-label="Operaciones disponibles"
  >
    <RouterLink
      v-for="item in items"
      :key="item.name"
      :to="{ name: item.name }"
      class="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      active-class="!bg-white !text-brand-700 shadow-sm dark:!bg-slate-700 dark:!text-white"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>
