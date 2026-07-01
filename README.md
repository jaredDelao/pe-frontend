# Pagos PE — Front End

Aplicación de transacciones con control de acceso por rol. La idea es sencilla: un **Operador**
entra a registrar ventas y revisar el historial, mientras que un **Supervisor** se encarga de
cancelar y devolver transacciones. Para no depender de un backend real, todo está simulado con
Mockoon.

Por dentro está hecha con Vue 3 (`<script setup>` + TypeScript), Vue Router, Pinia, Axios y
Tailwind CSS.

## Requisitos

Antes de arrancar necesitas tener a mano:

- Node 18 o superior.
- [Mockoon](https://mockoon.com/), ya sea la app de escritorio o `@mockoon/cli`.

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env
npm run dev
```

Con eso la app queda disponible en `http://localhost:5173`. Eso sí, necesita que el mock esté
corriendo en el puerto `3001`, así que no te olvides de levantarlo.

### Levantar el mock

Si usas la app de escritorio, basta con ir a **Import**, elegir `mockoon/evaluacion-pe.json` y
darle a *Start*.

Si prefieres la línea de comandos:

```bash
npx @mockoon/cli start --data ./mockoon/evaluacion-pe.json --port 3001
```

## Credenciales de prueba

El login decide a dónde llevarte según el usuario que escribas, y la contraseña es libre (pon lo
que quieras). Las opciones son:

- **`supervisor`** → entra como Supervisor y puede hacer Cancelación y Devolución.
- **Cualquier otro usuario** → entra como Operador, con acceso a Venta y Consultas.

## Variables de entorno

Estas son las variables que la app espera encontrar en tu `.env`:

- **`VITE_API_URL`** — la ruta base de la API. En desarrollo apunta a `/api`.
- **`VITE_MOCK_URL`** — el destino del proxy hacia Mockoon, normalmente `http://localhost:3001`.
- **`VITE_AES_KEY`** — la llave AES, de 16, 24 o 32 caracteres.
- **`VITE_AES_IV`** — el vector de inicialización, de 16 caracteres.

Un detalle importante: el front siempre le pega a `/api` y es el dev server de Vite el que
reenvía esas peticiones a Mockoon (puedes verlo en `server.proxy` dentro de `vite.config.ts`).
Gracias a eso el navegador trabaja siempre sobre el mismo origen y te ahorras los típicos errores
de CORS, sin importar cómo hayas levantado el mock.

## Scripts

Los comandos que vas a usar más seguido:

- **`npm run dev`** — levanta el servidor de desarrollo.
- **`npm run build`** — hace el chequeo de tipos y genera el build de producción.
- **`npm run preview`** — te deja previsualizar ese build.
- **`npm run type-check`** — corre solo el chequeo de tipos, sin construir nada.

## Cómo probar cada flujo

Para que puedas ver los distintos comportamientos sin adivinar, aquí van los casos preparados en
el mock:

- **Venta aprobada**: usa cualquier importe que no sea 666.
- **Venta rechazada (400)**: pon el importe `666` y se dispara la respuesta de error.
- **Consultas**: verás 12 registros generados con datos dinámicos.
- **Cancelación / Devolución con error (400)**: usa la referencia financiera `00000000`.
