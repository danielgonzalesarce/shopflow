'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Eye, ImageOff, ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import WishlistButton from '@/components/favorites/WishlistButton'
import { formatPrice, getProductImages } from '@/lib/products'
import { getApiErrorMessage } from '@/lib/errors'
import { useCartStore } from '@/store/cart.store'
import { useUiStore } from '@/store/ui.store'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

function pseudoRating(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (4 + (hash % 10) / 10).toFixed(1)
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const setCartOpen = useUiStore((state) => state.setCartOpen)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const images = getProductImages(product)
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const hasImage = images.length > 0 && !imageError
  const currentImage = images[activeImageIndex] || images[0]
  const rating = pseudoRating(product.id)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length)
    }, 2800)

    return () => clearInterval(interval)
  }, [images.length])

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (outOfStock) return

    setIsAdding(true)
    try {
      await addItem(product, 1)
      toast.success('Agregado al carrito')
      setCartOpen(true)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo agregar al carrito'))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-surface-elevated shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neon-red/40 hover:shadow-xl hover:shadow-neon-red/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Link
          href={`/productos/${product.id}`}
          className="absolute inset-0 z-0"
          aria-label={`Ver ${product.name}`}
        >
          {hasImage ? (
            <Image
              key={currentImage}
              src={currentImage}
              alt={`${product.name} — imagen ${activeImageIndex + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <ImageOff className="h-10 w-10" />
              <span className="mt-2 text-xs">Sin imagen</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        {product.category && (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-neon-cyan shadow-sm backdrop-blur-sm">
            {product.category.name}
          </span>
        )}

        {lowStock && !outOfStock && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg bg-amber-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
            Últimas unidades
          </span>
        )}

        <div className="absolute right-3 top-3 z-20">
          <WishlistButton product={product} size="sm" />
        </div>

        {images.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex gap-1">
            {images.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        <Link
          href={`/productos/${product.id}`}
          className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-center gap-1.5 rounded-xl bg-black/80 py-2 text-xs font-bold text-white opacity-0 shadow-lg backdrop-blur-sm transition-all group-hover:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver detalle
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">{rating}</span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-slate-400">
            {outOfStock ? 'Agotado' : `${product.stock} en stock`}
          </span>
        </div>

        <Link href={`/productos/${product.id}`}>
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-white transition-colors group-hover:text-neon-red">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-xl font-extrabold text-neon-cyan">{formatPrice(product.price)}</p>
        </div>

        <div className="mt-auto pt-4">
          {outOfStock ? (
            <span className="inline-flex w-full items-center justify-center rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-slate-500">
              Sin stock
            </span>
          ) : (
            <Button className="w-full" size="sm" onClick={handleAddToCart} isLoading={isAdding}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Agregar al carrito
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
