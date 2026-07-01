<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label: string
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    inputmode?: 'text' | 'numeric' | 'decimal' | 'email'
    autocomplete?: string
    maxlength?: number
    disabled?: boolean
  }>(),
  { type: 'text' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
}>()

const id = useId()
const errorId = `${id}-error`

const fieldClasses = computed(() => [
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100',
  props.error
    ? 'border-danger focus:border-danger focus:ring-danger/30'
    : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/30 dark:border-slate-700',
])
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-sm font-medium text-slate-700 dark:text-slate-200">
      {{ label }}
    </label>

    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        :class="fieldClasses"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur')"
        @focus="emit('focus')"
      />
      <span v-if="$slots.suffix" class="absolute inset-y-0 right-3 flex items-center">
        <slot name="suffix" />
      </span>
    </div>

    <p
      v-if="error"
      :id="errorId"
      class="text-xs font-medium text-danger"
      role="alert"
    >
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>
