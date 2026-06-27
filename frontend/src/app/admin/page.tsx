'use client'

import { useEffect, useState } from 'react'
import { Loader2, Package, ShoppingCart, Clock, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Card from '@/components/ui/Card'
import api from '@/lib/axios'
import { adminStatusStyles, adminTableHeadClass, adminTableRowClass } from '@/lib/admin'
import { getApiErrorMessage } from '@/lib/errors'
import { formatOrderDate, type OrderStatus } from '@/lib/orders'
import { formatPrice } from '@/lib/products'
import { useAuthStore } from '@/store/auth.store'
import type { ApiResponse, Order, Product } from '@/types'

interface DashboardStats {
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  recentOrders: Order[]
}

export default function AdminDashboardPage() {
  const token = useAuthStore((state) => state.token)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthLoading || !token) return

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
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Error al cargar el dashboard'))
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
  }, [token, isAuthLoading])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-red" />
      </div>
    )
  }

  const metrics = [
    {
      label: 'Productos activos',
      value: stats?.activeProducts ?? 0,
      icon: Package,
      iconClass: 'text-neon-red',
      bgClass: 'border-neon-red/30 bg-neon-red/10'
    },
    {
      label: 'Total de órdenes',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      iconClass: 'text-neon-cyan',
      bgClass: 'border-neon-cyan/30 bg-neon-cyan/10'
    },
    {
      label: 'Pedidos pendientes',
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      iconClass: 'text-amber-400',
      bgClass: 'border-amber-500/30 bg-amber-500/10'
    },
    {
      label: 'Ingresos totales',
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      iconClass: 'text-emerald-400',
      bgClass: 'border-emerald-500/30 bg-emerald-500/10'
    }
  ]

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Resumen general de ShopFlow"
      />

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} padding="md" hover>
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${metric.bgClass}`}
                >
                  <Icon className={`h-6 w-6 ${metric.iconClass}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="mt-8 overflow-hidden" padding="md">
        <h2 className="text-lg font-semibold text-white">Últimas 5 órdenes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className={adminTableHeadClass}>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No hay órdenes registradas
                  </td>
                </tr>
              ) : (
                stats?.recentOrders.map((order) => {
                  const statusKey = order.status as OrderStatus
                  const status = adminStatusStyles[statusKey]

                  return (
                    <tr key={order.id} className={adminTableRowClass}>
                      <td className="px-4 py-3 font-mono text-xs text-neon-cyan">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {order.customer?.full_name || '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        {status && (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        )}
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
      </Card>
    </div>
  )
}
