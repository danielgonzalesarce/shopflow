'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store
} from 'lucide-react'

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
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-slate-900 text-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <Store className="h-6 w-6 text-indigo-400" />
        <div>
          <p className="font-bold text-white">ShopFlow</p>
          <p className="text-xs text-slate-400">Panel Admin</p>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const active = isActive(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
