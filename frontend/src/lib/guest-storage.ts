import type { Product } from '@/types'

export const GUEST_CART_KEY = 'shopflow_guest_cart'
export const GUEST_FAVORITES_KEY = 'shopflow_guest_favorites'
export const AUTH_REDIRECT_KEY = 'shopflow_auth_redirect'

export interface GuestCartItem {
  product_id: string
  quantity: number
  product: Product
}

export function loadGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : []
  } catch {
    return []
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export function clearGuestCart() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_CART_KEY)
}

export function loadGuestFavorites(): Product[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(GUEST_FAVORITES_KEY)
    return raw ? (JSON.parse(raw) as Product[]) : []
  } catch {
    return []
  }
}

export function saveGuestFavorites(products: Product[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(products))
}

export function clearGuestFavorites() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_FAVORITES_KEY)
}

export function setAuthRedirect(path: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_REDIRECT_KEY, path)
}

export function consumeAuthRedirect(fallback = '/'): string {
  if (typeof window === 'undefined') return fallback
  const path = localStorage.getItem(AUTH_REDIRECT_KEY) || fallback
  localStorage.removeItem(AUTH_REDIRECT_KEY)
  return path
}

export function guestCartToState(items: GuestCartItem[]) {
  const cartItems = items.map((item) => ({
    id: `guest-${item.product_id}`,
    product_id: item.product_id,
    quantity: item.quantity,
    product: item.product
  }))
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  return { items: cartItems, total, itemCount }
}

export function guestFavoritesToState(products: Product[]) {
  const items = products.map((product, index) => ({
    id: `guest-fav-${product.id}`,
    product_id: product.id,
    created_at: new Date().toISOString(),
    product
  }))
  return {
    items,
    itemCount: products.length,
    productIds: products.map((p) => p.id)
  }
}
