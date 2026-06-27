'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useFavoritesStore } from '@/store/favorites.store'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage)

  useEffect(() => {
    const init = async () => {
      await loadFromStorage()
      const token = localStorage.getItem('token')
      if (!token) {
        useCartStore.getState().hydrateGuestCart()
        useFavoritesStore.getState().hydrateGuestFavorites()
      }
    }
    init()
  }, [loadFromStorage])

  return <>{children}</>
}
