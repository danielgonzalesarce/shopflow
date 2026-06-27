import { create } from 'zustand'
import api from '@/lib/axios'
import {
  clearGuestCart,
  guestCartToState,
  loadGuestCart,
  saveGuestCart,
  type GuestCartItem
} from '@/lib/guest-storage'
import type { ApiResponse, Cart, CartItem, Product } from '@/types'

interface ApiCartItem {
  id: string
  product_id: string
  quantity: number
  name: string | null
  price: number
  image_url: string | null
  stock: number
  subtotal: number
  created_at: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
  isGuest: boolean
  fetchCart: () => Promise<void>
  hydrateGuestCart: () => void
  addItem: (product: Product, quantity?: number) => Promise<void>
  updateItem: (cart_item_id: string, quantity: number) => Promise<void>
  removeItem: (cart_item_id: string) => Promise<void>
  clearCart: () => Promise<void>
  mergeGuestCartOnLogin: () => Promise<void>
  reset: () => void
}

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('token')
}

function mapApiCartItem(item: ApiCartItem): CartItem {
  const product: Product = {
    id: item.product_id,
    name: item.name || 'Producto',
    description: '',
    price: item.price,
    stock: item.stock,
    image_url: item.image_url || '',
    is_active: true
  }

  return {
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    product
  }
}

function applyCartData(set: (state: Partial<CartState>) => void, cart: Cart, isGuest: boolean) {
  set({
    items: cart.items,
    total: cart.total,
    itemCount: cart.itemCount,
    isLoading: false,
    isGuest
  })
}

function upsertGuestItem(items: GuestCartItem[], product: Product, quantity: number): GuestCartItem[] {
  const existing = items.find((i) => i.product_id === product.id)
  if (existing) {
    return items.map((i) =>
      i.product_id === product.id
        ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
        : i
    )
  }
  return [...items, { product_id: product.id, quantity, product }]
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  isGuest: false,

  hydrateGuestCart: () => {
    if (hasToken()) return
    const guest = loadGuestCart()
    applyCartData(set, guestCartToState(guest), true)
  },

  fetchCart: async () => {
    set({ isLoading: true })

    if (!hasToken()) {
      const guest = loadGuestCart()
      applyCartData(set, guestCartToState(guest), true)
      return
    }

    try {
      const { data } = await api.get<
        ApiResponse<{ items: ApiCartItem[]; total: number; itemCount: number }>
      >('/cart')

      applyCartData(
        set,
        {
          items: data.data.items.map(mapApiCartItem),
          total: data.data.total,
          itemCount: data.data.itemCount
        },
        false
      )
    } catch {
      set({ items: [], total: 0, itemCount: 0, isLoading: false, isGuest: false })
    }
  },

  addItem: async (product, quantity = 1) => {
    if (!hasToken()) {
      const guest = loadGuestCart()
      const updated = upsertGuestItem(guest, product, quantity)
      saveGuestCart(updated)
      applyCartData(set, guestCartToState(updated), true)
      return
    }

    set({ isLoading: true })
    try {
      const { data } = await api.post<
        ApiResponse<{ items: ApiCartItem[]; total: number; itemCount: number }>
      >('/cart', { product_id: product.id, quantity })

      applyCartData(
        set,
        {
          items: data.data.items.map(mapApiCartItem),
          total: data.data.total,
          itemCount: data.data.itemCount
        },
        false
      )
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updateItem: async (cart_item_id, quantity) => {
    if (!hasToken() || cart_item_id.startsWith('guest-')) {
      const productId = cart_item_id.replace('guest-', '')
      let guest = loadGuestCart()
      if (quantity <= 0) {
        guest = guest.filter((i) => i.product_id !== productId)
      } else {
        guest = guest.map((i) =>
          i.product_id === productId ? { ...i, quantity } : i
        )
      }
      saveGuestCart(guest)
      applyCartData(set, guestCartToState(guest), true)
      return
    }

    set({ isLoading: true })
    try {
      const { data } = await api.put<
        ApiResponse<{ items: ApiCartItem[]; total: number; itemCount: number }>
      >(`/cart/${cart_item_id}`, { quantity })

      applyCartData(
        set,
        {
          items: data.data.items.map(mapApiCartItem),
          total: data.data.total,
          itemCount: data.data.itemCount
        },
        false
      )
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  removeItem: async (cart_item_id) => {
    if (!hasToken() || cart_item_id.startsWith('guest-')) {
      const productId = cart_item_id.replace('guest-', '')
      const guest = loadGuestCart().filter((i) => i.product_id !== productId)
      saveGuestCart(guest)
      applyCartData(set, guestCartToState(guest), true)
      return
    }

    set({ isLoading: true })
    try {
      const { data } = await api.delete<
        ApiResponse<{ items: ApiCartItem[]; total: number; itemCount: number }>
      >(`/cart/${cart_item_id}`)

      applyCartData(
        set,
        {
          items: data.data.items.map(mapApiCartItem),
          total: data.data.total,
          itemCount: data.data.itemCount
        },
        false
      )
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  clearCart: async () => {
    if (!hasToken()) {
      clearGuestCart()
      applyCartData(set, { items: [], total: 0, itemCount: 0 }, true)
      return
    }

    set({ isLoading: true })
    try {
      const { data } = await api.delete<
        ApiResponse<{ items: ApiCartItem[]; total: number; itemCount: number }>
      >('/cart')

      applyCartData(
        set,
        {
          items: data.data.items.map(mapApiCartItem),
          total: data.data.total,
          itemCount: data.data.itemCount
        },
        false
      )
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  mergeGuestCartOnLogin: async () => {
    const guest = loadGuestCart()
    if (guest.length === 0) {
      await get().fetchCart()
      return
    }

    for (const item of guest) {
      try {
        await api.post('/cart', {
          product_id: item.product_id,
          quantity: item.quantity
        })
      } catch {
        /* stock conflicts — skip */
      }
    }

    clearGuestCart()
    await get().fetchCart()
  },

  reset: () => {
    set({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,
      isGuest: false
    })
  }
}))
