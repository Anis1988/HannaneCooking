import { useRef, useState } from 'react'
import { Camera, Loader2, Mic, MicOff, Sparkles, X } from 'lucide-react'
import type { MenuResponse } from '../../api/menu'
import { askMenu, shrinkPhoto, type Photo } from '../lib/ai'
import { useBooking } from '../store/booking'
import { cx } from '../lib/utils'
import { useDictation } from '../lib/speech'

const QUICK = ['Riz', 'Pâtes', 'Poulet', 'Courgettes', 'Tomates', 'Pois chiches', 'Œufs', 'Saumon', 'Fromage', 'Épinards']

/** Panneau « Composer avec l'IA » : envies en texte libre, ingrédients à utiliser, photo du frigo. */
export function AiAssistant({ dinners, weeks, onResult, title = 'Composer avec l’IA', sub, inBooking = true }: { dinners: number; weeks: number; onResult: (r: MenuResponse) => void; title?: string; sub?: string; inBooking?: boolean }) {
  const s = useBooking()
  const [txt, setTxt] = useState('')
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detected, setDetected] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const dictation = useDictation((t) => {
    const cur = useBooking.getState().aiWishes
    s.set({ aiWishes: ((cur ? cur + ' ' : '') + t).slice(0, 600) })
  })

  const addIngredients = (raw: string) => {
    const parts = raw.split(',').map((x) => x.trim()).filter(Boolean)
    if (parts.length) s.set({ aiIngredients: [...new Set([...s.aiIngredients, ...parts])].slice(0, 30) })
    setTxt('')
  }

  const onFile = async (f?: File) => {
    if (!f) return
    setError('')
    try {
      setPhoto(await shrinkPhoto(f))
    } catch {
      setError('Impossible de lire cette photo.')
    }
  }

  const run = async () => {
    setLoading(true)
    setError('')
    try {
      if (txt.trim()) addIngredients(txt)
      const r = await askMenu({
        wishes: s.aiWishes,
        ingredients: [...s.aiIngredients, ...txt.split(',').map((x) => x.trim()).filter(Boolean)],
        photo: photo ? { mediaType: photo.mediaType, data: photo.data } : null,
        adults: s.adults,
        kids: s.kids,
        diets: s.diets,
        avoid: s.avoid,
        equipment: s.equipment,
        cuisines: s.cuisines,
        dinners,
        weeks,
        formula: inBooking ? s.formula : null,
      })
      setDetected(r.detectedIngredients)
      onResult(r)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assistant indisponible pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[26px] border border-violet/35 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(123,92,255,0.2),transparent_55%),radial-gradient(100%_100%_at_100%_100%,rgba(255,106,61,0.1),transparent_60%),rgba(255,255,255,0.02)] p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet/20 text-[#c9bcff] ring-1 ring-violet/50"><Sparkles size={18} /></span>
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-mute">{sub ?? 'Dites ou écrivez vos envies et ce que vous avez déjà : l’IA compose le menu.'}</p>
        </div>
      </div>

      <div className="relative mt-4">
        <textarea
          rows={2}
          value={s.aiWishes}
          onChange={(e) => s.set({ aiWishes: e.target.value.slice(0, 600) })}
          placeholder={dictation.listening ? 'Je vous écoute…' : 'Ex. : « mon fils n’aime pas les légumes verts, on a envie de plats réconfortants et pas trop épicés »'}
          className={cx('field', dictation.supported && '!pr-14')}
        />
        {dictation.supported && (
          <button
            type="button"
            onClick={dictation.toggle}
            className={cx('absolute top-2 right-2 grid h-10 w-10 place-items-center rounded-full', dictation.listening ? 'animate-pulse bg-coral text-ink' : 'bg-white/[0.06] text-white/80 hover:bg-white/10')}
            aria-label={dictation.listening ? 'Arrêter la dictée' : 'Dicter mes envies'}
          >
            {dictation.listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>

      <p className="mt-4 mb-2 text-sm font-medium">Ingrédients à utiliser</p>
      <div className="flex gap-2">
        <input
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredients(txt))}
          placeholder="Ex. : courgettes, riz, poulet"
          className="field min-w-0"
        />
        <button type="button" onClick={() => addIngredients(txt)} className="shrink-0 rounded-2xl border border-line bg-white/5 px-4 font-semibold hover:bg-white/10">Ajouter</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {s.aiIngredients.map((i) => (
          <span key={i} className="flex items-center gap-1.5 rounded-full bg-mint/15 py-1 pr-2 pl-3 text-sm text-mint">
            {i}
            <button type="button" onClick={() => s.set({ aiIngredients: s.aiIngredients.filter((x) => x !== i) })} aria-label={`Retirer ${i}`}><X size={14} /></button>
          </span>
        ))}
        {QUICK.filter((q) => !s.aiIngredients.includes(q)).slice(0, s.aiIngredients.length ? 4 : 8).map((q) => (
          <button key={q} type="button" onClick={() => s.set({ aiIngredients: [...s.aiIngredients, q] })} className="rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-mute hover:text-white">+ {q}</button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        {photo ? (
          <div className="relative">
            <img src={photo.preview} alt="Votre photo" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/20" />
            <button type="button" onClick={() => setPhoto(null)} className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-ink-2 ring-1 ring-white/20" aria-label="Retirer la photo"><X size={14} /></button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">
            <Camera size={16} /> Photo de mon frigo
          </button>
        )}
        <span className="text-xs text-mute">Facultatif : l’IA repère vos ingrédients sur la photo.</span>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={loading}
        className={cx('mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-sun px-6 font-semibold text-ink shadow-[0_10px_34px_-12px_rgba(255,106,61,0.85)] transition hover:bg-hot', loading && 'opacity-70')}
      >
        {loading ? <><Loader2 size={18} className="animate-spin" /> L’IA compose votre menu…</> : <><Sparkles size={18} /> Composer mon menu avec l’IA</>}
      </button>

      {error && <p role="alert" className="mt-3 rounded-2xl bg-coral/10 p-3 text-sm text-coral">{error}</p>}
      {!!detected.length && (
        <p className="mt-3 text-sm text-mute">
          Repéré sur la photo : <span className="text-white">{detected.join(', ')}</span>
        </p>
      )}
    </div>
  )
}
