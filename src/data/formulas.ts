export type FormulaId = 'semaine' | 'mois' | 'postpartum'

export type Formula = {
  id: FormulaId
  name: string
  pitch: string
  weeks: number
  dinners: number[] // nombres de dîners possibles par semaine
  // prix par semaine selon le nombre de dîners
  price: Record<number, number>
  perks: string[]
  badge?: string
}

export const FORMULAS: Formula[] = [
  {
    id: 'semaine',
    name: 'La semaine chill',
    pitch: 'Idéal pour tester, ou pour une semaine où tout s’accélère.',
    weeks: 1,
    dinners: [5],
    price: { 5: 160 },
    perks: ['1 visite de votre cheffe', '5 dîners pour la semaine', 'Sans engagement', 'Pas de renouvellement automatique'],
  },
  {
    id: 'mois',
    name: 'Le mois chill',
    pitch: 'Idéal si vos semaines se ressemblent et que vous voulez souffler.',
    weeks: 4,
    dinners: [3, 4, 5],
    price: { 3: 102.5, 4: 112.5, 5: 120 },
    perks: ['4 visites (1 par semaine)', 'De 3 à 5 dîners par visite', 'La même cheffe et le même créneau', 'Mise en pause possible'],
    badge: 'Formule préférée',
  },
  {
    id: 'postpartum',
    name: 'Post-partum chill',
    pitch: 'Pour une naissance en douceur, et toute la famille.',
    weeks: 5,
    dinners: [5],
    price: { 5: 108 },
    perks: ['5 visites (1 par semaine)', '5 dîners adaptés par visite', 'La même cheffe et le même créneau', 'Mise en pause possible'],
  },
]

export const getFormula = (id: FormulaId) => FORMULAS.find((f) => f.id === id)!

export type OptionId = 'gouter' | 'courses' | 'family'

export const OPTIONS: { id: OptionId; name: string; desc: string; price: number; emoji: string }[] = [
  { id: 'gouter', name: 'Un goûter maison', desc: 'Un goûter sucré préparé en double, pour les petits et les grands.', price: 15, emoji: '🍪' },
  { id: 'courses', name: 'Les courses par nos soins', desc: 'On fait les courses avant la venue. Produits réglés en plus, au prix réel du ticket.', price: 20, emoji: '🛒' },
  { id: 'family', name: 'Family + : portions généreuses', desc: 'On double les quantités pour les grandes tablées ou les restes du midi.', price: 20, emoji: '👨‍👩‍👧‍👦' },
]

export const SUBSCRIPTIONS = [
  { id: 'none', label: 'Sans abonnement', months: 0, perks: ['Vous arrêtez quand vous voulez'] },
  { id: '3', label: '3 mois', months: 3, perks: ['1 goûter offert / mois', '3 pauses possibles', 'Recettes favorites'] },
  { id: '6', label: '6 mois', months: 6, perks: ['1 goûter offert / mois', '6 pauses possibles', 'Recettes favorites'] },
  { id: '9', label: '9 mois', months: 9, perks: ['1 goûter offert / mois', '9 pauses possibles', 'Recettes favorites', 'Recettes inédites'] },
] as const

export type SubscriptionId = (typeof SUBSCRIPTIONS)[number]['id']

export const GIFT_PRESETS = [
  { id: 'semaine', name: 'La semaine chill', amount: 160, desc: '5 dîners, une seule semaine. Parfait pour tester.' },
  { id: 'mois', name: 'Le mois chill', amount: 410, desc: 'Entre 3 et 5 dîners par semaine, pendant 4 semaines.' },
  { id: 'postpartum', name: 'Post-partum chill', amount: 540, desc: '5 dîners par semaine, 5 semaines, pour les jeunes parents.' },
]
