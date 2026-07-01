<script setup lang="ts">
import { useNotify } from '@/composables/useNotify'

const { toasts, dismiss } = useNotify()

const styles = {
  success: {
    ring: 'border-l-4 border-success',
    icon: 'text-success',
    path: 'M5 13l4 4L19 7',
  },
  error: {
    ring: 'border-l-4 border-danger',
    icon: 'text-danger',
    path: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  },
  info: {
    ring: 'border-l-4 border-brand-500',
    icon: 'text-brand-600',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
} as const
</script>

<template>
  <div class="pointer-events-none fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-lg dark:bg-slate-800"
        :class="styles[t.type].ring"
        role="status"
      >
        <svg
          class="mt-0.5 size-5 shrink-0"
          :class="styles[t.type].icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" :d="styles[t.type].path" />
        </svg>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-900 dark:text-white">{{ t.title }}</p>
          <p v-if="t.message" class="text-xs text-slate-500 dark:text-slate-300">
            {{ t.message }}
          </p>
        </div>

        <button
          class="text-slate-400 transition hover:text-slate-600"
          aria-label="Cerrar notificación"
          @click="dismiss(t.id)"
        >
          <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-active {
  position: absolute;
  right: 0;
  width: 100%;
}
</style>
