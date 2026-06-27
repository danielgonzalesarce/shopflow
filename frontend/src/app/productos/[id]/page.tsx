import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailView from './ProductDetailView'
import {
  fetchProductById,
  fetchProducts,
  fetchRelatedProducts,
  getProductImages
} from '@/lib/products'

export const revalidate = 60

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  try {
    const { products } = await fetchProducts({ limit: 20, page: 1 }, 60)
    return products.map((product) => ({ id: product.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await fetchProductById(id)

  if (!product) {
    return {
      title: 'Producto no encontrado | ShopFlow',
      description: 'El producto que buscas no está disponible.'
    }
  }

  const description =
    product.description?.slice(0, 160) ||
    `Compra ${product.name} en ShopFlow. Precio en soles peruanos.`

  return {
    title: `${product.name} | ShopFlow`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      locale: 'es_PE',
      ...(getProductImages(product).length
        ? { images: getProductImages(product).map((url) => ({ url })) }
        : {})
    }
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await fetchProductById(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = product.category?.slug
    ? await fetchRelatedProducts(product.category.slug, product.id)
    : []

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />
}
