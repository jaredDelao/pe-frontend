<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { formatCardNumber, onlyDigits } from '@/composables/useCardValidation'
import type { OperacionSupervisorPayload, TransaccionResultado } from '@/types'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ReceiptCard from '@/components/card/ReceiptCard.vue'

const props = defineProps<{
  title: string
  description: string
  action: (payload: OperacionSupervisorPayload) => Promise<{ data: TransaccionResultado }>
  confirmLabel: string
}>()

const form = reactive({ reference: '', number: '' })
const touched = reactive({ reference: false, number: false })
const loading = ref(false)
const showConfirm = ref(false)
const result = ref<TransaccionResultado | null>(null)

const errors = computed(() => ({
  reference: !/^\d{8}$/.test(form.reference)
    ? 'La referencia financiera debe tener 8 dígitos'
    : '',
  number: onlyDigits(form.number).length < 13 ? 'Ingresa el número de tarjeta' : '',
}))

const isValid = computed(() => !errors.value.reference && !errors.value.number)

function show(field: keyof typeof touched) {
  return touched[field] ? errors.value[field] : ''
}

function onReferenceInput(value: string) {
  form.reference = onlyDigits(value).slice(0, 8)
}

function onNumberInput(value: string) {
  form.number = formatCardNumber(value)
}

function askConfirm() {
  touched.reference = true
  touched.number = true
  if (!isValid.value) return
  showConfirm.value = true
}

async function confirm() {
  showConfirm.value = false
  loading.value = true
  try {
    const { data } = await props.action({
      financialReference: form.reference,
      cardNumber: onlyDigits(form.number),
    })
    result.value = data
  } catch {
    // Error notificado por el interceptor.
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value = null
  form.reference = ''
  form.number = ''
  touched.reference = false
  touched.number = false
}
</script>

<template>
  <section class="animate-fade-up">
    <PageHeader :title="title" :description="description">
      <template #icon>
        <slot name="icon" />
      </template>
    </PageHeader>

    <ReceiptCard v-if="result" :title="`${title} aplicada`" :result="result" @new="reset" />

    <form
      v-else
      class="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-card dark:bg-slate-800"
      @submit.prevent="askConfirm"
    >
      <div class="flex flex-col gap-4">
        <BaseInput
          label="Referencia financiera"
          :model-value="form.reference"
          inputmode="numeric"
          placeholder="8 dígitos"
          :maxlength="8"
          :error="show('reference')"
          @update:model-value="onReferenceInput"
          @blur="touched.reference = true"
        />

        <BaseInput
          label="Número de tarjeta"
          :model-value="form.number"
          inputmode="numeric"
          placeholder="0000 0000 0000 0000"
          :maxlength="19"
          :error="show('number')"
          @update:model-value="onNumberInput"
          @blur="touched.number = true"
        />

        <BaseButton type="submit" :loading="loading" block class="mt-2">
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </form>

    <BaseModal :open="showConfirm" :title="`Confirmar ${title.toLowerCase()}`" @close="showConfirm = false">
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Esta acción es irreversible. Se aplicará la {{ title.toLowerCase() }} sobre la referencia
        <span class="font-mono font-semibold text-slate-900 dark:text-white">{{ form.reference }}</span>
        y la tarjeta
        <span class="font-mono font-semibold text-slate-900 dark:text-white">{{ form.number }}</span>.
      </p>
      <div class="mt-6 flex justify-end gap-3">
        <BaseButton variant="ghost" @click="showConfirm = false">Cancelar</BaseButton>
        <BaseButton variant="danger" @click="confirm">Sí, continuar</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>
