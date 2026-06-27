'use client'

import { Heart } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '@/lib/errors'
import { useFavoritesStore } from '@/store/favorites.store'
import type { Product } from '@/types'

interface WishlistButtonProps {
  product: Product
  size?: 'sm' | 'md'
  className?: string
}

export default function WishlistButton({
  product,
  size = 'md',
  className = ''
}: WishlistButtonProps) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite)
  const [loading, setLoading] = useState(false)

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const btnSize = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    try {
      const added = await toggleFavorite(product)
      toast.success(added ? 'Agregado a favoritos' : 'Eliminado de favoritos')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar favoritos'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`flex ${btnSize} items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-all hover:scale-105 disabled:opacity-60 ${
        isFavorite
          ? 'border-neon-red/50 bg-neon-red/20 hover:border-neon-red hover:shadow-neon-red/30'
          : 'border-[var(--border)] bg-surface-elevated/95 hover:border-neon-red/40 hover:bg-neon-red/10'
      } ${className}`}
    >
      <Heart
        className={`${iconSize} transition-colors ${
          isFavorite ? 'fill-neon-red text-neon-red' : 'text-slate-400 hover:text-neon-red'
        }`}
      />
    </button>
  )
}
