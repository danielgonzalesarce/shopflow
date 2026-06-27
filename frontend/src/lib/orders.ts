import type { OrderItem as BaseOrderItem } from '@/types'
import {
  formatDate,
  getStatusLabel,
  orderStatusConfig,
  type OrderStatus
} from './utils'

export type { OrderStatus }
export { getStatusLabel }

export interface OrderItemProduct {
  name: string
  image_url: string | null
}

export interface OrderItem extends Omit<BaseOrderItem, 'product'> {
  subtotal?: number
  product: OrderItemProduct | null
}

export const statusStyles = orderStatusConfig

export function formatOrderDate(dateStr: string) {
  return formatDate(dateStr)
}

export function getOrderItemCount(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'pendiente',
  'procesando',
  'enviado',
  'entregado',
  'cancelado'
]
