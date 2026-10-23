import { useMemo, useState } from 'react'
import { Baby, Clock, Search } from 'lucide-react'
import { CUISINES, DIETS, RECIPES, SNACKS, srcSet, type Cuisine, type Diet } from '../data/recipes'
import { Button, Container, SectionTitle } from '../components/ui'
import { cx } from '../lib/utils'

export default function Menus() {
  const [q, setQ] = useState('')
  const [diet, setDiet] = useState<Diet | null>(null)
  const [cuisine, setCuisine] = useState<Cuisine | null>(null)
  const [kids, setKids] = useState(false)

  const list = useMemo(() => {
    const n = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return RECIPES.filter(
      (r) =>
        (!diet || r.diets.includes(diet)) &&
        (!cuisine || r.cuisine === cuisine) &&
        (!kids || r.kids) &&
        (!q || n(r.name + ' ' + r.ingredients.join(' ')).includes(n(q))),
    )
  }, [q, diet, cuisine, kids])

  return (
    <Container className="py-6 sm:py-10">
      <SectionTitle eyebrow={`${RECIPES.length} recettes de saison`} title={<>La <span className="text-gradient">carte</span></>} sub="Un aperçu de ce que votre cheffe peut cuisiner. Votre menu est composé à la réservation, selon vos goûts." />

      <div className="sticky top-[68px] z-30 -mx-4 mb-6 space-y-3 border-b border-line bg-ink/95 p-3 sm:top-24 sm:mx-0 sm:mb-8 sm:rounded-3xl sm:border sm:p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un plat, un ingrédient…" className="field !rounded-full !pl-11" />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <Pill active={kids} onClick={() => setKids(!kids)}><Baby size={14} /> Super kids</Pill>
          {DIETS.filter((d) => d.id !== 'sansPorc').map((d) => (
            <Pill key={d.id} active={diet === d.id} onClick={() => setDiet(diet === d.id ? null : d.id)}>{d.emoji} {d.label}</Pill>
          ))}
          <span className="mx-1 w-px shrink-0 bg-line" />
          {CUISINES.map((c) => (
            <Pill key={c.id} active={cuisine === c.id} onClick={() => setCuisine(cuisine === c.id ? null : c.id)}>{c.emoji} {c.label}</Pill>
          ))}
        </div>
      </div>
      <p className="mb-6 text-sm text-mute">Tous nos plats sont sans porc. {list.length} plat{list.length > 1 ? 's' : ''}.</p>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((r) => (
            <article key={r.id} className="fade-in glass group overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={r.img} srcSet={srcSet(r.img)} sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw" alt={r.name} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute top-2 left-2 rounded-full border border-line bg-ink/75 px-2.5 py-1 text-[11px] sm:top-3 sm:left-3 sm:text-xs">{r.tag}</span>
                {r.kids && <span className="absolute top-2 right-2 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-ink sm:top-3 sm:right-3 sm:text-xs">Kids</span>}
              </div>
              <div className="p-3 sm:p-5">
                <h3 className="font-display text-sm leading-snug font-semibold sm:text-base">{r.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-mute sm:mt-3 sm:text-xs">
                  <span className="flex items-center gap-1"><Clock size={12} /> {r.minutes} min<span className="max-sm:hidden"> à réchauffer</span></span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1 sm:mt-3">
                  {DIETS.filter((d) => d.id !== 'sansPorc' && r.diets.includes(d.id)).map((d) => (
                    <span key={d.id} title={d.label} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] sm:text-xs">{d.emoji} {d.short}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        
      </div>
      {!list.length && <p className="py-16 text-center text-mute">Aucun plat ne correspond. Essayez d’autres filtres.</p>}

      <section className="mt-24">
        <SectionTitle eyebrow="Option goûter" title={<>Et pour le <span className="text-gradient">goûter</span>…</>} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {SNACKS.map((s) => (
            <figure key={s.name} className="relative aspect-square overflow-hidden rounded-3xl border border-line">
              <img src={s.img} srcSet={srcSet(s.img)} sizes="(min-width: 640px) 33vw, 50vw" alt={s.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-3 bottom-3 border border-line bg-ink/75 rounded-2xl px-4 py-3 text-sm font-medium">{s.name}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 text-center"><Button to="/reservation" size="lg">Composer mon menu</Button></div>
      </section>
    </Container>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={cx('flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition', active ? 'border-sun/60 bg-sun/15 text-white' : 'border-line text-white/70 hover:text-white')}>
      {children}
    </button>
  )
}
