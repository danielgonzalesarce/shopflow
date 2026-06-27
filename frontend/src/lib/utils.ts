export type OrderStatus =
  | 'pendiente'
  | 'procesando'
  | 'enviado'
  | 'entregado'
  | 'cancelado'

export const orderStatusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pendiente: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-amber-800'
  },
  procesando: {
    label: 'Procesando',
    className: 'bg-blue-100 text-blue-900'
  },
  enviado: {
    label: 'Enviado',
    className: 'bg-indigo-500 text-white'
  },
  entregado: {
    label: 'Entregado',
    className: 'bg-green-100 text-green-800'
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800'
  }
}

export function formatPrice(price: number): string {
  return `S/. ${price.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

export function getStatusLabel(status: string): { text: string; color: string } {
  const config = orderStatusConfig[status as OrderStatus]

  if (!config) {
    return {
      text: status,
      color: 'bg-slate-100 text-slate-700'
    }
  }

  return {
    text: config.label,
    color: config.className
  }
}

export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}...`
}
