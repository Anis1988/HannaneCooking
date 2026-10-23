import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod/v4'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { CUISINES, DIETS, EQUIPMENTS, RECIPES, isCompatible, proposeMenu, type Cuisine, type Diet, type Equipment } from '../src/data/recipes.js'

// Composition de menus par Claude, limitée au catalogue (chaque plat a sa photo).
// Nécessite la variable d'environnement ANTHROPIC_API_KEY sur Vercel.

const MODEL = 'claude-opus-5-5'
const MAX_IMAGE_BYTES = 1_500_000

// Limite simple par adresse IP (mémoire de l'instance) pour éviter les abus coûteux.
const WINDOW_MS = 10 * 60 * 1000
const MAX_CALLS = 12
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_CALLS
}

const Body = z.object({
  wishes: z.string().max(600).default(''),
  ingredients: z.array(z.string().max(40)).max(30).default([]),
  photo: z
    .object({ mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']), data: z.string() })
    .nullish(),
  adults: z.number().int().min(1).max(10).default(2),
  kids: z.number().int().min(0).max(10).default(0),
  diets: z.array(z.string()).default([]),
  avoid: z.array(z.string().max(40)).max(30).default([]),
  equipment: z.array(z.string()).default([]),
  cuisines: z.array(z.string()).default([]),
  dinners: z.number().int().min(1).max(7).default(5),
  weeks: z.number().int().min(1).max(5).default(1),
})
export type MenuRequest = z.input<typeof Body>

const Answer = z.object({
  detected_ingredients: z.array(z.string()).describe('Ingrédients repérés sur la photo (vide sans photo)'),
  message: z.string().describe('Une ou deux phrases chaleureuses pour le client, en français'),
  weeks: z.array(
    z.object({
      dishes: z.array(z.object({ id: z.string(), why: z.string().describe('Raison courte (max 12 mots), en français') })),
    }),
  ),
})

export type MenuResponse = {
  message: string
  detectedIngredients: string[]
  weeks: { id: string; why: string }[][]
}

const SYSTEM = `Tu es l'assistante culinaire de Hannane Cooking, un service de batch cooking à domicile : une cheffe cuisine chez le client les dîners de la semaine.
Ta mission : composer les menus en choisissant UNIQUEMENT des plats du catalogue fourni (par leur id). N'invente jamais de plat.
Règles :
- Respecte les envies du client et privilégie les plats qui utilisent les ingrédients qu'il a déjà (texte ou photo).
- Varie les plats : pas de doublon dans une même semaine, et évite de répéter un plat d'une semaine à l'autre quand le catalogue le permet.
- Avec des enfants, inclus des plats « kids ».
- Équilibre : alterne viande, poisson et végétarien quand le régime le permet.
- La raison ("why") est courte, concrète et parle au client (ex. « utilise vos courgettes et le riz du placard »).
- Si une photo est fournie, liste les ingrédients que tu y reconnais dans detected_ingredients.
Tout le texte destiné au client est en français.`

const lists = <T extends string>(ids: string[], all: { id: T }[]) => ids.filter((x): x is T => all.some((a) => a.id === x))

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Assistant IA non configuré' })

  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'local'
  if (limited(ip)) return res.status(429).json({ error: 'Trop de demandes, réessayez dans quelques minutes.' })

  const parsed = Body.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Requête invalide' })
  const b = parsed.data
  if (b.photo && b.photo.data.length * 0.75 > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'Photo trop lourde' })

  const diets = lists<Diet>(b.diets, DIETS)
  const equipment = lists<Equipment>(b.equipment, EQUIPMENTS)
  const cuisines = lists<Cuisine>(b.cuisines, CUISINES)
  // Les contraintes dures (régime, allergies, équipement) sont appliquées ici, pas laissées au modèle.
  const pool = RECIPES.filter((r) => isCompatible(r, diets, b.avoid, equipment))
  if (!pool.length) return res.status(200).json({ message: 'Aucun plat ne correspond à vos critères.', detectedIngredients: [], weeks: [] } satisfies MenuResponse)

  const count = Math.min(b.dinners, pool.length)
  const catalog = pool.map((r) => ({ id: r.id, nom: r.name, cuisine: r.cuisine, ingredients: r.ingredients, kids: !!r.kids }))
  const brief = [
    `Foyer : ${b.adults} adulte(s), ${b.kids} enfant(s).`,
    `Nombre de semaines : ${b.weeks}. Dîners par semaine : ${count}.`,
    cuisines.length ? `Cuisines préférées : ${cuisines.join(', ')}.` : '',
    b.ingredients.length ? `Ingrédients à utiliser : ${b.ingredients.join(', ')}.` : '',
    b.wishes.trim() ? `Envies du client : « ${b.wishes.trim()} »` : '',
    `Catalogue (JSON) :\n${JSON.stringify(catalog)}`,
  ]
    .filter(Boolean)
    .join('\n')

  const content: Anthropic.Beta.BetaContentBlockParam[] = []
  if (b.photo) content.push({ type: 'image', source: { type: 'base64', media_type: b.photo.mediaType, data: b.photo.data } })
  content.push({ type: 'text', text: brief })

  try {
    const client = new Anthropic()
    const msg = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(Answer) },
      system: SYSTEM,
      messages: [{ role: 'user', content }],
    })
    if (msg.stop_reason === 'refusal' || !msg.parsed_output) {
      return res.status(502).json({ error: 'L’assistant n’a pas pu composer de menu.' })
    }
    return res.status(200).json(sanitize(msg.parsed_output, pool, count, b.weeks, cuisines, b.kids > 0))
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'Assistant très demandé, réessayez dans un instant.' })
    if (err instanceof Anthropic.APIError) {
      console.error('Claude API error', err.status, err.message)
      return res.status(502).json({ error: 'Assistant indisponible pour le moment.' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Erreur inattendue.' })
  }
}

/** Ne garde que des ids valides, sans doublon par semaine, et complète si besoin. */
export function sanitize(out: z.infer<typeof Answer>, pool: typeof RECIPES, count: number, weeks: number, cuisines: Cuisine[], kids: boolean): MenuResponse {
  const valid = new Set(pool.map((r) => r.id))
  const result: { id: string; why: string }[][] = []
  for (let w = 0; w < weeks; w++) {
    const seen = new Set<string>()
    const picks = (out.weeks[w]?.dishes ?? []).filter((d) => valid.has(d.id) && !seen.has(d.id) && seen.add(d.id)).slice(0, count)
    if (picks.length < count) {
      // complète en évitant aussi la semaine précédente
      const prev = result[w - 1]?.map((d) => d.id) ?? []
      const fill = proposeMenu(pool, count, cuisines, kids, 1000 + w, [...seen, ...prev])
      for (const id of fill) if (picks.length < count && !seen.has(id)) picks.push({ id, why: '' }), seen.add(id)
    }
    result.push(picks)
  }
  return { message: out.message, detectedIngredients: out.detected_ingredients.slice(0, 20), weeks: result }
}
