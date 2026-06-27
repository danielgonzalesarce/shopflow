'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthGuard from '@/components/auth/AuthGuard'
import OrderCard from '@/components/order/OrderCard'
import { OrderListSkeleton } from '@/components/order/OrderCardSkeleton'
import Button from '@/components/ui/Button'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import type { ApiResponse, Order } from '@/types'

function MisPedidosContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Mis pedidos</h1>
        <p className="mt-2 text-slate-600">Consulta el historial de tus compras</p>
        <div className="mt-8">
          <OrderListSkeleton count={3} />
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <Package className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Aún no tienes pedidos registrados
        </h1>
        <p className="mt-3 text-slate-600">
          Cuando realices tu primera compra, aparecerá aquí el detalle de tus pedidos.
        </p>
        <Link href="/productos" className="mt-8">
          <Button size="lg">Hacer mi primer pedido</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Mis pedidos</h1>
      <p className="mt-2 text-slate-600">
        {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en tu historial
      </p>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
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
