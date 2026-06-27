import { create } from 'zustand'
import api from '@/lib/axios'
import type { ApiResponse, User } from '@/types'
import { useCartStore } from '@/store/cart.store'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => Promise<void>
}

interface AuthPayload {
  token: string
  user: User
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })

    try {
      const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/login', {
        email,
        password
      })

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      set({
        user: data.data.user,
        token: data.data.token,
        isLoading: false
      })

      await useCartStore.getState().fetchCart()
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (email, password, full_name) => {
    set({ isLoading: true })

    try {
      const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/register', {
        email,
        password,
        full_name
      })

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      set({
        user: data.data.user,
        token: data.data.token,
        isLoading: false
      })

      await useCartStore.getState().fetchCart()
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    set({ user: null, token: null })
    useCartStore.getState().reset()
  },

  loadFromStorage: async () => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token) {
      set({ user: null, token: null })
      return
    }

    set({ token, isLoading: true })

    try {
      if (storedUser) {
        set({ user: JSON.parse(storedUser) as User })
      }

      const { data } = await api.get<ApiResponse<User>>('/auth/me')
      localStorage.setItem('user', JSON.stringify(data.data))
      set({ user: data.data, token, isLoading: false })

      await useCartStore.getState().fetchCart()
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isLoading: false })
      useCartStore.getState().reset()
    }
  }
}))
