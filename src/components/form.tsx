import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Mail, MessageCircle, Printer } from 'lucide-react'
import { mailtoLink, whatsappLink } from '../lib/utils'
import { Button, Card } from './ui'
import { useState } from 'react'

export function Field({ label, required, error, children, hint }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-white/85">
        {label} {required && <span className="text-coral">*</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-coral">{error}</span> : hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  )
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
export const isPhone = (s: string) => /^(\+33\s?|0)[1-9](\s?\d{2}){4}$/.test(s.trim())

/** Écran de confirmation : affiche le numéro et propose l'envoi par WhatsApp / e-mail. */
export function SuccessPanel({ title, refId, summary, subject, sent, children }: { title: string; refId: string; summary: string; subject: string; sent: boolean; children?: ReactNode }) {
  const [copied, setCopied] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl">
      <Card glow className="p-8 text-center sm:p-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint/15 text-mint">
          <CheckCircle2 size={42} />
        </motion.div>
        <h2 className="mt-6 font-display text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-mute">Votre numéro</p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(refId)
            setCopied(true)
          }}
          className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-dashed border-sun/50 px-5 py-2 font-mono text-2xl font-bold tracking-widest text-sun"
        >
          {refId} <Copy size={16} />
        </button>
        {copied && <p className="mt-1 text-xs text-mint">Copié !</p>}
        {children}
        <div className="mt-8 rounded-2xl bg-white/[0.04] p-5 text-left">
          <p className="text-sm font-semibold">{sent ? 'Dernière étape (recommandée)' : 'Dernière étape : envoyez-nous votre demande'}</p>
          <p className="mt-1 text-sm text-mute">
            {sent ? 'Envoyez aussi le récapitulatif par WhatsApp pour une confirmation encore plus rapide.' : 'Un clic, le message est déjà rédigé. Nous vous confirmons sous 24 h.'}
          </p>
          <div className="no-print mt-4 grid gap-2 sm:grid-cols-3">
            <Button href={whatsappLink(summary)} className="!bg-[#25d366] ![background-image:none]"><MessageCircle size={18} /> WhatsApp</Button>
            <Button href={mailtoLink(subject, summary)} variant="soft"><Mail size={18} /> E-mail</Button>
            <Button onClick={() => window.print()} variant="soft"><Printer size={18} /> Imprimer</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
