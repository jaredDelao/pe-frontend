import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload, Role } from '@/types'

const STORAGE_KEY = 'pe.session'

interface AuthState {
  token: string | null
  role: Role | null
  username: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    role: null,
    username: null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    isSupervisor: (s) => s.role === 'Supervisor',
    isOperador: (s) => s.role === 'Operador',
    homeRoute: (s) => (s.role === 'Supervisor' ? 'cancelacion' : 'venta'),
  },

  actions: {
    setSession(token: string) {
      const payload = jwtDecode<JwtPayload>(token)
      this.token = token
      this.role = (payload.Role ?? payload.role ?? null) as Role | null
      this.username = payload.sub ?? payload.name ?? null
      sessionStorage.setItem(STORAGE_KEY, token)
    },

    restore() {
      const token = sessionStorage.getItem(STORAGE_KEY)
      if (!token) return
      try {
        const payload = jwtDecode<JwtPayload>(token)
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          this.logout()
          return
        }
        this.setSession(token)
      } catch {
        this.logout()
      }
    },

    logout() {
      this.$reset()
      sessionStorage.removeItem(STORAGE_KEY)
    },
  },
})
