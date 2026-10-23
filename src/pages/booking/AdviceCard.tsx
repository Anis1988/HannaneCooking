import { useEffect, useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { FORMULAS } from '../../data/formulas'
import { askAdvice } from '../../lib/ai'
import { cx } from '../../lib/utils'
import { useBooking } from '../../store/booking'

/** Conseil de formule par Claude : lancé automatiquement à l'arrivée sur l'étape, relançable avec une précision. */
export function AdviceCard() {
  const s = useBooking()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [edit, setEdit] = useState(false)
  const sig = JSON.stringify([s.adults, s.kids, s.diets, s.cuisines, s.aiSituation.trim()])

  const ask = async () => {
    setLoading(true)
    setError('')
    try {
      const a = await askAdvice({ situation: s.aiSituation, adults: s.adults, kids: s.kids, diets: s.diets, cuisines: s.cuisines })
      useBooking.getState().set({ aiAdvice: a, aiAdviceSig: sig })
    } catch (e) {
      useBooking.getState().set({ aiAdviceSig: sig })
      setError(e instanceof Error ? e.message : 'Conseil indisponible.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // une seule demande par profil : on ne relance pas à chaque visite de l'étape
    if (s.aiAdviceSig !== sig) ask()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const a = s.aiAdvice
  const f = a && FORMULAS.find((x) => x.id === a.formula)
  const applied = !!a && s.formula === a.formula && s.dinners === a.dinners && s.subscription === a.subscription
  // le conseil est un bonus : en cas d'échec on n'encombre pas l'écran
  if (error && !a) return null

  return (
    <div className="mb-5 rounded-3xl border border-violet/30 bg-[linear-gradient(135deg,rgba(139,123,255,0.14),rgba(255,93,115,0.08))] p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-ink">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </span>
        <div className="min-w-0 flex-1" aria-live="polite">
          <div className="text-xs font-semibold tracking-widest text-violet uppercase">Conseil de l’IA</div>
          {loading || !a || !f ? (
            <div className="mt-2 space-y-2">
              <p className="text-sm text-mute">Claude analyse votre foyer…</p>
              <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
            </div>
          ) : (
            <>
              <p className="mt-1 font-display text-lg leading-snug font-bold">{a.headline}</p>
              <p className="mt-1 text-sm text-white/80">{a.reason}</p>
              <p className="mt-2 text-sm">
                👉 <b>{f.name}</b> · {a.dinners} dîners / semaine{a.subscription !== 'none' ? ` · abonnement ${a.subscription} mois` : ''}
              </p>
            </>
          )}
        </div>
      </div>
      {a && f && !loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={applied}
            onClick={() => s.set({ formula: a.formula, dinners: a.dinners, subscription: a.subscription })}
            className={cx('rounded-full px-5 py-2.5 text-sm font-semibold', applied ? 'bg-mint/15 text-mint' : 'bg-gradient-brand text-ink')}
          >
            {applied ? (
              <>
                <Check size={14} className="mr-1 inline" />
                Conseil appliqué
              </>
            ) : (
              'Choisir ce conseil'
            )}
          </button>
          <button type="button" onClick={() => setEdit((e) => !e)} className="rounded-full border border-line px-4 py-2.5 text-sm text-white/80 hover:bg-white/5">
            Préciser ma situation
          </button>
        </div>
      )}
      {edit && (
        <div className="mt-3 flex gap-2">
          <input
            className="field min-w-0"
            value={s.aiSituation}
            onChange={(e) => s.set({ aiSituation: e.target.value.slice(0, 500) })}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              setEdit(false)
              ask()
            }}
            placeholder="Ex. : bébé prévu en mars, on travaille tard le mardi et le jeudi"
          />
          <button
            type="button"
            onClick={() => {
              setEdit(false)
              ask()
            }}
            className="shrink-0 rounded-2xl border border-line bg-white/5 px-4 font-semibold hover:bg-white/10"
          >
            OK
          </button>
        </div>
      )}
    </div>
  )
}
