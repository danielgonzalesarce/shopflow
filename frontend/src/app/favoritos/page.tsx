'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Heart, Loader2, ShoppingBag, ShoppingCart, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import { getApiErrorMessage } from '@/lib/errors'
import { getFavoriteProducts, useFavoritesStore } from '@/store/favorites.store'
import { useCartStore } from '@/store/cart.store'
import { useUiStore } from '@/store/ui.store'

export default function FavoritosPage() {
  const { items, itemCount, fetchFavorites, isLoading, clearAllFavorites } = useFavoritesStore()
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useUiStore((s) => s.setCartOpen)

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const products = getFavoriteProducts(items)
  const [clearing, setClearing] = useState(false)
  const [addingAll, setAddingAll] = useState(false)

  const handleClearAll = async () => {
    if (!confirm('¿Eliminar todos los favoritos?')) return
    setClearing(true)
    try {
      await clearAllFavorites()
      toast.success('Favoritos vaciados')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudieron eliminar los favoritos'))
    } finally {
      setClearing(false)
    }
  }

  const handleAddAllToCart = async () => {
    const available = products.filter((p) => p.stock > 0)
    if (available.length === 0) {
      toast.error('No hay productos con stock disponible')
      return
    }
    setAddingAll(true)
    try {
      for (const product of available) {
        await addItem(product, 1)
      }
      toast.success(`${available.length} producto(s) agregados al carrito`)
      setCartOpen(true)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudieron agregar al carrito'))
    } finally {
      setAddingAll(false)
    }
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-neon-red" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-red/30 bg-neon-red/15 neon-glow-red">
                <Heart className="h-7 w-7 fill-neon-red text-neon-red" />
              </div>
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
                  Tu lista
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Mis favoritos</h1>
                <p className="mt-1 text-slate-400">
                  {itemCount > 0
                    ? `${itemCount} producto${itemCount === 1 ? '' : 's'} guardado${itemCount === 1 ? '' : 's'}`
                    : 'Guarda productos que te gusten para comprarlos después'}
                </p>
              </div>
            </div>

            {products.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddAllToCart}
                  isLoading={addingAll}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar todo al carrito
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  isLoading={clearing}
                  className="text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Vaciar lista
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-surface py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neon-red/20 bg-neon-red/10">
              <Heart className="h-10 w-10 text-neon-red/40" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-white">Aún no tienes favoritos</h2>
            <p className="mt-2 max-w-sm text-slate-400">
              Toca el corazón en cualquier producto para guardarlo aquí y comprarlo cuando quieras
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 px-4 py-2 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              Los favoritos se guardan en tu navegador o cuenta
            </div>
            <Link href="/productos" className="mt-8">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explorar catálogo
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Guardados', value: String(itemCount) },
                {
                  label: 'Con stock',
                  value: String(products.filter((p) => p.stock > 0).length)
                },
                {
                  label: 'Categorías',
                  value: String(new Set(products.map((p) => p.category?.slug).filter(Boolean)).size)
                }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[var(--border)] bg-surface-elevated px-5 py-4 text-center"
                >
                  <p className="text-2xl font-extrabold text-neon-cyan">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
            <ProductGrid products={products} />
          </>
        )}
      </div>
    </div>
  )
}
