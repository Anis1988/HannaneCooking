import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Quote, Search, Sparkles, Star } from 'lucide-react'
import { FORMULAS, type FormulaId } from '../data/formulas'
import { FAQ, FAQ_CATS, REVIEWS, REVIEWS_ARE_SAMPLES, type FaqCat } from '../data/content'
import { useBooking } from '../store/booking'
import { cx, eur } from '../lib/utils'
import { Button, Card, Reveal } from './ui'

export function PricingCards({ only }: { only?: FormulaId[] }) {
  const nav = useNavigate()
  const set = useBooking((s) => s.set)
  const [mois, setMois] = useState(5)
  const list = FORMULAS.filter((f) => !only || only.includes(f.id))

  const choose = (id: FormulaId, dinners: number) => {
    set({ formula: id, dinners })
    nav('/reservation')
  }

  return (
    <div className={cx('grid gap-5', list.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
      {list.map((f, i) => {
        const d = f.id === 'mois' ? mois : f.dinners[0]
        const price = f.price[d]
        const featured = !!f.badge
        return (
          <Reveal key={f.id} delay={i * 0.08}>
            <Card glow={featured} className={cx('relative flex h-full flex-col p-7', featured && 'bg-white/[0.06]')}>
              {f.badge && (
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold text-ink">{f.badge} ❤️</span>
              )}
              <h3 className="font-display text-2xl font-bold">{f.name}</h3>
              <p className="mt-2 text-sm text-mute">{f.pitch}</p>

              {f.dinners.length > 1 ? (
                <div className="mt-6 grid grid-cols-3 gap-1 rounded-full border border-line bg-white/[0.03] p-1">
                  {f.dinners.map((n) => (
                    <button
                      key={n}
                      onClick={() => setMois(n)}
                      className={cx('relative rounded-full py-2 text-sm font-semibold transition-colors', mois === n ? 'text-ink' : 'text-white/70 hover:text-white')}
                    >
                      {mois === n && <motion.span layoutId="mois-pill" className="absolute inset-0 -z-0 rounded-full bg-gradient-brand" />}
                      <span className="relative">{n} dîners</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-full border border-line bg-white/[0.03] py-2 text-center text-sm font-semibold">
                  {f.dinners[0]} dîners · {f.weeks > 1 ? `${f.weeks} semaines` : '1 semaine'}
                </div>
              )}

              <div className="mt-6 flex items-end gap-2">
                <motion.span key={price} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl font-extrabold tracking-tight">
                  {eur(price)}
                </motion.span>
                <span className="pb-2 text-mute">/ semaine</span>
              </div>
              <p className="mt-1 text-sm text-white/80">
                Soit <span className="font-semibold text-sun">{eur(price / d)}</span> le dîner pour toute la famille
              </p>
              {f.weeks > 1 && <p className="text-xs text-mute">{eur(price * f.weeks)} pour {f.weeks} semaines, réglé à chaque venue</p>}

              <ul className="mt-6 space-y-3 text-sm">
                {f.perks.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint/15 text-mint"><Check size={13} /></span>
                    {p}
                  </li>
                ))}
                <li className="flex gap-3 text-mute">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/5">💶</span>
                  Paiement en espèces à la cheffe
                </li>
              </ul>
              <div className="flex-1" />
              <Button onClick={() => choose(f.id, d)} variant={featured ? 'primary' : 'soft'} className="mt-8 w-full">
                Choisir cette formule
              </Button>
              <p className="mt-3 text-center text-xs text-mute">Prix des courses non inclus</p>
            </Card>
          </Reveal>
        )
      })}
    </div>
  )
}

export function FaqList({ limit, withSearch }: { limit?: number; withSearch?: boolean }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<FaqCat | 'Tout'>('Tout')
  const [open, setOpen] = useState<string | null>(null)
  const items = useMemo(() => {
    const n = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const res = FAQ.filter((f) => (cat === 'Tout' || f.cat === cat) && (!q || n(f.q + ' ' + f.a).includes(n(q))))
    return limit ? res.slice(0, limit) : res
  }, [q, cat, limit])

  return (
    <div className="mx-auto max-w-3xl">
      {withSearch && (
        <div className="mb-6 space-y-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Entrez votre recherche par mot-clé" className="field !rounded-full !py-4 !pl-11" />
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Tout', ...FAQ_CATS] as const).map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cx('rounded-full border px-4 py-1.5 text-sm transition', cat === c ? 'border-sun/60 bg-sun/10 text-white' : 'border-line text-white/70 hover:text-white')}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((f) => {
          const isOpen = open === f.q
          return (
            <Card key={f.q} className={cx('overflow-hidden transition-colors', isOpen && 'bg-white/[0.07]')}>
              <button onClick={() => setOpen(isOpen ? null : f.q)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded={isOpen}>
                <span>
                  <span className="mb-1 block text-xs font-medium tracking-wider text-sun/80 uppercase">{f.cat}</span>
                  <span className="font-medium">{f.q}</span>
                </span>
                <ChevronDown className={cx('shrink-0 transition-transform duration-300', isOpen && 'rotate-180')} size={20} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <p className="px-6 pb-6 text-mute">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
        {!items.length && <p className="py-10 text-center text-mute">Aucune réponse trouvée. Écrivez-nous, on vous répond vite !</p>}
      </div>
    </div>
  )
}

export function Reviews() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {REVIEWS.map((r, i) => (
        <Reveal key={r.name} delay={i * 0.06}>
          <Card className="flex h-full flex-col p-6">
            <Quote className="text-sun/70" size={22} />
            <div className="mt-3 flex gap-0.5 text-sun">{Array.from({ length: 5 }, (_, k) => <Star key={k} size={14} fill="currentColor" />)}</div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-white/85">« {r.text} »</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand font-bold text-ink">{r.name[0]}</span>
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-mute">{r.city} · {r.date}</div>
              </div>
            </div>
          </Card>
        </Reveal>
      ))}
      {REVIEWS_ARE_SAMPLES && (
        <p className="col-span-full text-center text-xs text-mute/70"><Sparkles size={12} className="mr-1 inline" />Avis d’exemple — à remplacer par vos retours clients.</p>
      )}
    </div>
  )
}

export function CtaBanner({ title, sub }: { title: string; sub: string }) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[2.5rem] border border-line p-10 text-center sm:p-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_300px_at_50%_0%,rgba(255,181,71,0.25),transparent),radial-gradient(500px_300px_at_80%_100%,rgba(139,123,255,0.25),transparent)]" />
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-mute">{sub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/reservation" size="lg">Réserver ma semaine</Button>
          <Button to="/tarifs" size="lg" variant="ghost">Voir les tarifs</Button>
        </div>
      </div>
    </Reveal>
  )
}
