import type { ReactNode } from 'react'
import { SITE } from '../config'
import { Button, Card, Container } from '../components/ui'

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Container className="py-10">
      <Card className="mx-auto max-w-3xl p-8 sm:p-12">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-white/80 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white">{children}</div>
      </Card>
    </Container>
  )
}

export function Cgv() {
  return (
    <Page title="Conditions générales de vente">
      <p>Les présentes conditions régissent les prestations de batch cooking à domicile proposées par {SITE.name}.</p>
      <h2>Prestation</h2>
      <p>Une cheffe se rend au domicile du client au créneau convenu et prépare le nombre de dîners prévu par la formule, pour 2 adultes et jusqu’à 3 enfants (portions doublées avec l’option Family +). La cuisine est rangée et nettoyée en fin de prestation.</p>
      <h2>Ingrédients</h2>
      <p>Les ingrédients sont à la charge du client. La liste de courses est communiquée à l’avance. Avec l’option courses, les produits sont remboursés au prix réel, sur présentation du ticket.</p>
      <h2>Prix et paiement</h2>
      <p>Les prix sont indiqués TTC, par semaine. Le paiement s’effectue exclusivement en espèces, remis à la cheffe le jour de chaque prestation. Aucun paiement en ligne n’est demandé.</p>
      <h2>Report et annulation</h2>
      <p>Toute prestation peut être reportée ou annulée sans frais jusqu’à 48 h avant le créneau. En deçà, la prestation est due.</p>
      <h2>Cartes cadeaux</h2>
      <p>Les cartes cadeaux sont valables un an à compter de leur émission, après réception du règlement en espèces.</p>
    </Page>
  )
}

export function Privacy() {
  return (
    <Page title="Politique de confidentialité">
      <p>{SITE.name} ne demande aucun compte. Les informations saisies lors d’une réservation (nom, coordonnées, adresse, préférences alimentaires) servent uniquement à organiser votre prestation.</p>
      <h2>Stockage</h2>
      <p>Votre réservation en cours est conservée dans votre navigateur pour vous éviter de tout ressaisir. Vous pouvez l’effacer à tout moment en vidant les données du site.</p>
      <h2>Vos droits</h2>
      <p>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en écrivant à {SITE.email}.</p>
    </Page>
  )
}

export function NotFound() {
  return (
    <Container className="py-24 text-center">
      <div className="font-display text-8xl font-extrabold text-gradient">404</div>
      <p className="mt-4 text-mute">Cette page est partie faire les courses.</p>
      <Button to="/" className="mt-8">Retour à l’accueil</Button>
    </Container>
  )
}
