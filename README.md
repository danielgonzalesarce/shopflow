# ShopFlow

ShopFlow es una plataforma de comercio electrónico full stack orientada al mercado peruano. Permite a los clientes explorar un catálogo de productos, gestionar un carrito persistente, realizar checkout y consultar el historial de pedidos. Los administradores disponen de un panel para gestionar productos, inventario y estados de órdenes.

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS | SSR/SSG para SEO, tipado estático, UI rápida de desarrollar y mantener |
| **Estado cliente** | Zustand | Store ligero para auth y carrito sin boilerplate |
| **HTTP cliente** | Axios | Interceptores para JWT y manejo centralizado de errores 401 |
| **Backend** | Node.js + Express 5 | API REST clara, middlewares modulares, ecosistema maduro |
| **Base de datos** | PostgreSQL (Supabase) | SQL relacional, RLS, hosting gestionado y cliente JS oficial |
| **Storage** | Supabase Storage | Imágenes de productos con URLs públicas |
| **Auth** | JWT + bcrypt | Tokens stateless en el backend; contraseñas hasheadas en BD |
| **Seguridad** | Helmet, express-rate-limit, express-validator | Cabeceras seguras, rate limiting en auth y validación de entrada |

## Estructura del monorepo

```
shopflow/
├── backend/          # API REST Express
│   └── src/
│       ├── config/   # Supabase, schema SQL
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── utils/
├── frontend/         # Next.js App Router
│   └── src/
│       ├── app/      # Páginas y rutas
│       ├── components/
│       ├── lib/
│       └── store/
└── package.json      # Scripts globales del monorepo
```

## Instalación local

### Requisitos previos

- Node.js 18+
- npm
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio> shopflow
cd shopflow
npm run install:all
```

O manualmente:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configurar Supabase

1. En el **SQL Editor** de Supabase, ejecuta el contenido de `backend/src/config/schema.sql`.
2. Crea el bucket **`product-images`** en Storage (público).
3. Copia **Project URL** y **Secret key** desde Settings → API Keys.

### 3. Variables de entorno

**Backend** — crea `backend/.env` (usa `backend/.env.example` como plantilla):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `4000` |
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Secret key (backend) | `sb_secret_...` |
| `JWT_SECRET` | Secreto para firmar JWT | cadena segura |
| `FRONTEND_URL` | Origen CORS del frontend | `http://localhost:3000` |
| `NODE_ENV` | Entorno (`development` / `production`) | `development` |

**Frontend** — crea `frontend/.env.local`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL base de la API | `http://localhost:4000/api` |

### 4. Ejecutar en desarrollo

Terminal 1 — Backend:

```bash
cd backend
npm run dev
```

Terminal 2 — Frontend:

```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:4000  
- Health check: http://localhost:4000/api/health  

### Credenciales de prueba (admin)

Tras ejecutar `schema.sql`:

- **Email:** `admin@shopflow.com`
- **Password:** `admin123`

## API REST — Endpoints

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | No | Registro de cliente |
| POST | `/login` | No | Inicio de sesión |
| GET | `/me` | Sí | Usuario autenticado |

> Rate limit: **10 peticiones/minuto** por IP en `/api/auth/*`.

### Productos (`/api/products`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | No | Listado paginado (activos) |
| GET | `/categories` | No | Categorías |
| GET | `/admin/all` | Admin | Todos los productos |
| GET | `/:id` | No | Detalle de producto |
| POST | `/` | Admin | Crear producto (multipart) |
| PUT | `/:id` | Admin | Actualizar producto |
| DELETE | `/:id` | Admin | Soft delete |

### Carrito (`/api/cart`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Ver carrito |
| POST | `/` | Sí | Agregar ítem |
| PUT | `/:id` | Sí | Actualizar cantidad |
| DELETE | `/:id` | Sí | Eliminar ítem |
| DELETE | `/` | Sí | Vaciar carrito |

### Órdenes (`/api/orders`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Mis órdenes |
| GET | `/admin/all` | Admin | Todas las órdenes |
| GET | `/:id` | Sí | Detalle de orden |
| POST | `/` | Sí | Crear orden desde carrito |
| PUT | `/:id/status` | Admin | Actualizar estado |

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del API |
| GET | `/api/health/db` | Conexión Supabase |

### Formato de respuestas

**Éxito:** `{ "success": true, "data": { ... } }`  
**Error:** `{ "error": true, "message": "..." }`  
**Validación (400):** incluye array `errors` con `{ field, message }`.

## Arquitectura de comunicación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Navegador)                            │
│  Next.js App Router  │  Zustand (auth, cart)  │  Axios + JWT header    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP REST (JSON / multipart)
                                │ NEXT_PUBLIC_API_URL → localhost:4000/api
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express 5)                                 │
│  helmet │ cors │ rate-limit(/auth) │ express.json │ routes │ errorHandler│
├─────────────────────────────────────────────────────────────────────────┤
│  /api/auth      → JWT login/register                                     │
│  /api/products  → CRUD + Supabase Storage (imágenes)                     │
│  /api/cart      → cart_items (usuario autenticado)                       │
│  /api/orders    → orders + order_items + descuento stock                 │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ @supabase/supabase-js (service key)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                         │
│  PostgreSQL          │  Storage (product-images)  │  Auth (opcional)    │
│  users, products,    │  Imágenes públicas         │                     │
│  categories, cart,   │                            │                     │
│  orders, order_items │                            │                     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Scripts útiles

```bash
# Raíz del monorepo
npm run dev:backend
npm run dev:frontend
npm run install:all

# Backend
cd backend && npm run dev
cd backend && npm start

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
```

## Despliegue a producción (Render + Vercel)

Repositorio: [github.com/danielgonzalesarce/shopflow](https://github.com/danielgonzalesarce/shopflow)

### Arquitectura en producción

| Servicio | Plataforma | URL de ejemplo |
|----------|------------|----------------|
| Frontend Next.js | [Vercel](https://vercel.com) | `https://shopflow.vercel.app` |
| Backend Express | [Render](https://render.com) | `https://shopflow-api.onrender.com` |
| Base de datos + Storage | [Supabase](https://supabase.com) | Proyecto existente |

---

### Paso 1 — Preparar Supabase (producción)

1. Ejecuta `backend/src/config/schema.sql` en el **SQL Editor** de Supabase (si aún no lo hiciste).
2. Crea el bucket **`product-images`** (público) en Storage.
3. En **Settings → API Keys**, copia:
   - **Project URL** → `SUPABASE_URL`
   - **Secret key** → `SUPABASE_SERVICE_KEY`
4. Genera un `JWT_SECRET` seguro (mínimo 32 caracteres aleatorios).

---

### Paso 2 — Desplegar Backend en Render

1. Entra a [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Conecta tu cuenta de GitHub y selecciona el repositorio **`danielgonzalesarce/shopflow`**.
3. Configura el servicio:

| Campo | Valor |
|-------|-------|
| **Name** | `shopflow-api` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Instance Type** | Free (o plan de pago) |

4. En **Environment Variables**, agrega (usa `backend/.env.production.example` como guía):

| Variable | Valor |
|----------|-------|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Tu secret key de Supabase |
| `JWT_SECRET` | Secreto JWT seguro |
| `FRONTEND_URL` | `https://shopflow.vercel.app` (URL final de Vercel) |

5. Pulsa **Create Web Service** y espera el despliegue.
6. Verifica: `https://shopflow-api.onrender.com/api/health` debe responder `{ "status": "ok", ... }`.

> Render asigna `PORT` automáticamente; puedes omitir `PORT=10000` o dejarlo como referencia. El `Procfile` y el script `start` ya están configurados.

---

### Paso 3 — Desplegar Frontend en Vercel

1. Entra a [Vercel Dashboard](https://vercel.com/dashboard) → **Add New…** → **Project**.
2. Importa el repositorio **`danielgonzalesarce/shopflow`** desde GitHub.
3. Configura el proyecto:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (por defecto) |
| **Output Directory** | `.next` (por defecto) |

4. En **Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://shopflow-api.onrender.com/api` |

5. Pulsa **Deploy** y espera a que finalice el build.
6. Copia la URL de producción (ej. `https://shopflow.vercel.app`).

---

### Paso 4 — Enlazar Frontend y Backend

1. Vuelve a **Render** → tu servicio `shopflow-api` → **Environment**.
2. Actualiza `FRONTEND_URL` con la URL real de Vercel (ej. `https://shopflow.vercel.app`).
3. Guarda y espera el redeploy automático.
4. En **Vercel**, confirma que `NEXT_PUBLIC_API_URL` apunta al backend en Render.

---

### Paso 5 — Verificación final

| Prueba | URL / Acción |
|--------|----------------|
| Health API | `GET https://shopflow-api.onrender.com/api/health` |
| Home | Abrir URL de Vercel |
| Login admin | `admin@shopflow.com` / `admin123` |
| Catálogo | `/productos` carga productos desde la API |
| Admin | `/admin` (solo rol admin) |

---

### Notas importantes

- **Nunca** subas `.env` con secretos reales a GitHub. Usa solo los archivos `.env.example` y `.env.production.example`.
- El plan Free de Render **apaga el servicio por inactividad**; la primera petición puede tardar ~30–60 s (cold start).
- CORS en producción acepta **únicamente** el origen definido en `FRONTEND_URL`.
- Las imágenes de Supabase se sirven vía `next/image` con el patrón `*.supabase.co` configurado en `next.config.ts`.

## Licencia

Proyecto académico / demostración — ShopFlow © 2026.
