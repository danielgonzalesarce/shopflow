require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const supabase = require('../src/config/database')

const imageUrl = (seed) => `https://picsum.photos/seed/shopflow-${seed}/800/600`

const productImages = (seed) => [
  imageUrl(seed),
  imageUrl(`${seed}-2`),
  imageUrl(`${seed}-3`)
]

const catalog = [
  {
    name: 'Audífonos Bluetooth TWS',
    description:
      'Audífonos inalámbricos con cancelación activa de ruido, estuche de carga rápida y 30 h de autonomía.',
    price: 89.9,
    stock: 50,
    category: 'electronica',
    seed: 'headphones'
  },
  {
    name: 'Mouse inalámbrico ergonómico',
    description:
      'Mouse óptico 2.4 GHz con diseño ergonómico, 6 botones programables y sensor de alta precisión.',
    price: 45.5,
    stock: 120,
    category: 'electronica',
    seed: 'mouse'
  },
  {
    name: 'Teclado mecánico RGB',
    description:
      'Switchs mecánicos red, retroiluminación RGB personalizable y reposamuñecas magnético incluido.',
    price: 189.0,
    stock: 35,
    category: 'electronica',
    seed: 'keyboard'
  },
  {
    name: 'Monitor 24" Full HD',
    description:
      'Panel IPS 75 Hz, borde ultrafino y puertos HDMI + DisplayPort para trabajo y gaming casual.',
    price: 549.0,
    stock: 22,
    category: 'electronica',
    seed: 'monitor'
  },
  {
    name: 'Webcam 1080p Pro',
    description:
      'Cámara web Full HD con micrófono dual, enfoque automático y cubierta de privacidad integrada.',
    price: 129.9,
    stock: 40,
    category: 'electronica',
    seed: 'webcam'
  },
  {
    name: 'Tablet 10" WiFi',
    description:
      'Pantalla IPS 10 pulgadas, 64 GB de almacenamiento y batería de larga duración para estudio o entretenimiento.',
    price: 699.0,
    stock: 18,
    category: 'electronica',
    seed: 'tablet'
  },
  {
    name: 'Smartwatch deportivo',
    description:
      'Monitoreo de ritmo cardíaco, GPS integrado, resistencia al agua IP68 y más de 100 modos deportivos.',
    price: 249.0,
    stock: 30,
    category: 'electronica',
    seed: 'smartwatch'
  },
  {
    name: 'Polo de algodón premium',
    description:
      'Polo unisex 100% algodón peinado, corte moderno y acabado premium disponible en varios colores.',
    price: 39.9,
    stock: 200,
    category: 'ropa',
    seed: 'polo'
  },
  {
    name: 'Jeans clásicos fit regular',
    description:
      'Denim azul oscuro de alta densidad, corte regular, tiro medio y costuras reforzadas.',
    price: 129.0,
    stock: 80,
    category: 'ropa',
    seed: 'jeans'
  },
  {
    name: 'Chaqueta impermeable',
    description:
      'Chaqueta ligera con membrana impermeable, capucha ajustable y bolsillos con cierre.',
    price: 159.0,
    stock: 45,
    category: 'ropa',
    seed: 'jacket'
  },
  {
    name: 'Zapatillas running',
    description:
      'Amortiguación reactiva, malla transpirable y suela antideslizante ideal para entrenamiento diario.',
    price: 219.0,
    stock: 55,
    category: 'ropa',
    seed: 'sneakers'
  },
  {
    name: 'Hoodie oversize',
    description:
      'Sudadera con capucha de felpa suave, fit oversize y bolsillo canguro frontal.',
    price: 89.0,
    stock: 70,
    category: 'ropa',
    seed: 'hoodie'
  },
  {
    name: 'Vestido casual verano',
    description:
      'Vestido midi de lino ligero, ideal para clima cálido con caída fluida y corte favorecedor.',
    price: 99.0,
    stock: 38,
    category: 'ropa',
    seed: 'dress'
  },
  {
    name: 'Mochila urbana',
    description:
      'Compartimento acolchado para laptop 15", puerto USB externo y material resistente al agua.',
    price: 119.0,
    stock: 65,
    category: 'ropa',
    seed: 'backpack'
  },
  {
    name: 'Juego de sábanas queen',
    description:
      'Sábanas de microfibra ultra suave, incluye funda de almohada y sábana bajera con elástico.',
    price: 79.9,
    stock: 60,
    category: 'hogar',
    seed: 'sheets'
  },
  {
    name: 'Licuadora 1.5 L 600 W',
    description:
      'Jarra de vidrio templado, 3 velocidades, cuchillas de acero inoxidable y base antideslizante.',
    price: 159.0,
    stock: 35,
    category: 'hogar',
    seed: 'blender'
  },
  {
    name: 'Aspiradora compacta',
    description:
      'Aspiradora ciclónica 2 en 1, filtro HEPA lavable y accesorios para pisos y tapicería.',
    price: 299.0,
    stock: 28,
    category: 'hogar',
    seed: 'vacuum'
  },
  {
    name: 'Set ollas antiadherentes',
    description:
      'Juego de 5 piezas con recubrimiento cerámico, aptas para inducción y mangos ergonómicos.',
    price: 249.0,
    stock: 32,
    category: 'hogar',
    seed: 'cookware'
  },
  {
    name: 'Lámpara LED escritorio',
    description:
      'Luz regulable en intensidad y temperatura, puerto USB de carga y brazo articulado.',
    price: 69.9,
    stock: 90,
    category: 'hogar',
    seed: 'lamp'
  },
  {
    name: 'Cafetera espresso',
    description:
      'Presión 15 bares, espumador de leche integrado y tanque de agua removible de 1.2 L.',
    price: 389.0,
    stock: 20,
    category: 'hogar',
    seed: 'coffee'
  }
]

async function main() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug')

  if (catError) throw new Error(catError.message)

  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]))

  const { data: existing, error: existingError } = await supabase
    .from('products')
    .select('id, name')

  if (existingError) throw new Error(existingError.message)

  const existingByName = new Map(existing.map((p) => [p.name, p.id]))

  let inserted = 0
  let updated = 0

  for (const item of catalog) {
    const categoryId = categoryBySlug[item.category]
    if (!categoryId) {
      throw new Error(`Categoría no encontrada: ${item.category}`)
    }

    const payload = {
      name: item.name,
      description: item.description,
      price: item.price,
      stock: item.stock,
      category_id: categoryId,
      image_url: imageUrl(item.seed),
      images: productImages(item.seed),
      is_active: true
    }

    const existingId = existingByName.get(item.name)

    if (existingId) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', existingId)

      if (error) throw new Error(`Update ${item.name}: ${error.message}`)
      updated++
    } else {
      const { error } = await supabase.from('products').insert(payload)

      if (error) throw new Error(`Insert ${item.name}: ${error.message}`)
      inserted++
    }
  }

  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (countError) throw new Error(countError.message)

  console.log(`Seed completado: ${updated} actualizados, ${inserted} nuevos. Total activos: ${count}`)
}

main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
