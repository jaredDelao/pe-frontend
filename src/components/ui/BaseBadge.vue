<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tone?: "success" | "danger" | "warning" | "neutral" | "brand" | "secondary";
  }>(),
  { tone: "neutral" },
);

const tones: Record<string, string> = {
  success: "bg-success-soft text-success",
  secondary: "bg-secondary-soft text-brand",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  brand: "bg-brand-100 text-brand-700",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
};

const classes = computed(() => tones[props.tone]);
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="classes"
  >
    <slot />
  </span>
</template>
