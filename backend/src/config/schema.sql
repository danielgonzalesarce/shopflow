-- =============================================================================
-- ShopFlow — Schema PostgreSQL
-- Ejecutar en Supabase: SQL Editor → New query → Pegar y Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tablas
-- -----------------------------------------------------------------------------

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  total            NUMERIC(10, 2) NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pendiente'
                   CHECK (status IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado')),
  shipping_address TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Trigger: actualizar updated_at automáticamente
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Datos de ejemplo
-- -----------------------------------------------------------------------------

INSERT INTO categories (name, slug) VALUES
  ('Electrónica', 'electronica'),
  ('Ropa',        'ropa'),
  ('Hogar',       'hogar');

INSERT INTO products (name, description, price, stock, category_id) VALUES
  (
    'Audífonos Bluetooth TWS',
    'Audífonos inalámbricos con cancelación de ruido y estuche de carga.',
    89.90,
    50,
    (SELECT id FROM categories WHERE slug = 'electronica')
  ),
  (
    'Mouse inalámbrico ergonómico',
    'Mouse óptico 2.4 GHz con diseño ergonómico para uso diario.',
    45.50,
    120,
    (SELECT id FROM categories WHERE slug = 'electronica')
  ),
  (
    'Polo de algodón premium',
    'Polo unisex 100% algodón peinado, disponible en varios colores.',
    39.90,
    200,
    (SELECT id FROM categories WHERE slug = 'ropa')
  ),
  (
    'Jeans clásicos fit regular',
    'Pantalón denim azul oscuro, corte regular y tiro medio.',
    129.00,
    80,
    (SELECT id FROM categories WHERE slug = 'ropa')
  ),
  (
    'Juego de sábanas queen',
    'Sábanas de microfibra suave, incluye funda de almohada.',
    79.90,
    60,
    (SELECT id FROM categories WHERE slug = 'hogar')
  ),
  (
    'Licuadora 1.5 L 600 W',
    'Licuadora de vidrio con 3 velocidades y cuchillas de acero inoxidable.',
    159.00,
    35,
    (SELECT id FROM categories WHERE slug = 'hogar')
  );

-- Usuario administrador inicial
-- IMPORTANTE: En producción, password_hash DEBE generarse con bcrypt en el backend
-- (ej. bcrypt.hashSync(password, 10)). Nunca almacenar contraseñas en texto plano.
-- Hash de prueba (contraseña: admin123):
INSERT INTO users (email, password_hash, full_name, role) VALUES (
  'admin@shopflow.com',
  '$2b$10$53RCpOL8X57jycEAapJpROY3ewQltZjvoG2BW3yD/cFarzQ1/ewrS',
  'Administrador',
  'admin'
);

/*
================================================================================
  DIAGRAMA ENTIDAD-RELACIÓN (E-R) — ShopFlow
================================================================================

  ┌─────────────────────────┐
  │         users           │
  ├─────────────────────────┤
  │ PK  id            UUID  │
  │     email         TEXT  │ UNIQUE
  │     password_hash TEXT  │
  │     full_name     TEXT  │
  │     role          TEXT  │  ('cliente' | 'admin')
  │     created_at    TS    │
  └───────────┬─────────────┘
              │
              │ 1
              │
              ├──────────────────────────────────────┐
              │                                      │
              │ N                                    │ N
              ▼                                      ▼
  ┌─────────────────────────┐            ┌─────────────────────────┐
  │      cart_items         │            │         orders          │
  ├─────────────────────────┤            ├─────────────────────────┤
  │ PK  id            UUID  │            │ PK  id            UUID  │
  │ FK  user_id       UUID  │──┐         │ FK  user_id       UUID  │──┐
  │ FK  product_id    UUID  │──│──┐      │     total         NUM   │  │
  │     quantity      INT   │  │  │      │     status        TEXT  │  │
  │     created_at    TS    │  │  │      │     shipping_addr TEXT  │  │
  │ UNIQUE(user_id,         │  │  │      │     created_at    TS    │  │
  │        product_id)      │  │  │      │     updated_at    TS    │  │
  └─────────────────────────┘  │  │      └───────────┬─────────────┘  │
                                 │  │                  │                │
                                 │  │                  │ 1              │
                                 │  │                  │                │
                                 │  │                  │ N              │
                                 │  │                  ▼                │
                                 │  │      ┌─────────────────────────┐  │
                                 │  │      │      order_items        │  │
                                 │  │      ├─────────────────────────┤  │
                                 │  │      │ PK  id            UUID  │  │
                                 │  │      │ FK  order_id      UUID  │──┘
                                 │  │      │ FK  product_id    UUID  │──┐
                                 │  │      │     quantity      INT   │  │
                                 │  │      │     unit_price    NUM   │  │
                                 │  │      │     created_at    TS    │  │
                                 │  │      └─────────────────────────┘  │
                                 │  │                                   │
                                 │  └───────────────────────────────────┘
                                 │
                                 │ N
                                 ▼
  ┌─────────────────────────┐      ┌─────────────────────────┐
  │       categories        │      │        products         │
  ├─────────────────────────┤      ├─────────────────────────┤
  │ PK  id            UUID  │      │ PK  id            UUID  │
  │     name          TEXT  │◄──1  │     name          TEXT  │
  │     slug          TEXT  │   N  │     description   TEXT  │
  │     created_at    TS    │      │     price         NUM   │
  └─────────────────────────┘      │     stock         INT   │
         ▲                           │     image_url     TEXT  │
         │                           │ FK  category_id   UUID  │
         └───────────────────────────│     is_active     BOOL  │
                                     │     created_at    TS    │
                                     │     updated_at    TS    │  ← trigger
                                     └─────────────────────────┘

  RELACIONES:
  ───────────
  users (1) ──────< (N) cart_items     Un usuario tiene muchos ítems en carrito
  users (1) ──────< (N) orders         Un usuario realiza muchos pedidos
  orders (1) ─────< (N) order_items    Un pedido contiene muchos ítems
  categories (1) ─< (N) products       Una categoría agrupa muchos productos
  products (1) ────< (N) cart_items    Un producto puede estar en varios carritos
  products (1) ────< (N) order_items   Un producto puede aparecer en varios pedidos

  TRIGGERS:
  ─────────
  trg_products_updated_at → BEFORE UPDATE ON products
  trg_orders_updated_at   → BEFORE UPDATE ON orders

================================================================================
*/
