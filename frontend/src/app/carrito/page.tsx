'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { ArrowRight, Heart, Loader2, ShoppingCart, Truck } from 'lucide-react'
import CartItemRow from '@/components/cart/CartItemRow'
import Button from '@/components/ui/Button'
import { useRequireAuthForCheckout } from '@/hooks/useRequireAuthForCheckout'
import { formatPrice } from '@/lib/products'
import {
  calcOrderTotal,
  calcShipping,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST
} from '@/lib/shipping'
import { useCartStore } from '@/store/cart.store'

export default function CarritoPage() {
  const { items, total, fetchCart, isLoading } = useCartStore()
  const requireAuthForCheckout = useRequireAuthForCheckout()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const shippingCost = calcShipping(total)
  const finalTotal = calcOrderTotal(total)
  const freeShippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total)

  if (isLoading && items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-neon-red" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-neon-red/30 bg-neon-red/10">
          <ShoppingCart className="h-12 w-12 text-neon-red" />
        </div>
        <h1 className="mt-8 text-3xl font-extrabold text-white">Tu carrito está vacío</h1>
        <p className="mt-3 max-w-md text-slate-400">
          Descubre más de 20 productos con envío a todo el Perú
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/productos">
            <Button size="lg">
              Ir al catálogo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/favoritos">
            <Button size="lg" variant="secondary">
              <Heart className="mr-2 h-5 w-5" />
              Ver favoritos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
            Checkout
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-white">Carrito de compras</h1>
          <p className="mt-1 text-slate-400">
            {items.length} producto{items.length === 1 ? '' : 's'} en tu carrito
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-[var(--border)] bg-surface-elevated shadow-lg shadow-black/30">
              <div className="border-b border-[var(--border)] bg-surface px-6 py-4">
                <h2 className="font-bold text-white">Resumen del pedido</h2>
              </div>

              <div className="p-6">
                {total < FREE_SHIPPING_THRESHOLD && (
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Truck className="h-3.5 w-3.5 text-neon-cyan" />
                        Envío gratis desde {formatPrice(FREE_SHIPPING_THRESHOLD)}
                      </span>
                      <span className="text-neon-cyan">{Math.round(freeShippingProgress)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
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

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Subtotal</dt>
                    <dd className="font-semibold text-white">{formatPrice(total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Envío</dt>
                    <dd className="font-semibold text-white">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400">Gratis</span>
                      ) : (
                        formatPrice(SHIPPING_COST)
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-3 text-lg">
                    <dt className="font-bold text-white">Total</dt>
                    <dd className="font-extrabold text-neon-cyan">{formatPrice(finalTotal)}</dd>
                  </div>
                </dl>

                <Button
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => requireAuthForCheckout('/checkout')}
                >
                  Proceder al pago
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link
                  href="/productos"
                  className="mt-4 block text-center text-sm font-semibold text-neon-red hover:text-neon-red-light"
                >
                  Seguir comprando
                </Link>
                <Link
                  href="/favoritos"
                  className="mt-2 block text-center text-sm font-medium text-slate-500 hover:text-neon-cyan"
                >
                  Ver mis favoritos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
