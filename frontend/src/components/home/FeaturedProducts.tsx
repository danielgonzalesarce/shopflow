'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import api from '@/lib/axios'
import ProductGrid from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton'
import type { ApiResponse, Product } from '@/types'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get<ApiResponse<ProductsResponse>>(
          '/products?page=1&limit=8'
        )
        setProducts(data.data.products)
      } catch {
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Destacados
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Productos populares
          </h2>
          <p className="mt-2 text-slate-600">
            Catálogo actualizado con imágenes y stock en tiempo real
          </p>
        </div>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Ver catálogo completo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? <ProductGridSkeleton count={8} /> : <ProductGrid products={products} />}
    </section>
  )
}
