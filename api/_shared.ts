import type { VercelRequest } from '@vercel/node'

// Code commun aux fonctions IA (les fichiers préfixés par « _ » ne sont pas des routes Vercel).

export const MODEL = 'claude-opus-5-5'

// Limite simple par adresse IP (mémoire de l'instance) pour éviter les abus coûteux.
const WINDOW_MS = 10 * 60 * 1000
const MAX_CALLS = 20
const hits = new Map<string, number[]>()

export function rateLimited(req: VercelRequest) {
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'local'
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_CALLS
}

export const FORMULA_HINTS: Record<string, string> = {
  semaine: 'Formule « La semaine chill » : une seule semaine pour découvrir le service, mets en avant des valeurs sûres et très appréciées.',
  mois: 'Formule « Le mois chill » : 4 semaines, varie au maximum d’une semaine à l’autre (cuisines, protéines, textures) pour éviter la lassitude.',
  postpartum:
    'Formule « Post-partum chill » : 5 semaines après une naissance. Privilégie des plats nourrissants et réconfortants, riches en fer, protéines, fibres et bons gras (poisson, légumineuses, soupes, mijotés), faciles à réchauffer et à manger d’une main. Évite les plats très épicés.',
}
