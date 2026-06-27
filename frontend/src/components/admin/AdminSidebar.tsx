'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  LayoutDashboard,
  Package,
  ShoppingBag
} from 'lucide-react'
import Logo from '@/components/ui/Logo'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--border)] bg-surface">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <div>
          <Logo href="/admin" size="md" />
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-cyan">
            Panel Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const active = isActive(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? 'border border-neon-red/30 bg-neon-red/10 text-white shadow-[0_0_20px_rgba(229,57,53,0.15)]'
                  : 'border border-transparent text-slate-400 hover:border-[var(--border)] hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? 'text-neon-red' : 'text-slate-500 group-hover:text-neon-cyan'}`}
              />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-slate-400 transition-colors hover:border-neon-cyan/30 hover:text-neon-cyan"
        >
          <ExternalLink className="h-4 w-4" />
          Ver tienda
        </Link>
      </div>
    </aside>
  )
}
