'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Loader2, ShoppingCart } from 'lucide-react'
import AuthGuard from '@/components/auth/AuthGuard'
import CartItemRow from '@/components/cart/CartItemRow'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/products'
import { useCartStore } from '@/store/cart.store'

const FREE_SHIPPING_THRESHOLD = 50
const SHIPPING_COST = 10

function CartPageContent() {
  const { items, total, fetchCart, isLoading } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const shippingCost = total > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const finalTotal = total + shippingCost

  if (isLoading && items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Cargando carrito...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <ShoppingCart className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Tu carrito está vacío</h1>
        <p className="mt-3 text-slate-600">
          Aún no has agregado productos. Explora nuestro catálogo y encuentra lo
          que necesitas.
        </p>
        <Link href="/productos" className="mt-8">
          <Button size="lg">Explorar productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Mi carrito</h1>
      <p className="mt-2 text-slate-600">
        {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24" padding="lg">
            <h2 className="text-lg font-semibold text-slate-900">Resumen del pedido</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-slate-600">Envío</dt>
                <dd className="font-medium text-slate-900">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </dd>
              </div>
              {total <= FREE_SHIPPING_THRESHOLD && total > 0 && (
                <p className="text-xs text-slate-500">
                  Envío gratis en compras mayores a {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </p>
              )}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <dt className="text-base font-semibold text-slate-900">Total</dt>
                  <dd className="text-2xl font-bold text-indigo-600">
                    {formatPrice(finalTotal)}
                  </dd>
                </div>
              </div>
            </dl>

            <Link href="/checkout" className="mt-6 block">
              <Button size="lg" className="w-full">
                Proceder al pago
              </Button>
            </Link>

            <Link
              href="/productos"
              className="mt-4 block text-center text-sm font-medium text-indigo-500 transition-colors hover:text-indigo-600"
            >
              Seguir comprando
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CarritoPage() {
  return (
    <AuthGuard>
      <CartPageContent />
    </AuthGuard>
  )
}
