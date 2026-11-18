import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, History, MapPin, Search, Star } from 'lucide-react'
import { FORMULAS, type FormulaId } from '../data/formulas'
import { FAQ, FAQ_CATS, REVIEWS, REVIEWS_ARE_SAMPLES, type FaqCat } from '../data/content'
import { ZONES, zoneForPostalCode } from '../config'
import { useBooking } from '../store/booking'
import { cx, eur, whatsappLink } from '../lib/utils'
import { Button, Reveal } from './ui'

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
    <div className={cx('grid gap-4 sm:gap-5', list.length === 3 ? 'lg:grid-cols-3' : list.length === 2 && 'md:grid-cols-2')}>
      {list.map((f, i) => {
        const d = f.id === 'mois' ? mois : f.dinners[0]
        const price = f.price[d]
        const featured = !!f.badge
        return (
          <Reveal key={f.id} delay={i * 0.06}>
            <div className={cx('relative flex h-full flex-col rounded-[26px] p-6 sm:p-7', featured ? 'heat-edge bg-[linear-gradient(180deg,rgba(255,180,67,0.08),rgba(255,255,255,0.03))]' : 'glass')}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-semibold tracking-tight">{f.name}</h3>
                {f.badge && <span className="shrink-0 rounded-full bg-sun px-2.5 py-1 text-xs font-semibold text-ink">{f.badge}</span>}
              </div>
              <p className="mt-2 text-sm text-mute">{f.pitch}</p>

              {f.dinners.length > 1 ? (
                <div className="mt-6 grid h-11 grid-cols-3 gap-1 rounded-2xl border border-line bg-white/[0.03] p-1" role="radiogroup" aria-label="Dîners par semaine">
                  {f.dinners.map((n) => (
                    <button
                      key={n}
                      role="radio"
                      aria-checked={mois === n}
                      onClick={() => setMois(n)}
                      className={cx('relative rounded-xl text-sm font-semibold transition-colors', mois === n ? 'text-ink' : 'text-white/70 hover:text-white')}
                    >
                      {mois === n && <motion.span layoutId="mois-pill" className="absolute inset-0 rounded-xl bg-sun" />}
                      <span className="relative">{n} dîners</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex h-11 items-center justify-center rounded-2xl border border-line bg-white/[0.03] text-sm font-medium text-white/85">
                  {f.dinners[0]} dîners, {f.weeks > 1 ? `${f.weeks} semaines` : '1 semaine'}
                </div>
              )}

              <div className="mt-6 flex items-end gap-2">
                <span className="font-display text-[2.8rem] leading-none font-semibold tracking-[-0.04em]">{eur(price)}</span>
                <span className="pb-1 text-mute">/ semaine</span>
              </div>
              <p className="mt-2 text-sm text-white/80">
                Soit <span className="font-semibold text-sun">{eur(price / d)}</span> le dîner pour toute la famille
              </p>
              {f.weeks > 1 && <p className="text-xs text-mute">{eur(price * f.weeks)} pour {f.weeks} semaines, réglé à chaque venue</p>}

              <ul className="mt-6 space-y-2.5 text-sm">
                {f.perks.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check size={16} className="mt-0.5 shrink-0 text-mint" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="flex-1" />
              <Button onClick={() => choose(f.id, d)} variant={featured ? 'primary' : 'ghost'} className="mt-8 w-full">
                Choisir cette formule
              </Button>
              <p className="mt-3 text-center text-xs text-mute">Courses non incluses, paiement en espèces</p>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

// minuscules, sans accents, espaces insécables ramenées à des espaces simples
const nf = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export function FaqList({ limit, withSearch, initialQuery = '' }: { limit?: number; withSearch?: boolean; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery)
  const [cat, setCat] = useState<FaqCat | 'Tout'>('Tout')
  const [open, setOpen] = useState<string | null>(() => FAQ.find((f) => nf(f.q) === nf(initialQuery))?.q ?? null)
  useEffect(() => {
    setQ(initialQuery)
    const hit = FAQ.find((f) => nf(f.q) === nf(initialQuery))
    if (hit) setOpen(hit.q)
  }, [initialQuery])
  const items = useMemo(() => {
    const n = nf
    const res = FAQ.filter((f) => (cat === 'Tout' || f.cat === cat) && (!q || n(f.q + ' ' + f.a).includes(n(q))))
    return limit ? res.slice(0, limit) : res
  }, [q, cat, limit])

  return (
    <div className={cx(withSearch && 'mx-auto max-w-3xl')}>
      {withSearch && (
        <div className="mb-6 space-y-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cherchez un mot : courses, annuler, allergies…" className="field !rounded-full !py-4 !pl-11" />
          </label>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {(['Tout', ...FAQ_CATS] as const).map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cx('shrink-0 rounded-full border px-4 py-2 text-sm transition', cat === c ? 'border-sun/70 bg-sun/10 text-white' : 'border-line text-white/70 hover:text-white')}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-line border-y border-line">
        {items.map((f) => {
          const isOpen = open === f.q
          return (
            <div key={f.q}>
              <button onClick={() => setOpen(isOpen ? null : f.q)} className="flex w-full items-center justify-between gap-4 py-4 text-left sm:py-5" aria-expanded={isOpen}>
                <span>
                  <span className="mb-0.5 block text-xs text-mute">{f.cat}</span>
                  <span className="font-medium sm:text-[17px]">{f.q}</span>
                </span>
                <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition-transform duration-300', isOpen && 'rotate-180 border-sun/60 text-sun')}>
                  <ChevronDown size={16} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <p className="max-w-[65ch] pb-5 text-mute">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
        {!items.length && <p className="py-10 text-center text-mute">Aucune réponse pour « {q} ». Posez la question à l’assistant ou écrivez-nous sur WhatsApp.</p>}
      </div>
    </div>
  )
}

export function Reviews() {
  return (
    <>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="glass flex w-[82%] shrink-0 snap-center flex-col rounded-[22px] p-6 sm:w-auto">
            <div className="flex gap-0.5 text-sun" aria-label="5 étoiles sur 5">{Array.from({ length: 5 }, (_, k) => <Star key={k} size={14} fill="currentColor" />)}</div>
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/85">« {r.text} »</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-3 font-display text-sm font-semibold text-sun">{r.name[0]}</span>
              <span>
                <span className="block text-sm font-semibold">{r.name}</span>
                <span className="block text-xs text-mute">{r.city}, {r.date.toLowerCase()}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      {REVIEWS_ARE_SAMPLES && <p className="mt-4 text-xs text-mute/70">Avis d’exemple, à remplacer par vos retours clients.</p>}
    </>
  )
}

export function CtaBanner({ title, sub }: { title: string; sub: string }) {
  return (
    <Reveal>
      <div className="relative isolate overflow-hidden rounded-[32px] border border-line px-6 py-12 sm:p-16">
        {/* La chaleur monte du bas : la cuisine est allumée */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_50%_120%,rgba(255,180,67,0.38),rgba(255,106,61,0.22)_35%,rgba(240,68,155,0.12)_55%,transparent_75%),#140f38]" />
        <h2 className="max-w-2xl font-display text-3xl leading-[1.08] font-semibold tracking-[-0.03em] sm:text-5xl">{title}</h2>
        <p className="mt-4 max-w-xl text-lg text-mute">{sub}</p>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <Button to="/reservation" size="lg">Réserver ma semaine</Button>
          <Button to="/tarifs" size="lg" variant="ghost">Voir les tarifs</Button>
        </div>
      </div>
    </Reveal>
  )
}

/** « Vous venez chez moi ? » : réponse immédiate à partir du code postal. */
export function ZoneCheck({ className }: { className?: string }) {
  const { address, setAddress } = useBooking()
  const [cp, setCp] = useState(address.cp)
  const zone = zoneForPostalCode(cp)
  const done = cp.length === 5
  return (
    <div className={className}>
      <label htmlFor="zone-cp" className="mb-2 block text-sm font-medium text-white/85">Vous venez chez moi ?</label>
      <div className={cx('flex items-center gap-2 rounded-full border bg-white/[0.04] p-1.5 pl-4 transition-colors', done ? (zone ? 'border-mint/60' : 'border-coral/60') : 'border-line focus-within:border-sun/60')}>
        <MapPin size={18} className={cx('shrink-0', done ? (zone ? 'text-mint' : 'text-coral') : 'text-mute')} />
        <input
          id="zone-cp"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={cp}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, 5)
            setCp(v)
            if (zoneForPostalCode(v)) setAddress({ cp: v })
          }}
          placeholder="Votre code postal"
          className="h-10 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#7d76a8]"
        />
        {done && zone && (
          <Link to="/reservation" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-mint px-4 text-sm font-semibold text-ink">
            Réserver <ArrowRight size={15} />
          </Link>
        )}
      </div>
      <p className="mt-2 min-h-5 text-sm" aria-live="polite">
        {!done && <span className="text-mute">Nous venons en {ZONES.map((z) => z.name).join(', ').replace(/, ([^,]*)$/, ' et $1')}.</span>}
        {done && zone && <span className="text-mint">Oui, nous venons chez vous ({zone.name}).</span>}
        {done && !zone && (
          <span className="text-white/80">
            Pas encore chez vous.{' '}
            <a className="font-medium text-sun underline underline-offset-2" href={whatsappLink(`Bonjour, venez-vous au ${cp} ? Prévenez-moi quand vous arrivez dans ma ville.`)} target="_blank" rel="noreferrer">
              Prévenez-moi à l’ouverture
            </a>
          </span>
        )}
      </p>
    </div>
  )
}

/** Bandeau « reprendre » : la réservation en cours est gardée sur l'appareil. */
export function ResumeBanner() {
  const { lastStep, confirmed } = useBooking()
  if (!lastStep || confirmed) return null
  return (
    <Link to={`/reservation/${lastStep}`} className="mb-6 flex items-center gap-3 rounded-2xl border border-sun/40 bg-sun/[0.07] p-3 pr-4 text-sm transition hover:bg-sun/[0.12]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-ink"><History size={16} /></span>
      <span className="flex-1">
        <span className="block font-semibold">Votre réservation est en cours</span>
        <span className="block text-mute">Reprenez là où vous en étiez.</span>
      </span>
      <ArrowRight size={16} className="text-sun" />
    </Link>
  )
}

