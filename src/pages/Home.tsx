import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Baby, Banknote, CalendarCheck, ChefHat, Clock, Gift, ListChecks, ShieldCheck, Sparkles, Users, UtensilsCrossed, WandSparkles } from 'lucide-react'
import { IMAGES, RECIPES } from '../data/recipes'
import { Button, Card, Container, Eyebrow, Reveal, SectionTitle } from '../components/ui'
import { CtaBanner, FaqList, PricingCards, Reviews } from '../components/sections'

const FEATURED = ['tikka', 'lasagnes', 'kefta', 'bowl-pois-chiches', 'poulet-grille'].map((id) => RECIPES.find((r) => r.id === id)!)

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <HowItWorks />
      <section id="formules" className="py-24">
        <Container>
          <SectionTitle eyebrow="Sans engagement" title={<>Nos formules, <span className="text-gradient">à votre rythme</span></>} sub="Essayez une semaine, vous déciderez ensuite. Report possible jusqu’à 48 h avant." />
          <PricingCards />
        </Container>
      </section>
      <Included />
      <Dishes />
      <TimeSaved />
      <PostPartumTeaser />
      <GiftTeaser />
      <section className="py-24">
        <Container>
          <SectionTitle eyebrow="Ils en parlent" title={<>Mieux que <span className="text-gradient">nous</span></>} sub="Vos retours, pas les nôtres." />
          <Reviews />
        </Container>
      </section>
      <Gallery />
      <section className="py-24">
        <Container>
          <SectionTitle eyebrow="Organisation · Cheffes · Logistique · Paiement" title={<>Vos questions, <span className="text-gradient">nos réponses</span></>} />
          <FaqList limit={5} />
          <div className="mt-8 text-center">
            <Button to="/faq" variant="ghost">Toutes nos réponses <ArrowRight size={16} /></Button>
          </div>
        </Container>
      </section>
      <Container className="space-y-6">
        <CtaBanner title="Envie de souffler cette semaine ?" sub="Votre cheffe s’occupe des dîners. Vous, vous profitez." />
        <BecomeChefTeaser />
      </Container>
    </>
  )
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60])

  return (
    <section ref={ref} className="relative overflow-hidden pt-10 pb-20 sm:pt-16">
      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Eyebrow>Sans compte · Paiement en espèces · Sans engagement</Eyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-5xl leading-[0.98] font-extrabold tracking-tight sm:text-6xl xl:text-7xl"
          >
            Fini la charge <br className="hidden sm:block" />
            mentale <span className="text-gradient">des repas.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }} className="mt-6 max-w-xl text-lg text-mute sm:text-xl">
            Votre cheffe vient chez vous et prépare <span className="text-white">tous vos dîners de la semaine en 2 heures</span>. Le vrai fait maison, qui s’adapte à vous.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8 flex flex-wrap gap-3">
            <Button to="/reservation" size="lg">Réserver ma semaine <ArrowRight size={18} /></Button>
            <Button to="/menus" size="lg" variant="ghost">Voir les menus</Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              ['2 h', 'chez vous'],
              ['5', 'dîners prêts'],
              ['0', 'compte à créer'],
            ].map(([a, b]) => (
              <div key={b} className="glass rounded-2xl px-4 py-3">
                <div className="font-display text-2xl font-bold text-gradient">{a}</div>
                <div className="text-xs text-mute">{b}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative mx-auto mt-6 aspect-square w-[92%] max-w-[560px] lg:mt-0 lg:w-full">
          <div className="absolute inset-[8%] rounded-full border border-dashed border-white/10 spin-slow" />
          <div className="absolute inset-[22%] rounded-full border border-white/5" />
          <motion.div style={{ y: y2 }} className="absolute inset-[14%] overflow-hidden rounded-full shadow-[0_40px_120px_-30px_rgba(255,93,115,0.6)] ring-1 ring-white/10">
            <img src={IMAGES.spread} alt="Assiettes de plats faits maison" className="h-full w-full object-cover" />
          </motion.div>
          <motion.img
            style={{ y: y1 }}
            src={RECIPES[1].img}
            alt=""
            className="absolute top-[2%] right-[2%] h-[30%] w-[30%] rounded-full object-cover shadow-2xl ring-4 ring-ink"
            animate={{ rotate: [0, 6, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.img
            style={{ y: y1 }}
            src={RECIPES[11].img}
            alt=""
            className="absolute bottom-[4%] left-[0%] h-[28%] w-[28%] rounded-full object-cover shadow-2xl ring-4 ring-ink"
            animate={{ rotate: [0, -8, 0] }}
            transition={{ duration: 9, repeat: Infinity }}
          />
          <FloatCard className="top-[12%] left-0 lg:left-[-2%]" delay={0.6} icon={<Clock size={18} />} title="C’est prêt en 2 h" sub="Gagnez 5 h / semaine" />
          <FloatCard className="right-0 bottom-[16%] lg:right-[-4%]" delay={0.8} icon={<Banknote size={18} />} title="Paiement espèces" sub="À la cheffe, le jour J" />
        </div>
      </Container>
    </section>
  )
}

function FloatCard({ className, icon, title, sub, delay }: { className: string; icon: React.ReactNode; title: string; sub: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{ delay, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}
      className={`glass absolute flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-ink">{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-mute">{sub}</span>
      </span>
    </motion.div>
  )
}

function Marquee() {
  const items = RECIPES.slice(0, 14)
  return (
    <div className="relative overflow-hidden border-y border-line bg-white/[0.02] py-5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="marquee flex w-max gap-10">
        {[...items, ...items].map((r, i) => (
          <span key={i} className="flex items-center gap-3 text-sm whitespace-nowrap text-white/70">
            <img src={r.img.replace('w=800', 'w=80')} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" />
            {r.name}
            <span className="text-sun">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { icon: <ListChecks />, t: 'Vous choisissez vos repas', d: 'Sélectionnez vos plats, adaptés à vos goûts, allergies et régimes.' },
    { icon: <ChefHat />, t: 'Votre cheffe cuisine chez vous', d: 'Elle prépare tous les dîners de la semaine, dans votre cuisine, en 2 h.' },
    { icon: <UtensilsCrossed />, t: 'C’est prêt pour la semaine', d: 'Il ne reste qu’à savourer. Votre cheffe range et nettoie tout.' },
  ]
  return (
    <section className="py-24">
      <Container>
        <SectionTitle eyebrow="Zéro prise de tête" title={<>Comment ça <span className="text-gradient">marche ?</span></>} />
        <div className="relative grid gap-5 md:grid-cols-3">
          <div className="absolute top-14 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-sun/50 to-transparent md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.12}>
              <Card className="group relative h-full p-8 transition-transform duration-500 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-ink shadow-[0_0_40px_-8px_rgba(255,93,115,0.9)]">{s.icon}</span>
                  <span className="font-display text-6xl font-extrabold text-white/5 transition-colors group-hover:text-white/10">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-mute">{s.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button to="/reservation" size="lg">Réserver ma semaine <ArrowRight size={18} /></Button>
        </div>
      </Container>
    </section>
  )
}

function Included() {
  const items = [
    { icon: <Users />, t: 'Des dîners pour 2 adultes et jusqu’à 3 enfants' },
    { icon: <WandSparkles />, t: 'Vos menus choisis parmi notre sélection, adaptés à vos goûts' },
    { icon: <ListChecks />, t: 'Votre liste de courses envoyée à l’avance' },
    { icon: <Sparkles />, t: 'La cuisine rangée et nettoyée avant son départ' },
    { icon: <ShieldCheck />, t: 'Ingrédients à votre charge (ou courses faites en option)' },
    { icon: <Banknote />, t: 'Règlement en espèces, directement à la cheffe' },
  ]
  return (
    <section className="py-24">
      <Container>
        <SectionTitle eyebrow="À chaque venue" title={<>Ce qui est <span className="text-gradient">compris</span></>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 0.05}>
              <div className="glass flex h-full items-center gap-4 rounded-2xl p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-sun">{it.icon}</span>
                <span className="text-sm font-medium">{it.t}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function Dishes() {
  return (
    <section className="py-24">
      <Container>
        <SectionTitle eyebrow="Vous choisissez, votre cheffe cuisine" title={<>Vos plats <span className="text-gradient">de la semaine</span></>} sub="Plus de 25 recettes de saison, du réconfortant au super kids." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {FEATURED.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.06} className={i === 0 ? 'col-span-2 row-span-2 md:col-span-1' : ''}>
              <div className="group relative h-full min-h-56 overflow-hidden rounded-3xl border border-line">
                <img src={r.img} alt={r.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="glass rounded-full px-3 py-1 text-xs">{r.tag}</span>
                  <h3 className="mt-3 font-display text-lg leading-tight font-semibold">{r.name}</h3>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button to="/menus" variant="ghost">Explorer tous les plats <ArrowRight size={16} /></Button>
          <Button to="/reservation">Composer mon menu</Button>
        </div>
      </Container>
    </section>
  )
}

function TimeSaved() {
  const rows = [
    ['1 h 40', 'à se demander quoi préparer', 33],
    ['2 h 30', 'à cuisiner les dîners', 50],
    ['1 h 15', 'à ranger et nettoyer', 25],
    ['15 min', 'à faire la liste de courses', 5],
  ] as const
  return (
    <section className="py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Ce que vous récupérez</Eyebrow>
          <h2 className="mt-5 font-display text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">5 h</span> par semaine.
          </h2>
          <p className="mt-4 text-lg text-mute">Soit 20 heures par mois rendues à vos soirées, à vos enfants, à vous.</p>
        </Reveal>
        <Card className="p-8">
          <div className="space-y-6">
            {rows.map(([a, b, w], i) => (
              <div key={b}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-mute">{b}</span>
                  <span className="font-semibold">{a}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${w * 2}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-brand"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </section>
  )
}

function PostPartumTeaser() {
  return (
    <section className="py-24">
      <Container>
        <Card className="grid overflow-hidden lg:grid-cols-2">
          <div className="relative min-h-72">
            <img src={RECIPES[13].img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/80 max-lg:bg-gradient-to-t" />
          </div>
          <div className="p-8 sm:p-12">
            <Eyebrow>Juste après la naissance</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-tight">Bien manger <span className="text-gradient">compte double.</span></h2>
            <p className="mt-4 text-mute">
              Les nuits sont hachées, les journées filent. Pendant 5 semaines, votre cheffe vient cuisiner chez vous. Toujours la même, celle qui connaît vos goûts. Vous, vous profitez de bébé.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/post-partum"><Baby size={18} /> Découvrir le Post-partum chill</Button>
              <Button to="/cartes-cadeaux" variant="ghost"><Gift size={18} /> L’offrir</Button>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  )
}

export function GiftCardVisual({ amount, to }: { amount?: number; to?: string }) {
  return (
    <motion.div
      whileHover={{ rotateX: 8, rotateY: -12, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      style={{ transformPerspective: 900 }}
      className="relative aspect-[1.6] w-full max-w-md overflow-hidden rounded-3xl p-7 shadow-[0_40px_100px_-30px_rgba(255,93,115,0.7)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffb547,#ff5d73_45%,#8b7bff)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.45),transparent_40%)]" />
      <div className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full border-[28px] border-white/15" />
      <div className="relative flex h-full flex-col justify-between text-ink">
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-extrabold">hannane.cooking</span>
          <Gift />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase opacity-70">Carte cadeau{to ? ` · pour ${to}` : ''}</div>
          <div className="font-display text-4xl font-extrabold">{amount ? `${amount} €` : 'Du temps offert'}</div>
          <div className="text-sm font-medium opacity-80">fait maison</div>
        </div>
      </div>
    </motion.div>
  )
}

function GiftTeaser() {
  return (
    <section className="py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="flex justify-center"><GiftCardVisual /></Reveal>
        <Reveal>
          <Eyebrow>Le plus beau des cadeaux</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">Offrez du <span className="text-gradient">temps</span> à ceux que vous aimez.</h2>
          <p className="mt-4 text-lg text-mute">Pour une naissance, un anniversaire ou simplement pour faire plaisir : des soirées libres et de vrais repas faits maison. À partir de 20 €.</p>
          <Button to="/cartes-cadeaux" size="lg" className="mt-8"><Gift size={18} /> Offrir une carte cadeau</Button>
        </Reveal>
      </Container>
    </section>
  )
}

function Gallery() {
  const shots = [
    [IMAGES.table, 'Une semaine de dîners, en une seule venue'],
    [RECIPES[4].img, 'Du poisson frais, cuisiné sur place'],
    [IMAGES.groceries, 'Des produits frais et de saison'],
    [RECIPES[8].img, 'Cinq dîners préparés en 2 h'],
  ]
  return (
    <section className="py-24">
      <Container>
        <SectionTitle eyebrow="En direct de nos prestations" title={<>Du vrai fait maison, <span className="text-gradient">chez vous</span></>} />
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
          {shots.map(([src, cap]) => (
            <figure key={cap} className="relative aspect-[3/4] w-[78%] shrink-0 snap-center overflow-hidden rounded-3xl border border-line sm:w-[40%] lg:w-[24%]">
              <img src={src} alt={cap} loading="lazy" className="h-full w-full object-cover" />
              <figcaption className="glass absolute inset-x-3 bottom-3 rounded-2xl px-4 py-3 text-sm">{cap}</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

function BecomeChefTeaser() {
  return (
    <Reveal>
      <Card className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
        <div className="flex items-center gap-5">
          <img src={IMAGES.chef} alt="" loading="lazy" className="h-20 w-20 rounded-2xl object-cover" />
          <div>
            <h3 className="font-display text-2xl font-bold">Devenez cheffe partenaire ❤️‍🔥</h3>
            <p className="mt-1 text-mute">Passionnée de cuisine, pro ou amatrice ? Formez-vous au batch cooking à domicile et vivez de votre passion.</p>
          </div>
        </div>
        <Button to="/devenir-cheffe" variant="ghost" className="shrink-0"><CalendarCheck size={18} /> Devenir cheffe</Button>
      </Card>
    </Reveal>
  )
}
