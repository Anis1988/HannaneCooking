import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2, RotateCcw } from 'lucide-react'
import { zoneForPostalCode } from '../../config'
import { pricing, useBooking, type BookingState } from '../../store/booking'
import { Button, Card, Container } from '../../components/ui'
import { isEmail, isPhone, SuccessPanel } from '../../components/form'
import { cx, eur, longDate, makeRef, submit } from '../../lib/utils'
import { AddressStep, buildSummary, ContactStep, Diet, earliestDate, FormulaStep, Kitchen, Options, People, Recipes, Schedule, Tastes, Validation } from './steps'

type Step = { path: string; section: Section; render: (tried: boolean) => ReactNode; valid?: (s: BookingState) => boolean }
type Section = 'Profil' | 'Formule' | 'Recettes' | 'Planification' | 'Adresse' | 'Validation'

const SECTIONS: { id: Section; sub: string }[] = [
  { id: 'Profil', sub: 'Vos habitudes alimentaires' },
  { id: 'Formule', sub: 'Une semaine ou un mois' },
  { id: 'Recettes', sub: 'Validez votre menu' },
  { id: 'Planification', sub: 'Options, jour et créneau' },
  { id: 'Adresse', sub: 'Où et qui' },
  { id: 'Validation', sub: 'Paiement en espèces' },
]

const STEPS: Step[] = [
  { path: 'profil/personnes-a-table', section: 'Profil', render: () => <People /> },
  { path: 'profil/regime-alimentaire', section: 'Profil', render: () => <Diet /> },
  { path: 'profil/envies', section: 'Profil', render: () => <Tastes /> },
  { path: 'profil/dans-votre-cuisine', section: 'Profil', render: () => <Kitchen /> },
  { path: 'formule', section: 'Formule', render: () => <FormulaStep /> },
  { path: 'choix-recettes', section: 'Recettes', render: () => <Recipes />, valid: (s) => Object.values(s.menus).some((m) => m.length > 0) },
  { path: 'planning/options', section: 'Planification', render: () => <Options /> },
  {
    path: 'planning/date',
    section: 'Planification',
    render: () => <Schedule />,
    valid: (s) => !!s.startDate && !!s.slot && new Date(s.startDate + 'T12:00:00') >= earliestDate(),
  },
  {
    path: 'adresse-prestation',
    section: 'Adresse',
    render: (t) => <AddressStep tried={t} />,
    valid: (s) => !!s.address.street.trim() && !!zoneForPostalCode(s.address.cp) && !!s.address.city.trim() && isPhone(s.address.phone),
  },
  {
    path: 'coordonnees',
    section: 'Adresse',
    render: (t) => <ContactStep tried={t} />,
    valid: (s) => !!s.address.firstName.trim() && !!s.address.lastName.trim() && isEmail(s.address.email),
  },
  { path: 'validation', section: 'Validation', render: (t) => <Validation tried={t} />, valid: (s) => s.accepted },
]

const firstInvalid = (s: BookingState, upTo: number) => {
  for (let i = 0; i < upTo; i++) if (STEPS[i].valid && !STEPS[i].valid!(s)) return i
  return -1
}

export default function Booking() {
  const path = useParams()['*'] || ''
  const nav = useNavigate()
  const s = useBooking()
  const [tried, setTried] = useState(false)
  const [sending, setSending] = useState(false)
  const idx = STEPS.findIndex((st) => st.path === path)

  useEffect(() => {
    setTried(false)
  }, [path])

  if (path === 'fin') {
    if (!s.confirmed) return <Navigate to="/reservation" replace />
    return <Done />
  }
  if (idx < 0) return <Navigate to={`/reservation/${STEPS[0].path}`} replace />
  const blocker = firstInvalid(s, idx)
  if (blocker >= 0) return <Navigate to={`/reservation/${STEPS[blocker].path}`} replace />

  const step = STEPS[idx]
  const secIdx = SECTIONS.findIndex((x) => x.id === step.section)
  const progress = ((idx + 1) / STEPS.length) * 100
  const isLast = idx === STEPS.length - 1

  const next = async () => {
    if (step.valid && !step.valid(s)) {
      setTried(true)
      return
    }
    if (!isLast) return nav(`/reservation/${STEPS[idx + 1].path}`)
    setSending(true)
    const ref = makeRef('HC')
    const summary = buildSummary(s, ref)
    const sent = await submit('Réservation', ref, summary, {
      formula: s.formula, dinners: s.dinners, options: s.options, startDate: s.startDate, slot: s.slot,
      adults: s.adults, kids: s.kids, diets: s.diets, avoid: s.avoid, menus: s.menus, address: s.address, comment: s.comment, giftCode: s.giftCode,
    })
    s.set({ confirmed: { ref, summary, sent } })
    setSending(false)
    nav('/reservation/fin')
  }

  return (
    <Container className="pb-36 sm:pb-40">
      {/* barre de progression mobile */}
      <div className="sticky top-[68px] z-30 -mx-4 mb-5 bg-ink/80 px-4 py-2.5 backdrop-blur-xl sm:top-[76px] lg:hidden">
        <div className="mb-1.5 flex justify-between text-xs text-mute">
          <span className="font-semibold text-white">{step.section}</span>
          <span>{idx + 1} / {STEPS.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full rounded-full bg-gradient-brand" animate={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr_300px]">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 space-y-1">
            {SECTIONS.map((sec, i) => {
              const done = i < secIdx
              const cur = i === secIdx
              return (
                <button
                  key={sec.id}
                  disabled={!done}
                  onClick={() => nav(`/reservation/${STEPS.find((x) => x.section === sec.id)!.path}`)}
                  className={cx('flex w-full items-center gap-3 rounded-2xl p-3 text-left transition', cur && 'glass', done && 'hover:bg-white/5')}
                >
                  <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold', done ? 'bg-mint/20 text-mint' : cur ? 'bg-gradient-brand text-ink' : 'bg-white/5 text-mute')}>
                    {done ? <Check size={15} /> : i + 1}
                  </span>
                  <span>
                    <span className={cx('block text-sm font-semibold', !cur && !done && 'text-mute')}>{sec.id}</span>
                    <span className="block text-xs text-mute">{sec.sub}</span>
                  </span>
                </button>
              )
            })}
            <button onClick={() => { s.reset(); nav('/reservation') }} className="mt-4 flex items-center gap-2 px-3 text-xs text-mute hover:text-white"><RotateCcw size={12} /> Recommencer</button>
          </nav>
        </aside>

        <section className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={path} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              {step.render(tried)}
            </motion.div>
          </AnimatePresence>
          {tried && step.valid && !step.valid(s) && (
            <p className="mt-6 rounded-2xl bg-coral/10 p-3 text-sm text-coral">Merci de compléter les champs requis pour continuer.</p>
          )}
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-28"><PriceBox /></div>
        </aside>
      </div>

      {/* barre d'action */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:border-0 sm:bg-transparent sm:p-4 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl items-center gap-3 sm:glass sm:rounded-full sm:bg-ink/80 sm:p-2 sm:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]">
          <button
            onClick={() => (idx > 0 ? nav(`/reservation/${STEPS[idx - 1].path}`) : nav('/'))}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/5 hover:bg-white/10"
            aria-label="Retour"
          >
            <ArrowLeft size={18} />
          </button>
          <MiniPrice />
          <Button onClick={next} size="lg" className="ml-auto shrink-0 !px-5 sm:!px-6" disabled={sending}>
            {sending ? <Loader2 className="animate-spin" size={18} /> : isLast ? <>Confirmer <Check size={18} /></> : <>Continuer <ArrowRight size={18} /></>}
          </Button>
        </div>
      </div>
    </Container>
  )
}

function MiniPrice() {
  const p = pricing(useBooking())
  return (
    <div className="min-w-0 leading-tight">
      <div className="truncate font-display text-lg font-bold">{eur(p.weekly)}<span className="text-xs font-normal text-mute"> / sem.</span></div>
      <div className="truncate text-xs text-mute">{p.f.name} · espèces</div>
    </div>
  )
}

function PriceBox() {
  const s = useBooking()
  const p = pricing(s)
  return (
    <Card className="p-6">
      <div className="text-xs font-semibold tracking-widest text-mute uppercase">Ma réservation</div>
      <div className="mt-2 font-display text-xl font-bold">{p.f.name}</div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <Stat n={p.dinners} l="dîners / sem." />
        <Stat n={s.adults + s.kids} l="personnes" />
        <Stat n={p.f.weeks} l={p.f.weeks > 1 ? 'semaines' : 'semaine'} />
        <Stat n={eur(p.perDinner)} l="le dîner" />
      </div>
      <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        <Row l="Formule" r={eur(p.base)} />
        {p.opts.map((o) => <Row key={o.id} l={o.name} r={`+${eur(o.price)}`} />)}
        {!p.opts.length && <div className="text-xs text-mute">Aucune option sélectionnée</div>}
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
        <span className="text-sm text-mute">Par semaine</span>
        <motion.span key={p.weekly} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-3xl font-extrabold text-gradient">{eur(p.weekly)}</motion.span>
      </div>
      {p.f.weeks > 1 && <div className="mt-1 text-right text-xs text-mute">Total {eur(p.total)} sur {p.f.weeks} semaines</div>}
      {s.startDate && <div className="mt-4 rounded-xl bg-white/5 p-3 text-xs capitalize">📅 {longDate(s.startDate)}</div>}
      <div className="mt-4 rounded-xl bg-sun/10 p-3 text-xs">💶 Réglé en espèces à la cheffe, à chaque venue. Courses non incluses.</div>
    </Card>
  )
}

const Stat = ({ n, l }: { n: ReactNode; l: string }) => (
  <div className="rounded-2xl bg-white/[0.04] p-3">
    <div className="font-display text-lg font-bold">{n}</div>
    <div className="text-[11px] text-mute">{l}</div>
  </div>
)
const Row = ({ l, r }: { l: string; r: string }) => (
  <div className="flex justify-between gap-3"><span className="text-mute">{l}</span><span>{r}</span></div>
)

function Done() {
  const s = useBooking()
  const nav = useNavigate()
  const c = s.confirmed!
  const p = pricing(s)
  return (
    <Container className="py-6">
      <SuccessPanel title="Réservation enregistrée 🎉" refId={c.ref} summary={c.summary} subject={`Réservation ${c.ref}`} sent={c.sent}>
        <p className="mt-4 text-mute">
          Merci {s.address.firstName} ! Votre cheffe viendra {s.startDate && <b className="text-white">le {longDate(s.startDate)}</b>}. Prévoyez <b className="text-white">{eur(p.weekly)} en espèces</b> à chaque venue. Vous recevrez votre liste de courses avant la prestation.
        </p>
        <p className="mt-2 text-sm text-mute">Report ou annulation gratuits jusqu’à 48 h avant, en rappelant votre numéro.</p>
      </SuccessPanel>
      <div className="mt-8 flex justify-center gap-3">
        <Button to="/" variant="ghost">Retour à l’accueil</Button>
        <Button onClick={() => { s.reset(); nav('/reservation') }} variant="soft">Nouvelle réservation</Button>
      </div>
    </Container>
  )
}
