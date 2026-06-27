const supabase = require('../config/database')

const WISHLIST_SELECT = `
  id,
  product_id,
  created_at,
  products (
    id,
    name,
    description,
    price,
    stock,
    image_url,
    is_active,
    category_id,
    category:categories ( name, slug )
  )
`

async function fetchWishlistData(userId) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(WISHLIST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Error al obtener favoritos')
  }

  const items = (data || [])
    .filter((row) => row.products && row.products.is_active)
    .map((row) => ({
      id: row.id,
      product_id: row.product_id,
      created_at: row.created_at,
      product: {
        id: row.products.id,
        name: row.products.name,
        description: row.products.description,
        price: Number(row.products.price),
        stock: row.products.stock,
        image_url: row.products.image_url,
        is_active: row.products.is_active,
        category_id: row.products.category_id,
        category: row.products.category
          ? {
              name: row.products.category.name,
              slug: row.products.category.slug
            }
          : undefined
      }
    }))

  return {
    items,
    itemCount: items.length,
    productIds: items.map((item) => item.product_id)
  }
}

async function respondWithWishlist(res, userId, statusCode = 200) {
  const wishlist = await fetchWishlistData(userId)
  return res.status(statusCode).json({ success: true, data: wishlist })
}

async function getWishlist(req, res) {
  try {
    return await respondWithWishlist(res, req.user.id)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

async function addItem(req, res) {
  try {
    const { product_id } = req.body

    if (!product_id) {
      return res.status(400).json({
        error: true,
        message: 'El campo product_id es obligatorio'
      })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, is_active')
      .eq('id', product_id)
      .maybeSingle()

    if (productError || !product || !product.is_active) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado o no disponible'
      })
    }

    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle()

    if (existing) {
      return await respondWithWishlist(res, req.user.id)
    }

    const { error: insertError } = await supabase.from('wishlist_items').insert({
      user_id: req.user.id,
      product_id
    })

    if (insertError) {
      return res.status(500).json({
        error: true,
        message: 'Error al agregar a favoritos'
      })
    }

    return await respondWithWishlist(res, req.user.id, 201)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

async function removeItem(req, res) {
  try {
    const { product_id } = req.params

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al eliminar de favoritos'
      })
    }

    return await respondWithWishlist(res, req.user.id)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

async function toggleItem(req, res) {
  try {
    const { product_id } = req.params

    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', req.user.id)
        .eq('product_id', product_id)
    } else {
      const { data: product } = await supabase
        .from('products')
        .select('id, is_active')
        .eq('id', product_id)
        .maybeSingle()

      if (!product || !product.is_active) {
        return res.status(404).json({
          error: true,
          message: 'Producto no encontrado'
        })
      }

      await supabase.from('wishlist_items').insert({
        user_id: req.user.id,
        product_id
      })
    }

    return await respondWithWishlist(res, req.user.id)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

module.exports = {
  getWishlist,
  addItem,
  removeItem,
  toggleItem
}
