# Plan de ejecución — Evaluación PE Front End 2026 (Vue 3)

> Objetivo: app de transacciones con vistas por rol (Supervisor / Operador), backend simulado en Mockoon y **UX como criterio de mayor peso**. Este documento prioriza dejar resueltos los puntos críticos antes de teclear la primera línea.

---

## 1. Stack recomendado

| Capa | Elección | Por qué |
|---|---|---|
| Build | **Vite + Vue 3 `<script setup>`** | Estándar actual, arranque inmediato |
| Estado | **Pinia** | Sesión/rol global, simple y tipable |
| Routing | **Vue Router** | Rutas protegidas y anidadas por rol |
| HTTP | **Axios** | Interceptores para JWT y notificaciones 200/400 |
| Notificaciones | **vue-toastification** (o store de toasts propio) | Requisito explícito de feedback por petición |
| Validación | **VeeValidate + Zod** (o composables propios) | Validación reactiva con mensajes accesibles |
| Cifrado | **crypto-js** | AES requerido para la Venta |
| JWT | **jwt-decode** | Leer el claim `Role` |
| Estilos | **Tailwind** o CSS con design tokens propios | Sistema visual consistente; lo que más suma en la rúbrica |

> El diseño es libre. Mi recomendación: **componentes propios bien hechos** (no una librería de UI completa). Demuestra más criterio de UX que arrastrar Vuetify. Tailwind te da velocidad sin esconder tus decisiones de diseño.

---

## 2. Estructura de carpetas

```
src/
├─ assets/styles/      # tokens.css, base.css
├─ components/
│  ├─ ui/              # BaseButton, BaseInput, BaseSelect, Toast, Modal, Skeleton, Badge
│  ├─ card/            # CardPreview (tarjeta animada), CardNumberInput, ExpiryInput, CvvInput
│  └─ layout/          # AppShell, AppHeader, AppNav
├─ composables/
│  ├─ useCrypto.js     # AES
│  ├─ useNotify.js     # wrapper de toasts
│  └─ useCardValidation.js  # Luhn, marca, expiración
├─ stores/
│  └─ auth.js
├─ services/
│  ├─ http.js          # instancia axios + interceptores
│  ├─ auth.service.js
│  └─ tx.service.js    # venta, consultas, cancelacion, devolucion
├─ views/
│  ├─ LoginView.vue
│  ├─ operador/  VentaView.vue, ConsultasView.vue
│  └─ supervisor/ CancelacionView.vue, DevolucionView.vue
├─ router/index.js
└─ main.js
```

---

## 3. Autenticación y JWT

### Los 2 tokens en jwtbuilder.jamiekurtz.com
En **Additional Claims** agrega un claim con nombre exacto `Role`:
- Token 1 → `Role: Supervisor`
- Token 2 → `Role: Operador`

Mantén el nombre del claim idéntico al que lees en el front (`Role` con mayúscula).

### Store de sesión

```js
// stores/auth.js
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({ token: null, role: null, username: null }),
  getters: {
    isAuthenticated: (s) => !!s.token,
    isSupervisor:    (s) => s.role === 'Supervisor',
    isOperador:      (s) => s.role === 'Operador',
  },
  actions: {
    setSession(token) {
      const payload = jwtDecode(token)        // { Role: 'Supervisor', ... }
      this.token = token
      this.role = payload.Role ?? payload.role
      this.username = payload.sub ?? payload.name ?? null
    },
    logout() { this.$reset() },
  },
})
```

### Guard por rol

```js
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' }
  if (to.meta.role && to.meta.role !== auth.role) {
    // un Operador no entra a vistas de Supervisor y viceversa
    return { name: auth.isSupervisor ? 'cancelacion' : 'venta' }
  }
})
```

> Decisión: el token en memoria (Pinia) es suficiente para la prueba. Si quieres persistir el login al refrescar, guarda solo el token en `sessionStorage` y rehidrata en `main.js`. No metas datos sensibles ahí.

---

## 4. Configuración de Mockoon

### Endpoints

| Operación | Método | Ruta | Status | Respuesta |
|---|---|---|---|---|
| Login | POST | `/login` | 200 | `{ token }` (uno de los 2 JWT) |
| Venta | POST | `/venta` | 200 / 400 | aprobación + referencia + tarjeta enmascarada |
| Consultas | GET | `/transacciones` | 200 | ≥10 registros aprobados |
| Cancelación | PATCH | `/cancelacion` | 200 / 400 | aprobación + referencia + tarjeta + estatus |
| Devolución | PATCH | `/devolucion` | 200 / 400 | igual que cancelación |

### Login que devuelve el token según usuario
En la ruta `/login`, agrega **Rules** sobre el body:
- Si `username` *equals* `supervisor` → response con el JWT de Supervisor.
- Response por defecto → JWT de Operador.

### Datos dinámicos (templating)
Mockoon usa helpers tipo Handlebars + Faker. Ejemplos (verifica los nombres de helper según la versión de tu Mockoon, los namespaces de Faker cambiaron entre v7/v8):

```handlebars
{
  "approvalNumber": "{{faker 'number.int' min=100000 max=999999}}",
  "financialReference": "{{faker 'number.int' min=10000000 max=99999999}}",
  "maskedCard": "{{body 'cardLast'}}",  // o construye 1234*****1234 desde el input
  "status": "APLICADO"
}
```

Para **Consultas**, usa el helper de repetición para emitir ≥10 registros:

```handlebars
[
  {{#repeat 12}}
  {
    "id": "{{faker 'string.uuid'}}",
    "approvalNumber": "{{faker 'number.int' min=100000 max=999999}}",
    "financialReference": "{{faker 'number.int' min=10000000 max=99999999}}",
    "maskedCard": "{{faker 'finance.maskedNumber'}}",
    "amount": {{faker 'finance.amount'}},
    "holder": "{{faker 'person.fullName'}}",
    "date": "{{faker 'date.recent'}}",
    "status": "APROBADA"
  }
  {{/repeat}}
]
```

### Simular el 400 (para demostrar manejo de errores)
En la ruta de Venta agrega un **segundo response** con status 400 y una Rule:
- `cardNumber` *equals* a una tarjeta de prueba (p. ej. `4000000000000002`) → 400 con `{ "message": "Transacción rechazada" }`.

Así puedes mostrar en vivo tanto el camino feliz como el de error sin tocar código.

---

## 5. Cifrado AES de la Venta

Solo la Venta cifra `cardNumber`, `expiry` y `cvv`.

```js
// composables/useCrypto.js
import CryptoJS from 'crypto-js'

const KEY = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_AES_KEY) // 16/24/32 bytes
const IV  = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_AES_IV)  // 16 bytes

export function encryptAES(plain) {
  return CryptoJS.AES.encrypt(String(plain), KEY, {
    iv: IV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7,
  }).toString() // Base64
}
```

Payload de Venta:

```js
const payload = {
  amount,
  holderName,
  cardNumber: encryptAES(cardNumber),
  expiry:     encryptAES(expiry),
  cvv:        encryptAES(cvv),
}
```

> **Nota profesional que conviene dejar escrita en el README** (suma puntos de criterio): el cifrado simétrico en cliente no protege por sí solo sin un intercambio seguro de llave; en producción esto se resuelve con TLS + tokenización/PCI DSS y el cifrado lo hace el gateway. Aquí se implementa AES porque es requisito del ejercicio, con la llave acordada por configuración. Mostrar esa conciencia diferencia a un senior.

---

## 6. Capa HTTP + notificaciones 200 / 400

Centraliza el requisito de "notificación en cada petición" en interceptores:

```js
// services/http.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useNotify } from '@/composables/useNotify'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
  const { token } = useAuthStore()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => {
    useNotify().success('Operación exitosa (200)')
    return res
  },
  (err) => {
    const status = err.response?.status ?? 0
    const msg = err.response?.data?.message ?? 'La solicitud falló'
    useNotify().error(`Error (${status}): ${msg}`)
    return Promise.reject(err)
  }
)

export default api
```

Las dos notificaciones deben ser **visualmente distintas**: éxito (verde, ícono check) vs error (rojo/ámbar, ícono alerta), distinto sonido/posición opcional. Que se note la diferencia de un vistazo.

---

## 7. Vistas y navegación

```
/login
/app                 (AppShell, requiresAuth)
  ├─ /app/venta      (role: Operador)
  ├─ /app/consultas  (role: Operador)
  ├─ /app/cancelacion(role: Supervisor)
  └─ /app/devolucion (role: Supervisor)
```

- **LoginView**: usuario + password, botón con estado de carga, mostrar/ocultar password, botón deshabilitado si el form es inválido.
- **AppShell (Main)**: header con nombre de usuario + rol + logout, y navegación que **solo muestra las operaciones del rol**. Aquí se cumple "Main visualiza según el rol".
- **VentaView (Operador)**: formulario de venta → POST. Al recibir 200, mostrar **comprobante** (card/modal) con n° de aprobación, referencia financiera, tarjeta enmascarada e importe.
- **ConsultasView (Operador)**: tabla con ≥10 registros → GET. Con badges de estatus, búsqueda/orden, skeleton de carga y empty state.
- **Cancelación / Devolución (Supervisor)**: selector de operación, n° de referencia financiera, n° de tarjeta → PATCH. **Modal de confirmación antes de ejecutar** (acción sensible). Resultado muestra estatus aplicado.

> Patrón sugerido: en cada vista de Operador y Supervisor, un *segmented control* / tabs para alternar entre sus dos operaciones. Limpio y claro.

---

## 8. Validaciones (clave para UX)

Composable de tarjeta:

```js
// composables/useCardValidation.js
export function luhnValid(num) {
  const d = num.replace(/\D/g, '')
  let sum = 0, alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = +d[i]
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n; alt = !alt
  }
  return d.length >= 13 && sum % 10 === 0
}

export function detectBrand(num) {
  const n = num.replace(/\D/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  return 'unknown'
}
```

Reglas por campo:
- **Tarjeta**: solo dígitos, formato en grupos de 4, validación Luhn, ícono de marca detectada.
- **Expiración**: máscara `MM/AA`, mes válido, **no vencida**.
- **CVV**: 3 dígitos (4 para Amex), enmascarado.
- **Nombre**: requerido, solo letras/espacios.
- **Importe**: positivo, formato de moneda MXN.
- **Referencia financiera** (Supervisor): 8 dígitos.

Mensajes inline, específicos y accesibles (no solo borde rojo): "La tarjeta no es válida", "La fecha ya expiró".

---

## 9. Estrategia UX/UI — la sección que más pesa

**Sistema de diseño**
- Tokens consistentes: paleta (primario, éxito, error, neutros), escala tipográfica, espaciados, radios, sombras. Un solo lenguaje visual en toda la app.
- Modo claro/oscuro como plus.

**Estados (no dejar ninguno sin diseñar)**
- *Loading*: botones con spinner, skeletons en la tabla.
- *Empty*: estado vacío ilustrado en Consultas.
- *Error*: mensajes claros + toast diferenciado.
- *Success*: comprobante visual tras la venta/cancelación.

**Momentos de alto impacto**
- **Tarjeta animada (`CardPreview`)** que se llena conforme escribes número, nombre, expiración y se voltea al enfocar el CVV. Es el detalle que más impresiona en formularios de pago.
- Comprobante tipo recibo tras una transacción aprobada.
- Modal de confirmación en cancelaciones (acción destructiva).

**Accesibilidad**
- Navegación por teclado, focus visible, `aria-*` en inputs/errores, contraste AA.

**Responsive**
- Mobile-first. Que la tabla de consultas colapse a tarjetas en móvil.

**Micro-interacciones**
- Transiciones sutiles (`<Transition>`), feedback en hover/focus, no abusar.

---

## 10. Roadmap por fases

1. **Fundaciones** — Vite + Vue + Pinia + Router + Tailwind, tokens, componentes `ui/` base, sistema de toasts.
2. **Auth** — Mockoon `/login` con reglas, store, guard por rol, LoginView, AppShell con nav por rol.
3. **Operador** — VentaView (form + AES + comprobante), ConsultasView (tabla, skeleton, empty state).
4. **Supervisor** — Cancelación/Devolución (form + confirmación + resultado con estatus).
5. **Transversal** — interceptores 200/400, validaciones finas, tarjeta animada, responsive, dark mode.
6. **Pulido + README** — accesibilidad, revisión visual, documentación (incluida la nota sobre AES) y guía para correr Mockoon.

---

## 11. Checklist de entrega (mapeado a la rúbrica)

- [ ] 2 JWT creados con claim `Role` (Supervisor / Operador)
- [ ] Login devuelve token y enruta según rol
- [ ] Main muestra solo operaciones del rol
- [ ] Operador: Venta (POST) + Consultas (GET ≥10)
- [ ] Supervisor: Cancelación/Devolución (PATCH)
- [ ] Venta cifra tarjeta + expiración + cvv con AES
- [ ] Respuesta Venta/Cancelación: aprobación (6) + referencia (8) + tarjeta enmascarada (+ estatus)
- [ ] Notificación 200 en cada petición
- [ ] Notificación 400 distinta para errores
- [ ] JSON en toda la comunicación
- [ ] **UX**: estados, validaciones, comprobante, tarjeta animada, responsive, accesibilidad
- [ ] README con setup + nota técnica sobre AES

---

## 12. Supuestos / decisiones a confirmar

- El claim del rol se llama `Role` (ajústalo si lo nombras distinto en jwtbuilder).
- La llave/IV de AES se acuerdan por `.env` (Mockoon no descifra; basta con enviar el ciphertext).
- "Cancelación" y "Devolución" se tratan como dos operaciones del Supervisor con el mismo contrato (referencia + tarjeta), diferenciadas por endpoint o por un campo `type`.