<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <header
    class="mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-slate-700 dark:bg-slate-800"
  >
    <span
      class="grid size-12 place-items-center rounded-4xl bg-secondary-500 text-white"
    >
      <slot name="icon" />
    </span>

    <div class="min-w-0">
      <h1 class="text-2xl font-bold text-secondary-500 dark:text-white">
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm text-slate-500">{{ description }}</p>
    </div>

    <div v-if="$slots.actions" class="ml-auto w-full sm:w-auto">
      <slot name="actions" />
    </div>
  </header>
</template>
