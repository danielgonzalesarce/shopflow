export interface User {
  id: string
  email: string
  full_name: string
  role: 'cliente' | 'admin'
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category_id?: string
  category?: {
    name: string
    slug: string
  }
  is_active: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: Product
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  product: Product
}

export interface Order {
  id: string
  total: number
  status: string
  shipping_address: string
  created_at: string
  items: OrderItem[]
  customer?: {
    full_name: string
    email: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  error: true
  message: string
}
