import { useState } from 'react'
import { CalendarPlus, Check, Copy, Gift, Mail, MessageCircle, ShoppingBasket, Trash2 } from 'lucide-react'
import { SLOTS } from '../config'
import { FORMULAS, type FormulaId } from '../data/formulas'
import { RECIPES } from '../data/recipes'
import { Button, Card, Container, Sheet } from '../components/ui'
import { ShoppingList } from '../components/ShoppingList'
import { buildIcs, countdown, downloadFile, nextVisit, visitDates } from '../lib/calendar'
import { cx, getSubmissions, longDate, removeSubmission, toIso, whatsappLink, type Submission } from '../lib/utils'

type ResaData = {
  formula?: FormulaId
  dinners?: number
  startDate?: string
  slot?: string
  menus?: Record<string, string[]>
  address?: { firstName?: string; street?: string; cp?: string; city?: string }
}

/** Réservations et demandes gardées sur cet appareil : pas de compte, juste l'historique local. */
export default function MyBookings() {
  const [list, setList] = useState(getSubmissions)
  const resas = list.filter((s) => s.kind === 'Réservation')
  const others = list.filter((s) => s.kind !== 'Réservation')

  const remove = (ref: string) => {
    if (!window.confirm(`Retirer ${ref} de cet appareil ? La réservation n’est pas annulée pour autant.`)) return
    removeSubmission(ref)
    setList(getSubmissions())
  }

  return (
    <Container className="py-6 sm:py-10">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="font-display text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-5xl">Mes réservations</h1>
        <p className="mt-3 text-mute sm:text-lg">Gardées sur cet appareil, sans compte. Ajoutez les venues à votre agenda et retrouvez votre liste de courses.</p>
      </div>

      {!resas.length && (
        <Card className="rounded-[28px] p-8 text-center sm:p-12">
          <p className="font-display text-xl font-semibold">Aucune réservation sur cet appareil</p>
          <p className="mx-auto mt-2 max-w-md text-mute">Votre première semaine se réserve en quelques minutes. Elle apparaîtra ici, avec un rappel dans votre agenda si vous le souhaitez.</p>
          <Button to="/reservation" size="lg" className="mt-6">Réserver ma semaine</Button>
        </Card>
      )}

      <div className="space-y-5">
        {resas.map((s) => (
          <BookingCard key={s.ref} s={s} onRemove={() => remove(s.ref)} />
        ))}
      </div>

      {!!others.length && (
        <section className="mt-12">
          <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">Autres demandes</h2>
          <div className="divide-y divide-line border-y border-line">
            {others.map((s) => (
              <div key={s.ref} className="flex flex-wrap items-center gap-3 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] text-sun">{s.kind === 'Carte cadeau' ? <Gift size={18} /> : <Mail size={18} />}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{s.kind} <span className="text-mute">{s.ref}</span></div>
                  <div className="text-sm text-mute">Envoyée le {new Date(s.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
                </div>
                <a href={whatsappLink(s.summary)} target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm hover:bg-white/[0.06]">Renvoyer</a>
                <button onClick={() => remove(s.ref)} className="grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-white/[0.06] hover:text-white" aria-label={`Retirer ${s.ref}`}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}

function BookingCard({ s, onRemove }: { s: Submission; onRemove: () => void }) {
  const d = (s.data ?? {}) as ResaData
  const f = FORMULAS.find((x) => x.id === d.formula)
  const dates = visitDates(d.startDate ?? '', f?.weeks ?? 1)
  const slot = SLOTS.find((x) => x.id === d.slot)
  const next = nextVisit(dates, d.slot ?? '')
  const menus = d.menus ?? {}
  const [shop, setShop] = useState(false)
  const [copied, setCopied] = useState(false)
  const where = [d.address?.street, [d.address?.cp, d.address?.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  const today = toIso(new Date())

  const addToCalendar = () =>
    downloadFile(
      `hannane-${s.ref}.ics`,
      buildIcs({ ref: s.ref, dates, slotId: d.slot ?? 'matin', location: where, description: `Réservation ${s.ref}. ${f?.name ?? ''}. Paiement en espèces à la cheffe.` }),
    )

  return (
    <Card className="overflow-hidden rounded-[28px]">
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(s.ref)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-sun/50 px-3 py-1 text-sm font-semibold tracking-wider text-sun"
              aria-label={`Copier le numéro ${s.ref}`}
            >
              {s.ref} {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <span className="text-sm text-mute">{f?.name}{d.dinners ? `, ${d.dinners} dîners par semaine` : ''}</span>
          </div>
          {next ? (
            <div className="mt-5">
              <div className="flex items-center gap-2 text-sm text-mute">
                <span className="h-2 w-2 rounded-full bg-coral shadow-[0_0_10px_var(--color-coral)]" /> Prochaine venue {countdown(next.at)}
              </div>
              <div className="mt-1 font-display text-2xl font-semibold tracking-tight first-letter:uppercase sm:text-3xl">{longDate(next.iso)}</div>
              {slot && <div className="mt-1 text-mute">{slot.label}, {slot.range}</div>}
            </div>
          ) : (
            <p className="mt-5 text-mute">{dates.length ? 'Toutes les venues de cette réservation sont passées.' : 'Date à confirmer avec notre équipe.'}</p>
          )}
          {dates.length > 1 && (
            <ol className="mt-4 flex flex-wrap gap-2">
              {dates.map((x, i) => (
                <li key={x} className={cx('rounded-full px-3 py-1 text-sm', x < today ? 'bg-white/[0.03] text-mute line-through' : 'bg-white/[0.06]')}>
                  S{i + 1}, {new Date(x + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {!!dates.length && <Button onClick={addToCalendar} size="sm"><CalendarPlus size={16} /> Ajouter à mon agenda</Button>}
            <Button onClick={() => setShop(true)} size="sm" variant="ghost"><ShoppingBasket size={16} /> Liste de courses</Button>
            <Button href={whatsappLink(`Bonjour, au sujet de ma réservation ${s.ref} : je souhaite `)} size="sm" variant="ghost"><MessageCircle size={16} /> Reporter ou modifier</Button>
          </div>
        </div>
        <div className="rounded-[22px] bg-white/[0.03] p-5">
          <div className="text-sm text-mute">Au menu</div>
          <div className="mt-3 space-y-3">
            {Object.entries(menus).slice(0, 2).map(([w, ids]) => (
              <div key={w}>
                {Object.keys(menus).length > 1 && <div className="mb-1.5 text-xs text-mute">Semaine {w}</div>}
                <div className="flex flex-wrap gap-1.5">
                  {ids.map((id) => {
                    const r = RECIPES.find((x) => x.id === id)
                    return r ? <span key={id} className="rounded-full bg-white/[0.06] px-3 py-1 text-sm">{r.name.split(',')[0]}</span> : null
                  })}
                </div>
              </div>
            ))}
            {Object.keys(menus).length > 2 && <div className="text-xs text-mute">+ {Object.keys(menus).length - 2} autre(s) semaine(s)</div>}
            {!Object.keys(menus).length && <div className="text-sm text-mute">Menu composé avec votre cheffe.</div>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-mute sm:px-8">
        <span>Réservée le {new Date(s.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <button onClick={onRemove} className="flex items-center gap-1.5 py-1 hover:text-white"><Trash2 size={14} /> Retirer de cet appareil</button>
      </div>
      <Sheet open={shop} onClose={() => setShop(false)} title="Liste de courses" wide>
        <div className="px-5 pb-6 sm:px-6"><ShoppingList menus={menus} /></div>
      </Sheet>
    </Card>
  )
}
