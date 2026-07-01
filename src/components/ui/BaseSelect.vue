<script setup lang="ts">
import { useId } from 'vue'

interface Option {
  label: string
  value: string
}

defineProps<{
  modelValue: string
  label: string
  options: Option[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </label>
    <select :id="id" :value="modelValue"
      class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
