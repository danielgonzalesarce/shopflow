import { fetchProducts } from '@/lib/products'
import ProductSpotlightList from './ProductSpotlightList'

export default async function ProductSpotlightRows() {
  const { products } = await fetchProducts({ page: 1, limit: 6 }, 300)

  return <ProductSpotlightList products={products} />
}
