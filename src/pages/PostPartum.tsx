import { useNavigate } from 'react-router-dom'
import { Baby, Check, Gift, HeartHandshake, Leaf, Moon, Repeat } from 'lucide-react'
import { RECIPES, srcSet, thumb } from '../data/recipes'
import { getFormula } from '../data/formulas'
import { useBooking } from '../store/booking'
import { Button, Card, Container, Eyebrow, HeatBar, Reveal, SectionTitle } from '../components/ui'
import { eur } from '../lib/utils'

const byId = (id: string) => RECIPES.find((r) => r.id === id)!
const HERO = byId('veloute')
// Plats nourrissants, faciles à réchauffer et à manger d'une main.
const DISHES = ['saumon', 'soupe-legumes', 'bowl-pois-chiches', 'chorba'].map(byId)

const PERKS = [
  { icon: <Repeat size={18} />, t: 'Toujours la même cheffe', d: 'Elle connaît vos goûts, votre cuisine et votre rythme.' },
  { icon: <Leaf size={18} />, t: 'Des plats adaptés', d: 'Riches en fer, en fibres et en bons nutriments pour la récupération et l’allaitement.' },
  { icon: <Moon size={18} />, t: 'Zéro charge mentale', d: 'Courses en option, cuisine rangée et nettoyée : vous ne gérez rien.' },
  { icon: <HeartHandshake size={18} />, t: 'Flexible', d: 'Mise en pause possible si bébé a d’autres plans.' },
]

/** Réserve directement la formule Post-partum (5 dîners par semaine). */
function useBookPostpartum() {
  const set = useBooking((s) => s.set)
  const nav = useNavigate()
  return () => {
    set({ formula: 'postpartum', dinners: 5, subscription: 'none' })
    nav('/reservation')
  }
}

export default function PostPartum() {
  const book = useBookPostpartum()
  return (
    <>
      <Hero onBook={book} />
      <Perks />
      <Dishes />
      <Price onBook={book} />
    </>
  )
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section className="pt-4 pb-14 sm:pt-10 sm:pb-20">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
        <div className="min-w-0">
          <Eyebrow tone="violet">Post-partum chill, pendant 5 semaines</Eyebrow>
          <h1 className="mt-5 font-display text-[2.4rem] leading-[1.04] font-semibold tracking-[-0.04em] sm:mt-6 sm:text-[3.4rem] xl:text-[4rem]">
            Bien manger compte double.
          </h1>
          <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-mute sm:mt-6 sm:text-lg">
            Les nuits sont hachées, les journées filent, et vous n’avez qu’une envie : profiter de bébé. Pendant 5 semaines, votre cheffe vient cuisiner chez vous. Vous, vous vous concentrez sur l’essentiel.
          </p>
          <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <Button onClick={onBook} size="lg"><Baby size={18} /> Réserver le Post-partum</Button>
            <Button to="/cartes-cadeaux?formule=postpartum" size="lg" variant="ghost"><Gift size={18} /> L’offrir à de jeunes parents</Button>
          </div>
        </div>

        {/* Une photo, et les 5 semaines de la formule : une venue par semaine, la même cheffe */}
        <div className="relative min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] ring-1 ring-white/10 lg:aspect-square">
            <img src={HERO.img} srcSet={srcSet(HERO.img)} sizes="(min-width: 1024px) 45vw, 100vw" alt={HERO.name} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 rounded-[22px] border border-line bg-ink/80 p-4 sm:inset-x-4 sm:bottom-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">5 venues, 25 dîners</span>
                <span className="text-mute">une seule cheffe</span>
              </div>
              <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-label="Une venue par semaine pendant 5 semaines">
                {[1, 2, 3, 4, 5].map((w) => (
                  <li key={w}>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div className="h-full bg-heat" style={{ backgroundSize: '500% 100%', backgroundPosition: `${(w - 1) * 25}% 0` }} />
                    </div>
                    <div className="mt-1.5 text-center text-xs text-mute">S{w}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function Perks() {
  return (
    <section className="py-14 sm:py-20">
      <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <SectionTitle title="Pensé pour les jeunes parents" sub="Une aide concrète au moment où l’on en a le plus besoin, sans rien à organiser." className="!mb-0" />
        <ul className="divide-y divide-line border-y border-line">
          {PERKS.map((p) => (
            <li key={p.t} className="flex gap-4 py-4 sm:py-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.05] text-sun">{p.icon}</span>
              <div>
                <h3 className="font-display text-[17px] font-semibold tracking-tight">{p.t}</h3>
                <p className="mt-1 text-mute">{p.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

function Dishes() {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <SectionTitle title="Au menu, par exemple" sub="Des plats nourrissants, faciles à réchauffer et à manger d’une main. Votre menu est composé avec vous à la réservation." />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {DISHES.map((r) => (
            <article key={r.id} className="glass w-[70%] shrink-0 snap-center overflow-hidden rounded-[22px] sm:w-auto">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={thumb(r.img, 600)} srcSet={srcSet(r.img)} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 70vw" alt={r.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-[15px] leading-snug font-medium tracking-tight">{r.name}</h3>
                <div className="mt-2.5 flex items-center gap-2">
                  <HeatBar value={r.minutes} max={25} className="flex-1" />
                  <span className="text-xs text-mute tabular-nums">{r.minutes} min</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Price({ onBook }: { onBook: () => void }) {
  const f = getFormula('postpartum')
  const d = f.dinners[0]
  const weekly = f.price[d]
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <Reveal>
          <Card className="heat-edge grid overflow-hidden rounded-[32px] !border-0 lg:grid-cols-[1fr_1.1fr]">
            <div className="relative p-6 sm:p-10">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_80%_at_0%_100%,rgba(255,106,61,0.18),transparent_60%)]" />
              <h2 className="font-display text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">{f.name}</h2>
              <p className="mt-2 text-mute">{f.pitch}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="font-display text-[3rem] leading-none font-semibold tracking-[-0.04em] sm:text-6xl">{eur(weekly)}</span>
                <span className="pb-1 whitespace-nowrap text-mute">/ semaine</span>
              </div>
              <p className="mt-3 text-white/85">
                Soit <span className="font-semibold text-sun">{eur(weekly / d)}</span> le dîner pour toute la famille.
              </p>
              <p className="mt-1 text-sm text-mute">{eur(weekly * f.weeks)} sur {f.weeks} semaines, réglé en espèces à chaque venue. Courses non incluses.</p>
            </div>
            <div className="border-t border-line p-6 sm:p-10 lg:border-t-0 lg:border-l">
              <ul className="space-y-3">
                {f.perks.map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-mint" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid gap-3">
                <Button onClick={onBook} size="lg" className="w-full"><Baby size={18} /> Réserver le Post-partum</Button>
                <Button to="/cartes-cadeaux?formule=postpartum" size="lg" variant="ghost" className="w-full"><Gift size={18} /> L’offrir à de jeunes parents</Button>
              </div>
            </div>
          </Card>
        </Reveal>
      </Container>
    </section>
  )
}
