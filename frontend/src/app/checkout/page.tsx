'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FormEvent, useEffect, useState } from 'react'
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  ImageOff,
  Landmark,
  Loader2,
  Lock,
  ShoppingCart,
  Truck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useRequireAuthForCheckout } from '@/hooks/useRequireAuthForCheckout'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import { formatPrice } from '@/lib/products'
import {
  calcOrderTotal,
  calcShipping,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST
} from '@/lib/shipping'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import type { ApiResponse, Order } from '@/types'

type PaymentMethod = 'card' | 'cash' | 'transfer'

const paymentOptions: {
  value: PaymentMethod
  label: string
  description: string
  icon: typeof CreditCard
}[] = [
  {
    value: 'card',
    label: 'Tarjeta de crédito / débito',
    description: 'Visa, Mastercard, Amex',
    icon: CreditCard
  },
  {
    value: 'cash',
    label: 'Efectivo contra entrega',
    description: 'Paga al recibir tu pedido',
    icon: Banknote
  },
  {
    value: 'transfer',
    label: 'Transferencia bancaria',
    description: 'Yape, Plin o transferencia',
    icon: Landmark
  }
]

const textareaClass =
  'w-full rounded-xl border border-[var(--border)] bg-surface px-4 py-3 text-white shadow-sm transition-all placeholder:text-slate-500 focus:border-neon-red focus:outline-none focus:ring-4 focus:ring-neon-red/15 disabled:cursor-not-allowed disabled:opacity-60'

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
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const freeShippingProgress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total)

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
      <div className="flex min-h-[50vh] items-center justify-center bg-[var(--background)] px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-red" />
        <p className="ml-3 text-slate-400">Redirigiendo para iniciar sesión...</p>
      </div>
    )
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-neon-red" />
          <p className="text-sm font-medium text-slate-400">Cargando checkout...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[var(--background)] px-4 py-16 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-neon-red/30 bg-neon-red/10">
          <ShoppingCart className="h-12 w-12 text-neon-red" />
        </div>
        <h1 className="mt-8 text-3xl font-extrabold text-white">No hay productos para checkout</h1>
        <p className="mt-3 max-w-md text-slate-400">
          Agrega productos a tu carrito antes de continuar.
        </p>
        <Link href="/carrito" className="mt-8">
          <Button size="lg">Ir al carrito</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/carrito"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-neon-cyan"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al carrito
          </Link>
          <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
            Finalizar compra
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-white">Checkout</h1>
          <p className="mt-1 text-slate-400">
            {itemCount} artículo{itemCount === 1 ? '' : 's'} · Revisa tu pedido y completa el envío
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card padding="lg">
              <h2 className="text-lg font-bold text-white">Resumen de compra</h2>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-surface p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-surface-elevated">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageOff className="h-5 w-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{item.product.name}</p>
                      <p className="mt-0.5 text-sm text-slate-400">
                        {formatPrice(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-bold text-neon-cyan">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-bold text-white">Datos de envío</h2>
              <p className="mt-1 text-sm text-slate-400">
                Entrega a todo el Perú · 3 a 5 días hábiles
              </p>
              <div className="mt-5 space-y-4">
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
                    className="mb-1.5 block text-sm font-semibold text-slate-200"
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
                    className={textareaClass}
                  />
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="text-lg font-bold text-white">Método de pago</h2>
              <div className="mt-4 space-y-3">
                {paymentOptions.map((option) => {
                  const Icon = option.icon
                  const selected = paymentMethod === option.value

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-all ${
                        selected
                          ? 'border-neon-red/50 bg-neon-red/10 shadow-[0_0_20px_rgba(229,57,53,0.12)]'
                          : 'border-[var(--border)] bg-surface hover:border-neon-cyan/30 hover:bg-white/[0.02]'
                      } ${isSubmitting ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={selected}
                        onChange={() => setPaymentMethod(option.value)}
                        disabled={isSubmitting}
                        className="h-4 w-4 accent-[var(--neon-red)]"
                      />
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                          selected
                            ? 'border-neon-red/40 bg-neon-red/15 text-neon-red'
                            : 'border-[var(--border)] bg-surface-elevated text-slate-400'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-white">
                          {option.label}
                        </span>
                        <span className="text-xs text-slate-500">{option.description}</span>
                      </div>
                    </label>
                  )
                })}
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  paymentMethod === 'card' ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-4 rounded-xl border border-[var(--border)] bg-surface p-4">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Lock className="h-3.5 w-3.5 text-neon-cyan" />
                    Datos simulados — no se procesa un pago real
                  </p>
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

          <div className="lg:col-span-4">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-[var(--border)] bg-surface-elevated shadow-lg shadow-black/30">
              <div className="border-b border-[var(--border)] bg-surface px-6 py-4">
                <h2 className="font-bold text-white">Total del pedido</h2>
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
                    <dt className="text-slate-400">Subtotal ({itemCount} items)</dt>
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
                  type="submit"
                  size="lg"
                  className="mt-6 w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Confirmar pedido
                </Button>

                <Link
                  href="/carrito"
                  className={`mt-4 block text-center text-sm font-semibold text-neon-red transition-colors hover:text-neon-red-light ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Volver al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
