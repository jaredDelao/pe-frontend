import { reactive, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

const toasts = reactive<Toast[]>([])
let seq = 0

function push(type: ToastType, title: string, message?: string, timeout = 4000) {
  const id = ++seq
  toasts.push({ id, type, title, message })
  if (timeout > 0) {
    window.setTimeout(() => dismiss(id), timeout)
  }
  return id
}

function dismiss(id: number) {
  const i = toasts.findIndex((t) => t.id === id)
  if (i !== -1) toasts.splice(i, 1)
}

export function useNotify() {
  return {
    toasts: readonly(toasts),
    dismiss,
    success: (title: string, message?: string) => push('success', title, message),
    error: (title: string, message?: string) => push('error', title, message, 6000),
    info: (title: string, message?: string) => push('info', title, message),
  }
}
