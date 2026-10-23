import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote } from 'lucide-react'
import { GIFT_PRESETS } from '../data/formulas'
import { Button, Card, Chip, Container, SectionTitle } from '../components/ui'
import { Field, isEmail, isPhone, SuccessPanel } from '../components/form'
import { GiftCardVisual } from './Home'
import { eur, makeRef, submit } from '../lib/utils'

const empty = { from: '', email: '', to: '', message: '', firstName: '', lastName: '', street: '', cp: '', city: '', phone: '' }

export default function GiftCards() {
  const [preset, setPreset] = useState<string>('semaine')
  const [custom, setCustom] = useState('50')
  const [f, setF] = useState(empty)
  const [ok, setOk] = useState(false)
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState<{ ref: string; summary: string; sent: boolean } | null>(null)

  const amount = preset === 'custom' ? Math.max(0, Number(custom) || 0) : GIFT_PRESETS.find((p) => p.id === preset)!.amount
  const valid = new Date()
  valid.setFullYear(valid.getFullYear() + 1)

  const errors: Partial<Record<keyof typeof empty | 'amount' | 'ok', string>> = {}
  if (amount < 20) errors.amount = 'Montant minimum : 20 €'
  if (!f.from.trim()) errors.from = 'Requis'
  if (!isEmail(f.email)) errors.email = 'E-mail invalide'
  if (!f.to.trim()) errors.to = 'Requis'
  if (!f.firstName.trim()) errors.firstName = 'Requis'
  if (!f.lastName.trim()) errors.lastName = 'Requis'
  if (!f.street.trim()) errors.street = 'Requis'
  if (!/^\d{5}$/.test(f.cp)) errors.cp = '5 chiffres'
  if (!f.city.trim()) errors.city = 'Requis'
  if (!isPhone(f.phone)) errors.phone = 'Ex. 06 12 34 56 78'
  if (!ok) errors.ok = 'Merci d’accepter les conditions'
  const err = (k: keyof typeof errors) => (tried ? errors[k] : undefined)

  const send = async () => {
    setTried(true)
    if (Object.keys(errors).length) return
    const ref = makeRef('CAD')
    const label = preset === 'custom' ? 'Montant personnalisé' : GIFT_PRESETS.find((p) => p.id === preset)!.name
    const summary = [
      `🎁 Demande de carte cadeau ${ref}`,
      `Formule : ${label} — ${eur(amount)}`,
      `De la part de : ${f.from} (${f.email})`,
      `Pour : ${f.to}`,
      f.message && `Message : ${f.message}`,
      `Facturation : ${f.firstName} ${f.lastName}, ${f.street}, ${f.cp} ${f.city}`,
      `Tél : ${f.phone}`,
      `Paiement : espèces`,
    ].filter(Boolean).join('\n')
    const sent = await submit('Carte cadeau', ref, summary, { amount, label, ...f })
    setDone({ ref, summary, sent })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (done)
    return (
      <Container className="py-6 sm:py-10">
        <SuccessPanel title="Demande de carte cadeau reçue !" refId={done.ref} summary={done.summary} subject={`Carte cadeau ${done.ref}`} sent={done.sent}>
          <p className="mt-4 text-mute">Nous vous contactons pendant nos horaires d’ouverture pour organiser le règlement de <b className="text-white">{eur(amount)}</b> en espèces. Dès réception, la carte est envoyée par e-mail.</p>
        </SuccessPanel>
      </Container>
    )

  const inp = (k: keyof typeof empty, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input className="field" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...props} />
  )

  return (
    <Container className="py-6 sm:py-10">
      <SectionTitle eyebrow="Du temps offert, fait maison" title={<>Construisez votre <span className="text-gradient">carte cadeau</span></>} />
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold">1. Choisissez le cadeau</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {GIFT_PRESETS.map((p) => (
                <Chip key={p.id} active={preset === p.id} onClick={() => setPreset(p.id)} className="!p-5">
                  <span className="block font-display text-base font-bold">{p.name} — {p.id === 'mois' ? 'dès ' : ''}{eur(p.amount)}</span>
                  <span className="mt-1 block text-xs text-mute">{p.desc}</span>
                </Chip>
              ))}
              <Chip active={preset === 'custom'} onClick={() => setPreset('custom')} className="!p-5">
                <span className="block font-display text-base font-bold">Un montant personnalisé</span>
                <span className="mt-1 block text-xs text-mute">Le montant que vous souhaitez offrir, dès 20 €.</span>
              </Chip>
            </div>
            {preset === 'custom' && (
              <div className="mt-4 max-w-xs">
                <Field label="Montant (€)" required error={err('amount')}>
                  <input type="number" min={20} step={5} className="field" value={custom} onChange={(e) => setCustom(e.target.value)} />
                </Field>
              </div>
            )}
          </Card>

          <Card className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold">2. Informations de la carte</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="De la part de" required error={err('from')}>{inp('from', { placeholder: 'Votre prénom' })}</Field>
              <Field label="Votre e-mail" required error={err('email')}>{inp('email', { type: 'email', placeholder: 'vous@email.fr' })}</Field>
              <Field label="Pour" required error={err('to')}>{inp('to', { placeholder: 'Prénom du bénéficiaire' })}</Field>
              <div className="sm:col-span-2">
                <Field label="Message personnalisé">
                  <textarea rows={3} className="field" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Bienvenue bébé ! Profitez de vos soirées ❤️" />
                </Field>
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold">3. Informations de facturation</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" required error={err('firstName')}>{inp('firstName', { autoComplete: 'given-name' })}</Field>
              <Field label="Nom" required error={err('lastName')}>{inp('lastName', { autoComplete: 'family-name' })}</Field>
              <div className="sm:col-span-2"><Field label="Adresse" required error={err('street')}>{inp('street', { autoComplete: 'street-address' })}</Field></div>
              <Field label="Code postal" required error={err('cp')}>{inp('cp', { inputMode: 'numeric', maxLength: 5, autoComplete: 'postal-code' })}</Field>
              <Field label="Ville" required error={err('city')}>{inp('city', { autoComplete: 'address-level2' })}</Field>
              <Field label="Téléphone" required error={err('phone')} hint="Format : 06 12 34 56 78">{inp('phone', { type: 'tel', autoComplete: 'tel' })}</Field>
            </div>
            <label className="mt-6 flex items-start gap-3 text-sm text-white/80">
              <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-sun)]" />
              <span>Je confirme avoir lu et accepté les <Link to="/cgv" className="underline">conditions générales de vente</Link> ainsi que la <Link to="/confidentialite" className="underline">politique de confidentialité</Link>.</span>
            </label>
            {err('ok') && <p className="mt-1 text-xs text-coral">{err('ok')}</p>}
          </Card>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Card className="space-y-5 p-6">
            <GiftCardVisual amount={amount} to={f.to || undefined} />
            <div className="flex justify-between text-sm"><span className="text-mute">Valable jusqu’au</span><span>{valid.toLocaleDateString('fr-FR')}</span></div>
            <div className="flex justify-between border-t border-line pt-4 font-display text-xl font-bold"><span>Total (TTC)</span><span>{eur(amount)}</span></div>
            <div className="flex gap-3 rounded-2xl bg-sun/10 p-4 text-sm text-white/85">
              <Banknote className="shrink-0 text-sun" size={20} />
              <span>Règlement en espèces uniquement. Nous vous recontactons pour organiser la remise, puis la carte est envoyée par e-mail.</span>
            </div>
            <Button onClick={send} size="lg" className="w-full">Valider ma demande</Button>
          </Card>
        </aside>
      </div>
    </Container>
  )
}
