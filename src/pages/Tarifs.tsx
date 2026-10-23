import { Banknote, Check, Gift, HelpCircle } from 'lucide-react'
import { OPTIONS, SUBSCRIPTIONS } from '../data/formulas'
import { Button, Card, Container, Reveal, SectionTitle } from '../components/ui'
import { PricingCards } from '../components/sections'
import { eur } from '../lib/utils'

export default function Tarifs() {
  return (
    <Container className="space-y-28 py-10">
      <section>
        <SectionTitle eyebrow="C’est super simple" title={<>Nos <span className="text-gradient">offres</span></>} sub="Toutes nos formules et tarifs. Prix TTC par semaine, réglés en espèces à chaque venue." />
        <PricingCards />
      </section>

      <section>
        <SectionTitle eyebrow="À la carte" title={<>Nos <span className="text-gradient">options</span></>} sub="Ajoutez des options pour adapter la prestation à vos besoins." />
        <div className="grid gap-5 md:grid-cols-3">
          {OPTIONS.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.08}>
              <Card className="h-full p-7">
                <div className="text-4xl">{o.emoji}</div>
                <h3 className="mt-4 font-display text-xl font-bold">{o.name}</h3>
                <p className="mt-2 text-sm text-mute">{o.desc}</p>
                <div className="mt-6 font-display text-3xl font-bold">+{eur(o.price)}<span className="text-base font-normal text-mute"> / semaine</span></div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Pour le Mois chill" title={<>Nos <span className="text-gradient">abonnements</span></>} sub="Gardez l’esprit tranquille 3, 6 ou 9 mois, avec des avantages exclusifs." />
        <div className="grid gap-5 md:grid-cols-3">
          {SUBSCRIPTIONS.filter((s) => s.months).map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <Card glow={s.id === '9'} className="h-full p-7">
                <div className="font-display text-4xl font-extrabold text-gradient">{s.label}</div>
                <ul className="mt-6 space-y-3 text-sm">
                  {s.perks.map((p) => (
                    <li key={p} className="flex gap-3"><Check size={18} className="text-mint" /> {p}</li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="p-8">
          <Banknote className="text-sun" size={30} />
          <h3 className="mt-4 font-display text-xl font-bold">Moyen de paiement</h3>
          <p className="mt-2 text-mute">Espèces uniquement, remises à votre cheffe le jour de la prestation. Aucune carte, aucun compte, aucun prélèvement.</p>
        </Card>
        <Card className="p-8">
          <Gift className="text-coral" size={30} />
          <h3 className="mt-4 font-display text-xl font-bold">Envie d’offrir ?</h3>
          <p className="mt-2 text-mute">Cartes cadeaux à partir de 20 €.</p>
          <Button to="/cartes-cadeaux" variant="soft" className="mt-5">Offrir une carte cadeau</Button>
        </Card>
        <Card className="p-8">
          <HelpCircle className="text-violet" size={30} />
          <h3 className="mt-4 font-display text-xl font-bold">Besoin d’aide ?</h3>
          <p className="mt-2 text-mute">Une question sur nos prestations ? Consultez la FAQ ou écrivez-nous sur WhatsApp.</p>
          <Button to="/faq" variant="soft" className="mt-5">Consulter la FAQ</Button>
        </Card>
      </section>
    </Container>
  )
}
