# ShopFlow

ShopFlow es una plataforma de comercio electrónico full stack orientada al mercado peruano. Permite explorar un catálogo con imágenes múltiples, gestionar carrito y favoritos (como invitado o autenticado), checkout seguro y panel de administración. Incluye login con **Google**, **GitHub** o email/contraseña, y una interfaz **dark mode gaming** (rojo neón + cian).

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| **Estado cliente** | Zustand (auth, carrito, favoritos, UI) |
| **HTTP** | Axios con interceptores JWT |
| **Backend** | Node.js + Express 5 |
| **Base de datos** | PostgreSQL (Supabase) |
| **Storage** | Supabase Storage + imágenes externas (picsum) |
| **Auth** | JWT + bcrypt + OAuth (Google, GitHub) |
| **Seguridad** | Helmet, CORS, rate-limit en `/api/auth`, express-validator |

## Estructura del monorepo

```
shopflow/
├── backend/                 # API REST Express
│   ├── scripts/             # Seeds y migraciones
│   └── src/
│       ├── config/          # Schema SQL, migraciones
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/        # OAuth
│       └── utils/
├── frontend/                # Next.js App Router
│   └── src/
│       ├── app/             # Páginas (home, productos, auth, admin…)
│       ├── components/
│       ├── lib/
│       └── store/
└── package.json             # Scripts globales
```

## Instalación local

### Requisitos

- Node.js 18+
- npm
- Proyecto en [Supabase](https://supabase.com)

### 1. Clonar e instalar

```bash
git clone <url-del-repositorio> shopflow
cd shopflow
npm run install:all
```

### 2. Configurar Supabase

1. En el **SQL Editor**, ejecuta `backend/src/config/schema.sql`.
2. Ejecuta las migraciones adicionales (en orden):
   - `backend/src/config/wishlist.sql` — favoritos
   - `backend/src/config/product-images.sql` — columna `images[]`
   - `backend/src/config/oauth-migration.sql` — OAuth (Google/GitHub)
3. Crea el bucket **`product-images`** en Storage (público), si subes imágenes propias.

**Migraciones por script** (requieren `DATABASE_URL` en `.env` — connection string de Supabase):

```bash
cd backend
npm run migrate:wishlist
npm run migrate:product-images
npm run migrate:oauth
```

### 3. Variables de entorno

**Backend** — `backend/.env` (plantilla: `backend/.env.example`):

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del API (default `4000`) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Secret key del backend |
| `JWT_SECRET` | Secreto para firmar JWT |
| `FRONTEND_URL` | Origen CORS (`http://localhost:3000`) |
| `BACKEND_URL` | URL pública del API (`http://localhost:4000`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth GitHub |
| `DATABASE_URL` | Connection string (solo migraciones locales) |

**Frontend** — `frontend/.env.local`:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` |

### 4. Datos de prueba (seeds)

```bash
cd backend
npm run seed:products        # 20 productos con 3 imágenes cada uno
npm run seed:super-admin     # Super administrador
```

### 5. Ejecutar en desarrollo

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:4000 |
| Health | http://localhost:4000/api/health |
| OAuth status | http://localhost:4000/api/auth/oauth/status |

### Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super admin | `superadmin@shopflow.com` | `SuperAdmin2026!` |
| Admin (schema.sql) | `admin@shopflow.com` | `admin123` |

---

## OAuth — Google y GitHub

### Callbacks (desarrollo local)

| Proveedor | Redirect URI |
|-----------|----------------|
| Google | `http://localhost:4000/api/auth/google/callback` |
| GitHub | `http://localhost:4000/api/auth/github/callback` |

### Configuración Google Cloud

1. [Google Cloud Console](https://console.cloud.google.com) → Credentials → OAuth 2.0 Client ID (Web).
2. **Authorized redirect URIs:** la URL de callback de arriba.
3. Copia Client ID y Client Secret a `backend/.env`.

### Configuración GitHub

1. [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps → New.
2. **Homepage URL:** `http://localhost:3000`
3. **Authorization callback URL:** `http://localhost:4000/api/auth/github/callback`
4. Genera **Client secret** y agrégalo a `backend/.env`.

### Flujo

1. Usuario pulsa «Continuar con Google/GitHub» en `/auth/login` o `/auth/register`.
2. El backend redirige al proveedor y procesa el callback.
3. Se crea o vincula el usuario en la tabla `users` (`oauth_provider`, `oauth_id`).
4. Redirección a `/auth/callback?token=...` → sesión JWT + fusión de carrito/favoritos de invitado.

Verifica configuración: `GET /api/auth/oauth/status` → `{ "google": true, "github": true }`.

---

## API REST — Endpoints

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/oauth/status` | No | Estado OAuth (Google/GitHub configurados) |
| GET | `/google` | No | Iniciar login con Google |
| GET | `/google/callback` | No | Callback Google |
| GET | `/github` | No | Iniciar login con GitHub |
| GET | `/github/callback` | No | Callback GitHub |
| POST | `/register` | No | Registro email/contraseña |
| POST | `/login` | No | Login email/contraseña |
| GET | `/me` | Sí | Usuario autenticado |

> Rate limit: **10 peticiones/minuto** por IP en `/api/auth/*`.

### Productos (`/api/products`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | No | Listado paginado |
| GET | `/categories` | No | Categorías |
| GET | `/admin/all` | Admin | Todos los productos |
| GET | `/:id` | No | Detalle |
| POST | `/` | Admin | Crear (multipart) |
| PUT | `/:id` | Admin | Actualizar |
| DELETE | `/:id` | Admin | Soft delete |

### Carrito (`/api/cart`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Ver carrito |
| POST | `/` | Sí | Agregar ítem |
| PUT | `/:id` | Sí | Actualizar cantidad |
| DELETE | `/:id` | Sí | Eliminar ítem |
| DELETE | `/` | Sí | Vaciar carrito |

### Favoritos (`/api/favorites`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Listar favoritos |
| POST | `/` | Sí | Agregar favorito |
| POST | `/toggle/:productId` | Sí | Alternar favorito |
| DELETE | `/:productId` | Sí | Quitar favorito |

> Como **invitado**, favoritos y carrito se guardan en `localStorage` y se fusionan al iniciar sesión.

### Órdenes (`/api/orders`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Mis órdenes |
| GET | `/admin/all` | Admin | Todas las órdenes |
| GET | `/:id` | Sí | Detalle |
| POST | `/` | Sí | Crear orden |
| PUT | `/:id/status` | Admin | Actualizar estado |

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del API |
| GET | `/api/health/db` | Conexión Supabase |

---

## Funcionalidades del frontend

- **Home:** hero gaming, categorías, productos destacados, FAQ, testimonios, newsletter.
- **Catálogo:** filtros, búsqueda, paginación, tarjetas con carrusel de imágenes.
- **Detalle producto:** galería, pestañas (descripción, envío, especificaciones), relacionados.
- **Carrito:** drawer lateral + página completa con barra de envío gratis.
- **Favoritos:** lista, agregar todo al carrito, vaciar lista.
- **Auth:** login/registro con Google, GitHub o email; panel admin aislado del layout tienda.
- **Admin:** CRUD productos, pedidos, dashboard.

---

## Scripts útiles

```bash
# Raíz
npm run dev:backend
npm run dev:frontend
npm run install:all

# Backend
cd backend && npm run dev
cd backend && npm start
cd backend && npm run seed:products
cd backend && npm run seed:super-admin
cd backend && npm run migrate:oauth
cd backend && npm run migrate:product-images
cd backend && npm run migrate:wishlist

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
```

---

## Despliegue (Render + Vercel)

Repositorio: [github.com/danielgonzalesarce/shopflow](https://github.com/danielgonzalesarce/shopflow)

| Servicio | Plataforma | URL ejemplo |
|----------|------------|-------------|
| Frontend | [Vercel](https://vercel.com) | `https://shopflow.vercel.app` |
| Backend | [Render](https://render.com) | `https://shopflow-api.onrender.com` |
| BD + Storage | [Supabase](https://supabase.com) | Proyecto existente |

> **Importante:** Vercel solo aloja el frontend (Next.js). El backend Express va en **Render** (plan free). Sin el backend en Render, la tienda en Vercel no puede cargar productos ni autenticar usuarios.

### Paso 1 — Backend en Render

1. Entra a [render.com](https://render.com) → **New** → **Blueprint**.
2. Conecta el repo `danielgonzalesarce/shopflow` (usa el `render.yaml` del proyecto).
3. En **Environment**, completa las variables (plantilla: `backend/.env.production.example`):

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `SUPABASE_URL` | Tu URL de Supabase |
| `SUPABASE_SERVICE_KEY` | Secret key de Supabase |
| `JWT_SECRET` | Secreto largo y aleatorio |
| `FRONTEND_URL` | URL de Vercel (la obtienes en el paso 2) |
| `BACKEND_URL` | `https://shopflow-api.onrender.com` (tu URL de Render) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth GitHub |

4. Espera el deploy y verifica: `https://TU-API.onrender.com/api/health` → `{ "status": "ok" }`.

**Alternativa manual:** New → Web Service → Root Directory `backend` → Build `npm install` → Start `npm start`.

### Paso 2 — Frontend en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) → Importa el repo de GitHub.
2. Configura el proyecto:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (default) |

3. En **Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://TU-API.onrender.com/api` |

4. Deploy. Copia la URL que te da Vercel (ej. `https://shopflow.vercel.app`).

5. Vuelve a **Render** y actualiza `FRONTEND_URL` con la URL exacta de Vercel (sin `/` al final). Redeploy el backend.

### Paso 3 — OAuth en producción

Agrega estos callbacks **además** de los de localhost:

| Proveedor | Redirect URI producción |
|-----------|-------------------------|
| Google | `https://TU-API.onrender.com/api/auth/google/callback` |
| GitHub | `https://TU-API.onrender.com/api/auth/github/callback` |

En GitHub OAuth App, actualiza también **Homepage URL** a tu URL de Vercel.

### Paso 4 — Supabase

Ejecuta en SQL Editor (si no lo hiciste antes):

- `backend/src/config/schema.sql`
- `backend/src/config/wishlist.sql`
- `backend/src/config/product-images.sql`
- `backend/src/config/oauth-migration.sql`

Bucket **`product-images`** público en Storage.

### Verificación final

| Prueba | URL / acción |
|--------|----------------|
| Health API | `GET https://TU-API.onrender.com/api/health` |
| OAuth | `GET https://TU-API.onrender.com/api/auth/oauth/status` → `dbReady: true` |
| Tienda | Abrir URL Vercel → catálogo carga |
| Login | Google, GitHub o email |
| Admin | `superadmin@shopflow.com` → `/admin` |

### Notas

- **No subas** `.env` con secretos a GitHub.
- Render Free tiene **cold start** (~30–60 s la primera petición).
- `FRONTEND_URL` en Render debe coincidir **exactamente** con la URL de Vercel (https, sin barra final).
- Desarrollo local sigue igual: `localhost:3000` + `localhost:4000` (CORS permite localhost en dev).
- Imágenes: Supabase y `picsum.photos` en `frontend/next.config.ts`.

---

## Licencia

Proyecto académico / demostración — ShopFlow © 2026.
