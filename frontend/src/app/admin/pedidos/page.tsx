'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Card from '@/components/ui/Card'
import api from '@/lib/axios'
import {
  adminSelectClass,
  adminStatusStyles,
  adminTableHeadClass,
  adminTableRowClass
} from '@/lib/admin'
import { getApiErrorMessage } from '@/lib/errors'
import {
  formatOrderDate,
  ORDER_STATUS_OPTIONS,
  type OrderStatus
} from '@/lib/orders'
import { formatPrice } from '@/lib/products'
import { useAuthStore } from '@/store/auth.store'
import type { ApiResponse, Order } from '@/types'

export default function AdminPedidosPage() {
  const token = useAuthStore((state) => state.token)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const [orders, setOrders] = useState<Order[]>([])
  const [filterStatus, setFilterStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)

    try {
      const url = filterStatus
        ? `/orders/admin/all?status=${filterStatus}`
        : '/orders/admin/all'

      const { data } = await api.get<ApiResponse<Order[]>>(url)
      setOrders(data.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Error al cargar pedidos'))
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    if (isAuthLoading || !token) return
    loadOrders()
  }, [loadOrders, token, isAuthLoading])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)

    try {
      const { data } = await api.put<ApiResponse<Order>>(
        `/orders/${orderId}/status`,
        { status: newStatus }
      )

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? data.data : order))
      )
      toast.success('Estado actualizado correctamente')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el estado'))
      await loadOrders()
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Pedidos"
        subtitle="Histórico completo de órdenes"
        actions={
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={adminSelectClass}
          >
            <option value="">Todos los estados</option>
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {adminStatusStyles[status].label}
              </option>
            ))}
          </select>
        }
      />

      <Card className="mt-8 overflow-hidden" padding="sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neon-red" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className={adminTableHeadClass}>
                  <th className="px-4 py-3">ID Orden</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      No hay pedidos con el filtro seleccionado
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const statusKey = order.status as OrderStatus
                    const statusStyle = adminStatusStyles[statusKey]

                    return (
                      <tr key={order.id} className={adminTableRowClass}>
                        <td className="px-4 py-3 font-mono text-xs text-neon-cyan">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">
                            {order.customer?.full_name || '—'}
                          </p>
                          <p className="text-xs text-slate-500">{order.customer?.email}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className={`rounded-lg border bg-surface px-3 py-1.5 text-xs font-semibold text-white focus:border-neon-red/50 focus:outline-none focus:ring-2 focus:ring-neon-red/20 disabled:opacity-50 ${
                              statusStyle?.className || 'border-[var(--border)]'
                            }`}
                          >
                            {ORDER_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {adminStatusStyles[status].label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {formatOrderDate(order.created_at)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
