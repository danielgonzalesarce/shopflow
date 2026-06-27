import { create } from 'zustand'
import api from '@/lib/axios'
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
  fetchCart: () => Promise<void>
  addItem: (product_id: string, quantity: number) => Promise<void>
  updateItem: (cart_item_id: string, quantity: number) => Promise<void>
  removeItem: (cart_item_id: string) => Promise<void>
  clearCart: () => Promise<void>
  reset: () => void
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

function applyCartData(set: (state: Partial<CartState>) => void, cart: Cart) {
  set({
    items: cart.items,
    total: cart.total,
    itemCount: cart.itemCount,
    isLoading: false
  })
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })

    try {
      const { data } = await api.get<ApiResponse<{
        items: ApiCartItem[]
        total: number
        itemCount: number
      }>>('/cart')

      applyCartData(set, {
        items: data.data.items.map(mapApiCartItem),
        total: data.data.total,
        itemCount: data.data.itemCount
      })
    } catch {
      set({ items: [], total: 0, itemCount: 0, isLoading: false })
    }
  },

  addItem: async (product_id, quantity) => {
    set({ isLoading: true })

    try {
      const { data } = await api.post<ApiResponse<{
        items: ApiCartItem[]
        total: number
        itemCount: number
      }>>('/cart', { product_id, quantity })

      applyCartData(set, {
        items: data.data.items.map(mapApiCartItem),
        total: data.data.total,
        itemCount: data.data.itemCount
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  updateItem: async (cart_item_id, quantity) => {
    set({ isLoading: true })

    try {
      const { data } = await api.put<ApiResponse<{
        items: ApiCartItem[]
        total: number
        itemCount: number
      }>>(`/cart/${cart_item_id}`, { quantity })

      applyCartData(set, {
        items: data.data.items.map(mapApiCartItem),
        total: data.data.total,
        itemCount: data.data.itemCount
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  removeItem: async (cart_item_id) => {
    set({ isLoading: true })

    try {
      const { data } = await api.delete<ApiResponse<{
        items: ApiCartItem[]
        total: number
        itemCount: number
      }>>(`/cart/${cart_item_id}`)

      applyCartData(set, {
        items: data.data.items.map(mapApiCartItem),
        total: data.data.total,
        itemCount: data.data.itemCount
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  clearCart: async () => {
    set({ isLoading: true })

    try {
      const { data } = await api.delete<ApiResponse<{
        items: ApiCartItem[]
        total: number
        itemCount: number
      }>>('/cart')

      applyCartData(set, {
        items: data.data.items.map(mapApiCartItem),
        total: data.data.total,
        itemCount: data.data.itemCount
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  reset: () => {
    set({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false
    })
  }
}))
