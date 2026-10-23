import { useState } from 'react'
import { ChefHat, Clock, Mail, MessageCircle, Phone } from 'lucide-react'
import { SITE, ZONES } from '../config'
import { Button, Card, Chip, Container, SectionTitle } from '../components/ui'
import { Field, isEmail, isPhone, SuccessPanel } from '../components/form'
import { makeRef, submit, whatsappLink } from '../lib/utils'

type Done = { ref: string; summary: string; sent: boolean }

export function Contact() {
  const [f, setF] = useState({ name: '', email: '', phone: '', subject: 'Question', message: '' })
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState<Done | null>(null)
  const errors = {
    name: !f.name.trim() && 'Requis',
    email: !isEmail(f.email) && 'E-mail invalide',
    message: f.message.trim().length < 5 && 'Votre message est trop court',
  }
  const send = async () => {
    setTried(true)
    if (Object.values(errors).some(Boolean)) return
    const ref = makeRef('MSG')
    const summary = `✉️ Message ${ref}\nSujet : ${f.subject}\nDe : ${f.name} (${f.email}${f.phone ? ', ' + f.phone : ''})\n\n${f.message}`
    setDone({ ref, summary, sent: await submit('Contact', ref, summary, f) })
  }

  if (done) return <Container className="py-10"><SuccessPanel title="Message prêt !" refId={done.ref} summary={done.summary} subject={`Message ${done.ref}`} sent={done.sent} /></Container>

  return (
    <Container className="py-10">
      <SectionTitle eyebrow="On vous répond vite" title={<>Nous <span className="text-gradient">contacter</span></>} />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card className="p-6"><a href={whatsappLink('Bonjour !')} target="_blank" rel="noreferrer" className="flex items-center gap-4"><MessageCircle className="text-[#25d366]" /> <span><b className="block">WhatsApp</b><span className="text-sm text-mute">Le plus rapide</span></span></a></Card>
          <Card className="p-6"><a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="flex items-center gap-4"><Phone className="text-sun" /> <span><b className="block">{SITE.phone}</b><span className="text-sm text-mute">Téléphone</span></span></a></Card>
          <Card className="p-6"><a href={`mailto:${SITE.email}`} className="flex items-center gap-4"><Mail className="text-coral" /> <span><b className="block break-all">{SITE.email}</b><span className="text-sm text-mute">E-mail</span></span></a></Card>
          <Card className="p-6"><div className="flex items-center gap-4"><Clock className="text-violet" /> <span><b className="block">{SITE.hours}</b><span className="text-sm text-mute">{ZONES.map((z) => z.name).join(' · ')}</span></span></div></Card>
        </div>
        <Card className="p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap gap-2">
            {['Question', 'Réservation', 'Report / annulation', 'Carte cadeau', 'Autre'].map((s) => (
              <Chip key={s} active={f.subject === s} onClick={() => setF({ ...f, subject: s })} className="!rounded-full !py-2">{s}</Chip>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom" required error={tried ? errors.name || undefined : undefined}><input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="E-mail" required error={tried ? errors.email || undefined : undefined}><input type="email" className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Téléphone"><input type="tel" className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <div className="sm:col-span-2">
              <Field label="Message" required error={tried ? errors.message || undefined : undefined}>
                <textarea rows={6} className="field" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Votre numéro de réservation si vous en avez un…" />
              </Field>
            </div>
          </div>
          <Button onClick={send} size="lg" className="mt-6">Envoyer</Button>
        </Card>
      </div>
    </Container>
  )
}

export function BecomeChef() {
  const [f, setF] = useState({ name: '', email: '', phone: '', city: ZONES[0].name, level: 'Amatrice passionnée', about: '' })
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState<Done | null>(null)
  const errors = {
    name: !f.name.trim() && 'Requis',
    email: !isEmail(f.email) && 'E-mail invalide',
    phone: !isPhone(f.phone) && 'Ex. 06 12 34 56 78',
  }
  const send = async () => {
    setTried(true)
    if (Object.values(errors).some(Boolean)) return
    const ref = makeRef('CHF')
    const summary = `👩‍🍳 Candidature cheffe ${ref}\n${f.name} — ${f.city}\n${f.email} · ${f.phone}\nProfil : ${f.level}\n\n${f.about}`
    setDone({ ref, summary, sent: await submit('Candidature cheffe', ref, summary, f) })
  }
  if (done) return <Container className="py-10"><SuccessPanel title="Candidature prête !" refId={done.ref} summary={done.summary} subject={`Candidature ${done.ref}`} sent={done.sent} /></Container>

  return (
    <Container className="py-10">
      <SectionTitle eyebrow="Rejoignez l’équipe ❤️‍🔥" title={<>Devenez <span className="text-gradient">cheffe partenaire</span></>} sub="Passionnée de cuisine, professionnelle ou amatrice ? Formez-vous au batch cooking à domicile et vivez de votre passion, à votre rythme." />
      <Card className="mx-auto max-w-3xl p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom & nom" required error={tried ? errors.name || undefined : undefined}><input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Ville" required>
            <select className="field" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{ZONES.map((z) => <option key={z.name} className="bg-ink">{z.name}</option>)}</select>
          </Field>
          <Field label="E-mail" required error={tried ? errors.email || undefined : undefined}><input type="email" className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Téléphone" required error={tried ? errors.phone || undefined : undefined}><input type="tel" className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        </div>
        <p className="mt-5 mb-2 text-sm font-medium">Votre profil</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {['Amatrice passionnée', 'Cuisinière expérimentée', 'Cheffe professionnelle'].map((l) => (
            <Chip key={l} active={f.level === l} onClick={() => setF({ ...f, level: l })}><ChefHat size={16} className="mb-1" />{l}</Chip>
          ))}
        </div>
        <div className="mt-5">
          <Field label="Parlez-nous de vous"><textarea rows={5} className="field" value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} placeholder="Vos spécialités, vos disponibilités…" /></Field>
        </div>
        <Button onClick={send} size="lg" className="mt-6">Envoyer ma candidature</Button>
      </Card>
    </Container>
  )
}
