// Réglages du site : modifiez ici les coordonnées, zones et tarifs.

export const SITE = {
  name: 'Hannane Cooking',
  short: 'hannane',
  tagline: 'Batch cooking à domicile',
  phone: '06 00 00 00 00',
  // Numéro WhatsApp au format international, sans "+" ni espaces.
  whatsapp: '33600000000',
  email: 'contact@hannanecooking.fr',
  instagram: 'https://instagram.com/',
  // Point d'envoi optionnel (Formspree, Web3Forms, webhook…). Laisser vide pour
  // n'utiliser que WhatsApp / e-mail.
  formEndpoint: '',
  hours: 'Lun – Sam · 9h – 19h',
}

export type Zone = { name: string; prefixes: string[] }

export const ZONES: Zone[] = [
  { name: 'Île-de-France', prefixes: ['75', '77', '78', '91', '92', '93', '94', '95'] },
  { name: 'Nantes', prefixes: ['44'] },
  { name: 'Bordeaux', prefixes: ['33'] },
  { name: 'Lille', prefixes: ['59'] },
  { name: 'Lyon', prefixes: ['69'] },
  { name: 'Marseille', prefixes: ['13'] },
]

export function zoneForPostalCode(cp: string): Zone | undefined {
  if (!/^\d{5}$/.test(cp)) return undefined
  return ZONES.find((z) => z.prefixes.some((p) => cp.startsWith(p)))
}

// Délai minimum avant une prestation (heures).
export const MIN_NOTICE_HOURS = 48

export const SLOTS = [
  { id: 'matin', label: 'Matin', range: '9h – 11h', emoji: '🌅' },
  { id: 'midi', label: 'Midi', range: '11h – 13h', emoji: '☀️' },
  { id: 'aprem', label: 'Après-midi', range: '14h – 16h', emoji: '🌤️' },
  { id: 'soir', label: 'Fin de journée', range: '16h – 18h', emoji: '🌇' },
] as const
