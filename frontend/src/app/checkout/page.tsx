'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { Loader2, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useRequireAuthForCheckout } from '@/hooks/useRequireAuthForCheckout'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import { formatPrice } from '@/lib/products'
import { calcOrderTotal, calcShipping, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/shipping'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import type { ApiResponse, Order } from '@/types'

type PaymentMethod = 'card' | 'cash' | 'transfer'

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: 'Tarjeta de Crédito/Débito' },
  { value: 'cash', label: 'Efectivo contra entrega' },
  { value: 'transfer', label: 'Transferencia Bancaria' }
]

export default function CheckoutPage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const requireAuthForCheckout = useRequireAuthForCheckout()
  const { items, total, fetchCart, reset, isLoading } = useCartStore()

  const [recipientName, setRecipientName] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  useEffect(() => {
    if (!token && !authChecked) {
      setAuthChecked(true)
      requireAuthForCheckout('/checkout')
    }
  }, [token, authChecked, requireAuthForCheckout])

  useEffect(() => {
    if (user?.full_name) {
      setRecipientName(user.full_name)
    }
  }, [user?.full_name])

  const shippingCost = calcShipping(total)
  const finalTotal = calcOrderTotal(total)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      requireAuthForCheckout('/checkout')
      return
    }

    if (items.length === 0) {
      toast.error('Tu carrito está vacío')
      router.push('/carrito')
      return
    }

    setIsSubmitting(true)

    try {
      const shipping_address = [
        `Destinatario: ${recipientName.trim()}`,
        `Dirección: ${address.trim()}`,
        `Método de pago: ${paymentOptions.find((o) => o.value === paymentMethod)?.label}`
      ].join('\n')

      const { data } = await api.post<ApiResponse<Order>>('/orders', {
        shipping_address
      })

      reset()
      toast.success('¡Pedido confirmado!')
      router.push(`/checkout/exito?orderId=${data.data.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo confirmar el pedido'))
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
        <p className="text-slate-600">Redirigiendo para iniciar sesión...</p>
      </div>
    )
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Cargando checkout...</p>
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
        <h1 className="mt-6 text-2xl font-bold text-slate-900">No hay productos para checkout</h1>
        <p className="mt-3 text-slate-600">Agrega productos a tu carrito antes de continuar.</p>
        <Link href="/carrito" className="mt-8">
          <Button size="lg">Ir al carrito</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-2 text-slate-600">Revisa tu pedido y completa los datos de envío</p>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-slate-900">Resumen de compra</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{item.product.name}</p>
                    <p className="text-slate-500">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
              <span className="font-semibold text-slate-900">Total a pagar</span>
              <span className="text-xl font-bold text-indigo-600">{formatPrice(finalTotal)}</span>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-semibold text-slate-900">Datos de envío</h2>
            <div className="mt-4 space-y-4">
              <Input
                label="Nombre completo del destinatario"
                name="recipientName"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                placeholder="Nombre y apellido"
                required
                disabled={isSubmitting}
              />
              <div className="w-full">
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-sm font-semibold text-slate-800"
                >
                  Dirección de entrega completa
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={4}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Calle, número, distrito, ciudad, referencia..."
                  required
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-semibold text-slate-900">Método de pago</h2>
            <div className="mt-4 space-y-3">
              {paymentOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    paymentMethod === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  } ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-900">{option.label}</span>
                </label>
              ))}
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                paymentMethod === 'card' ? 'mt-4 max-h-80 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                <Input
                  label="Número de tarjeta"
                  name="cardNumber"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  maxLength={19}
                  required={paymentMethod === 'card'}
                  disabled={isSubmitting}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Fecha de vencimiento"
                    name="cardExpiry"
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(event.target.value)}
                    placeholder="MM/AA"
                    maxLength={5}
                    required={paymentMethod === 'card'}
                    disabled={isSubmitting}
                  />
                  <Input
                    label="CVV"
                    name="cardCvv"
                    value={cardCvv}
                    onChange={(event) => setCardCvv(event.target.value)}
                    placeholder="123"
                    inputMode="numeric"
                    maxLength={4}
                    required={paymentMethod === 'card'}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24" padding="lg">
            <h2 className="text-lg font-semibold text-slate-900">Total del pedido</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Envío</dt>
                <dd className="font-medium text-slate-900">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    formatPrice(SHIPPING_COST)
                  )}
                </dd>
              </div>
              {total <= FREE_SHIPPING_THRESHOLD && total > 0 && (
                <p className="text-xs text-slate-500">
                  Envío gratis en compras mayores a {formatPrice(FREE_SHIPPING_THRESHOLD)}
                </p>
              )}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <dt className="font-semibold text-slate-900">Total</dt>
                  <dd className="text-2xl font-bold text-indigo-600">
                    {formatPrice(finalTotal)}
                  </dd>
                </div>
              </div>
            </dl>

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Confirmar pedido
            </Button>

            <Link
              href="/carrito"
              className={`mt-4 block text-center text-sm font-medium text-indigo-500 transition-colors hover:text-indigo-600 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
            >
              Volver al carrito
            </Link>
          </Card>
        </div>
      </form>
    </div>
  )
}
