import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Baby, Banknote, CalendarClock, ChefHat, Gift, Heart, ListChecks, Minus, Plus, ShieldCheck, Sparkles, Users, WandSparkles } from 'lucide-react'
import { IMAGES, RECIPES, srcSet, thumb, type Recipe } from '../data/recipes'
import { getFormula, type OptionId } from '../data/formulas'
import { Button, Card, Container, Eyebrow, HeatBar, Reveal, SectionTitle } from '../components/ui'
import { CtaBanner, FaqList, PricingCards, ResumeBanner, Reviews, ZoneCheck } from '../components/sections'
import { useBooking } from '../store/booking'
import { useFavs } from '../store/favs'
import { cx, eur } from '../lib/utils'

const byId = (id: string) => RECIPES.find((r) => r.id === id)!
const WEEK: { day: string; label: string; r: Recipe }[] = [
  { day: 'Lun', label: 'Lasagnes', r: byId('lasagnes') },
  { day: 'Mar', label: 'Curry de poulet', r: byId('curry-poulet') },
  { day: 'Mer', label: 'Chakchouka', r: byId('shakshuka') },
  { day: 'Jeu', label: 'Saumon et légumes', r: byId('saumon') },
  { day: 'Ven', label: 'Pizza maison', r: byId('pizza') },
]
const FEATURED = ['tikka', 'kefta', 'bowl-pois-chiches', 'poulet-grille', 'veloute'].map(byId)

/** Lundi de la semaine prochaine, pour ancrer le visuel dans le réel. */
function nextMonday() {
  const d = new Date()
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7))
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <section id="formules" className="py-16 sm:py-24">
        <Container>
          <SectionTitle title="Une semaine pour essayer, un mois pour souffler" sub="Sans engagement. Report ou annulation gratuits jusqu’à 48 h avant la venue." />
          <PricingCards />
        </Container>
      </section>
      <Calculator />
      <Included />
      <Dishes />
      <PostPartumTeaser />
      <GiftTeaser />
      <section className="py-16 sm:py-24">
        <Container>
          <SectionTitle title="Ce qu’en disent les familles" />
          <Reviews />
        </Container>
      </section>
      <section className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionTitle title="Vos questions, nos réponses" sub="Organisation, cheffes, courses, paiement : l’essentiel est ici." className="!mb-6" />
            <div className="flex flex-wrap gap-3">
              <Button to="/faq" variant="ghost">Toutes les réponses</Button>
            </div>
          </div>
          <FaqList limit={5} />
        </Container>
      </section>
      <Container className="space-y-6">
        <CtaBanner title="Envie de souffler cette semaine ?" sub="Votre cheffe s’occupe des dîners. Vous, vous profitez de vos soirées." />
        <BecomeChefTeaser />
      </Container>
    </>
  )
}

function Hero() {
  return (
    <section className="relative pt-4 pb-14 sm:pt-12 sm:pb-24">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 xl:grid-cols-[0.85fr_1.15fr]">
        <div>
          <ResumeBanner />
          <h1 className="font-display text-[2.45rem] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[3.6rem] xl:text-[4.4rem]">
            Fini la charge mentale des repas.
          </h1>
          <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-mute sm:mt-6 sm:text-xl">
            Votre cheffe vient chez vous et cuisine <span className="text-white">tous vos dîners de la semaine en 2 heures</span>. Du vrai fait maison, adapté à vos goûts, vos allergies et votre cuisine.
          </p>
          <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <Button to="/reservation" size="lg">Réserver ma semaine</Button>
            <Button to="/menus" size="lg" variant="ghost">Voir les menus</Button>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-mint" /> Sans compte</li>
            <li className="flex items-center gap-2"><Banknote size={16} className="text-mint" /> Paiement en espèces</li>
            <li className="flex items-center gap-2"><CalendarClock size={16} className="text-mint" /> Report gratuit jusqu’à 48 h</li>
          </ul>
          <ZoneCheck className="mt-8 max-w-md" />
        </div>
        <WeekScan />
      </Container>
    </section>
  )
}

/** Le moment signature : la semaine de dîners vue en thermique, qui « refroidit » en photo réelle.
 *  Le balayage démarre quand les premières photos sont chargées (ou au bout de 3 s). */
function WeekScan() {
  const [ready, setReady] = useState(false)
  const [seen, setSeen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const loaded = useRef(new Set<number>())
  const onReady = (i: number) => {
    loaded.current.add(i)
    if (loaded.current.size >= 3) setReady(true)
  }
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 3000)
    // sur mobile le visuel est sous la ligne de flottaison : on attend qu'il soit à l'écran
    const io = new IntersectionObserver(
      (entries, obs) => {
        if (!entries[0]?.isIntersecting) return
        setSeen(true)
        obs.disconnect()
      },
      { threshold: 0.35 },
    )
    if (root.current) io.observe(root.current)
    return () => {
      clearTimeout(t)
      io.disconnect()
    }
  }, [])
  return (
    <div ref={root} className={cx('relative min-w-0 -mx-4 sm:mx-0', ready && seen && 'run')} aria-label="Exemple de semaine : cinq dîners cuisinés en une seule venue">
      <div className="relative px-4 py-5 sm:rounded-[32px] sm:border sm:border-line sm:bg-white/[0.02] sm:p-6">
        <div className="reticle max-sm:hidden" />
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
          <span className="text-sm text-white/80">Semaine du {nextMonday()}</span>
          <span className="flex items-center gap-2 text-sm text-mute">
            <span className="h-2 w-2 rounded-full bg-coral shadow-[0_0_12px_var(--color-coral)]" /> Cuisiné chez vous en 2 h
          </span>
        </div>
        <div className="no-scrollbar relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <ol className="relative flex w-max gap-2.5 sm:grid sm:w-auto sm:grid-cols-5 sm:gap-3">
            {WEEK.map(({ day, label, r }, i) => (
              <li key={day} className="w-[36vw] max-w-40 shrink-0 sm:w-auto sm:max-w-none">
                <div className="relative aspect-[3/4.8] overflow-hidden rounded-[20px] bg-ink-3 ring-1 ring-white/10">
                  <img
                    ref={(el) => el?.complete && el.naturalWidth > 0 && onReady(i)}
                    onLoad={() => onReady(i)}
                    src={thumb(r.img, 400)}
                    alt={r.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    fetchPriority={i < 3 ? 'high' : 'auto'}
                    decoding="async"
                  />
                  <img src={thumb(r.img, 400)} alt="" aria-hidden className="thermal thermal-layer absolute inset-0 h-full w-full object-cover" style={{ '--i': i } as React.CSSProperties} />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 to-transparent" />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold">{day}</span>
                  <span className="absolute inset-x-3 bottom-3 text-sm leading-tight font-medium">{label}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2 px-0.5">
                  <HeatBar value={r.minutes} max={25} className="flex-1" />
                  <span className="text-xs text-mute tabular-nums">{r.minutes} min</span>
                </div>
              </li>
            ))}
            <span className="scanline pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent_80%,rgba(255,180,67,0.14)_97%,#fff1c9)] max-sm:hidden" aria-hidden />
          </ol>
        </div>
        <p className="mt-4 px-1 text-sm text-mute">Sous chaque plat, le temps qu’il vous reste pour le réchauffer.</p>
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { when: '2 jours avant', t: 'Vous validez le menu', d: 'Vous choisissez vos plats et recevez la liste de courses. Ou on fait les courses pour vous.', icon: <ListChecks size={20} /> },
    { when: 'Le jour J, 2 heures', t: 'Votre cheffe cuisine chez vous', d: 'Elle prépare tous les dîners, les met en boîtes étiquetées, puis range et nettoie.', icon: <ChefHat size={20} /> },
    { when: 'Du lundi au vendredi', t: 'Vous réchauffez, vous savourez', d: 'Entre 5 et 25 minutes par soir. Vos soirées vous appartiennent de nouveau.', icon: <Heart size={20} /> },
  ]
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionTitle title="Comment ça marche" sub="Trois temps, une seule venue par semaine." />
        <div className="relative">
          {/* La ligne du temps chauffe le jour J, puis refroidit au fil de la semaine */}
          <div className="absolute top-[22px] right-[16%] left-[16%] hidden h-[3px] rounded-full bg-[linear-gradient(90deg,#3a26c4,#7b5cff_22%,#f0449b_38%,#ffb443_50%,#ff6a3d_60%,#7b5cff_82%,#8fb8ff)] md:block" />
          <div className="absolute top-6 bottom-16 left-[22px] w-[3px] rounded-full bg-[linear-gradient(180deg,#3a26c4,#7b5cff_22%,#f0449b_38%,#ffb443_50%,#ff6a3d_60%,#7b5cff_82%,#8fb8ff)] md:hidden" />
          <ol className="grid gap-7 md:grid-cols-3 md:gap-6">
            {steps.map((s, i) => (
              <li key={s.t} className="relative flex gap-4 md:block md:text-center">
                <span className={cx('relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border md:mx-auto', i === 1 ? 'border-sun bg-sun text-ink shadow-[0_0_40px_-6px_var(--color-coral)]' : 'border-line bg-ink-2 text-white/85')}>
                  {s.icon}
                </span>
                <div className="md:mt-5">
                  <div className={cx('text-sm font-medium', i === 1 ? 'text-sun' : 'text-mute')}>{s.when}</div>
                  <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{s.t}</h3>
                  <p className="mt-1.5 text-mute md:mx-auto md:max-w-[30ch]">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

/** Simulateur : prix par portion et temps rendu selon le foyer et le rythme choisi. */
function Calculator() {
  const set = useBooking((s) => s.set)
  const nav = useNavigate()
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(2)
  const [formula, setFormula] = useState<'semaine' | 'mois'>('mois')
  const [dinners, setDinners] = useState(4)
  const f = getFormula(formula)
  const d = formula === 'semaine' ? 5 : dinners
  const family = adults > 2 || kids > 3
  const weekly = f.price[d] + (family ? 20 : 0)
  const people = adults + kids
  const perPortion = weekly / (d * people)
  const hoursMonth = d * 4 // environ 1 h gagnée par dîner (idée, courses, cuisine, vaisselle)

  const book = () => {
    set({ adults, kids, formula, dinners: d, options: family ? (['family'] as OptionId[]) : [] })
    nav('/reservation')
  }

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Card className="grid overflow-hidden rounded-[32px] lg:grid-cols-[1.1fr_1fr]">
          <div className="p-6 sm:p-10">
            <h2 className="font-display text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">Combien pour votre foyer ?</h2>
            <p className="mt-2 text-mute">Réglez, le calcul se fait tout seul.</p>
            <div className="mt-7 space-y-5">
              <Stepper label="Adultes" value={adults} min={1} max={6} onChange={setAdults} />
              <Stepper label="Enfants" value={kids} min={0} max={5} onChange={setKids} />
              <div>
                <div className="mb-2 text-sm font-medium">Rythme</div>
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-white/[0.03] p-1">
                  {(['semaine', 'mois'] as const).map((id) => (
                    <button key={id} onClick={() => setFormula(id)} className={cx('rounded-xl py-2.5 text-sm font-semibold transition-colors', formula === id ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white')}>
                      {id === 'semaine' ? 'Une semaine' : 'Tout le mois'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Dîners par semaine</div>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map((n) => {
                    const off = formula === 'semaine' && n !== 5
                    return (
                      <button key={n} disabled={off} onClick={() => setDinners(n)} className={cx('rounded-2xl border py-3 font-display text-lg font-semibold transition', d === n ? 'border-sun/80 bg-sun/10' : 'border-line', off && 'opacity-30')}>
                        {n}
                      </button>
                    )
                  })}
                </div>
                {formula === 'semaine' && <p className="mt-2 text-xs text-mute">La semaine chill comprend 5 dîners.</p>}
              </div>
            </div>
          </div>
          <div className="relative flex flex-col justify-between gap-8 border-t border-line bg-[radial-gradient(120%_90%_at_100%_100%,rgba(255,106,61,0.22),transparent_60%),radial-gradient(90%_70%_at_0%_0%,rgba(58,38,196,0.35),transparent_60%)] p-6 sm:p-10 lg:border-t-0 lg:border-l">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-7">
              <div className="col-span-2">
                <dt className="text-sm text-mute">Par portion</dt>
                <dd className="mt-1 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">{eur(Math.round(perPortion * 100) / 100)}</dd>
                <dd className="mt-1 text-sm text-mute">{people} personne{people > 1 ? 's' : ''} × {d} dîners, fait maison</dd>
              </div>
              <div>
                <dt className="text-sm text-mute">Par semaine</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{eur(weekly)}</dd>
              </div>
              <div>
                <dt className="text-sm text-mute">Temps rendu</dt>
                <dd className="mt-1 font-display text-2xl font-semibold">{hoursMonth} h<span className="text-base font-normal text-mute"> / mois</span></dd>
              </div>
            </dl>
            <div>
              {family && <p className="mb-4 rounded-2xl bg-white/[0.06] p-3 text-sm">Grande tablée : l’option Family + (portions doublées, +20 €) est incluse dans le calcul.</p>}
              <p className="mb-4 text-xs text-mute">Courses non comprises. Réglé en espèces à la cheffe, à chaque venue.</p>
              <Button onClick={book} size="lg" className="w-full">Réserver avec ces réglages</Button>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  )
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="grid h-10 w-10 place-items-center rounded-full border border-line disabled:opacity-30" aria-label={`Moins d’${label.toLowerCase()}`}><Minus size={16} /></button>
        <span className="w-6 text-center font-display text-xl font-semibold tabular-nums" aria-live="polite">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="grid h-10 w-10 place-items-center rounded-full border border-line disabled:opacity-30" aria-label={`Plus d’${label.toLowerCase()}`}><Plus size={16} /></button>
      </div>
    </div>
  )
}

function Included() {
  const items = [
    { icon: <Users size={18} />, t: 'Des dîners pour 2 adultes et jusqu’à 3 enfants' },
    { icon: <WandSparkles size={18} />, t: 'Un menu choisi avec vous, selon vos goûts et allergies' },
    { icon: <ListChecks size={18} />, t: 'La liste de courses envoyée à l’avance' },
    { icon: <Sparkles size={18} />, t: 'La cuisine rangée et nettoyée avant son départ' },
    { icon: <ShieldCheck size={18} />, t: 'Ingrédients à votre charge, ou courses faites en option' },
    { icon: <Banknote size={18} />, t: 'Règlement en espèces, directement à la cheffe' },
  ]
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] ring-1 ring-white/10">
            <img src={IMAGES.kitchen} srcSet={srcSet(IMAGES.kitchen)} sizes="(min-width: 1024px) 50vw, 100vw" alt="Une cheffe cuisine dans une cuisine familiale" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink/60 via-transparent to-transparent" />
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionTitle title="À chaque venue" sub="Tout ce qui est compris, sans supplément caché." className="!mb-6" />
          <ul className="divide-y divide-line border-y border-line">
            {items.map((it) => (
              <li key={it.t} className="flex items-center gap-4 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.05] text-sun">{it.icon}</span>
                <span className="text-[15px]">{it.t}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}

function Dishes() {
  const favs = useFavs()
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle title="Au menu cette saison" sub={`${RECIPES.length} recettes, du réconfortant au super kids. Touchez le cœur pour garder vos préférés.`} className="!mb-0" />
          <Button to="/menus" variant="ghost">Toute la carte <ArrowRight size={16} /></Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
          {FEATURED.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.05} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
              <article className="group relative h-full min-h-48 overflow-hidden rounded-[24px] ring-1 ring-white/10 sm:min-h-60">
                <img src={r.img} srcSet={srcSet(r.img)} sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'} alt={r.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                <button onClick={() => favs.toggle(r.id)} aria-pressed={favs.ids.includes(r.id)} aria-label={favs.ids.includes(r.id) ? `Retirer ${r.name} des favoris` : `Ajouter ${r.name} aux favoris`} className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-ink/70">
                  <Heart size={18} className={favs.ids.includes(r.id) ? 'fill-coral text-coral' : 'text-white'} />
                </button>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="text-xs text-white/70">{r.tag}</span>
                  <h3 className={cx('mt-1 font-display leading-tight font-semibold tracking-tight', i === 0 ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base')}>{r.name}</h3>
                  <div className="mt-2.5 flex max-w-48 items-center gap-2">
                    <HeatBar value={r.minutes} max={25} className="flex-1" />
                    <span className="text-xs text-mute tabular-nums">{r.minutes} min</span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function PostPartumTeaser() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Card className="grid overflow-hidden rounded-[32px] lg:grid-cols-2">
          <div className="relative min-h-56 sm:min-h-80">
            <img src={RECIPES[13].img} srcSet={srcSet(RECIPES[13].img)} sizes="(min-width: 1024px) 50vw, 100vw" alt="Velouté de butternut fait maison" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-2/70 max-lg:bg-gradient-to-t" />
          </div>
          <div className="p-6 sm:p-12">
            <Eyebrow tone="violet">Juste après la naissance</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Bien manger compte double.</h2>
            <p className="mt-4 text-mute">
              Les nuits sont hachées, les journées filent. Pendant 5 semaines, votre cheffe vient cuisiner chez vous. Toujours la même, celle qui connaît vos goûts. Vous, vous profitez de bébé.
            </p>
            <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
              <Button to="/post-partum"><Baby size={18} /> Découvrir le Post-partum chill</Button>
              <Button to="/cartes-cadeaux" variant="ghost"><Gift size={18} /> L’offrir</Button>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  )
}

/** Carte cadeau : une plaque de cuisson vue en thermique. Inclinaison 3D au survol. */
export function GiftCardVisual({ amount, to }: { amount?: number; to?: string }) {
  return (
    <motion.div
      whileHover={{ rotateX: 7, rotateY: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      style={{ transformPerspective: 900 }}
      className="relative aspect-[1.6] w-full max-w-md overflow-hidden rounded-[26px] border border-white/15 bg-[#160f45] p-5 shadow-[0_40px_100px_-30px_rgba(255,106,61,0.6)] sm:p-7"
    >
      <div className="absolute -top-16 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,#fff1c9_0%,#ffb443_18%,#ff6a3d_34%,#f0449b_52%,#7b5cff_70%,transparent_72%)] opacity-90" />
      <div className="absolute -top-16 -right-20 h-64 w-64 rounded-full border-[10px] border-[#160f45]/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.14),transparent_45%)]" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-semibold tracking-tight sm:text-lg">hannane<span className="text-white/60">cooking</span></span>
        </div>
        <div>
          <div className="text-sm text-white/75">Carte cadeau{to ? ` pour ${to}` : ''}</div>
          <div className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{amount ? eur(amount) : 'Du temps offert'}</div>
        </div>
      </div>
    </motion.div>
  )
}

function GiftTeaser() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
        <Reveal className="flex justify-center"><GiftCardVisual /></Reveal>
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-[2.6rem] sm:leading-[1.1]">Offrez des soirées libres à ceux que vous aimez.</h2>
          <p className="mt-4 text-lg text-mute">Pour une naissance, un anniversaire ou simplement pour faire plaisir : de vrais repas faits maison. À partir de 20 €.</p>
          <Button to="/cartes-cadeaux" size="lg" className="mt-8 w-full sm:w-auto"><Gift size={18} /> Offrir une carte cadeau</Button>
        </Reveal>
      </Container>
    </section>
  )
}

function BecomeChefTeaser() {
  return (
    <Reveal>
      <Card className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <img src={IMAGES.chef} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20" />
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Devenez cheffe partenaire</h3>
            <p className="mt-1 text-mute">Passionnée de cuisine, pro ou amatrice ? Formez-vous au batch cooking à domicile et vivez de votre passion.</p>
          </div>
        </div>
        <Button to="/devenir-cheffe" variant="ghost" className="w-full shrink-0 sm:w-auto"><ChefHat size={18} /> Devenir cheffe</Button>
      </Card>
    </Reveal>
  )
}
