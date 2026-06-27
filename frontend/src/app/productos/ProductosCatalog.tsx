'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import api from '@/lib/axios'
import { filterProductsByPrice } from '@/lib/products'
import ProductGrid from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { ApiResponse, Category, Product } from '@/types'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export default function ProductosCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || '1')
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const [searchInput, setSearchInput] = useState(search)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null, page: '1' })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, search, updateParams])

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get<ApiResponse<Category[]>>('/products/categories')
        setCategories(data.data)
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '12'
        })

        if (category) params.set('category', category)
        if (search) params.set('search', search)

        const { data } = await api.get<ApiResponse<ProductsResponse>>(
          `/products?${params.toString()}`
        )

        const min = minPrice ? Number(minPrice) : undefined
        const max = maxPrice ? Number(maxPrice) : undefined

        const filtered = filterProductsByPrice(data.data.products, min, max)

        setProducts(filtered)
        setTotalPages(data.data.totalPages)
      } catch {
        setProducts([])
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [category, search, page, minPrice, maxPrice])

  const toggleCategory = (slug: string) => {
    updateParams({
      category: category === slug ? null : slug,
      page: '1'
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Catálogo de productos</h1>
        <p className="mt-2 text-slate-600">
          Explora nuestra selección y encuentra lo que necesitas
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Buscar productos..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          aria-label="Buscar productos"
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Filtros</h2>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700">Categorías</h3>
              <div className="mt-3 space-y-2">
                {categories.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={category === item.slug}
                      onChange={() => toggleCategory(item.slug)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700">Precio (S/.)</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Input
                  label="Mínimo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={minPrice}
                  onChange={(event) =>
                    updateParams({ minPrice: event.target.value || null, page: '1' })
                  }
                />
                <Input
                  label="Máximo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="999.99"
                  value={maxPrice}
                  onChange={(event) =>
                    updateParams({ maxPrice: event.target.value || null, page: '1' })
                  }
                />
              </div>
            </div>

            {(category || minPrice || maxPrice || search) && (
              <button
                onClick={() => router.push(pathname)}
                className="mt-6 w-full text-sm font-medium text-indigo-500 transition-colors hover:text-indigo-600"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : (
            <>
              <ProductGrid products={products} />

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-slate-600">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
