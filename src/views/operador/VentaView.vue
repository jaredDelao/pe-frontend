<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { venta } from '@/services/transactions.service'
import {
  cvvLength,
  detectBrand,
  expiryValid,
  formatCardNumber,
  formatExpiry,
  onlyDigits,
} from '@/composables/useCardValidation'
import type { TransaccionResultado } from '@/types'
import CardPreview from '@/components/card/CardPreview.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ReceiptCard from '@/components/card/ReceiptCard.vue'

const form = reactive({
  amount: '',
  holder: '',
  number: '',
  expiry: '',
  cvv: '',
})

const touched = reactive({
  amount: false,
  holder: false,
  number: false,
  expiry: false,
  cvv: false,
})

const loading = ref(false)
const cvvFocused = ref(false)
const result = ref<TransaccionResultado | null>(null)

const brand = computed(() => detectBrand(form.number))

const amountValue = computed(() => Number(form.amount.replace(/,/g, '')) || 0)

const errors = computed(() => {
  return {
    amount: amountValue.value <= 0 ? 'Ingresa un importe mayor a cero' : '',
    holder: !/^[a-zA-ZÀ-ÿ\s]{3,}$/.test(form.holder.trim())
      ? 'Nombre del titular requerido (solo letras)'
      : '',
    number: onlyDigits(form.number).length < 13 ? 'Ingresa el número de tarjeta' : '',
    expiry: !expiryValid(form.expiry) ? 'Fecha inválida o vencida' : '',
    cvv:
      onlyDigits(form.cvv).length !== cvvLength(brand.value)
        ? `El CVV debe tener ${cvvLength(brand.value)} dígitos`
        : '',
  }
})

const isValid = computed(() => Object.values(errors.value).every((e) => !e))

function show(field: keyof typeof touched) {
  return touched[field] ? errors.value[field] : ''
}

function onNumberInput(value: string) {
  form.number = formatCardNumber(value)
}

function onExpiryInput(value: string) {
  form.expiry = formatExpiry(value)
}

function onCvvInput(value: string) {
  form.cvv = onlyDigits(value).slice(0, cvvLength(brand.value))
}

function enmascararImporte(valor: string): string {
  let limpio = valor.replace(/[^\d.]/g, '')
  const punto = limpio.indexOf('.')
  if (punto !== -1) {
    limpio = limpio.slice(0, punto + 1) + limpio.slice(punto + 1).replace(/\./g, '')
  }

  let [enteros = '', deciamales] = limpio.split('.')
  enteros = enteros.replace(/^0+(?=\d)/, '')
  const enteroEnmascarado = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (limpio.includes('.')) {
    return `${enteroEnmascarado || '0'}.${(deciamales ?? '').slice(0, 2)}`
  }
  return enteroEnmascarado
}

function onAmountInput(event: Event) {
  const el = event.target as HTMLInputElement
  const masked = enmascararImporte(el.value)
  form.amount = masked
  el.value = masked
}

const amountPreview = computed(() => {
  if (!amountValue.value) return ''
  return amountValue.value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
})

async function onSubmit() {
  Object.keys(touched).forEach((k) => (touched[k as keyof typeof touched] = true))
  if (!isValid.value || loading.value) return

  loading.value = true
  try {
    const { data } = await venta({
      amount: amountValue.value,
      holderName: form.holder.trim(),
      cardNumber: onlyDigits(form.number),
      expiry: form.expiry,
      cvv: form.cvv,
    })
    result.value = data
  } catch {
  } finally {
    loading.value = false
  }
}

function nuevaVenta() {
  result.value = null
  Object.assign(form, { amount: '', holder: '', number: '', expiry: '', cvv: '' })
  Object.keys(touched).forEach((k) => (touched[k as keyof typeof touched] = false))
}
</script>

<template>
  <section class="animate-fade-up">
    <PageHeader title="Nueva venta" description="Captura los datos del pago para procesar la transacción.">
      <template #icon>
        <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
        </svg>
      </template>
    </PageHeader>

    <ReceiptCard v-if="result" title="Venta aprobada" :result="result" @new="nuevaVenta" />

    <div v-else class="grid gap-8 lg:grid-cols-[20rem_1fr]">
      <div class="flex flex-col items-center gap-4">
        <CardPreview :number="form.number" :holder="form.holder" :expiry="form.expiry" :cvv="form.cvv" :brand="brand"
          :flipped="cvvFocused" />
        <p class="flex items-center gap-1.5 text-xs text-slate-400">
          <svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Los datos de la tarjeta se cifran con AES antes de enviarse.
        </p>
      </div>

      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="onSubmit">
        <div class="sm:col-span-2">
          <label for="venta-importe" class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Importe
          </label>
          <div
            class="flex items-baseline gap-3 rounded-2xl border-2 bg-brand-50/60 px-4 py-3.5 transition focus-within:ring-4 dark:bg-brand-500/5"
            :class="show('amount')
                ? 'border-danger focus-within:ring-danger/15'
                : 'border-brand-200 focus-within:border-brand-500 focus-within:ring-brand-500/15 dark:border-brand-500/30'
              ">
            <input id="venta-importe" :value="form.amount" inputmode="decimal" placeholder="0.00" autocomplete="off"
              class="w-full bg-transparent text-3xl font-bold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none dark:text-white dark:placeholder:text-slate-600"
              :aria-invalid="!!show('amount')" aria-describedby="venta-importe-error" @input="onAmountInput"
              @blur="touched.amount = true" />
            <span class="text-sm font-semibold text-slate-400">MXN</span>
          </div>
          <p v-if="show('amount')" id="venta-importe-error" class="mt-1.5 text-xs font-medium text-danger" role="alert">
            {{ show('amount') }}
          </p>
        </div>

        <div class="sm:col-span-2">
          <BaseInput v-model="form.holder" label="Titular de la tarjeta" placeholder="Como aparece en la tarjeta"
            autocomplete="cc-name" :error="show('holder')" @blur="touched.holder = true" />
        </div>

        <div class="sm:col-span-2">
          <BaseInput label="Número de tarjeta" :model-value="form.number" inputmode="numeric"
            placeholder="0000 0000 0000 0000" autocomplete="cc-number" :maxlength="brand === 'amex' ? 17 : 19"
            :error="show('number')" @update:model-value="onNumberInput" @blur="touched.number = true">
            <template #suffix>
              <span class="text-xs font-bold uppercase text-slate-400">
                {{ brand !== 'unknown' ? brand : '' }}
              </span>
            </template>
          </BaseInput>
        </div>

        <BaseInput label="Expiración" :model-value="form.expiry" inputmode="numeric" placeholder="MM/AA"
          autocomplete="cc-exp" :maxlength="5" :error="show('expiry')" @update:model-value="onExpiryInput"
          @blur="touched.expiry = true" />

        <BaseInput label="CVV" type="password" :model-value="form.cvv" inputmode="numeric"
          :placeholder="'•'.repeat(cvvLength(brand))" autocomplete="cc-csc" :maxlength="cvvLength(brand)"
          :error="show('cvv')" @update:model-value="onCvvInput" @blur="cvvFocused = false; touched.cvv = true"
          @focus="cvvFocused = true" />

        <div class="sm:col-span-2 mt-2">
          <BaseButton type="submit" :loading="loading" block>
            {{ loading ? 'Procesando…' : `Cobrar ${amountPreview || ''}`.trim() }}
          </BaseButton>
        </div>
      </form>
    </div>
  </section>
</template>
