<script setup lang="ts">
import { computed } from 'vue'
import type { TransaccionResultado } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps<{
  title: string
  result: TransaccionResultado
  newLabel?: string
}>()

defineEmits<{ (e: 'new'): void }>()

const amount = computed(() =>
  props.result.amount?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
)

const rows = computed(() => [
  { label: 'Número de aprobación', value: props.result.approvalNumber },
  { label: 'Referencia financiera', value: props.result.financialReference },
  { label: 'Tarjeta', value: props.result.maskedCard },
])
</script>

<template>
  <div class="mx-auto max-w-md animate-fade-up">
    <div class="overflow-hidden rounded-2xl bg-white shadow-card dark:bg-slate-800">
      <div class="flex flex-col items-center gap-2 bg-success-soft px-6 py-7 text-center">
        <span class="grid size-12 place-items-center rounded-full bg-success text-white">
          <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
        <p v-if="amount" class="text-2xl font-bold text-slate-900">{{ amount }}</p>
      </div>

      <dl class="divide-y divide-slate-100 px-6 dark:divide-slate-700">
        <div v-for="row in rows" :key="row.label" class="flex items-center justify-between py-3.5">
          <dt class="text-sm text-slate-500">{{ row.label }}</dt>
          <dd class="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            {{ row.value }}
          </dd>
        </div>
        <div v-if="result.status" class="flex items-center justify-between py-3.5">
          <dt class="text-sm text-slate-500">Estatus</dt>
          <dd><BaseBadge tone="success">{{ result.status }}</BaseBadge></dd>
        </div>
      </dl>

      <div class="border-t border-dashed border-slate-200 p-5 dark:border-slate-700">
        <BaseButton variant="secondary" block @click="$emit('new')">
          {{ newLabel ?? 'Nueva operación' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
