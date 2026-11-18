import { useMemo, useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { shoppingList, shoppingText } from '../lib/shopping'
import { cx } from '../lib/utils'

/** Liste de courses prévisionnelle, à cocher, à copier ou à envoyer. */
export function ShoppingList({ menus, note = true }: { menus: Record<number | string, string[]>; note?: boolean }) {
  const items = useMemo(() => shoppingList(menus), [menus])
  const [done, setDone] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [all, setAll] = useState(false)
  const text = shoppingText(items)
  const shown = all ? items : items.slice(0, 12)
  if (!items.length) return <p className="text-sm text-mute">Choisissez vos plats pour voir la liste de courses.</p>
  return (
    <div>
      {note && <p className="mb-4 text-sm text-mute">Une première idée de ce qu’il faudra. Votre cheffe vous envoie les quantités exactes avant sa venue.</p>}
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {shown.map((i) => {
          const on = done.includes(i.name)
          return (
            <li key={i.name}>
              <button
                onClick={() => setDone(on ? done.filter((x) => x !== i.name) : [...done, i.name])}
                aria-pressed={on}
                className={cx('flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition', on ? 'border-transparent bg-white/[0.03] text-mute' : 'border-line bg-white/[0.04]')}
              >
                <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-md border', on ? 'border-mint bg-mint text-ink' : 'border-white/30')}>{on && <Check size={13} />}</span>
                <span className={cx('flex-1 text-[15px]', on && 'line-through')}>{i.name}</span>
                {i.dishes.length > 1 && <span className="text-xs text-mute">×{i.dishes.length}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      {items.length > shown.length && (
        <button onClick={() => setAll(true)} className="mt-2 w-full rounded-2xl border border-dashed border-line py-2.5 text-sm text-mute hover:text-white">
          Voir les {items.length - shown.length} autres ingrédients
        </button>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            navigator.clipboard?.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          }}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm hover:bg-white/[0.06]"
        >
          {copied ? <Check size={15} className="text-mint" /> : <Copy size={15} />} {copied ? 'Copiée' : 'Copier la liste'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm hover:bg-white/[0.06]">
          <MessageCircle size={15} /> Envoyer sur WhatsApp
        </a>
      </div>
    </div>
  )
}
