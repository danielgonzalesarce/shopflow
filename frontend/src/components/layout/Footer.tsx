import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const footerLinks = {
  tienda: [
    { href: '/productos', label: 'Catálogo' },
    { href: '/productos?category=electronica', label: 'Electrónica' },
    { href: '/productos?category=ropa', label: 'Moda' },
    { href: '/productos?category=hogar', label: 'Hogar' }
  ],
  cuenta: [
    { href: '/auth/login', label: 'Iniciar sesión' },
    { href: '/auth/register', label: 'Crear cuenta' },
    { href: '/mis-pedidos', label: 'Mis pedidos' },
    { href: '/favoritos', label: 'Favoritos' },
    { href: '/carrito', label: 'Carrito' }
  ]
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-[var(--border)] bg-[var(--background)] text-slate-300">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-neon-red/5 to-neon-cyan/5"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo variant="white" size="lg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Tu destino de compras online en Perú. Tecnología, moda y hogar con
              la mejor experiencia de usuario.
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-neon-cyan" />
                Lima, Perú
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-neon-cyan" />
                contacto@shopflow.pe
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-neon-cyan" />
                +51 999 888 777
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Tienda
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.tienda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-neon-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Mi cuenta
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.cuenta.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-neon-red"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Proyecto final
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              E-commerce full stack con Next.js, Express, Supabase y despliegue en
              Vercel + Render.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-neon-red/30 bg-neon-red/10 px-4 py-2 text-xs font-medium text-neon-red">
              <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
              Stack moderno 2026
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {currentYear} ShopFlow. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-600">
            Hecho con Next.js · Express · Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
