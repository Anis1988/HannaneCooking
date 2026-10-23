import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod/v4'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MODEL, rateLimited } from './_shared.js'
import { FORMULAS, SUBSCRIPTIONS, type FormulaId, type SubscriptionId } from '../src/data/formulas.js'

// Conseil de formule : Claude recommande semaine / mois / post-partum et le nombre de dîners.

const Body = z.object({
  situation: z.string().max(500).default(''),
  adults: z.number().int().min(1).max(10).default(2),
  kids: z.number().int().min(0).max(10).default(0),
  diets: z.array(z.string().max(30)).max(10).default([]),
  cuisines: z.array(z.string().max(30)).max(10).default([]),
})
export type AdviceRequest = z.input<typeof Body>

const Answer = z.object({
  formula: z.enum(['semaine', 'mois', 'postpartum']),
  dinners: z.number().int(),
  subscription: z.enum(['none', '3', '6', '9']),
  headline: z.string().describe('Titre très court de la recommandation, en français (max 8 mots)'),
  reason: z.string().describe('Une ou deux phrases qui expliquent le choix au client, en français, ton chaleureux'),
})

export type AdviceResponse = { formula: FormulaId; dinners: number; subscription: SubscriptionId; headline: string; reason: string }

const SYSTEM = `Tu es la conseillère de Hannane Cooking, un service de batch cooking à domicile : une cheffe vient cuisiner chez le client les dîners de la semaine en 2 heures. Paiement en espèces, sans engagement.
Recommande LA formule la plus adaptée au foyer, le nombre de dîners par semaine et, uniquement pour « mois », un abonnement éventuel.
Principes :
- « postpartum » seulement si le client évoque une naissance, une grossesse ou un bébé.
- « semaine » pour découvrir le service ou un besoin ponctuel.
- « mois » pour un besoin régulier (semaines chargées, travail, famille nombreuse). Ajuste le nombre de dîners au rythme décrit (3, 4 ou 5).
- Un abonnement (3, 6 ou 9 mois) seulement si le client exprime clairement un besoin durable ; sinon « none ».
- Ne promets rien qui n'est pas dans les formules. Ne parle pas de prix dans le texte.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Assistant IA non configuré' })
  if (rateLimited(req)) return res.status(429).json({ error: 'Trop de demandes, réessayez dans quelques minutes.' })

  const parsed = Body.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Requête invalide' })
  const b = parsed.data

  const formulas = FORMULAS.map((f) => ({ id: f.id, nom: f.name, semaines: f.weeks, diners_par_semaine: f.dinners, points: f.perks }))
  const brief = [
    `Foyer : ${b.adults} adulte(s), ${b.kids} enfant(s).`,
    b.diets.length ? `Régimes : ${b.diets.join(', ')}.` : '',
    b.cuisines.length ? `Cuisines aimées : ${b.cuisines.join(', ')}.` : '',
    b.situation.trim() ? `Situation décrite par le client : « ${b.situation.trim()} »` : 'Le client n’a pas décrit sa situation.',
    `Formules disponibles (JSON) :\n${JSON.stringify(formulas)}`,
    `Abonnements possibles pour « mois » : ${SUBSCRIPTIONS.filter((s) => s.months).map((s) => s.label).join(', ')}.`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const client = new Anthropic()
    const msg = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(Answer) },
      system: SYSTEM,
      messages: [{ role: 'user', content: brief }],
    })
    if (msg.stop_reason === 'refusal' || !msg.parsed_output) return res.status(502).json({ error: 'Conseil indisponible.' })
    return res.status(200).json(sanitizeAdvice(msg.parsed_output))
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'Assistant très demandé, réessayez dans un instant.' })
    if (err instanceof Anthropic.APIError) {
      console.error('Claude API error', err.status, err.message)
      return res.status(502).json({ error: 'Conseil indisponible pour le moment.' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Erreur inattendue.' })
  }
}

/** Ramène le conseil dans les valeurs possibles de la formule choisie. */
export function sanitizeAdvice(a: z.infer<typeof Answer>): AdviceResponse {
  const f = FORMULAS.find((x) => x.id === a.formula)!
  const dinners = f.dinners.includes(a.dinners) ? a.dinners : f.dinners.reduce((best, d) => (Math.abs(d - a.dinners) < Math.abs(best - a.dinners) ? d : best))
  return { formula: f.id, dinners, subscription: f.id === 'mois' ? a.subscription : 'none', headline: a.headline, reason: a.reason }
}
