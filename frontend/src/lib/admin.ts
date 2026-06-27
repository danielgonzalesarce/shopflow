import type { OrderStatus } from './utils'

export const adminStatusStyles: Record<OrderStatus, { label: string; className: string }> = {
  pendiente: {
    label: 'Pendiente',
    className: 'border border-amber-500/40 bg-amber-500/15 text-amber-300'
  },
  procesando: {
    label: 'Procesando',
    className: 'border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
  },
  enviado: {
    label: 'Enviado',
    className: 'border border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
  },
  entregado: {
    label: 'Entregado',
    className: 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
  },
  cancelado: {
    label: 'Cancelado',
    className: 'border border-red-500/40 bg-red-500/15 text-red-300'
  }
}

export const adminTableHeadClass =
  'bg-white/[0.03] text-xs font-semibold uppercase tracking-wider text-slate-500'

export const adminTableRowClass =
  'border-t border-[var(--border)] transition-colors hover:bg-white/[0.02]'

export const adminSelectClass =
  'rounded-xl border border-[var(--border)] bg-surface px-4 py-2.5 text-sm text-white focus:border-neon-red/50 focus:outline-none focus:ring-2 focus:ring-neon-red/20'
