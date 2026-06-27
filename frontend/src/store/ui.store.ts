import { create } from 'zustand'

interface UiState {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  toggleCart: () => void
}

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen }))
}))
