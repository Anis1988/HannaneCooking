import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Banknote, Check, ChevronLeft, ChevronRight, MapPin, Minus, Plus, RefreshCw, Shuffle, X } from 'lucide-react'
import { MIN_NOTICE_HOURS, SITE, SLOTS, zoneForPostalCode } from '../../config'
import { FORMULAS, OPTIONS, SUBSCRIPTIONS, getFormula } from '../../data/formulas'
import { CUISINES, DIETS, EQUIPMENTS, RECIPES, isCompatible, proposeMenu, type Recipe } from '../../data/recipes'
import { pricing, useBooking, type BookingState } from '../../store/booking'
import { Card, Chip } from '../../components/ui'
import { Field, isEmail, isPhone } from '../../components/form'
import { cx, eur, longDate, toIso } from '../../lib/utils'

export function StepHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <div className="text-xs font-semibold tracking-widest text-sun uppercase">{kicker}</div>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-mute">{sub}</p>}
    </div>
  )
}

function Counter({ label, sub, value, min, max, onChange, emoji }: { label: string; sub: string; value: number; min: number; max: number; onChange: (n: number) => void; emoji: string }) {
  return (
    <Card className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{emoji}</span>
        <div>
          <div className="font-semibold">{label}</div>
          <div className="text-sm text-mute">{sub}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="glass grid h-10 w-10 place-items-center rounded-full disabled:opacity-30" aria-label={`Moins de ${label}`}><Minus size={16} /></button>
        <motion.span key={value} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-6 text-center font-display text-2xl font-bold">{value}</motion.span>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="glass grid h-10 w-10 place-items-center rounded-full disabled:opacity-30" aria-label={`Plus de ${label}`}><Plus size={16} /></button>
      </div>
    </Card>
  )
}

export function People() {
  const { adults, kids, set } = useBooking()
  return (
    <>
      <StepHead kicker="Question 1 sur 5" title="Combien de personnes seront à table ?" sub="Indiquez le nombre d’adultes et d’enfants qui mangeront les repas." />
      <div className="space-y-4">
        <Counter label="Adultes" sub="À partir de 16 ans" emoji="🧑" value={adults} min={1} max={6} onChange={(n) => set({ adults: n })} />
        <Counter label="Enfants" sub="Entre 2 et 15 ans" emoji="🧒" value={kids} min={0} max={5} onChange={(n) => set({ kids: n })} />
      </div>
      <div className="mt-6 flex flex-wrap gap-1 text-3xl" aria-hidden>
        {Array.from({ length: adults }, (_, i) => <motion.span key={'a' + i} initial={{ scale: 0 }} animate={{ scale: 1 }}>🧑</motion.span>)}
        {Array.from({ length: kids }, (_, i) => <motion.span key={'k' + i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">🧒</motion.span>)}
      </div>
      {(adults > 2 || kids > 3) && (
        <p className="mt-4 rounded-2xl bg-sun/10 p-4 text-sm">Les dîners sont prévus pour 2 adultes et jusqu’à 3 enfants. Pensez à l’option <b>Family +</b> (portions doublées) à l’étape planification.</p>
      )}
    </>
  )
}

export function Diet() {
  const { diets, avoid, toggle, set } = useBooking()
  const [txt, setTxt] = useState('')
  const add = () => {
    const parts = txt.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length) set({ avoid: [...new Set([...avoid, ...parts])] })
    setTxt('')
  }
  const quick = ['Arachides', 'Fruits à coque', 'Crustacés', 'Poisson', 'Œuf', 'Champignons', 'Piment', 'Coriandre']
  return (
    <>
      <StepHead kicker="Question 2 sur 5" title="Quel est votre régime alimentaire ?" sub="Indiquez vos préférences et allergies afin que nous vous proposions les recettes les plus adaptées." />
      <div className="grid gap-3 sm:grid-cols-2">
        {DIETS.map((d) => (
          <Chip key={d.id} active={diets.includes(d.id)} onClick={() => toggle('diets', d.id)} className="flex items-center gap-3">
            <span className="text-xl">{d.emoji}</span> {d.label}
            {diets.includes(d.id) && <Check size={16} className="ml-auto text-sun" />}
          </Chip>
        ))}
      </div>
      <h2 className="mt-10 font-display text-xl font-semibold">Y a-t-il des ingrédients à éviter ?</h2>
      <div className="mt-3 flex gap-2">
        <input className="field" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Ex. : coriandre, champignons…" />
        <button onClick={add} className="glass shrink-0 rounded-2xl px-5 font-semibold hover:bg-white/10">Ajouter</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quick.filter((q) => !avoid.includes(q)).map((q) => (
          <button key={q} onClick={() => set({ avoid: [...avoid, q] })} className="rounded-full border border-dashed border-line px-3 py-1 text-sm text-mute hover:text-white">+ {q}</button>
        ))}
      </div>
      {!!avoid.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {avoid.map((a) => (
            <span key={a} className="flex items-center gap-1.5 rounded-full bg-coral/15 py-1 pr-2 pl-3 text-sm text-coral">
              {a}
              <button onClick={() => set({ avoid: avoid.filter((x) => x !== a) })} aria-label={`Retirer ${a}`}><X size={14} /></button>
            </span>
          ))}
        </div>
      )}
    </>
  )
}

export function Tastes() {
  const { cuisines, toggle } = useBooking()
  return (
    <>
      <StepHead kicker="Question 3 sur 5" title="Quelles cuisines vous font envie ?" sub="Choisissez-en autant que vous voulez : nous en tiendrons compte pour composer votre menu." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CUISINES.map((c) => (
          <Chip key={c.id} active={cuisines.includes(c.id)} onClick={() => toggle('cuisines', c.id)} className="!py-6 text-center">
            <span className="block text-4xl">{c.emoji}</span>
            <span className="mt-2 block">{c.label}</span>
          </Chip>
        ))}
      </div>
      <p className="mt-4 text-sm text-mute">Pas de préférence ? Passez à la suite, on varie les plaisirs.</p>
    </>
  )
}

export function Kitchen() {
  const { equipment, toggle } = useBooking()
  return (
    <>
      <StepHead kicker="Question 4 sur 5" title="Qu’avez-vous dans votre cuisine ?" sub="Précisez vos équipements afin que les recettes soient adaptées." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {EQUIPMENTS.map((e) => (
          <Chip key={e.id} active={equipment.includes(e.id)} onClick={() => toggle('equipment', e.id)} className="flex items-center gap-3 !py-4">
            <span className="text-2xl">{e.emoji}</span> {e.label}
          </Chip>
        ))}
      </div>
      {!equipment.includes('plaques') && <p className="mt-4 rounded-2xl bg-sun/10 p-4 text-sm">Sans plaques de cuisson, le choix de recettes sera très limité.</p>}
    </>
  )
}

export function FormulaStep() {
  const { formula, dinners, subscription, set } = useBooking()
  return (
    <>
      <StepHead kicker="Question 5 sur 5" title="Quelle formule souhaitez-vous ?" sub="Testez le service une semaine, ou soufflez un mois entier." />
      <div className="space-y-4">
        {FORMULAS.map((f) => {
          const active = formula === f.id
          const d = active && f.dinners.includes(dinners) ? dinners : f.dinners[f.dinners.length - 1]
          return (
            <Card key={f.id} glow={active} className={cx('cursor-pointer p-6 transition', active && 'bg-white/[0.07]')}>
              <div role="radio" aria-checked={active} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && set({ formula: f.id, dinners: d })} onClick={() => set({ formula: f.id, dinners: d })} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <span className={cx('mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2', active ? 'border-sun bg-sun text-ink' : 'border-white/30')}>{active && <Check size={14} />}</span>
                  <div>
                    <div className="flex items-center gap-2 font-display text-xl font-bold">{f.name} {f.badge && <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] text-ink">❤️ {f.badge}</span>}</div>
                    <ul className="mt-2 space-y-1 text-sm text-mute">{f.perks.map((p) => <li key={p}>· {p}</li>)}</ul>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs text-mute">{f.dinners.length > 1 ? 'À partir de' : ''}</div>
                  <div className="font-display text-3xl font-extrabold">{eur(Math.min(...Object.values(f.price)))}</div>
                  <div className="text-xs text-mute">par semaine</div>
                </div>
              </div>
              <AnimatePresence>
                {active && f.dinners.length > 1 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-6 border-t border-line pt-5">
                      <p className="mb-3 text-sm font-medium">Combien de dîners par semaine ?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {f.dinners.map((n) => (
                          <Chip key={n} active={dinners === n} onClick={() => set({ dinners: n })} className="text-center">
                            <span className="block font-display text-xl font-bold">{n} dîners</span>
                            <span className="block text-xs text-mute">{eur(f.price[n])} / sem.</span>
                          </Chip>
                        ))}
                      </div>
                      <p className="mt-6 mb-3 text-sm font-medium">Abonnement (facultatif)</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {SUBSCRIPTIONS.map((s) => (
                          <Chip key={s.id} active={subscription === s.id} onClick={() => set({ subscription: s.id })}>
                            <span className="block font-semibold">{s.label}</span>
                            <span className="mt-1 block text-xs text-mute">{s.perks[0]}</span>
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>
    </>
  )
}

export function usePool() {
  const { diets, avoid, equipment } = useBooking()
  return useMemo(() => RECIPES.filter((r) => isCompatible(r, diets, avoid, equipment)), [diets, avoid, equipment])
}

/** Garantit un menu valide pour chaque semaine de la formule. */
export function useEnsureMenus() {
  const s = useBooking()
  const pool = usePool()
  const { f, dinners } = pricing(s)
  useEffect(() => {
    const ids = new Set(pool.map((r) => r.id))
    const next: Record<number, string[]> = {}
    let changed = false
    const used: string[] = []
    for (let w = 1; w <= f.weeks; w++) {
      const cur = (s.menus[w] || []).filter((id) => ids.has(id))
      if (cur.length === Math.min(dinners, pool.length) && cur.length === (s.menus[w] || []).length) next[w] = cur
      else {
        next[w] = proposeMenu(pool, Math.min(dinners, pool.length), s.cuisines, s.kids > 0, s.seed + w * 101, used.slice(-dinners * 2))
        changed = true
      }
      used.push(...next[w])
    }
    if (changed || Object.keys(s.menus).length !== f.weeks) s.set({ menus: next })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, f.weeks, dinners, s.seed])
  return pool
}

export function Recipes() {
  const s = useBooking()
  const pool = useEnsureMenus()
  const { f, dinners } = pricing(s)
  const [week, setWeek] = useState(1)
  const [swap, setSwap] = useState<number | null>(null)
  const menu = (s.menus[week] || []).map((id) => RECIPES.find((r) => r.id === id)!).filter(Boolean)
  const w = Math.min(week, f.weeks)

  const replace = (idx: number, r: Recipe) => {
    const m = [...(s.menus[w] || [])]
    m[idx] = r.id
    s.set({ menus: { ...s.menus, [w]: m } })
    setSwap(null)
  }
  const reshuffle = () => {
    const used = Object.entries(s.menus).filter(([k]) => Number(k) !== w).flatMap(([, v]) => v)
    s.set({ menus: { ...s.menus, [w]: proposeMenu(pool, Math.min(dinners, pool.length), s.cuisines, s.kids > 0, Math.floor(Math.random() * 1e6), used) } })
  }

  return (
    <>
      <StepHead kicker="Choix des recettes" title="Votre menu est prêt ✨" sub={`Nous avons composé ${dinners} dîners selon votre profil. Changez ce que vous voulez.`} />
      {pool.length < dinners && (
        <p className="mb-6 rounded-2xl bg-coral/10 p-4 text-sm">Seulement {pool.length} recette(s) compatible(s) avec vos critères. Votre cheffe complètera avec des plats sur mesure, ou ajustez vos préférences.</p>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {f.weeks > 1 ? (
          <div className="flex gap-1 overflow-x-auto rounded-full border border-line bg-white/[0.03] p-1">
            {Array.from({ length: f.weeks }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setWeek(n)} className={cx('relative rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap', w === n ? 'text-ink' : 'text-white/70')}>
                {w === n && <motion.span layoutId="week-pill" className="absolute inset-0 rounded-full bg-gradient-brand" />}
                <span className="relative">Semaine {n}</span>
              </button>
            ))}
          </div>
        ) : <span />}
        <button onClick={reshuffle} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm hover:bg-white/10"><Shuffle size={16} /> Me proposer autre chose</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {menu.map((r, i) => (
            <motion.div key={`${w}-${i}-${r.id}`} layout initial={{ opacity: 0, rotateX: -30 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }} className="glass group flex overflow-hidden rounded-3xl">
              <img src={r.img} alt="" className="h-auto w-28 shrink-0 object-cover sm:w-32" />
              <div className="flex flex-1 flex-col p-4">
                <span className="text-xs text-sun">Dîner {i + 1} · {r.tag}</span>
                <span className="mt-1 leading-snug font-semibold">{r.name}</span>
                <span className="mt-1 text-xs text-mute">{CUISINES.find((c) => c.id === r.cuisine)?.label}{r.kids ? ' · Super kids' : ''}</span>
                <button onClick={() => setSwap(i)} className="mt-auto flex items-center gap-1.5 self-start pt-3 text-sm text-white/70 hover:text-white"><RefreshCw size={14} /> Changer</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {swap !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={() => setSwap(null)}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()} className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-ink-2/95 p-6 sm:rounded-3xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">Remplacer le dîner {swap + 1}</h3>
                <button onClick={() => setSwap(null)} className="glass grid h-9 w-9 place-items-center rounded-full" aria-label="Fermer"><X size={16} /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {pool.filter((r) => !(s.menus[w] || []).includes(r.id)).map((r) => (
                  <button key={r.id} onClick={() => replace(swap, r)} className="flex items-center gap-3 rounded-2xl border border-line p-2 text-left transition hover:border-sun/60 hover:bg-white/5">
                    <img src={r.img.replace('w=800', 'w=160')} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <span className="text-sm font-medium">{r.name}</span>
                  </button>
                ))}
              </div>
              {pool.length <= menu.length && <p className="text-sm text-mute">Aucune autre recette compatible.</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function Options() {
  const { options, toggle } = useBooking()
  return (
    <>
      <StepHead kicker="Planification · étape 1 sur 2" title="🥐 Quelles options ?" sub="Sélectionnez autant d’options que vous le souhaitez." />
      <div className="space-y-3">
        {OPTIONS.map((o) => {
          const on = options.includes(o.id)
          return (
            <Chip key={o.id} active={on} onClick={() => toggle('options', o.id)} className="flex w-full items-center gap-4 !p-5">
              <span className="text-3xl">{o.emoji}</span>
              <span className="flex-1">
                <span className="block font-semibold">{o.name}</span>
                <span className="mt-0.5 block text-sm text-mute">{o.desc}</span>
              </span>
              <span className="text-right whitespace-nowrap">
                <span className="block font-display font-bold">+{eur(o.price)}</span>
                <span className="text-xs text-mute">/ semaine</span>
              </span>
              <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-md border-2', on ? 'border-sun bg-sun text-ink' : 'border-white/30')}>{on && <Check size={14} />}</span>
            </Chip>
          )
        })}
      </div>
    </>
  )
}

export function earliestDate() {
  const d = new Date(Date.now() + MIN_NOTICE_HOURS * 3600 * 1000)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  return d
}

export function Schedule() {
  const { startDate, slot, set, formula } = useBooking()
  const f = getFormula(formula)
  const min = earliestDate()
  const [month, setMonth] = useState(() => {
    const d = startDate ? new Date(startDate + 'T12:00:00') : min
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const max = new Date(min)
  max.setDate(max.getDate() + 60)

  const days = useMemo(() => {
    const first = new Date(month)
    const offset = (first.getDay() + 6) % 7
    const out: (Date | null)[] = Array(offset).fill(null)
    const n = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    for (let i = 1; i <= n; i++) out.push(new Date(month.getFullYear(), month.getMonth(), i))
    return out
  }, [month])

  const series = startDate
    ? Array.from({ length: f.weeks }, (_, i) => {
        const d = new Date(startDate + 'T12:00:00')
        d.setDate(d.getDate() + i * 7)
        return toIso(d)
      })
    : []

  const canPrev = month > new Date(min.getFullYear(), min.getMonth(), 1)
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= max

  return (
    <>
      <StepHead kicker="Planification · étape 2 sur 2" title="📅 Quand vient votre cheffe ?" sub={`Choisissez le jour de la première venue (au moins ${MIN_NOTICE_HOURS} h à l’avance) et votre créneau.`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <button disabled={!canPrev} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="glass grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label="Mois précédent"><ChevronLeft size={16} /></button>
            <span className="font-display font-semibold capitalize">{month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            <button disabled={!canNext} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="glass grid h-9 w-9 place-items-center rounded-full disabled:opacity-30" aria-label="Mois suivant"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-mute">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i} className="py-1">{d}</span>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <span key={i} />
              const iso = toIso(d)
              const off = d < min || d > max || d.getDay() === 0
              const sel = iso === startDate
              const inSeries = series.includes(iso)
              return (
                <button
                  key={i}
                  disabled={off}
                  onClick={() => set({ startDate: iso })}
                  className={cx(
                    'aspect-square rounded-xl text-sm font-medium transition',
                    off && 'text-white/15',
                    !off && !sel && 'hover:bg-white/10',
                    sel && 'bg-gradient-brand font-bold text-ink shadow-[0_0_20px_-4px_rgba(255,93,115,0.8)]',
                    inSeries && !sel && 'bg-sun/15 text-sun ring-1 ring-sun/40',
                  )}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs text-mute">Pas de prestation le dimanche.</p>
        </Card>
        <div className="space-y-2">
          <p className="text-sm font-medium">Créneau</p>
          {SLOTS.map((sl) => (
            <Chip key={sl.id} active={slot === sl.id} onClick={() => set({ slot: sl.id })} className="flex w-full items-center gap-3">
              <span className="text-xl">{sl.emoji}</span>
              <span><span className="block font-semibold">{sl.label}</span><span className="text-xs text-mute">{sl.range}</span></span>
            </Chip>
          ))}
        </div>
      </div>
      {series.length > 1 && (
        <Card className="mt-6 p-5">
          <p className="text-sm font-medium">Vos {series.length} venues (même jour, même créneau)</p>
          <div className="mt-3 flex flex-wrap gap-2">{series.map((d, i) => <span key={d} className="rounded-full bg-white/5 px-3 py-1 text-sm capitalize">S{i + 1} · {longDate(d)}</span>)}</div>
        </Card>
      )}
    </>
  )
}

export function AddressStep({ tried }: { tried: boolean }) {
  const { address: a, setAddress } = useBooking()
  const zone = zoneForPostalCode(a.cp)
  const cpErr = a.cp.length === 5 && !zone
  return (
    <>
      <StepHead kicker="Adresse · étape 1 sur 2" title="📍 Où aura lieu la prestation ?" sub="La prestation se déroule à votre domicile (résidence principale ou secondaire)." />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Adresse" required error={tried && !a.street.trim() ? 'Requis' : undefined}>
            <input className="field" autoComplete="street-address" value={a.street} onChange={(e) => setAddress({ street: e.target.value })} placeholder="12 rue des Lilas" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Complément (bâtiment, étage, digicode…)">
            <input className="field" value={a.extra} onChange={(e) => setAddress({ extra: e.target.value })} />
          </Field>
        </div>
        <Field label="Code postal" required error={cpErr ? 'Désolé, nous n’intervenons pas encore dans cette zone.' : tried && !zone ? 'Code postal invalide' : undefined}>
          <div className="relative">
            <input className="field" inputMode="numeric" maxLength={5} autoComplete="postal-code" value={a.cp} onChange={(e) => setAddress({ cp: e.target.value.replace(/\D/g, '') })} placeholder="75011" />
            {zone && <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 rounded-full bg-mint/15 px-2 py-1 text-xs text-mint"><MapPin size={12} /> {zone.name}</span>}
          </div>
        </Field>
        <Field label="Ville" required error={tried && !a.city.trim() ? 'Requis' : undefined}>
          <input className="field" autoComplete="address-level2" value={a.city} onChange={(e) => setAddress({ city: e.target.value })} />
        </Field>
        <Field label="Numéro de téléphone" required error={tried && !isPhone(a.phone) ? 'Format : 06 12 34 56 78' : undefined} hint="Format : 06 12 34 56 78">
          <input className="field" type="tel" autoComplete="tel" value={a.phone} onChange={(e) => setAddress({ phone: e.target.value })} />
        </Field>
      </div>
    </>
  )
}

export function ContactStep({ tried }: { tried: boolean }) {
  const { address: a, setAddress } = useBooking()
  return (
    <>
      <StepHead kicker="Adresse · étape 2 sur 2" title="👋 Qui êtes-vous ?" sub="Pas de compte à créer : juste de quoi vous envoyer la confirmation." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" required error={tried && !a.firstName.trim() ? 'Requis' : undefined}>
          <input className="field" autoComplete="given-name" value={a.firstName} onChange={(e) => setAddress({ firstName: e.target.value })} />
        </Field>
        <Field label="Nom" required error={tried && !a.lastName.trim() ? 'Requis' : undefined}>
          <input className="field" autoComplete="family-name" value={a.lastName} onChange={(e) => setAddress({ lastName: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="E-mail" required error={tried && !isEmail(a.email) ? 'E-mail invalide' : undefined}>
            <input className="field" type="email" autoComplete="email" value={a.email} onChange={(e) => setAddress({ email: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Accès au logement" hint="Serez-vous présent ? Clé chez un voisin, boîte à code, animaux…">
            <textarea rows={3} className="field" value={a.access} onChange={(e) => setAddress({ access: e.target.value })} />
          </Field>
        </div>
      </div>
    </>
  )
}

export function Validation({ tried }: { tried: boolean }) {
  const s = useBooking()
  const p = pricing(s)
  const slot = SLOTS.find((x) => x.id === s.slot)
  return (
    <>
      <StepHead kicker="Validation" title="Confirmation & paiement" sub="Vérifiez votre réservation, puis confirmez." />
      <Card glow className="flex items-start gap-4 p-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-ink"><Banknote /></span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-lg font-bold">Paiement en espèces</span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-sun text-ink"><Check size={14} /></span>
          </div>
          <p className="mt-1 text-sm text-mute">
            Vous réglez <b className="text-white">{eur(p.weekly)}</b> en espèces directement à votre cheffe, à chaque venue{p.f.weeks > 1 ? ` (${p.f.weeks} venues)` : ''}. Pensez à prévoir l’appoint. Aucune carte, aucun compte.
          </p>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Recap title="Profil" lines={[
          `${s.adults} adulte${s.adults > 1 ? 's' : ''}${s.kids ? `, ${s.kids} enfant${s.kids > 1 ? 's' : ''}` : ''}`,
          s.diets.length ? DIETS.filter((d) => s.diets.includes(d.id)).map((d) => d.label).join(', ') : 'Aucun régime particulier',
          s.avoid.length ? `À éviter : ${s.avoid.join(', ')}` : '',
        ]} />
        <Recap title="Planning" lines={[
          s.startDate ? `Dès le ${longDate(s.startDate)}` : '',
          slot ? `${slot.label} (${slot.range})` : '',
          `${p.f.weeks > 1 ? `1 fois par semaine, ${p.f.weeks} semaines` : '1 venue'}`,
        ]} />
        <Recap title="Adresse" lines={[`${s.address.firstName} ${s.address.lastName}`, s.address.street, `${s.address.cp} ${s.address.city}`, s.address.phone]} />
        <Recap title="Menu" lines={Object.entries(s.menus).slice(0, 1).flatMap(([, ids]) => ids.map((id) => '· ' + (RECIPES.find((r) => r.id === id)?.name ?? '')))} more={p.f.weeks > 1 ? `+ ${p.f.weeks - 1} autre(s) semaine(s) composée(s)` : undefined} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Carte cadeau (facultatif)" hint="Votre code sera vérifié par notre équipe et déduit du montant.">
          <input className="field font-mono uppercase" value={s.giftCode} onChange={(e) => s.set({ giftCode: e.target.value })} placeholder="CAD-XXXXXX" />
        </Field>
        <Field label="Un commentaire sur votre réservation ?">
          <textarea rows={2} className="field" value={s.comment} onChange={(e) => s.set({ comment: e.target.value })} />
        </Field>
      </div>

      <label className="mt-6 flex items-start gap-3 text-sm text-white/80">
        <input type="checkbox" checked={s.accepted} onChange={(e) => s.set({ accepted: e.target.checked })} className="mt-1 h-4 w-4 accent-[var(--color-sun)]" />
        <span>Je confirme avoir lu et accepté les <Link to="/cgv" target="_blank" className="underline">conditions générales de vente</Link> ainsi que la <Link to="/confidentialite" target="_blank" className="underline">politique de confidentialité</Link> de {SITE.name}.</span>
      </label>
      {tried && !s.accepted && <p className="mt-1 text-xs text-coral">Merci d’accepter les conditions pour confirmer.</p>}
    </>
  )
}

function Recap({ title, lines, more }: { title: string; lines: string[]; more?: string }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-semibold tracking-widest text-mute uppercase">{title}</div>
      <div className="mt-2 space-y-0.5 text-sm">{lines.filter(Boolean).map((l, i) => <div key={i} className="first-letter:uppercase">{l}</div>)}</div>
      {more && <div className="mt-2 text-xs text-sun">{more}</div>}
    </Card>
  )
}

export function buildSummary(s: BookingState, ref: string) {
  const p = pricing(s)
  const slot = SLOTS.find((x) => x.id === s.slot)
  const menus = Object.entries(s.menus)
    .map(([w, ids]) => `Semaine ${w} : ${ids.map((id) => RECIPES.find((r) => r.id === id)?.name).join(' / ')}`)
    .join('\n')
  return [
    `🍽️ Nouvelle réservation ${ref}`,
    `${p.f.name} — ${p.dinners} dîners/sem. × ${p.f.weeks} sem.`,
    s.formula === 'mois' && s.subscription !== 'none' && `Abonnement : ${s.subscription} mois`,
    `Options : ${p.opts.map((o) => o.name).join(', ') || 'aucune'}`,
    `Montant : ${eur(p.weekly)} / semaine (total ${eur(p.total)}) — ESPÈCES à la cheffe`,
    s.giftCode && `Carte cadeau : ${s.giftCode.toUpperCase()}`,
    '',
    `📅 Début : ${s.startDate ? longDate(s.startDate) : '?'} — ${slot ? `${slot.label} ${slot.range}` : '?'}`,
    `👨‍👩‍👧 ${s.adults} adulte(s), ${s.kids} enfant(s)`,
    `Régimes : ${DIETS.filter((d) => s.diets.includes(d.id)).map((d) => d.label).join(', ') || 'aucun'}`,
    s.avoid.length > 0 && `À éviter : ${s.avoid.join(', ')}`,
    `Cuisines : ${CUISINES.filter((c) => s.cuisines.includes(c.id)).map((c) => c.label).join(', ') || 'pas de préférence'}`,
    `Équipement : ${EQUIPMENTS.filter((e) => s.equipment.includes(e.id)).map((e) => e.label).join(', ')}`,
    '',
    menus,
    '',
    `👤 ${s.address.firstName} ${s.address.lastName} — ${s.address.phone} — ${s.address.email}`,
    `📍 ${s.address.street}${s.address.extra ? ', ' + s.address.extra : ''}, ${s.address.cp} ${s.address.city}`,
    s.address.access && `Accès : ${s.address.access}`,
    s.comment && `💬 ${s.comment}`,
  ]
    .filter((l) => typeof l === 'string')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}
