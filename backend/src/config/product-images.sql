-- Añade galería de imágenes por producto (hasta 3 URLs)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Rellena productos existentes con 3 imágenes (conserva la principal si ya existe)
UPDATE products
SET images = ARRAY[
  COALESCE(
    image_url,
    'https://picsum.photos/seed/shopflow-' || LEFT(REPLACE(id::text, '-', ''), 12) || '-1/800/600'
  ),
  'https://picsum.photos/seed/shopflow-' || LEFT(REPLACE(id::text, '-', ''), 12) || '-2/800/600',
  'https://picsum.photos/seed/shopflow-' || LEFT(REPLACE(id::text, '-', ''), 12) || '-3/800/600'
]
WHERE images IS NULL OR cardinality(images) < 3;

UPDATE products
SET image_url = images[1]
WHERE cardinality(images) > 0
  AND (image_url IS NULL OR image_url = '');
