import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Home as HomeIcon,
  Laptop,
  ShieldCheck,
  Shirt,
  Truck,
  Zap
} from 'lucide-react'
import Button from '@/components/ui/Button'
import ProductSpotlightRows from '@/components/home/ProductSpotlightRows'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import StatsBanner from '@/components/home/StatsBanner'
import FaqSection from '@/components/home/FaqSection'
import NewsletterSection from '@/components/home/NewsletterSection'
import { fetchCategories } from '@/lib/products'
import type { Category } from '@/types'

export const revalidate = 3600

const HERO_BG = '/images/hero-ecommerce.jpg'

export const metadata: Metadata = {
  title: 'ShopFlow — Tu tienda online de confianza',
  description:
    'Compra electrónica, ropa y productos para el hogar con envío rápido. Descubre las mejores ofertas en ShopFlow Perú.',
  openGraph: {
    title: 'ShopFlow — Tu tienda online de confianza',
    description:
      'Compra electrónica, ropa y productos para el hogar con envío rápido en Perú.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'ShopFlow'
  }
}

const categoryIcons: Record<string, ReactNode> = {
  electronica: <Laptop className="h-8 w-8" />,
  ropa: <Shirt className="h-8 w-8" />,
  hogar: <HomeIcon className="h-8 w-8" />
}

const features = [
  {
    icon: Truck,
    title: 'Envío a todo el Perú',
    description: 'Entrega confiable en Lima y provincias con seguimiento en tiempo real.'
  },
  {
    icon: ShieldCheck,
    title: 'Compra 100% segura',
    description: 'Pagos protegidos y datos encriptados en cada transacción.'
  },
  {
    icon: Zap,
    title: 'Checkout express',
    description: 'Finaliza tu compra en minutos con un flujo optimizado.'
  }
]

const stats = [
  { value: '20+', label: 'Productos' },
  { value: '3', label: 'Categorías' },
  { value: '24/7', label: 'Disponible' },
  { value: '100%', label: 'Satisfacción' }
]

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/productos?category=${category.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-surface-elevated p-8 shadow-sm card-hover"
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-neon-red/10 transition-transform group-hover:scale-150" />
      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-red text-white shadow-lg shadow-neon-red/30 transition-transform group-hover:scale-110 neon-glow-red">
          {categoryIcons[category.slug] || <Laptop className="h-8 w-8" />}
        </div>
        <h3 className="mt-5 text-lg font-bold text-white">{category.name}</h3>
        <p className="mt-2 text-sm text-slate-400">Explorar colección</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-neon-cyan opacity-0 transition-opacity group-hover:opacity-100">
          Ver productos <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

export default async function Home() {
  const categories = await fetchCategories()

  return (
    <div>
      <section className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${HERO_BG}")` }}
          aria-hidden
        />
        <div className="absolute inset-0 z-[1] bg-black/50" aria-hidden />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-neon-red/10 to-neon-cyan/10"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-1.5 text-sm font-semibold text-neon-cyan backdrop-blur-md">
              E-commerce de nueva generación
            </span>
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Compra smart.
              <br />
              <span className="neon-text-cyan">Vive mejor.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">
              Descubre más de 20 productos seleccionados en electrónica, moda y hogar.
              Precios en soles, experiencia premium y envío confiable.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/productos">
                <Button size="lg" className="min-w-[220px]">
                  Explorar catálogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline-light" className="min-w-[220px]">
                  Crear cuenta gratis
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-neon-red/30 bg-black/30 px-4 py-5 text-center backdrop-blur-md"
              >
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-surface py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neon-red/15 text-neon-red">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductSpotlightRows />

      <HowItWorks />

      <section className="section-gradient px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
              Categorías
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              Compra por categoría
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">
              Navega por nuestras colecciones curadas para encontrar exactamente lo que buscas
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <StatsBanner />

      <Testimonials />

      <FaqSection />

      <NewsletterSection />

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative min-h-[320px] overflow-hidden rounded-3xl px-8 py-14 text-center shadow-2xl sm:min-h-[360px] sm:px-16">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${HERO_BG}")` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/60" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-red/20 via-transparent to-neon-cyan/20" aria-hidden />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              ¿Listo para empezar?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-200">
              Regístrate gratis, explora el catálogo y realiza tu primera compra hoy mismo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/productos">
                <Button size="lg" className="min-w-[180px]">
                  Ir al catálogo
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline-light" className="min-w-[180px]">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
