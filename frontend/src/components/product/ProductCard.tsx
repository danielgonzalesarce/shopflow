'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ImageOff, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/products'
import { getApiErrorMessage } from '@/lib/errors'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const addItem = useCartStore((state) => state.addItem)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const outOfStock = product.stock === 0
  const hasImage = product.image_url && !imageError

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (outOfStock) return

    if (!token) {
      toast.error('Inicia sesión para agregar productos al carrito')
      router.push('/auth/login')
      return
    }

    setIsAdding(true)

    try {
      await addItem(product.id, 1)
      toast.success('Producto agregado al carrito')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo agregar al carrito'))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link
      href={`/productos/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {hasImage ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
            <ImageOff className="h-10 w-10" />
            <span className="mt-2 text-xs">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span className="mb-2 inline-flex w-fit rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
            {product.category.name}
          </span>
        )}

        <h3 className="line-clamp-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-indigo-500">
          {product.name}
        </h3>

        <p className="mt-3 text-lg font-bold text-slate-900">
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto pt-4">
          {outOfStock ? (
            <span className="inline-flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500">
              Sin stock
            </span>
          ) : (
            <Button
              className="w-full"
              onClick={handleAddToCart}
              isLoading={isAdding}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Agregar al carrito
            </Button>
          )}
        </div>
      </div>
    </Link>
  )
}
