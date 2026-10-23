import { SITE } from '../config'

export const eur = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n)

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const longDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function makeRef(prefix: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `${prefix}-${s}`
}

export const whatsappLink = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`
export const mailtoLink = (subject: string, body: string) =>
  `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

export type Submission = { ref: string; kind: string; createdAt: string; summary: string; data: unknown }

/** Enregistre la demande localement et l'envoie au point d'envoi configuré.
 *  Renvoie true si l'envoi en ligne a réussi (ou s'il n'y a pas de point d'envoi). */
export async function submit(kind: string, ref: string, summary: string, data: unknown): Promise<boolean> {
  const entry: Submission = { ref, kind, createdAt: new Date().toISOString(), summary, data }
  try {
    const all = JSON.parse(localStorage.getItem('hc-submissions') || '[]') as Submission[]
    localStorage.setItem('hc-submissions', JSON.stringify([entry, ...all].slice(0, 20)))
  } catch {
    /* stockage indisponible : on continue */
  }
  if (!SITE.formEndpoint) return true
  try {
    const res = await fetch(SITE.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: `${kind} ${ref}`, ref, kind, message: summary, ...flatten(data) }),
    })
    return res.ok
  } catch {
    return false
  }
}

function flatten(o: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    for (const [k, v] of Object.entries(o)) Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k))
  } else out[prefix || 'value'] = Array.isArray(o) ? o.join(', ') : String(o ?? '')
  return out
}
