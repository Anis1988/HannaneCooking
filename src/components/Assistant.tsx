import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, Mic, MicOff, RotateCcw, Sparkles, X } from 'lucide-react'
import { FAQ } from '../data/content'
import { useUi } from '../store/ui'
import { useDictation } from '../lib/speech'
import { cx, whatsappLink } from '../lib/utils'
import { norm } from './CommandPalette'

type Msg = { role: 'user' | 'assistant'; content: string; local?: boolean }

const GREETING: Msg = {
  role: 'assistant',
  content: 'Bonjour ! Je peux vous aider à choisir une formule, vérifier si nous venons chez vous ou répondre à vos questions sur les menus, les courses et le paiement.',
}

const SUGGESTIONS = ['Comment se passe une prestation ?', 'Quelle formule pour 2 adultes et 2 enfants ?', 'Vous venez à Lyon ?', 'Les courses sont-elles comprises ?']

/** Réponse de secours, sans IA : la question fréquente la plus proche. */
function localAnswer(q: string): string {
  const words = norm(q)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3)
  let best = { s: 0, i: -1 }
  FAQ.forEach((f, i) => {
    const hay = norm(f.q + ' ' + f.a)
    const s = words.filter((w) => hay.includes(w)).length + words.filter((w) => norm(f.q).includes(w)).length
    if (s > best.s) best = { s, i }
  })
  if (best.i < 0) return 'Je n’ai pas trouvé de réponse toute prête. Le plus simple : écrivez-nous sur WhatsApp, nous répondons vite.'
  return `${FAQ[best.i].a}\n\nD’autres réponses dans la [FAQ](/faq).`
}

/** Mise en forme minimale et sûre : **gras**, [liens](/page), listes « - ». */
function Rich({ text, onNav }: { text: string; onNav: () => void }) {
  const inline = (s: string, k: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
      const bold = part.match(/^\*\*([^*]+)\*\*$/)
      if (bold) return <b key={k + i} className="font-semibold text-white">{bold[1]}</b>
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
      if (link) {
        const [, label, href] = link
        if (href.startsWith('/')) return <Link key={k + i} to={href} onClick={onNav} className="font-medium text-sun underline decoration-sun/40 underline-offset-2">{label}</Link>
        if (/^https:\/\//.test(href)) return <a key={k + i} href={href} target="_blank" rel="noreferrer" className="font-medium text-sun underline decoration-sun/40 underline-offset-2">{label}</a>
        return label
      }
      return <Fragment key={k + i}>{part}</Fragment>
    })
  const blocks = text.split(/\n{2,}/)
  return (
    <>
      {blocks.map((b, bi) => {
        const lines = b.split('\n')
        if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
          return (
            <ul key={bi} className="mt-1.5 space-y-1 first:mt-0">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2"><span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-sun" />{inline(l.replace(/^\s*[-•]\s+/, ''), `${bi}-${li}-`)}</li>
              ))}
            </ul>
          )
        return (
          <p key={bi} className="mt-2 first:mt-0">
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, `${bi}-${li}-`)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}

/** Assistant conversationnel (Claude), avec repli sur la FAQ si l'IA n'est pas configurée. */
export function Assistant() {
  const { assistantOpen, assistantPrompt, closeAssistant } = useUi()
  const [msgs, setMsgs] = useState<Msg[]>([GREETING])
  const [txt, setTxt] = useState('')
  const [busy, setBusy] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abort = useRef<AbortController | null>(null)
  const dictation = useDictation((t) => setTxt((cur) => (cur ? cur + ' ' : '') + t))

  useEffect(() => {
    if (!assistantOpen) return
    if (assistantPrompt) send(assistantPrompt)
    // sur grand écran on place le curseur ; sur mobile on évite d'ouvrir le clavier d'office
    else if (window.matchMedia('(min-width: 1024px)').matches) setTimeout(() => inputRef.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAssistant()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantOpen, assistantPrompt])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])

  const send = async (raw: string) => {
    const content = raw.trim().slice(0, 1000)
    if (!content || busy) return
    setTxt('')
    const history = [...msgs.filter((m) => m !== GREETING && !m.local), { role: 'user' as const, content }]
    setMsgs((m) => [...m, { role: 'user', content }, { role: 'assistant', content: '' }])
    setBusy(true)
    const ctrl = new AbortController()
    abort.current = ctrl
    const write = (text: string, local = false) =>
      setMsgs((m) => {
        const next = [...m]
        next[next.length - 1] = { role: 'assistant', content: text, local }
        return next
      })
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-12) }),
        signal: ctrl.signal,
      })
      if (!res.ok || !res.body) throw new Error(String(res.status))
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        write(acc)
      }
      if (!acc.trim()) write(localAnswer(content), true)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') write(localAnswer(content), true)
    } finally {
      setBusy(false)
      abort.current = null
    }
  }

  const reset = () => {
    abort.current?.abort()
    setMsgs([GREETING])
    setBusy(false)
  }

  return (
    <div
      className={cx(
        'no-print fixed z-[75] flex flex-col overflow-hidden border-line bg-ink-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] transition-[opacity,transform,visibility] duration-200',
        'inset-x-0 bottom-0 top-[max(3rem,env(safe-area-inset-top))] rounded-t-[28px] border-t',
        'lg:inset-auto lg:right-5 lg:bottom-5 lg:h-[min(640px,calc(100dvh-7rem))] lg:w-[400px] lg:rounded-[28px] lg:border',
        assistantOpen ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-4 opacity-0',
      )}
      role="dialog"
      aria-label="Assistant Hannane Cooking"
      aria-hidden={!assistantOpen}
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_210deg,#3a26c4,#7b5cff,#f0449b,#ff6a3d,#ffb443,#3a26c4)] p-[2px]">
          <span className="grid h-full w-full place-items-center rounded-full bg-ink-2"><Sparkles size={17} className="text-sun" /></span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-semibold tracking-tight">Assistant Hannane</div>
          <div className="text-xs text-mute">Réponses instantanées, par IA</div>
        </div>
        <button onClick={reset} className="grid h-9 w-9 place-items-center rounded-full text-mute hover:bg-white/[0.07] hover:text-white" aria-label="Nouvelle conversation"><RotateCcw size={16} /></button>
        <button onClick={closeAssistant} className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] hover:bg-white/10" aria-label="Fermer l’assistant"><X size={17} /></button>
      </div>

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
        {msgs.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-[20px] rounded-br-md bg-sun px-4 py-2.5 text-[15px] text-ink">{m.content}</div>
          ) : (
            <div key={i} className="max-w-[92%] rounded-[20px] rounded-bl-md bg-white/[0.05] px-4 py-3 text-[15px] leading-relaxed text-white/90">
              {m.content ? <Rich text={m.content} onNav={closeAssistant} /> : <span className="inline-flex gap-1 py-1" aria-label="L’assistant écrit"><Dot d={0} /><Dot d={150} /><Dot d={300} /></span>}
              {m.local && <div className="mt-2 text-xs text-mute">Réponse tirée de notre FAQ.</div>}
            </div>
          ),
        )}
        {msgs.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3.5 py-2 text-left text-sm text-white/80 hover:border-sun/50 hover:text-white">{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(txt)
          }}
          className="flex items-end gap-2 rounded-[22px] border border-line bg-white/[0.04] p-1.5 focus-within:border-sun/60"
        >
          {dictation.supported && (
            <button type="button" onClick={dictation.toggle} className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full', dictation.listening ? 'animate-pulse bg-coral text-ink' : 'text-mute hover:bg-white/[0.07] hover:text-white')} aria-label={dictation.listening ? 'Arrêter la dictée' : 'Dicter ma question'}>
              {dictation.listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <textarea
            ref={inputRef}
            rows={1}
            value={txt}
            onChange={(e) => setTxt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(txt)
              }
            }}
            placeholder={dictation.listening ? 'Je vous écoute…' : 'Votre question'}
            className="max-h-32 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[16px] outline-none placeholder:text-[#7d76a8]"
          />
          <button type="submit" disabled={!txt.trim() || busy} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sun text-ink disabled:opacity-30" aria-label="Envoyer">
            <ArrowUp size={18} />
          </button>
        </form>
        <a href={whatsappLink('Bonjour, j’ai une question sur Hannane Cooking.')} target="_blank" rel="noreferrer" className="mt-2 block text-center text-xs text-mute hover:text-white">
          Préférez un humain ? Écrivez-nous sur WhatsApp
        </a>
      </div>
    </div>
  )
}

const Dot = ({ d }: { d: number }) => <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: `${d}ms` }} />
