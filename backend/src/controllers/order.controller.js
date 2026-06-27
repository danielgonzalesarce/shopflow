const supabase = require('../config/database')

const VALID_STATUSES = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']

const ORDER_DETAIL_SELECT = `
  id,
  user_id,
  total,
  status,
  shipping_address,
  created_at,
  updated_at,
  order_items (
    id,
    product_id,
    quantity,
    unit_price,
    created_at,
    products (
      name,
      image_url
    )
  )
`

const ORDER_ADMIN_SELECT = `
  id,
  user_id,
  total,
  status,
  shipping_address,
  created_at,
  updated_at,
  users (
    full_name,
    email
  ),
  order_items (
    id,
    product_id,
    quantity,
    unit_price,
    created_at,
    products (
      name,
      image_url
    )
  )
`

async function fetchUserCartForOrder(userId) {
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      products (
        name,
        price,
        stock,
        is_active
      )
    `)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Error al obtener el carrito')
  }

  return (cartItems || []).map((item) => ({
    cart_item_id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    name: item.products?.name || null,
    price: Number(item.products?.price || 0),
    stock: item.products?.stock ?? 0,
    is_active: item.products?.is_active ?? false
  }))
}

function formatOrderItem(item) {
  const unitPrice = Number(item.unit_price)

  return {
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: unitPrice,
    subtotal: item.quantity * unitPrice,
    created_at: item.created_at,
    product: item.products
      ? {
          name: item.products.name,
          image_url: item.products.image_url
        }
      : null
  }
}

function formatOrder(order, includeUser = false) {
  const { order_items, users, ...rest } = order

  const formatted = {
    ...rest,
    total: Number(rest.total),
    items: (order_items || []).map(formatOrderItem)
  }

  if (includeUser && users) {
    formatted.customer = {
      full_name: users.full_name,
      email: users.email
    }
  }

  return formatted
}

async function fetchOrderDetail(orderId, includeUser = false) {
  const { data: order, error } = await supabase
    .from('orders')
    .select(includeUser ? ORDER_ADMIN_SELECT : ORDER_DETAIL_SELECT)
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) {
    return null
  }

  return formatOrder(order, includeUser)
}

async function rollbackOrder(orderId) {
  if (!orderId) return

  await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
}

async function restoreStock(stockUpdates) {
  for (const update of stockUpdates) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', update.product_id)
      .maybeSingle()

    if (product) {
      await supabase
        .from('products')
        .update({ stock: product.stock + update.quantity })
        .eq('id', update.product_id)
    }
  }
}

async function createOrder(req, res) {
  let orderId = null
  const stockUpdates = []

  try {
    const { shipping_address } = req.body

    if (!shipping_address?.trim()) {
      return res.status(400).json({
        error: true,
        message: 'El campo shipping_address es obligatorio'
      })
    }

    const cartItems = await fetchUserCartForOrder(req.user.id)

    if (cartItems.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'El carrito está vacío'
      })
    }

    for (const item of cartItems) {
      if (!item.is_active) {
        return res.status(400).json({
          error: true,
          message: `El producto "${item.name}" ya no está disponible`
        })
      }

      if (item.stock < item.quantity) {
        return res.status(400).json({
          error: true,
          message: `Stock insuficiente para "${item.name}"`
        })
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        total,
        status: 'pendiente',
        shipping_address: shipping_address.trim()
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return res.status(500).json({
        error: true,
        message: 'Error al crear la orden'
      })
    }

    orderId = order.id

    const orderItemsPayload = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)

    if (itemsError) {
      await rollbackOrder(orderId)
      return res.status(500).json({
        error: true,
        message: 'Error al registrar los ítems de la orden. Operación revertida.'
      })
    }

    for (const item of cartItems) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        await rollbackOrder(orderId)
        await restoreStock(stockUpdates)
        return res.status(500).json({
          error: true,
          message: 'Error al validar el stock del producto. Operación revertida.'
        })
      }

      const newStock = product.stock - item.quantity

      if (newStock < 0) {
        await rollbackOrder(orderId)
        await restoreStock(stockUpdates)
        return res.status(400).json({
          error: true,
          message: `Stock insuficiente para "${item.name}". Operación revertida.`
        })
      }

      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', item.product_id)

      if (stockError) {
        await rollbackOrder(orderId)
        await restoreStock(stockUpdates)
        return res.status(500).json({
          error: true,
          message: 'Error al actualizar el stock. Operación revertida.'
        })
      }

      stockUpdates.push({
        product_id: item.product_id,
        quantity: item.quantity
      })
    }

    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id)

    if (clearCartError) {
      await rollbackOrder(orderId)
      await restoreStock(stockUpdates)
      return res.status(500).json({
        error: true,
        message: 'Error al vaciar el carrito. Stock y orden revertidos.'
      })
    }

    const orderDetail = await fetchOrderDetail(orderId)

    return res.status(201).json({
      success: true,
      data: orderDetail
    })
  } catch (error) {
    if (orderId) {
      await rollbackOrder(orderId)
      await restoreStock(stockUpdates)
    }

    return res.status(500).json({
      error: true,
      message: error.message || 'Error interno del servidor. Operación revertida.'
    })
  }
}

async function getMyOrders(req, res) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(ORDER_DETAIL_SELECT)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al obtener las órdenes'
      })
    }

    return res.status(200).json({
      success: true,
      data: (orders || []).map((order) => formatOrder(order))
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params

    const { data: order, error } = await supabase
      .from('orders')
      .select(ORDER_DETAIL_SELECT)
      .eq('id', id)
      .maybeSingle()

    if (error || !order) {
      return res.status(404).json({
        error: true,
        message: 'Orden no encontrada'
      })
    }

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(404).json({
        error: true,
        message: 'Orden no encontrada'
      })
    }

    return res.status(200).json({
      success: true,
      data: formatOrder(order)
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function getAllOrders(req, res) {
  try {
    const { status } = req.query

    let query = supabase
      .from('orders')
      .select(ORDER_ADMIN_SELECT)
      .order('created_at', { ascending: false })

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: true,
          message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`
        })
      }
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al obtener las órdenes'
      })
    }

    return res.status(200).json({
      success: true,
      data: (orders || []).map((order) => formatOrder(order, true))
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        error: true,
        message: 'El campo status es obligatorio'
      })
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: true,
        message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`
      })
    }

    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (findError || !existingOrder) {
      return res.status(404).json({
        error: true,
        message: 'Orden no encontrada'
      })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(ORDER_ADMIN_SELECT)
      .single()

    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error al actualizar el estado de la orden'
      })
    }

    return res.status(200).json({
      success: true,
      data: formatOrder(order, true)
    })
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Error interno del servidor'
    })
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
}
