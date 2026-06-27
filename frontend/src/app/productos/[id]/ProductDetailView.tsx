'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronRight, ImageOff, Minus, Plus, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import ProductCard from '@/components/product/ProductCard'
import { formatPrice } from '@/lib/products'
import { getApiErrorMessage } from '@/lib/errors'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import type { Product } from '@/types'

interface ProductDetailViewProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetailView({
  product,
  relatedProducts
}: ProductDetailViewProps) {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const addItem = useCartStore((state) => state.addItem)

  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock < 5
  const hasImage = product.image_url && !imageError

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta
      if (next < 1) return 1
      if (next > product.stock) return product.stock
      return next
    })
  }

  const handleAddToCart = async () => {
    if (outOfStock) return

    if (!token) {
      toast.error('Debes iniciar sesión para agregar productos al carrito')
      router.push('/auth/login')
      return
    }

    setIsAdding(true)

    try {
      await addItem(product.id, quantity)
      toast.success('Producto agregado al carrito')
      setQuantity(1)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo agregar al carrito'))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-indigo-500">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" className="transition-colors hover:text-indigo-500">
          Productos
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/productos?category=${product.category.slug}`}
              className="transition-colors hover:text-indigo-500"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-medium text-slate-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 shadow-sm">
          {hasImage ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
              <ImageOff className="h-16 w-16" />
              <span className="mt-3 text-sm">Sin imagen disponible</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <span className="mb-4 inline-flex w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
              {product.category.name}
            </span>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          <p className="mt-6 text-3xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </p>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Descripción
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {product.description || 'Sin descripción disponible para este producto.'}
            </p>
          </div>

          <div className="mt-8">
            {outOfStock ? (
              <p className="text-sm font-medium text-red-500">Producto agotado</p>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Stock disponible:{' '}
                  <span className="font-semibold text-slate-900">{product.stock} unidades</span>
                </p>
                {lowStock && (
                  <p className="mt-2 text-sm font-semibold text-orange-500">
                    ¡Últimas unidades disponibles!
                  </p>
                )}
              </>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-8">
              <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-slate-700">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(event) => {
                    const value = parseInt(event.target.value, 10)
                    if (Number.isNaN(value)) return
                    setQuantity(Math.min(Math.max(value, 1), product.stock))
                  }}
                  className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleAddToCart}
              disabled={outOfStock}
              isLoading={isAdding}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </Button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-slate-100 pt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Productos relacionados</h2>
            {product.category && (
              <Link
                href={`/productos?category=${product.category.slug}`}
                className="hidden text-sm font-medium text-indigo-500 transition-colors hover:text-indigo-600 sm:flex sm:items-center sm:gap-1"
              >
                Ver más en {product.category.name}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
          {product.category && (
            <Link
              href={`/productos?category=${product.category.slug}`}
              className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-indigo-500 sm:hidden"
            >
              Ver más en {product.category.name}
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
