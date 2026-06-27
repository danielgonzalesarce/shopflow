'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/products'
import { debounce } from '@/lib/debounce'
import { getApiErrorMessage } from '@/lib/errors'
import { useCartStore } from '@/store/cart.store'
import type { CartItem } from '@/types'

interface CartItemRowProps {
  item: CartItem
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const updateItem = useCartStore((state) => state.updateItem)
  const removeItem = useCartStore((state) => state.removeItem)

  const [quantity, setQuantity] = useState(item.quantity)
  const [imageError, setImageError] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    setQuantity(item.quantity)
  }, [item.quantity])

  const syncQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      setIsUpdating(true)
      try {
        await updateItem(cartItemId, newQuantity)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'No se pudo actualizar la cantidad'))
        setQuantity(item.quantity)
      } finally {
        setIsUpdating(false)
      }
    },
    [updateItem, item.quantity]
  )

  const debouncedSync = useMemo(
    () => debounce((cartItemId: string, newQuantity: number) => {
      syncQuantity(cartItemId, newQuantity)
    }, 500),
    [syncQuantity]
  )

  const debouncedSyncRef = useRef(debouncedSync)
  debouncedSyncRef.current = debouncedSync

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return

    setQuantity(newQuantity)
    debouncedSyncRef.current(item.id, newQuantity)
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await removeItem(item.id)
      toast.success('Producto eliminado del carrito')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el producto'))
    } finally {
      setIsRemoving(false)
    }
  }

  const subtotal = item.product.price * quantity
  const hasImage = item.product.image_url && !imageError

  return (
    <div className="flex gap-4 rounded-2xl border border-[var(--border)] bg-surface-elevated p-5 transition-all hover:border-neon-red/30 sm:items-center">
      <Link
        href={`/productos/${item.product_id}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface sm:h-24 sm:w-24"
      >
        {hasImage ? (
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            fill
            sizes="96px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={`/productos/${item.product_id}`}
            className="line-clamp-2 font-semibold text-white transition-colors hover:text-neon-cyan"
          >
            {item.product.name}
          </Link>
          <p className="mt-1 text-sm text-slate-400">
            {formatPrice(item.product.price)} c/u
          </p>
          {item.product.category && (
            <span className="mt-2 inline-flex rounded-full border border-neon-cyan/20 bg-neon-cyan/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-neon-cyan">
              {item.product.category.name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating || isRemoving}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-white transition-colors hover:border-neon-red/50 hover:bg-neon-red/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={
                quantity >= item.product.stock || isUpdating || isRemoving
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-white transition-colors hover:border-neon-red/50 hover:bg-neon-red/10 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <p className="min-w-[90px] text-right text-sm font-bold text-neon-cyan sm:text-base">
            {formatPrice(subtotal)}
          </p>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving || isUpdating}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Eliminar producto"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
