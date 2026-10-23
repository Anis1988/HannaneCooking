import { Baby, Gift, HeartHandshake, Leaf, Moon, Repeat } from 'lucide-react'
import { RECIPES } from '../data/recipes'
import { Button, Card, Container, Eyebrow, Reveal, SectionTitle } from '../components/ui'
import { CtaBanner, PricingCards } from '../components/sections'

export default function PostPartum() {
  const perks = [
    { icon: <Repeat />, t: 'Toujours la même cheffe', d: 'Votre petite fée, qui connaît vos goûts et votre rythme.' },
    { icon: <Leaf />, t: 'Des plats adaptés', d: 'Riches en fer, en fibres et en bons nutriments pour la récupération et l’allaitement.' },
    { icon: <Moon />, t: 'Zéro charge mentale', d: 'Courses en option, cuisine nettoyée : vous ne gérez rien.' },
    { icon: <HeartHandshake />, t: 'Flexible', d: 'Mise en pause possible si bébé a d’autres plans.' },
  ]
  return (
    <>
      <Container className="grid items-center gap-10 py-6 sm:gap-12 sm:py-10 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Post-partum chill · 5 semaines</Eyebrow>
          <h1 className="mt-5 font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight sm:mt-6 sm:text-6xl">
            Bien manger <span className="text-gradient">compte double.</span>
          </h1>
          <p className="mt-6 text-lg text-mute">
            Les nuits sont hachées, les journées filent, et vous n’avez qu’une envie : profiter de bébé. Pendant 5 semaines, votre cheffe vient cuisiner chez vous. Vous, vous vous concentrez sur l’essentiel.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Button to="/reservation" size="lg"><Baby size={18} /> Réserver le Post-partum</Button>
            <Button to="/cartes-cadeaux" size="lg" variant="ghost"><Gift size={18} /> L’offrir à de jeunes parents</Button>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-2 gap-3 pb-8 sm:gap-4">
          {[RECIPES[13], RECIPES[4], RECIPES[11], RECIPES[2]].map((r, i) => (
            <img key={r.id} src={r.img} alt={r.name} className={`aspect-square w-full rounded-3xl object-cover ${i % 2 ? 'translate-y-8' : ''}`} />
          ))}
        </Reveal>
      </Container>

      <Container className="py-16 sm:py-24">
        <SectionTitle title={<>Pensé pour <span className="text-gradient">les jeunes parents</span></>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.08}>
              <Card className="h-full p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-ink">{p.icon}</span>
                <h3 className="mt-5 font-display text-lg font-bold">{p.t}</h3>
                <p className="mt-2 text-sm text-mute">{p.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="py-10">
        <div className="mx-auto max-w-md"><PricingCards only={['postpartum']} /></div>
      </Container>

      <Container className="py-24">
        <CtaBanner title="Accueillez bébé, on s’occupe du reste." sub="5 visites, 25 dîners faits maison, une seule cheffe." />
      </Container>
    </>
  )
}
