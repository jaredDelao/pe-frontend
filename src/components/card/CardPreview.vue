<script setup lang="ts">
import { computed } from 'vue'
import type { CardBrand } from '@/types'

const props = defineProps<{
  number: string
  holder: string
  expiry: string
  cvv: string
  brand: CardBrand
  flipped: boolean
}>()

const displayNumber = computed(() => {
  const groups = props.brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4]
  const digits = props.number.replace(/\D/g, '')
  const total = groups.reduce((a, b) => a + b, 0)
  const padded = digits.padEnd(total, '•')
  const out: string[] = []
  let i = 0
  for (const g of groups) {
    out.push(padded.slice(i, i + g))
    i += g
  }
  return out.join('  ')
})

const brandLabel: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  amex: 'AMEX',
  unknown: '',
}
</script>

<template>
  <div class="card-scene">
    <div class="card-3d" :class="{ 'is-flipped': flipped }">
      <div class="card-face card-front">
        <div class="flex items-start justify-between">
          <div class="h-9 w-12 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner" />
          <span class="text-sm font-bold tracking-wide">{{ brandLabel[brand] }}</span>
        </div>

        <p class="mt-6 font-mono text-lg tracking-[0.15em] sm:text-xl">{{ displayNumber }}</p>

        <div class="mt-5 flex items-end justify-between text-xs">
          <div class="min-w-0">
            <span class="block text-[10px] uppercase tracking-wider text-white/60">Titular</span>
            <span class="block truncate font-medium uppercase">
              {{ holder || 'NOMBRE APELLIDO' }}
            </span>
          </div>
          <div class="text-right">
            <span class="block text-[10px] uppercase tracking-wider text-white/60">Expira</span>
            <span class="font-mono font-medium">{{ expiry || 'MM/AA' }}</span>
          </div>
        </div>
      </div>

      <div class="card-face card-back">
        <div class="-mx-6 mt-5 h-10 bg-black/80" />
        <div class="mt-5 flex items-center justify-end">
          <span class="mr-2 text-[10px] uppercase tracking-wider text-white/60">CVV</span>
          <span class="rounded bg-white px-3 py-1 font-mono text-sm text-slate-900">
            {{ cvv || '•••' }}
          </span>
        </div>
        <p class="mt-auto text-right text-xs font-semibold opacity-80">{{ brandLabel[brand] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-scene {
  perspective: 1200px;
  width: 100%;
  max-width: 22rem;
  aspect-ratio: 1.586;
}

.card-3d {
  position: relative;
  height: 100%;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  transform-style: preserve-3d;
}

.card-3d.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 1rem;
  color: white;
  backface-visibility: hidden;
  box-shadow: 0 18px 40px -18px rgb(49 46 129 / 0.7);
  background: linear-gradient(135deg, #4f46e5 0%, #312e81 55%, #1e1b4b 100%);
}

.card-back {
  transform: rotateY(180deg);
}
</style>
