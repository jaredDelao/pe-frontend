<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listarTransacciones } from '@/services/transactions.service'
import type { EstatusTransaccion, Transaccion } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'

const rows = ref<Transaccion[]>([])
const loading = ref(true)
const failed = ref(false)
const search = ref('')
const sortDesc = ref(true)

const toneByStatus: Record<EstatusTransaccion, 'success' | 'danger' | 'warning' | 'neutral'> = {
  APROBADA: 'success',
  CANCELADA: 'warning',
  DEVUELTA: 'neutral',
  RECHAZADA: 'danger',
}

async function loadTransacciones() {
  loading.value = true
  failed.value = false
  try {
    const { data } = await listarTransacciones()
    rows.value = data
    console.log(data)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadTransacciones)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = q
    ? rows.value.filter(
        (r) =>
          r.holder.toLowerCase().includes(q) ||
          r.financialReference.includes(q) ||
          r.maskedCard.includes(q),
      )
    : rows.value
  return [...list].sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime()
    return sortDesc.value ? diff : -diff
  })
})

function money(n: number) {
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function shortDatee(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <section class="animate-fade-up">
    <PageHeader title="Consultas" description="Transacciones aprobadas registradas en el sistema.">
      <template #icon>
        <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5h11M9 12h11M9 19h11M4 5h.01M4 12h.01M4 19h.01" />
        </svg>
      </template>
      <template #actions>
        <div class="w-full sm:w-72">
          <BaseInput v-model="search" label="Buscar" placeholder="Titular, referencia o tarjeta">
            <template #suffix>
              <svg class="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" />
                <path stroke-linecap="round" d="m21 21-4.3-4.3" />
              </svg>
            </template>
          </BaseInput>
        </div>
      </template>
    </PageHeader>

    <div class="overflow-hidden rounded-2xl bg-white shadow-card dark:bg-slate-800">
      <div v-if="loading" class="divide-y divide-slate-100 dark:divide-slate-700">
        <div v-for="n in 6" :key="n" class="flex items-center gap-4 px-5 py-4">
          <BaseSkeleton width="2.5rem" height="2.5rem" rounded="9999px" />
          <div class="flex-1 space-y-2">
            <BaseSkeleton width="40%" height="0.75rem" />
            <BaseSkeleton width="25%" height="0.75rem" />
          </div>
          <BaseSkeleton width="4rem" height="1.25rem" rounded="9999px" />
        </div>
      </div>

      <div v-else-if="failed" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span class="grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </span>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
          No se pudieron cargar las transacciones
        </p>
        <button class="text-sm font-semibold text-brand-600 hover:underline" @click="loadTransacciones">
          Reintentar
        </button>
      </div>

      <div v-else-if="!filtered.length" class="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span class="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700">
          <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6h13M9 5h13M3 5h.01M3 12h.01M3 19h.01M9 19h13" />
          </svg>
        </span>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">Sin resultados</p>
        <p class="text-sm text-slate-400">
          {{ search ? 'Ajusta tu búsqueda para ver más registros.' : 'Aún no hay transacciones.' }}
        </p>
      </div>

      <table v-else class="hidden w-full text-left text-sm sm:table">
        <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/40">
          <tr>
            <th class="px-5 py-3 font-semibold">Titular</th>
            <th class="px-5 py-3 font-semibold">Tarjeta</th>
            <th class="px-5 py-3 font-semibold">Referencia</th>
            <th class="px-5 py-3 text-right font-semibold">Importe</th>
            <th class="px-5 py-3 font-semibold">
              <button class="inline-flex items-center gap-1 hover:text-slate-700" @click="sortDesc = !sortDesc">
                Fecha
                <span>{{ sortDesc ? '↓' : '↑' }}</span>
              </button>
            </th>
            <th class="px-5 py-3 font-semibold">Estatus</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
          <tr
            v-for="r in filtered"
            :key="r.id"
            class="transition hover:bg-slate-50/70 dark:hover:bg-slate-700/30"
          >
            <td class="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100">{{ r.holder }}</td>
            <td class="px-5 py-3.5 font-mono text-slate-500">{{ r.maskedCard }}</td>
            <td class="px-5 py-3.5 font-mono text-slate-500">{{ r.financialReference }}</td>
            <td class="px-5 py-3.5 text-right font-medium text-slate-800 dark:text-slate-100">
              {{ money(r.amount) }}
            </td>
            <td class="px-5 py-3.5 text-slate-500">{{ shortDatee(r.date) }}</td>
            <td class="px-5 py-3.5">
              <BaseBadge :tone="toneByStatus[r.status] ?? 'neutral'">{{ r.status }}</BaseBadge>
            </td>
          </tr>
        </tbody>
      </table>

      <ul v-if="!loading && !failed && filtered.length" class="divide-y divide-slate-100 dark:divide-slate-700 sm:hidden">
        <li v-for="r in filtered" :key="r.id" class="flex items-center justify-between gap-3 px-4 py-3.5">
          <div class="min-w-0">
            <p class="truncate font-medium text-slate-800 dark:text-slate-100">{{ r.holder }}</p>
            <p class="font-mono text-xs text-slate-400">{{ r.maskedCard }} · {{ shortDatee(r.date) }}</p>
          </div>
          <div class="text-right">
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ money(r.amount) }}</p>
            <BaseBadge :tone="toneByStatus[r.status] ?? 'neutral'">{{ r.status }}</BaseBadge>
          </div>
        </li>
      </ul>
    </div>

    <p v-if="!loading && !failed && filtered.length" class="mt-3 text-xs text-slate-400">
      {{ filtered.length }} {{ filtered.length === 1 ? 'transacción' : 'transacciones' }}
    </p>
  </section>
</template>
