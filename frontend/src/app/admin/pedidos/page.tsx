'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Card from '@/components/ui/Card'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import {
  formatOrderDate,
  ORDER_STATUS_OPTIONS,
  statusStyles,
  type OrderStatus
} from '@/lib/orders'
import { formatPrice } from '@/lib/products'
import type { ApiResponse, Order } from '@/types'

export default function AdminPedidosPage() {
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
    loadOrders()
  }, [loadOrders])

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
          <p className="mt-2 text-slate-600">Histórico completo de órdenes</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">Todos los estados</option>
          {ORDER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {statusStyles[status].label}
            </option>
          ))}
        </select>
      </div>

      <Card className="mt-8 overflow-hidden" padding="sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">ID Orden</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
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
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-mono text-xs">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {order.customer?.full_name || '—'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.customer?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 ${
                            statusStyles[order.status as OrderStatus]?.className ||
                            'border-slate-200'
                          }`}
                        >
                          {ORDER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {statusStyles[status].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatOrderDate(order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
