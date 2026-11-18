import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Plats favoris, gardés sur l'appareil (pas de compte).
type FavState = {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useFavs = create<FavState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set({ ids: get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id] }),
      has: (id) => get().ids.includes(id),
    }),
    { name: 'hc-favs' },
  ),
)
