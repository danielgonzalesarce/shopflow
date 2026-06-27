'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Clock,
  Package,
  ShoppingBag,
  Truck
} from 'lucide-react'
import toast from 'react-hot-toast'
import AuthGuard from '@/components/auth/AuthGuard'
import OrderCard from '@/components/order/OrderCard'
import { OrderListSkeleton } from '@/components/order/OrderCardSkeleton'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import { formatPrice } from '@/lib/products'
import type { ApiResponse, Order } from '@/types'

type StatusFilter = 'all' | 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado'

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'procesando', label: 'Procesando' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' }
]

function MisPedidosContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true)

      try {
        const { data } = await api.get<ApiResponse<Order[]>>('/orders')
        setOrders(data.data)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'No se pudieron cargar tus pedidos'))
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter((order) => order.status === filter)
  }, [orders, filter])

  const stats = useMemo(() => {
    const active = orders.filter(
      (o) => o.status !== 'entregado' && o.status !== 'cancelado'
    ).length
    const totalSpent = orders
      .filter((o) => o.status !== 'cancelado')
      .reduce((sum, o) => sum + o.total, 0)

    return { total: orders.length, active, totalSpent }
  }, [orders])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <PageHeader orderCount={0} />
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <OrderListSkeleton count={3} />
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <PageHeader orderCount={0} />
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-neon-red/30 bg-neon-red/10">
            <Package className="h-12 w-12 text-neon-red" />
          </div>
          <h2 className="mt-8 text-2xl font-extrabold text-white">
            Aún no tienes pedidos registrados
          </h2>
          <p className="mt-3 max-w-md text-slate-400">
            Cuando realices tu primera compra, aparecerá aquí el detalle de tus pedidos.
          </p>
          <Link href="/productos" className="mt-8">
            <Button size="lg">
              Hacer mi primer pedido
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PageHeader orderCount={orders.length} />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neon-red/30 bg-neon-red/10">
                <ShoppingBag className="h-5 w-5 text-neon-red" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total pedidos</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neon-cyan/30 bg-neon-cyan/10">
                <Truck className="h-5 w-5 text-neon-cyan" />
              </div>
              <div>
                <p className="text-xs text-slate-400">En curso</p>
                <p className="text-xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                <Clock className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total gastado</p>
                <p className="text-xl font-bold text-neon-cyan">{formatPrice(stats.totalSpent)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === option.value
                  ? 'border border-neon-red/40 bg-neon-red/15 text-white'
                  : 'border border-[var(--border)] bg-surface text-slate-400 hover:border-neon-cyan/30 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-surface-elevated px-6 py-12 text-center">
            <p className="text-slate-400">No hay pedidos con este filtro.</p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-3 text-sm font-semibold text-neon-cyan hover:text-neon-cyan-light"
            >
              Ver todos los pedidos
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PageHeader({ orderCount }: { orderCount: number }) {
  return (
    <div className="border-b border-[var(--border)] bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
          Tu cuenta
        </span>
        <h1 className="mt-1 text-3xl font-extrabold text-white">Mis pedidos</h1>
        <p className="mt-1 text-slate-400">
          {orderCount === 0
            ? 'Consulta el historial de tus compras'
            : `${orderCount} ${orderCount === 1 ? 'pedido' : 'pedidos'} en tu historial`}
        </p>
      </div>
    </div>
  )
}

export default function MisPedidosPage() {
  return (
    <AuthGuard>
      <MisPedidosContent />
    </AuthGuard>
  )
}
