import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cuisine, Diet, Equipment } from '../data/recipes'
import { getFormula, OPTIONS, type FormulaId, type OptionId, type SubscriptionId } from '../data/formulas'

export type Address = {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  extra: string
  cp: string
  city: string
  access: string
}

export type BookingState = {
  adults: number
  kids: number
  diets: Diet[]
  avoid: string[]
  cuisines: Cuisine[]
  equipment: Equipment[]
  formula: FormulaId
  dinners: number
  subscription: SubscriptionId
  menus: Record<number, string[]>
  seed: number
  options: OptionId[]
  startDate: string
  slot: string
  address: Address
  comment: string
  giftCode: string
  accepted: boolean
  confirmed: { ref: string; summary: string; sent: boolean } | null
  // Assistant IA
  aiWishes: string
  aiIngredients: string[]
  aiNotes: Record<string, string>
  aiMessage: string
  set: (p: Partial<BookingState>) => void
  setAddress: (p: Partial<Address>) => void
  toggle: <K extends 'diets' | 'cuisines' | 'equipment' | 'options'>(key: K, v: BookingState[K][number]) => void
  reset: () => void
}

const initial = {
  adults: 2,
  kids: 0,
  diets: [] as Diet[],
  avoid: [] as string[],
  cuisines: [] as Cuisine[],
  equipment: ['four', 'plaques', 'micro'] as Equipment[],
  formula: 'mois' as FormulaId,
  dinners: 4,
  subscription: 'none' as SubscriptionId,
  menus: {} as Record<number, string[]>,
  seed: 1,
  options: [] as OptionId[],
  startDate: '',
  slot: '',
  address: { firstName: '', lastName: '', email: '', phone: '', street: '', extra: '', cp: '', city: '', access: '' },
  comment: '',
  giftCode: '',
  accepted: false,
  confirmed: null as BookingState['confirmed'],
  aiWishes: '',
  aiIngredients: [] as string[],
  aiNotes: {} as Record<string, string>,
  aiMessage: '',
}

export const useBooking = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initial,
      set: (p) => set(p),
      setAddress: (p) => set({ address: { ...get().address, ...p } }),
      toggle: (key, v) => {
        const arr = get()[key] as unknown[]
        set({ [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] } as Partial<BookingState>)
      },
      reset: () => set({ ...initial, seed: Math.floor(Math.random() * 1e6) }),
    }),
    { name: 'hc-booking' },
  ),
)

export function pricing(s: Pick<BookingState, 'formula' | 'dinners' | 'options'>) {
  const f = getFormula(s.formula)
  const dinners = f.dinners.includes(s.dinners) ? s.dinners : f.dinners[f.dinners.length - 1]
  const base = f.price[dinners]
  const opts = OPTIONS.filter((o) => s.options.includes(o.id))
  const weekly = base + opts.reduce((n, o) => n + o.price, 0)
  return { f, dinners, base, opts, weekly, total: weekly * f.weeks, perDinner: base / dinners }
}
