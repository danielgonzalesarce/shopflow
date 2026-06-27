'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  X
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useFavoritesStore } from '@/store/favorites.store'
import { useUiStore } from '@/store/ui.store'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' }
]

function IconButton({
  children,
  badge,
  onClick,
  label,
  light = false
}: {
  children: React.ReactNode
  badge?: number
  onClick?: () => void
  label: string
  light?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
        light
          ? 'border-white/25 bg-white/10 text-white hover:border-neon-cyan/50 hover:bg-neon-cyan/10'
          : 'border-[var(--border)] bg-surface-elevated text-slate-300 hover:border-neon-red/40 hover:bg-neon-red/10 hover:text-neon-red'
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className={`absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ${
            light ? 'bg-neon-red ring-slate-900/50' : 'bg-neon-red ring-[var(--background)]'
          }`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const itemCount = useCartStore((state) => state.itemCount)
  const favCount = useFavoritesStore((state) => state.itemCount)
  const setCartOpen = useUiStore((state) => state.setCartOpen)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    if (!isHome) {
      setScrolled(false)
      return
    }

    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    setMobileOpen(false)
  }

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    router.push(query ? `/productos?search=${encodeURIComponent(query)}` : '/productos')
    setMobileOpen(false)
  }

  const openCart = () => {
    setCartOpen(true)
    setMobileOpen(false)
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        transparent
          ? 'border-b border-white/10 bg-transparent'
          : 'border-b border-[var(--border)] bg-[var(--background)]/95 shadow-sm backdrop-blur-md glass-dark'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo size="md" variant={transparent ? 'white' : 'default'} />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                transparent
                  ? isActive(link.href)
                    ? 'bg-neon-red/20 text-white shadow-sm shadow-neon-red/20'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                  : isActive(link.href)
                    ? 'bg-neon-red/15 text-neon-red'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden flex-1 md:block md:max-w-lg">
          <div className="relative">
            <Search
              className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                transparent ? 'text-white/60' : 'text-slate-400'
              }`}
            />
            <input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 ${
                transparent
                  ? 'border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/15 focus:ring-white/10'
                  : 'border-[var(--border)] bg-surface text-white placeholder:text-slate-500 focus:border-neon-red focus:bg-surface-elevated focus:ring-neon-red/15'
              }`}
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <IconButton
            label="Favoritos"
            badge={favCount}
            light={transparent}
            onClick={() => router.push('/favoritos')}
          >
            <Heart
              className={`h-[18px] w-[18px] ${favCount > 0 ? 'fill-neon-red text-neon-red' : ''}`}
            />
          </IconButton>

          <IconButton label="Carrito" badge={itemCount} light={transparent} onClick={openCart}>
            <ShoppingCart className="h-[18px] w-[18px]" />
          </IconButton>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`flex items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-3 text-sm font-semibold transition-all ${
                  transparent
                    ? 'border-white/25 bg-white/10 text-white hover:border-white/40'
                    : 'border-[var(--border)] bg-surface-elevated text-slate-200 hover:border-neon-red/40 hover:shadow-md hover:shadow-neon-red/10'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-red text-xs font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[90px] truncate">{user.full_name.split(' ')[0]}</span>
                <ChevronDown
                  className={`h-4 w-4 ${transparent ? 'text-white/70' : 'text-slate-400'}`}
                />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-surface-elevated py-1 shadow-xl shadow-black/40">
                    <div className="border-b border-[var(--border)] px-4 py-3">
                      <p className="truncate text-sm font-bold text-white">{user.full_name}</p>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>
                    <Link
                      href="/mis-pedidos"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-neon-cyan"
                    >
                      <Package className="h-4 w-4" />
                      Mis pedidos
                    </Link>
                    <Link
                      href="/favoritos"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-neon-cyan"
                    >
                      <Heart className="h-4 w-4" />
                      Favoritos
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-neon-cyan"
                      >
                        Panel admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/login">
                <Button
                  variant={transparent ? 'outline-light' : 'ghost'}
                  size="sm"
                  className={transparent ? '' : 'border-transparent'}
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  <ShoppingBag className="mr-1.5 h-4 w-4" />
                  Registrarse
                </Button>
              </Link>
            </div>
          )}

          <button
            className={`rounded-xl border p-2.5 lg:hidden ${
              transparent
                ? 'border-white/25 text-white hover:bg-white/10'
                : 'border-[var(--border)] text-slate-300'
            }`}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className={`border-t px-4 py-4 lg:hidden ${
            transparent ? 'border-white/10 bg-slate-950/90 backdrop-blur-md' : 'border-[var(--border)] bg-surface'
          }`}
        >
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search
                className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  transparent ? 'text-white/60' : 'text-slate-400'
                }`}
              />
              <input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 ${
                  transparent
                    ? 'border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:ring-white/10'
                    : 'border-[var(--border)] bg-surface text-white focus:border-neon-red focus:ring-neon-red/15'
                }`}
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  transparent
                    ? isActive(link.href)
                      ? 'bg-white/15 text-white'
                      : 'text-white/90'
                    : isActive(link.href)
                      ? 'bg-neon-red/15 text-neon-red'
                      : 'text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/mis-pedidos"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    transparent ? 'text-white/90' : 'text-slate-300'
                  }`}
                >
                  Mis pedidos
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-400"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant={transparent ? 'outline-light' : 'outline'} className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
