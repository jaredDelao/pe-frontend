<script setup lang="ts">
import { devolucion } from '@/services/transactions.service'
import OperacionForm from '@/components/supervisor/OperacionForm.vue'
</script>

<template>
  <OperacionForm
    title="Devolución"
    description="Reintegra el importe de una transacción ya liquidada."
    confirm-label="Procesar devolución"
    :action="devolucion"
  >
    <template #icon>
      <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 14L4 9l5-5" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 9h11a5 5 0 015 5v1" />
      </svg>
    </template>
  </OperacionForm>
</template>
