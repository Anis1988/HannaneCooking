import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod/v4'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MODEL, rateLimited } from './_shared.js'
import { FAQ } from '../src/data/content.js'
import { FORMULAS, GIFT_PRESETS, OPTIONS, SUBSCRIPTIONS } from '../src/data/formulas.js'
import { CUISINES, DIETS, RECIPES } from '../src/data/recipes.js'
import { MIN_NOTICE_HOURS, SITE, SLOTS, ZONES } from '../src/config.js'

// Assistant conversationnel du site : répond aux questions sur le service, en streaming.
// Toutes les informations viennent des fichiers de données du site (une seule source de vérité).

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) }))
    .min(1)
    .max(12),
})
export type ChatRequest = z.input<typeof Body>

const KNOWLEDGE = [
  `Service : ${SITE.name}, batch cooking à domicile. Une cheffe vient chez le client et cuisine en 2 heures environ les dîners de la semaine (pour 2 adultes et jusqu'à 3 enfants), les met en boîtes, puis range et nettoie la cuisine.`,
  'Sans compte, sans engagement. Paiement UNIQUEMENT en espèces, remis à la cheffe le jour de chaque venue. Les ingrédients (courses) ne sont pas inclus dans le prix.',
  `Zones desservies (vérifiées par le code postal à la réservation) : ${ZONES.map((z) => `${z.name} (départements ${z.prefixes.join(', ')})`).join(' ; ')}.`,
  `Réservation au moins ${MIN_NOTICE_HOURS} h à l'avance, du lundi au samedi (pas le dimanche). Créneaux : ${SLOTS.map((s) => `${s.label} ${s.range}`).join(', ')}.`,
  `Contact : WhatsApp ${SITE.phone}, e-mail ${SITE.email}, horaires ${SITE.hours}.`,
  `Formules (prix TTC par semaine) :\n${FORMULAS.map((f) => `- ${f.name} : ${f.weeks} semaine(s), ${f.dinners.map((d) => `${d} dîners = ${f.price[d]} €/semaine`).join(' ; ')}. ${f.pitch} Points : ${f.perks.join(', ')}.`).join('\n')}`,
  `Options (par semaine) :\n${OPTIONS.map((o) => `- ${o.name} : +${o.price} € — ${o.desc}`).join('\n')}`,
  `Abonnements possibles pour le Mois chill : ${SUBSCRIPTIONS.filter((s) => s.months).map((s) => `${s.label} (${s.perks.join(', ')})`).join(' ; ')}.`,
  `Cartes cadeaux (dès 20 €, valables 1 an, réglées en espèces) : ${GIFT_PRESETS.map((g) => `${g.name} ${g.amount} €`).join(', ')}, ou montant libre.`,
  `Régimes gérés : ${DIETS.map((d) => d.label).join(', ')}. Tous les plats sont sans porc. Cuisines : ${CUISINES.map((c) => c.label).join(', ')}.`,
  `Plats de la carte : ${RECIPES.map((r) => r.name).join(' ; ')}.`,
  `Questions fréquentes :\n${FAQ.map((f) => `Q : ${f.q}\nR : ${f.a}`).join('\n')}`,
].join('\n\n')

const SYSTEM = `Tu es l'assistant du site ${SITE.name}. Tu réponds aux visiteurs avec chaleur et précision, comme une conseillère de l'équipe.
Règles :
- Réponds dans la langue du visiteur (français par défaut), en 1 à 4 phrases courtes. Utilise une petite liste « - » seulement si c'est vraiment plus clair.
- Appuie-toi UNIQUEMENT sur les informations ci-dessous. Si une information manque (disponibilité précise d'une date, cas particulier, tarif non listé), dis-le simplement et propose d'écrire sur WhatsApp ou via [la page contact](/contact).
- N'invente jamais de prix, de zone, de plat ou de promesse. Le paiement est uniquement en espèces.
- Pour un code postal, vérifie ses deux premiers chiffres dans la liste des zones.
- Quand c'est utile, propose UN lien interne en Markdown parmi : [Réserver](/reservation), [Voir les menus](/menus), [Tarifs](/tarifs), [Post-partum](/post-partum), [Carte cadeau](/cartes-cadeaux), [FAQ](/faq), [Mes réservations](/mes-reservations), [Contact](/contact).
- Tu peux mettre un mot clé en **gras**. Pas de titres, pas de tableaux.
- Tu ne peux pas créer, modifier ni annuler une réservation toi-même : pour cela, oriente vers WhatsApp avec le numéro de réservation.

Informations du service :
${KNOWLEDGE}`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Assistant IA non configuré' })
  if (rateLimited(req, 'chat', 40)) return res.status(429).json({ error: 'Trop de demandes, réessayez dans quelques minutes.' })

  const parsed = Body.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Requête invalide' })
  // La conversation doit commencer par le visiteur et alterner les rôles.
  const messages: { role: 'user' | 'assistant'; content: string }[] = []
  for (const m of parsed.data.messages) {
    if (!messages.length && m.role !== 'user') continue
    if (messages.length && messages[messages.length - 1].role === m.role) messages[messages.length - 1].content += '\n' + m.content
    else messages.push({ ...m })
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') return res.status(400).json({ error: 'Requête invalide' })

  try {
    const client = new Anthropic()
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 1200,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system: SYSTEM,
      messages,
    })
    let started = false
    for await (const ev of stream) {
      if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
        if (!started) {
          started = true
          res.status(200)
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.setHeader('Cache-Control', 'no-cache, no-transform')
          res.setHeader('X-Accel-Buffering', 'no')
        }
        res.write(ev.delta.text)
      }
    }
    if (!started) return res.status(502).json({ error: 'Assistant indisponible pour le moment.' })
    return res.end()
  } catch (err) {
    if (res.headersSent) return res.end()
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'Assistant très demandé, réessayez dans un instant.' })
    if (err instanceof Anthropic.APIError) {
      console.error('Claude API error', err.status, err.message)
      return res.status(502).json({ error: 'Assistant indisponible pour le moment.' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Erreur inattendue.' })
  }
}
