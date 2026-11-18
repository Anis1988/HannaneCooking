import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, ChefHat, CircleHelp, CornerDownLeft, FileText, Gift, Heart, MessageCircle, Search, Sparkles, UtensilsCrossed } from 'lucide-react'
import { FAQ } from '../data/content'
import { RECIPES, thumb } from '../data/recipes'
import { useUi } from '../store/ui'
import { cx, whatsappLink } from '../lib/utils'

type Item = { id: string; group: string; label: string; hint?: string; icon: ReactNode; keywords?: string; run: () => void }

export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Recherche rapide (Ctrl/⌘ K) : pages, plats, questions fréquentes et assistant. */
export function CommandPalette() {
  const { searchOpen, closeSearch, openAssistant } = useUi()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchOpen) return
    setQ('')
    setSel(0)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => input.current?.focus())
    return () => {
      document.body.style.overflow = prev
    }
  }, [searchOpen])

  const go = (to: string) => () => {
    closeSearch()
    nav(to)
  }

  const all = useMemo<Item[]>(
    () => [
      { id: 'p-book', group: 'Pages', label: 'Réserver ma semaine', hint: 'En quelques minutes, sans compte', icon: <ChefHat size={18} />, keywords: 'reservation commander cheffe', run: go('/reservation') },
      { id: 'p-menus', group: 'Pages', label: 'Menus et plats', icon: <UtensilsCrossed size={18} />, keywords: 'carte recettes', run: go('/menus') },
      { id: 'p-favs', group: 'Pages', label: 'Mes plats favoris', icon: <Heart size={18} />, keywords: 'coeur favoris', run: go('/menus?favoris=1') },
      { id: 'p-mine', group: 'Pages', label: 'Mes réservations', hint: 'Dates, calendrier, liste de courses', icon: <CalendarCheck size={18} />, keywords: 'reservation numero annuler reporter', run: go('/mes-reservations') },
      { id: 'p-tarifs', group: 'Pages', label: 'Tarifs et formules', icon: <FileText size={18} />, keywords: 'prix abonnement options', run: go('/tarifs') },
      { id: 'p-pp', group: 'Pages', label: 'Post-partum chill', icon: <FileText size={18} />, keywords: 'bebe naissance maternite', run: go('/post-partum') },
      { id: 'p-gift', group: 'Pages', label: 'Offrir une carte cadeau', icon: <Gift size={18} />, keywords: 'cadeau offrir', run: go('/cartes-cadeaux') },
      { id: 'p-faq', group: 'Pages', label: 'Questions fréquentes', icon: <CircleHelp size={18} />, keywords: 'faq aide', run: go('/faq') },
      { id: 'p-contact', group: 'Pages', label: 'Nous contacter', icon: <MessageCircle size={18} />, keywords: 'contact telephone email', run: go('/contact') },
      { id: 'p-chef', group: 'Pages', label: 'Devenir cheffe partenaire', icon: <ChefHat size={18} />, keywords: 'recrutement emploi', run: go('/devenir-cheffe') },
      {
        id: 'p-wa',
        group: 'Pages',
        label: 'Écrire sur WhatsApp',
        icon: <MessageCircle size={18} />,
        keywords: 'whatsapp message',
        run: () => {
          closeSearch()
          window.open(whatsappLink('Bonjour Hannane Cooking !'), '_blank')
        },
      },
      ...RECIPES.map((r) => ({
        id: 'r-' + r.id,
        group: 'Plats',
        label: r.name,
        hint: r.tag,
        icon: <img src={thumb(r.img, 80)} alt="" className="h-8 w-8 rounded-lg object-cover" loading="lazy" />,
        keywords: r.ingredients.join(' ') + ' ' + r.cuisine,
        run: go(`/menus?plat=${r.id}`),
      })),
      ...FAQ.map((f, i) => ({ id: 'f-' + i, group: 'Questions', label: f.q, hint: f.cat, icon: <CircleHelp size={18} />, keywords: f.a, run: go(`/faq?q=${encodeURIComponent(f.q)}`) })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean)
    const ask: Item[] = q.trim()
      ? [{ id: 'ask', group: 'Assistant', label: `Demander à l’assistant : « ${q.trim()} »`, icon: <Sparkles size={18} className="text-sun" />, run: () => openAssistant(q.trim()) }]
      : [{ id: 'ask', group: 'Assistant', label: 'Poser une question à l’assistant', hint: 'Réponse immédiate', icon: <Sparkles size={18} className="text-sun" />, run: () => openAssistant() }]
    if (!words.length) return [...all.filter((i) => ['p-book', 'p-menus', 'p-mine', 'p-tarifs', 'p-wa'].includes(i.id)), ...ask]
    const scored = all
      .map((i) => {
        const label = norm(i.label)
        const hay = label + ' ' + norm(i.keywords ?? '') + ' ' + norm(i.hint ?? '')
        if (!words.every((w) => hay.includes(w))) return null
        const s = (label.startsWith(words[0]) ? 3 : 0) + words.filter((w) => label.includes(w)).length * 2 + (i.group === 'Pages' ? 1 : 0)
        return { i, s }
      })
      .filter((x): x is { i: Item; s: number } => !!x)
      .sort((a, b) => b.s - a.s)
    const by = (g: string, n: number) => scored.filter((x) => x.i.group === g).slice(0, n).map((x) => x.i)
    return [...by('Pages', 4), ...by('Plats', 5), ...by('Questions', 4), ...ask]
  }, [q, all, openAssistant])

  useEffect(() => setSel(0), [q])
  useEffect(() => {
    list.current?.querySelector(`[data-idx="${sel}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  if (!searchOpen) return null

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeSearch()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(results.length - 1, s + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(0, s - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[sel]?.run()
    }
  }

  let lastGroup = ''
  return (
    <div className="fade-in fixed inset-0 z-[80] flex items-start justify-center bg-[#07051a]/80 px-3 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-[12vh]" onClick={closeSearch} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Recherche" onClick={(e) => e.stopPropagation()} onKeyDown={onKey} className="sheet-in w-full max-w-xl overflow-hidden rounded-[24px] border border-line bg-ink-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]">
        <label className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="shrink-0 text-mute" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Un plat, une question, une page…"
            className="h-14 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#7d76a8]"
            aria-controls="cmd-list"
            aria-activedescendant={results[sel] ? `cmd-${results[sel].id}` : undefined}
          />
          <button onClick={closeSearch} className="rounded-md border border-line px-2 py-1 text-xs text-mute">Échap</button>
        </label>
        <div ref={list} id="cmd-list" role="listbox" className="max-h-[min(60dvh,460px)] overflow-y-auto overscroll-contain p-2">
          {results.map((r, idx) => {
            const head = r.group !== lastGroup ? r.group : null
            lastGroup = r.group
            return (
              <div key={r.id}>
                {head && <div className="px-3 pt-3 pb-1.5 text-xs font-medium text-mute">{head}</div>}
                <button
                  id={`cmd-${r.id}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={sel === idx}
                  onMouseMove={() => setSel(idx)}
                  onClick={r.run}
                  className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left', sel === idx ? 'bg-white/[0.08]' : '')}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-white/80">{r.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px]">{r.label}</span>
                    {r.hint && <span className="block truncate text-xs text-mute">{r.hint}</span>}
                  </span>
                  {sel === idx && <CornerDownLeft size={15} className="shrink-0 text-mute max-sm:hidden" />}
                </button>
              </div>
            )
          })}
        </div>
        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-mute sm:flex">
          <span>↑ ↓ pour naviguer</span>
          <span>Entrée pour ouvrir</span>
        </div>
      </div>
    </div>
  )
}
