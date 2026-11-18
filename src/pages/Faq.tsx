import { useSearchParams } from 'react-router-dom'
import { MessageCircle, Sparkles } from 'lucide-react'
import { useUi } from '../store/ui'
import { Button, Container, SectionTitle } from '../components/ui'
import { FaqList } from '../components/sections'
import { whatsappLink } from '../lib/utils'

export default function Faq() {
  const [params] = useSearchParams()
  const openAssistant = useUi((s) => s.openAssistant)
  return (
    <Container className="py-6 sm:py-10">
      <SectionTitle level={1} center title="Questions fréquentes" sub="Organisation, cheffes, courses, paiement : cherchez un mot ou parcourez par thème." />
      <FaqList withSearch initialQuery={params.get('q') ?? ''} />
      <div className="mx-auto mt-14 max-w-3xl rounded-[26px] border border-line bg-white/[0.03] p-6 text-center sm:p-8">
        <p className="font-display text-lg font-semibold tracking-tight">Une question qui n’est pas là ?</p>
        <p className="mt-1 text-mute">L’assistant répond tout de suite. Ou écrivez-nous, une personne vous répond.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button onClick={() => openAssistant()}><Sparkles size={18} /> Demander à l’assistant</Button>
          <Button href={whatsappLink('Bonjour, j’ai une question :')} variant="ghost"><MessageCircle size={18} /> WhatsApp</Button>
          <Button to="/contact" variant="ghost">Écrivez-nous</Button>
        </div>
      </div>
    </Container>
  )
}
