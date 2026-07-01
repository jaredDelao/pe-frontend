<script setup lang="ts">
import { cancelacion } from '@/services/transactions.service'
import PageHeader from '@/components/ui/PageHeader.vue'
import OperacionForm from '@/components/supervisor/OperacionForm.vue'
</script>

<template>
  <section class="animate-fade-up">
    <PageHeader
      title="Cancelación"
      description="Anula una transacción aprobada antes de su liquidación."
    >
      <template #icon>
        <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <path stroke-linecap="round" d="M9 9l6 6m0-6l-6 6" />
        </svg>
      </template>
    </PageHeader>

    <OperacionForm
      title="Cancelación"
      confirm-label="Cancelar transacción"
      with-transaction-number
      :action="cancelacion"
    />
  </section>
</template>
