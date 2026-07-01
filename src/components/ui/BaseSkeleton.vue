<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string; rounded?: string }>(), {
  width: '100%',
  height: '1rem',
  rounded: '0.5rem',
})
</script>

<template>
  <span
    class="block animate-pulse bg-slate-200 dark:bg-slate-700"
    :style="{ width, height, borderRadius: rounded }"
    aria-hidden="true"
  />
</template>
