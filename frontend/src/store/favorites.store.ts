import { create } from 'zustand'
import api from '@/lib/axios'
import {
  clearGuestFavorites,
  guestFavoritesToState,
  loadGuestFavorites,
  saveGuestFavorites
} from '@/lib/guest-storage'
import type { ApiResponse, Product, WishlistItem } from '@/types'

interface FavoritesState {
  items: WishlistItem[]
  productIds: string[]
  itemCount: number
  isLoading: boolean
  isGuest: boolean
  fetchFavorites: () => Promise<void>
  hydrateGuestFavorites: () => void
  toggleFavorite: (product: Product) => Promise<boolean>
  removeFavorite: (product_id: string) => Promise<void>
  clearAllFavorites: () => Promise<void>
  isFavorite: (product_id: string) => boolean
  mergeGuestFavoritesOnLogin: () => Promise<void>
  reset: () => void
}

function hasToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('token')
}

function applyFavorites(
  set: (state: Partial<FavoritesState>) => void,
  data: { items: WishlistItem[]; itemCount: number; productIds: string[] },
  isGuest: boolean
) {
  set({
    items: data.items,
    itemCount: data.itemCount,
    productIds: data.productIds,
    isLoading: false,
    isGuest
  })
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  productIds: [],
  itemCount: 0,
  isLoading: false,
  isGuest: false,

  hydrateGuestFavorites: () => {
    if (hasToken()) return
    const products = loadGuestFavorites()
    applyFavorites(set, guestFavoritesToState(products), true)
  },

  fetchFavorites: async () => {
    set({ isLoading: true })

    if (!hasToken()) {
      const products = loadGuestFavorites()
      applyFavorites(set, guestFavoritesToState(products), true)
      return
    }

    try {
      const { data } = await api.get<
        ApiResponse<{ items: WishlistItem[]; itemCount: number; productIds: string[] }>
      >('/favorites')
      applyFavorites(set, data.data, false)
    } catch {
      set({ items: [], productIds: [], itemCount: 0, isLoading: false, isGuest: false })
    }
  },

  toggleFavorite: async (product) => {
    const wasFavorite = get().productIds.includes(product.id)

    if (!hasToken()) {
      let products = loadGuestFavorites()
      if (wasFavorite) {
        products = products.filter((p) => p.id !== product.id)
      } else {
        products = [...products, product]
      }
      saveGuestFavorites(products)
      applyFavorites(set, guestFavoritesToState(products), true)
      return !wasFavorite
    }

    set({ isLoading: true })
    try {
      const { data } = await api.post<
        ApiResponse<{ items: WishlistItem[]; itemCount: number; productIds: string[] }>
      >(`/favorites/toggle/${product.id}`)

      applyFavorites(set, data.data, false)
      return !wasFavorite
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  removeFavorite: async (product_id) => {
    if (!hasToken()) {
      const products = loadGuestFavorites().filter((p) => p.id !== product_id)
      saveGuestFavorites(products)
      applyFavorites(set, guestFavoritesToState(products), true)
      return
    }

    set({ isLoading: true })
    try {
      const { data } = await api.delete<
        ApiResponse<{ items: WishlistItem[]; itemCount: number; productIds: string[] }>
      >(`/favorites/${product_id}`)
      applyFavorites(set, data.data, false)
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  clearAllFavorites: async () => {
    if (!hasToken()) {
      saveGuestFavorites([])
      applyFavorites(set, guestFavoritesToState([]), true)
      return
    }

    const ids = [...get().productIds]
    for (const product_id of ids) {
      try {
        await api.delete<
          ApiResponse<{ items: WishlistItem[]; itemCount: number; productIds: string[] }>
        >(`/favorites/${product_id}`)
      } catch {
        /* skip failed */
      }
    }
    await get().fetchFavorites()
  },

  isFavorite: (product_id) => get().productIds.includes(product_id),

  mergeGuestFavoritesOnLogin: async () => {
    const products = loadGuestFavorites()
    if (products.length === 0) {
      await get().fetchFavorites()
      return
    }

    for (const product of products) {
      try {
        await api.post('/favorites', { product_id: product.id })
      } catch {
        /* already exists */
      }
    }

    clearGuestFavorites()
    await get().fetchFavorites()
  },

  reset: () => {
    set({ items: [], productIds: [], itemCount: 0, isLoading: false, isGuest: false })
  }
}))

export function getFavoriteProducts(items: WishlistItem[]): Product[] {
  return items.map((item) => item.product)
}
