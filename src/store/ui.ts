import { create } from 'zustand'

// État d'interface partagé : recherche rapide et assistant.
type UiState = {
  searchOpen: boolean
  assistantOpen: boolean
  /** Question envoyée à l'ouverture de l'assistant (ex. depuis la recherche). */
  assistantPrompt: string
  openSearch: () => void
  closeSearch: () => void
  openAssistant: (prompt?: string) => void
  closeAssistant: () => void
}

export const useUi = create<UiState>()((set) => ({
  searchOpen: false,
  assistantOpen: false,
  assistantPrompt: '',
  openSearch: () => set({ searchOpen: true, assistantOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  openAssistant: (prompt = '') => set({ assistantOpen: true, searchOpen: false, assistantPrompt: prompt }),
  closeAssistant: () => set({ assistantOpen: false, assistantPrompt: '' }),
}))
