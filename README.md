# Pagos PE — Front End

Aplicación de transacciones con control de acceso por rol. Un **Operador** registra ventas y
consulta el historial; un **Supervisor** cancela y devuelve transacciones. El backend está
simulado con Mockoon.

Construida con Vue 3 (`<script setup>` + TypeScript), Vue Router, Pinia, Axios y Tailwind CSS.

## Requisitos

- Node 18 o superior
- [Mockoon](https://mockoon.com/) (app de escritorio) o `@mockoon/cli`

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda en `http://localhost:5173`. Necesita el mock corriendo en el puerto `3001`.

### Levantar el mock

Con la app de escritorio: **Import** → `mockoon/evaluacion-pe.json` → *Start*.

Con la CLI:

```bash
npx @mockoon/cli start --data ./mockoon/evaluacion-pe.json --port 3001
```

## Credenciales de prueba

El login enruta según el usuario; la contraseña es libre.

| Usuario        | Rol        | Operaciones            |
| -------------- | ---------- | ---------------------- |
| `supervisor`   | Supervisor | Cancelación, Devolución |
| cualquier otro | Operador   | Venta, Consultas        |

## Variables de entorno

| Variable        | Descripción                                  |
| --------------- | -------------------------------------------- |
| `VITE_API_URL`  | Ruta base de la API. En desarrollo es `/api` |
| `VITE_MOCK_URL` | Destino del proxy hacia Mockoon (`http://localhost:3001`) |
| `VITE_AES_KEY`  | Llave AES (16, 24 o 32 caracteres)           |
| `VITE_AES_IV`   | Vector de inicialización (16 caracteres)     |

> El front pega a `/api` y el dev server de Vite reenvía esas peticiones a Mockoon
> (ver `server.proxy` en `vite.config.ts`). Así el navegador trabaja siempre en el mismo
> origen y se evitan los errores de CORS, independientemente de cómo levantes el mock.

## Scripts

| Comando              | Acción                              |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Servidor de desarrollo              |
| `npm run build`      | Chequeo de tipos + build de producción |
| `npm run preview`    | Previsualiza el build               |
| `npm run type-check` | Solo chequeo de tipos               |

## Cómo probar cada flujo

- **Venta aprobada**: cualquier importe distinto de 666.
- **Venta rechazada (400)**: importe `666` — dispara la respuesta de error del mock.
- **Consultas**: 12 registros generados con datos dinámicos.
- **Cancelación / Devolución 400**: referencia financiera `00000000`.
