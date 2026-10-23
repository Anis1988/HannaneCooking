import { MessageCircle } from 'lucide-react'
import { Button, Container, SectionTitle } from '../components/ui'
import { FaqList } from '../components/sections'
import { whatsappLink } from '../lib/utils'

export default function Faq() {
  return (
    <Container className="py-10">
      <SectionTitle eyebrow="C’est super clair" title={<>Foire aux <span className="text-gradient">questions</span></>} sub="Toutes les questions que vous vous posez sur Hannane Cooking." />
      <FaqList withSearch />
      <div className="mt-14 text-center">
        <p className="text-mute">Une question qui n’est pas là ?</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button href={whatsappLink('Bonjour, j’ai une question :')}><MessageCircle size={18} /> WhatsApp</Button>
          <Button to="/contact" variant="ghost">Écrivez-nous</Button>
        </div>
      </div>
    </Container>
  )
}
