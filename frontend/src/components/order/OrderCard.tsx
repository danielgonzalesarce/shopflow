'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  ChevronDown,
  ImageOff,
  MapPin,
  Package,
  Receipt
} from 'lucide-react'
import Card from '@/components/ui/Card'
import { adminStatusStyles } from '@/lib/admin'
import { formatPrice } from '@/lib/products'
import {
  formatOrderDate,
  getOrderItemCount,
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
    <div className="flex gap-3 border-b border-[var(--border)] py-3 last:border-0">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-surface">
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
          <div className="flex h-full w-full items-center justify-center text-slate-500">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">{item.product?.name || 'Producto'}</p>
        <p className="mt-1 text-sm text-slate-400">
          {item.quantity} × {formatPrice(item.unit_price)}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-neon-cyan">{formatPrice(subtotal)}</p>
    </div>
  )
}

export default function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusKey = order.status as OrderStatus
  const status = adminStatusStyles[statusKey] || {
    label: order.status,
    className: 'border border-[var(--border)] bg-surface text-slate-300'
  }

  const items = order.items as OrderItem[]
  const itemCount = getOrderItemCount(items)
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (item.subtotal ?? item.quantity * item.unit_price),
    0
  )
  const previewItems = items.slice(0, 3)

  return (
    <Card padding="md" className="overflow-hidden transition-all hover:border-neon-red/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neon-red/30 bg-neon-red/10 sm:flex">
            <Package className="h-5 w-5 text-neon-red" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm font-bold text-neon-cyan">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{formatOrderDate(order.created_at)}</p>
            <p className="mt-2 text-xs text-slate-500">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </p>

            {!expanded && previewItems.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {previewItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative h-8 w-8 overflow-hidden rounded-lg border-2 border-surface-elevated bg-surface"
                    >
                      {item.product?.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageOff className="h-3 w-3 text-slate-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {items.length > 3 && (
                  <span className="text-xs text-slate-500">+{items.length - 3} más</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
          <p className="text-xl font-extrabold text-white">{formatPrice(order.total)}</p>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-surface px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:border-neon-cyan/40 hover:text-neon-cyan"
            aria-expanded={expanded}
          >
            {expanded ? 'Ocultar' : 'Ver detalle'}
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
          <div className="border-t border-[var(--border)] pt-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Receipt className="h-4 w-4 text-neon-red" />
              Productos
            </h4>
            <div className="mt-2">
              {items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[var(--border)] bg-surface p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
                <MapPin className="h-4 w-4 text-neon-cyan" />
                Dirección de envío
              </h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-400">
                {order.shipping_address}
              </p>
            </div>

            <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Subtotal productos</dt>
                <dd className="font-medium text-white">{formatPrice(itemsSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-white">Total pagado</dt>
                <dd className="font-bold text-neon-cyan">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  )
}
