# Prueba PE — Front End

Aplicación de transacciones con control de acceso por rol. 
Existe el Rol **Operador** que entra a registrar ventas y revisar el historial, mientras que un **Supervisor** se encarga de
cancelar y devolver transacciones. Todo está simulado con
mockoon

Por dentro está hecha con Vue 3 (`<script setup>` + TypeScript), Vue Router, Pinia, Axios y
Tailwind CSS.

## Requisitos

Tener instalado:

- Node 18 o superior (22 de preferencia)
- `@mockoon/cli`.

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Con eso la app queda disponible en `http://localhost:5173`.

### Levantar el mock

Correr mockoon:

```bash
npx @mockoon/cli start --data ./mockoon/evaluacion-pe.json --port 3001
```

## Credenciales de prueba

El login decide a dónde llevarte según el usuario que escribas, y la contraseña es libre (pon lo
que quieras). Las opciones son:

- **`supervisor`** →  puede hacer Cancelación y Devolución.
- **operador** → con acceso a Venta y Consultas.

## Variables de entorno

Estas son las variables que la app espera encontrar en tu `.env`:

- **`VITE_API_URL`** — la ruta base de la API. En desarrollo apunta a `/api`.
- **`VITE_MOCK_URL`** — el destino del proxy hacia Mockoon, normalmente `http://localhost:3001`.
- **`VITE_AES_KEY`** — la llave AES, de 16, 24 o 32 caracteres.
- **`VITE_AES_IV`** — el vector de inicialización, de 16 caracteres.


## Scripts

Los comandos incluidos en package.json son:

- **`npm run dev`** — levanta el servidor de desarrollo.
- **`npm run build`** — hace el chequeo de tipos y genera el build de producción.
- **`npm run preview`** — te deja previsualizar ese build.
- **`npm run type-check`** — corre solo el chequeo de tipos, sin construir nada.

## Cómo probar cada flujo

- **Venta aprobada**: usa cualquier importe que no sea 666.
- **Venta rechazada (400)**: pon el importe `666` y se dispara la respuesta de error.
- **Consultas**: verás 12 registros generados con datos dinámicos.
- **Cancelación / Devolución con error (400)**: usa la referencia financiera `00000000`.

### Cómo teclear la tarjeta según la marca

La marca se detecta sola por los primeros dígitos que escribas, así que basta con empezar el
número correcto para que el formulario la reconozca (y ajuste el formato, el largo y el CVV):

- **Visa**: empieza con **`4`**. Son 16 dígitos y CVV de 3. Ejemplo: `4111 1111 1111 1111`.
- **Mastercard**: empieza con un número entre **`51` y `55`**, o entre **`22` y `27`**. También
  son 16 dígitos y CVV de 3. Ejemplo: `5555 5555 5555 4444`
- **Amex**: empieza con **`34`** o **`37`**. Aquí son 15 dígitos agrupados 4-6-5 y CVV de 4.
  Ejemplo: `3782 822463 10005`.
