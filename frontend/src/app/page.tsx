import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  Home as HomeIcon,
  Laptop,
  Shirt,
  Sparkles
} from 'lucide-react'
import Button from '@/components/ui/Button'
import ProductGrid from '@/components/product/ProductGrid'
import { fetchCategories, fetchProducts } from '@/lib/products'
import type { Category } from '@/types'

export const revalidate = 3600

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
  electronica: <Laptop className="h-7 w-7" />,
  ropa: <Shirt className="h-7 w-7" />,
  hogar: <HomeIcon className="h-7 w-7" />
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/productos?category=${category.slug}`}
      className="group flex flex-col items-center rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
        {categoryIcons[category.slug] || <Sparkles className="h-7 w-7" />}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{category.name}</h3>
      <p className="mt-1 text-sm text-slate-500">Ver productos</p>
    </Link>
  )
}

export default async function Home() {
  const [featuredData, categories] = await Promise.all([
    fetchProducts({ limit: 8, page: 1 }),
    fetchCategories()
  ])

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%221%22 cy=%221%22 r=%221%22/%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">
            Bienvenido a ShopFlow
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Compra smart.
            <br />
            Vive mejor.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
            Encuentra los mejores productos de electrónica, moda y hogar con
            precios en soles y entrega confiable en todo el Perú.
          </p>
          <div className="mt-10">
            <Link href="/productos">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                Explorar catálogo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Productos destacados</h2>
            <p className="mt-2 text-slate-600">Los últimos productos agregados a nuestra tienda</p>
          </div>
          <Link
            href="/productos"
            className="hidden text-sm font-medium text-indigo-500 transition-colors hover:text-indigo-600 sm:block"
          >
            Ver todos →
          </Link>
        </div>
        <ProductGrid products={featuredData.products} />
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Compra por categoría</h2>
            <p className="mt-2 text-slate-600">
              Encuentra lo que necesitas navegando por nuestras categorías
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
