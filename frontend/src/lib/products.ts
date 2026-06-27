import type { ApiResponse, Category, Product } from '@/types'
import { formatPrice } from './utils'

export { formatPrice }

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ProductsPageData {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export async function fetchProducts(
  params: {
    page?: number
    limit?: number
    category?: string
    search?: string
  },
  revalidate = 3600
): Promise<ProductsPageData> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))
  if (params.category) searchParams.set('category', params.category)
  if (params.search) searchParams.set('search', params.search)

  const query = searchParams.toString()
  const url = `${API_URL}/products${query ? `?${query}` : ''}`

  const response = await fetch(url, {
    next: { revalidate }
  })

  if (!response.ok) {
    return { products: [], total: 0, page: 1, totalPages: 0 }
  }

  const json = (await response.json()) as ApiResponse<ProductsPageData>
  return json.data
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const response = await fetch(`${API_URL}/products/${id}`, {
    next: { revalidate: 60 }
  })

  if (!response.ok) return null

  const json = (await response.json()) as ApiResponse<Product>
  return json.data
}

export async function fetchRelatedProducts(
  categorySlug: string,
  excludeId: string
): Promise<Product[]> {
  const { products } = await fetchProducts(
    { category: categorySlug, limit: 8, page: 1 },
    60
  )

  return products.filter((product) => product.id !== excludeId).slice(0, 4)
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/products/categories`, {
    next: { revalidate: 3600 }
  })

  if (!response.ok) return []

  const json = (await response.json()) as ApiResponse<Category[]>
  return json.data
}

export function filterProductsByPrice(
  products: Product[],
  minPrice?: number,
  maxPrice?: number
) {
  return products.filter((product) => {
    if (minPrice !== undefined && product.price < minPrice) return false
    if (maxPrice !== undefined && product.price > maxPrice) return false
    return true
  })
}
