const { randomUUID } = require('crypto')
const supabase = require('../config/database')

const BUCKET = 'product-images'

const PRODUCT_SELECT = `
  id,
  name,
  description,
  price,
  stock,
  image_url,
  images,
  category_id,
  is_active,
  created_at,
  updated_at,
  category:categories ( name, slug )
`

const PRODUCT_SELECT_LEGACY = `
  id,
  name,
  description,
  price,
  stock,
  image_url,
  category_id,
  is_active,
  created_at,
  updated_at,
  category:categories ( name, slug )
`

function isMissingImagesColumn(error) {
  if (!error?.message) return false
  const message = error.message.toLowerCase()
  return message.includes('images') && message.includes('column')
}

function formatProduct(product) {
  if (!product) return product

  const { category, ...rest } = product
  const rawImages = Array.isArray(rest.images)
    ? rest.images.filter(Boolean)
    : []
  const images =
    rawImages.length > 0
      ? rawImages.slice(0, 3)
      : rest.image_url
        ? [rest.image_url]
        : []

  return {
    ...rest,
    images,
    image_url: images[0] || rest.image_url || null,
    category: category
      ? { name: category.name, slug: category.slug }
      : null
  }
}

function slugifySeed(value) {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'product'
  )
}

function buildPlaceholderImages(seed) {
  const base = slugifySeed(seed)
  return [1, 2, 3].map(
    (n) => `https://picsum.photos/seed/shopflow-${base}-${n}/800/600`
  )
}

function parseImagesBody(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean).slice(0, 3)

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 3) : []
  } catch {
    return []
  }
}

async function resolveProductImages({ name, file, bodyImages, fallbackSeed }) {
  let images = parseImagesBody(bodyImages)

  if (file) {
    try {
      const uploadedUrl = await uploadProductImage(file)
      images = images.length > 0 ? [uploadedUrl, ...images.slice(1)] : [uploadedUrl]
    } catch (uploadError) {
      console.warn('[product images] upload failed:', uploadError.message)
    }
  }

  images = images.filter(Boolean).slice(0, 3)

  if (images.length === 0) {
    return buildPlaceholderImages(fallbackSeed || name)
  }

  if (images.length < 3) {
    const placeholders = buildPlaceholderImages(fallbackSeed || name)
    while (images.length < 3) {
      images.push(placeholders[images.length])
    }
  }

  return images
}

async function uploadProductImage(file) {
  const filePath = `products/${randomUUID()}-${file.originalname}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

async function getAll(req, res) {
  try {
    const categorySlug = req.query.category
    const search = req.query.search?.trim()
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.max(parseInt(req.query.limit, 10) || 12, 1)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (categorySlug) {
      const { data: categoryRow } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle()

      if (!categoryRow) {
        return res.status(200).json({
          success: true,
          data: {
            products: [],
            total: 0,
            page,
            totalPages: 0
          }
        })
      }

      query = query.eq('category_id', categoryRow.id)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: products, error, count } = await query.range(from, to)

    if (error) {
      if (isMissingImagesColumn(error)) {
        let legacyQuery = supabase
          .from('products')
          .select(PRODUCT_SELECT_LEGACY, { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (categorySlug) {
          const { data: categoryRow } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .maybeSingle()

          if (categoryRow) {
            legacyQuery = legacyQuery.eq('category_id', categoryRow.id)
          }
        }

        if (search) {
          legacyQuery = legacyQuery.or(
            `name.ilike.%${search}%,description.ilike.%${search}%`
          )
        }

        const legacyResult = await legacyQuery.range(from, to)

        if (legacyResult.error) {
          console.error('[getAll]', legacyResult.error)
          return res.status(500).json({
            error: true,
            message: 'Error al obtener los productos'
          })
        }

        const total = legacyResult.count || 0
        const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

        return res.status(200).json({
          success: true,
          data: {
            products: (legacyResult.data || []).map(formatProduct),
            total,
            page,
            totalPages
          }
        })
      }

      console.error('[getAll]', error)
      return res.status(500).json({
        error: true,
        message: 'Error al obtener los productos'
      })
    }

    const total = count || 0
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

    return res.status(200).json({
      success: true,
      data: {
        products: (products || []).map(formatProduct),
        total,
        page,
        totalPages
      }
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params

    const { data: product, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error || !product || !product.is_active) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado'
      })
    }

    return res.status(200).json({
      success: true,
      data: formatProduct(product)
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function create(req, res) {
  try {
    const { name, price, stock, category_id, description } = req.body

    if (!name || price === undefined || stock === undefined || !category_id) {
      return res.status(400).json({
        error: true,
        message: 'Los campos name, price, stock y category_id son obligatorios'
      })
    }

    const parsedPrice = Number(price)
    const parsedStock = parseInt(stock, 10)

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        error: true,
        message: 'El precio debe ser un número válido mayor o igual a 0'
      })
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        error: true,
        message: 'El stock debe ser un número entero mayor o igual a 0'
      })
    }

    const { data: categoryRow } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .maybeSingle()

    if (!categoryRow) {
      return res.status(400).json({
        error: true,
        message: 'La categoría especificada no existe'
      })
    }

    const images = await resolveProductImages({
      name: name.trim(),
      file: req.file,
      bodyImages: req.body.images,
      fallbackSeed: name.trim()
    })
    const image_url = images[0]

    const insertPayload = {
      name: name.trim(),
      description: description?.trim() || null,
      price: parsedPrice,
      stock: parsedStock,
      category_id,
      image_url,
      images
    }

    let { data: product, error } = await supabase
      .from('products')
      .insert(insertPayload)
      .select(PRODUCT_SELECT)
      .single()

    if (error && isMissingImagesColumn(error)) {
      const { images: _images, ...legacyPayload } = insertPayload
      const legacyResult = await supabase
        .from('products')
        .insert(legacyPayload)
        .select(PRODUCT_SELECT_LEGACY)
        .single()

      product = legacyResult.data
      error = legacyResult.error
    }

    if (error) {
      console.error('[create product]', error)
      return res.status(500).json({
        error: true,
        message: `Error al crear el producto: ${error.message || 'intenta de nuevo'}`
      })
    }

    return res.status(201).json({
      success: true,
      data: formatProduct(product)
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function update(req, res) {
  try {
    const { id } = req.params

    const { data: existingProduct, error: findError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingProduct) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado'
      })
    }

    const updates = {}
    const { name, price, stock, category_id, description } = req.body

    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description.trim() || null

    if (price !== undefined) {
      const parsedPrice = Number(price)
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          error: true,
          message: 'El precio debe ser un número válido mayor o igual a 0'
        })
      }
      updates.price = parsedPrice
    }

    if (stock !== undefined) {
      const parsedStock = parseInt(stock, 10)
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          error: true,
          message: 'El stock debe ser un número entero mayor o igual a 0'
        })
      }
      updates.stock = parsedStock
    }

    if (category_id !== undefined) {
      const { data: categoryRow } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .maybeSingle()

      if (!categoryRow) {
        return res.status(400).json({
          error: true,
          message: 'La categoría especificada no existe'
        })
      }
      updates.category_id = category_id
    }

    if (req.body.is_active !== undefined) {
      updates.is_active =
        req.body.is_active === true || req.body.is_active === 'true'
    }

    if (req.body.images !== undefined || req.file) {
      const { data: currentProduct } = await supabase
        .from('products')
        .select('name, images, image_url')
        .eq('id', id)
        .maybeSingle()

      const resolvedImages = await resolveProductImages({
        name: updates.name || currentProduct?.name || id,
        file: req.file,
        bodyImages:
          req.body.images !== undefined
            ? req.body.images
            : currentProduct?.images || currentProduct?.image_url,
        fallbackSeed: updates.name || currentProduct?.name || id
      })

      updates.images = resolvedImages
      updates.image_url = resolvedImages[0]
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No se proporcionaron campos para actualizar'
      })
    }

    updates.updated_at = new Date().toISOString()

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single()

    if (error) {
      console.error('[update product]', error)
      return res.status(500).json({
        error: true,
        message: `Error al actualizar el producto: ${error.message || 'intenta de nuevo'}`
      })
    }

    return res.status(200).json({
      success: true,
      data: formatProduct(product)
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params

    const { data: existingProduct, error: findError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingProduct) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado'
      })
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single()

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al eliminar el producto'
      })
    }

    return res.status(200).json({
      success: true,
      data: formatProduct(product)
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function getAllAdmin(req, res) {
  try {
    let { data: products, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false })

    if (error && isMissingImagesColumn(error)) {
      const legacyResult = await supabase
        .from('products')
        .select(PRODUCT_SELECT_LEGACY)
        .order('created_at', { ascending: false })

      products = legacyResult.data
      error = legacyResult.error
    }

    if (error) {
      console.error('[getAllAdmin]', error)
      return res.status(500).json({
        error: true,
        message: 'Error al obtener los productos'
      })
    }

    return res.status(200).json({
      success: true,
      data: (products || []).map(formatProduct)
    })
  } catch (error) {
    console.error('[getAllAdmin]', error)
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function getCategories(req, res) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug, created_at')
      .order('name', { ascending: true })

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al obtener las categorías'
      })
    }

    return res.status(200).json({
      success: true,
      data: categories
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  update,
  delete: deleteProduct,
  getCategories
}
