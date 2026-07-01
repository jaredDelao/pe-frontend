import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    role?: Role
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/app',
      component: () => import('@/components/layout/AppShell.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'venta',
          name: 'venta',
          component: () => import('@/views/operador/VentaView.vue'),
          meta: { role: 'Operador', requiresAuth: true },
        },
        {
          path: 'consultas',
          name: 'consultas',
          component: () => import('@/views/operador/ConsultasView.vue'),
          meta: { role: 'Operador', requiresAuth: true },
        },
        {
          path: 'cancelacion',
          name: 'cancelacion',
          component: () => import('@/views/supervisor/CancelacionView.vue'),
          meta: { role: 'Supervisor', requiresAuth: true },
        },
        {
          path: 'devolucion',
          name: 'devolucion',
          component: () => import('@/views/supervisor/DevolucionView.vue'),
          meta: { role: 'Supervisor', requiresAuth: true },
        },
      ],
    },
    { path: '/', redirect: { name: 'login' } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  // Si ya inició sesión, no tiene sentido volver al login.
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: auth.homeRoute }
  }

  // Cada rol solo entra a sus operaciones.
  if (to.meta.role && to.meta.role !== auth.role) {
    return { name: auth.homeRoute }
  }
})

export default router
