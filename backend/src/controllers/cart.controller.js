const supabase = require('../config/database')

const CART_SELECT = `
  id,
  user_id,
  product_id,
  quantity,
  created_at,
  products (
    name,
    price,
    image_url,
    stock,
    is_active
  )
`

async function fetchCartData(userId) {
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select(CART_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Error al obtener el carrito')
  }

  const items = (cartItems || []).map((item) => {
    const price = Number(item.products?.price || 0)
    const quantity = item.quantity

    return {
      id: item.id,
      product_id: item.product_id,
      quantity,
      created_at: item.created_at,
      name: item.products?.name || null,
      price,
      image_url: item.products?.image_url || null,
      stock: item.products?.stock ?? 0,
      subtotal: quantity * price
    }
  })

  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    total,
    itemCount
  }
}

async function respondWithCart(res, userId, statusCode = 200) {
  const cart = await fetchCartData(userId)
  return res.status(statusCode).json({
    success: true,
    data: cart
  })
}

async function getCart(req, res) {
  try {
    return await respondWithCart(res, req.user.id)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

async function addItem(req, res) {
  try {
    const { product_id, quantity } = req.body
    const parsedQuantity = parseInt(quantity, 10)

    if (!product_id || quantity === undefined) {
      return res.status(400).json({
        error: true,
        message: 'Los campos product_id y quantity son obligatorios'
      })
    }

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        error: true,
        message: 'La cantidad debe ser un número entero mayor a 0'
      })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, is_active')
      .eq('id', product_id)
      .maybeSingle()

    if (productError || !product || !product.is_active) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado o no disponible'
      })
    }

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle()

    const newQuantity = existingItem
      ? existingItem.quantity + parsedQuantity
      : parsedQuantity

    if (product.stock < newQuantity) {
      return res.status(400).json({
        error: true,
        message: 'Stock insuficiente para la cantidad solicitada'
      })
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .eq('user_id', req.user.id)

      if (updateError) {
        return res.status(500).json({
          error: true,
          message: 'Error al actualizar el carrito'
        })
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: req.user.id,
          product_id,
          quantity: parsedQuantity
        })

      if (insertError) {
        return res.status(500).json({
          error: true,
          message: 'Error al agregar el producto al carrito'
        })
      }
    }

    return await respondWithCart(res, req.user.id, 201)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

async function removeItemById(userId, cartItemId) {
  const { data: cartItem, error: findError } = await supabase
    .from('cart_items')
    .select('id')
    .eq('id', cartItemId)
    .eq('user_id', userId)
    .maybeSingle()

  if (findError || !cartItem) {
    return { notFound: true }
  }

  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', userId)

  if (deleteError) {
    throw new Error('Error al eliminar el ítem del carrito')
  }

  return { notFound: false }
}

async function updateItem(req, res) {
  try {
    const { id } = req.params
    const { quantity } = req.body
    const parsedQuantity = parseInt(quantity, 10)

    if (quantity === undefined) {
      return res.status(400).json({
        error: true,
        message: 'El campo quantity es obligatorio'
      })
    }

    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        error: true,
        message: 'La cantidad debe ser un número entero mayor o igual a 0'
      })
    }

    if (parsedQuantity === 0) {
      const result = await removeItemById(req.user.id, id)

      if (result.notFound) {
        return res.status(404).json({
          error: true,
          message: 'Ítem del carrito no encontrado'
        })
      }

      return await respondWithCart(res, req.user.id)
    }

    const { data: cartItem, error: findError } = await supabase
      .from('cart_items')
      .select('id, product_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle()

    if (findError || !cartItem) {
      return res.status(404).json({
        error: true,
        message: 'Ítem del carrito no encontrado'
      })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock, is_active')
      .eq('id', cartItem.product_id)
      .maybeSingle()

    if (productError || !product || !product.is_active) {
      return res.status(404).json({
        error: true,
        message: 'Producto no encontrado o no disponible'
      })
    }

    if (product.stock < parsedQuantity) {
      return res.status(400).json({
        error: true,
        message: 'Stock insuficiente para la cantidad solicitada'
      })
    }

    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: parsedQuantity })
      .eq('id', id)
      .eq('user_id', req.user.id)

    if (updateError) {
      return res.status(500).json({
        error: true,
        message: 'Error al actualizar el ítem del carrito'
      })
    }

    return await respondWithCart(res, req.user.id)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

async function removeItem(req, res) {
  try {
    const { id } = req.params
    const result = await removeItemById(req.user.id, id)

    if (result.notFound) {
      return res.status(404).json({
        error: true,
        message: 'Ítem del carrito no encontrado'
      })
    }

    return await respondWithCart(res, req.user.id)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

async function clearCart(req, res) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id)

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al vaciar el carrito'
      })
    }

    return await respondWithCart(res, req.user.id)
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor'
    })
  }
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
}
