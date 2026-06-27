'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Heart,
  ImageOff,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { useRequireAuthForCheckout } from '@/hooks/useRequireAuthForCheckout'
import { formatPrice } from '@/lib/products'
import { getApiErrorMessage } from '@/lib/errors'
import { calcOrderTotal, calcShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping'
import { useCartStore } from '@/store/cart.store'
import { useUiStore } from '@/store/ui.store'

export default function CartDrawer() {
  const cartOpen = useUiStore((s) => s.cartOpen)
  const setCartOpen = useUiStore((s) => s.setCartOpen)
  const requireAuthForCheckout = useRequireAuthForCheckout()
  const { items, total, itemCount, fetchCart, isLoading, updateItem, removeItem } = useCartStore()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (cartOpen) {
      fetchCart()
    }
  }, [cartOpen, fetchCart])

  if (!cartOpen) return null

  const shipping = calcShipping(total)
  const finalTotal = calcOrderTotal(total)
  const freeShippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total)

  const handleCheckout = () => {
    setCartOpen(false)
    requireAuthForCheckout('/checkout')
  }

  const handleQuantityChange = async (itemId: string, newQty: number, maxStock: number) => {
    if (newQty < 1 || newQty > maxStock) return
    setUpdatingId(itemId)
    try {
      await updateItem(itemId, newQty)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId)
    try {
      await removeItem(itemId)
      toast.success('Eliminado del carrito')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-l border-[var(--border)] bg-surface shadow-2xl shadow-black/50"
        role="dialog"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white">Tu carrito</h2>
            <p className="text-sm text-slate-400">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-red border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-surface-elevated">
              <ShoppingBag className="h-10 w-10 text-slate-600" />
            </div>
            <p className="mt-5 text-lg font-bold text-white">Carrito vacío</p>
            <p className="mt-2 text-sm text-slate-400">
              Explora el catálogo y agrega productos a tu carrito
            </p>
            <div className="mt-6 flex w-full flex-col gap-3">
              <Link href="/productos" onClick={() => setCartOpen(false)} className="w-full">
                <Button className="w-full">Ver productos</Button>
              </Link>
              <Link href="/favoritos" onClick={() => setCartOpen(false)} className="w-full">
                <Button variant="secondary" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Ver favoritos
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-4">
                {items.map((item) => {
                  const busy = updatingId === item.id

                  return (
                    <li
                      key={item.id}
                      className="rounded-xl border border-[var(--border)] bg-surface-elevated p-3"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                          {item.product.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageOff className="h-6 w-6 text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/productos/${item.product_id}`}
                            onClick={() => setCartOpen(false)}
                            className="line-clamp-2 text-sm font-semibold text-white hover:text-neon-cyan"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatPrice(item.product.price)} c/u
                          </p>
                          <p className="mt-1 text-sm font-bold text-neon-cyan">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          disabled={busy}
                          className="h-8 w-8 shrink-0 rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1, item.product.stock)
                            }
                            disabled={item.quantity <= 1 || busy}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-white hover:border-neon-red/50 disabled:opacity-50"
                            aria-label="Menos"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1, item.product.stock)
                            }
                            disabled={item.quantity >= item.product.stock || busy}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-white hover:border-neon-red/50 disabled:opacity-50"
                            aria-label="Más"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-xs text-slate-500">
                          Stock: {item.product.stock}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-5">
              {total < FREE_SHIPPING_THRESHOLD && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Truck className="h-3.5 w-3.5 text-neon-cyan" />
                      Envío gratis desde {formatPrice(FREE_SHIPPING_THRESHOLD)}
                    </span>
                    <span className="font-semibold text-neon-cyan">
                      {Math.round(freeShippingProgress)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-red to-neon-cyan transition-all"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                  {amountToFreeShipping > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Agrega {formatPrice(amountToFreeShipping)} más para envío gratis
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Envío</span>
                  <span className="font-medium text-white">
                    {shipping === 0 ? (
                      <span className="text-emerald-400">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-extrabold text-neon-cyan">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              <Button className="mt-4 w-full" size="lg" onClick={handleCheckout}>
                Proceder al pago
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link
                href="/carrito"
                onClick={() => setCartOpen(false)}
                className="mt-3 block text-center text-sm font-semibold text-neon-red hover:text-neon-red-light"
              >
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
