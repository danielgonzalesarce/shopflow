'use client'

import { useEffect, useState } from 'react'
import { Loader2, Package, ShoppingCart, Clock, DollarSign } from 'lucide-react'
import Card from '@/components/ui/Card'
import api from '@/lib/axios'
import { formatOrderDate, statusStyles, type OrderStatus } from '@/lib/orders'
import { formatPrice } from '@/lib/products'
import type { ApiResponse, Order, Product } from '@/types'

interface DashboardStats {
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  recentOrders: Order[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)

      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get<ApiResponse<Product[]>>('/products/admin/all'),
          api.get<ApiResponse<Order[]>>('/orders/admin/all')
        ])

        const products = productsRes.data.data
        const orders = ordersRes.data.data

        const activeProducts = products.filter((p) => p.is_active).length
        const pendingOrders = orders.filter((o) => o.status === 'pendiente').length
        const totalRevenue = orders
          .filter((o) => o.status !== 'cancelado')
          .reduce((sum, o) => sum + o.total, 0)

        setStats({
          activeProducts,
          totalOrders: orders.length,
          pendingOrders,
          totalRevenue,
          recentOrders: orders.slice(0, 5)
        })
      } catch {
        setStats({
          activeProducts: 0,
          totalOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          recentOrders: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  const metrics = [
    {
      label: 'Productos activos',
      value: stats?.activeProducts ?? 0,
      icon: Package,
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      label: 'Total de órdenes',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Pedidos pendientes',
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      label: 'Ingresos totales',
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50'
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">Resumen general de ShopFlow</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} padding="md">
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${metric.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="mt-8" padding="md">
        <h2 className="text-lg font-semibold text-slate-900">Últimas 5 órdenes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No hay órdenes registradas
                  </td>
                </tr>
              ) : (
                stats?.recentOrders.map((order) => {
                  const statusKey = order.status as OrderStatus
                  const status = statusStyles[statusKey]

                  return (
                    <tr key={order.id} className="border-b border-slate-50">
                      <td className="py-3 font-mono text-xs">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3">
                        {order.customer?.full_name || '—'}
                      </td>
                      <td className="py-3 font-medium">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        {status && (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500">
                        {formatOrderDate(order.created_at)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
