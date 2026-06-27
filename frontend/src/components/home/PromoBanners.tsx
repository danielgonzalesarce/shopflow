import Link from 'next/link'
import { Headphones, Percent, Sparkles } from 'lucide-react'

const promos = [
  {
    icon: Percent,
    title: 'Ofertas de temporada',
    description: 'Descuentos en electrónica, moda y hogar. Revisa el catálogo cada semana.',
    href: '/productos',
    cta: 'Ver ofertas',
    accent: 'from-indigo-600 to-violet-600'
  },
  {
    icon: Headphones,
    title: 'Top en electrónica',
    description: 'Audífonos, periféricos y gadgets con stock actualizado y envío rápido.',
    href: '/productos?category=electronica',
    cta: 'Explorar tech',
    accent: 'from-slate-800 to-slate-900'
  },
  {
    icon: Sparkles,
    title: 'Nuevos ingresos',
    description: 'Productos recién añadidos al catálogo. Sé el primero en descubrirlos.',
    href: '/productos',
    cta: 'Ver novedades',
    accent: 'from-violet-600 to-purple-700'
  }
]

export default function PromoBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {promos.map((promo) => {
          const Icon = promo.icon

          return (
            <Link
              key={promo.title}
              href={promo.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${promo.accent} p-8 text-white shadow-lg transition-transform hover:-translate-y-1`}
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition-transform group-hover:scale-125" />
              <Icon className="relative h-8 w-8 text-white/90" />
              <h3 className="relative mt-5 text-xl font-bold">{promo.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-white/85">
                {promo.description}
              </p>
              <span className="relative mt-5 inline-block text-sm font-semibold text-white underline-offset-4 group-hover:underline">
                {promo.cta} →
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
