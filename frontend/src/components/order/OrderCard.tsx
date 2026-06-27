'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown, ImageOff } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatPrice } from '@/lib/products'
import {
  formatOrderDate,
  getOrderItemCount,
  statusStyles,
  type OrderItem,
  type OrderStatus
} from '@/lib/orders'
import type { Order } from '@/types'

interface OrderCardProps {
  order: Order
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const [imageError, setImageError] = useState(false)
  const hasImage = item.product?.image_url && !imageError
  const subtotal = item.subtotal ?? item.quantity * item.unit_price

  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {hasImage ? (
          <Image
            src={item.product!.image_url!}
            alt={item.product?.name || 'Producto'}
            fill
            sizes="56px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">
          {item.product?.name || 'Producto'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {item.quantity} × {formatPrice(item.unit_price)}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-slate-900">
        {formatPrice(subtotal)}
      </p>
    </div>
  )
}

export default function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusKey = order.status as OrderStatus
  const status = statusStyles[statusKey] || {
    label: order.status,
    className: 'bg-slate-100 text-slate-700'
  }

  const itemCount = getOrderItemCount(order.items as OrderItem[])
  const itemsSubtotal = (order.items as OrderItem[]).reduce(
    (sum, item) => sum + (item.subtotal ?? item.quantity * item.unit_price),
    0
  )

  return (
    <Card padding="md" className="overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatOrderDate(order.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.label}
          </span>
          <p className="text-lg font-bold text-slate-900">{formatPrice(order.total)}</p>
          <p className="text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            aria-expanded={expanded}
          >
            Ver detalle
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-900">Productos</h4>
            <div className="mt-2">
              {(order.items as OrderItem[]).map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Dirección de envío
              </h4>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                {order.shipping_address}
              </p>
            </div>

            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal productos</dt>
                <dd className="font-medium text-slate-900">
                  {formatPrice(itemsSubtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-slate-900">Total pagado</dt>
                <dd className="font-bold text-indigo-600">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  )
}
