import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Baby, Check, ChefHat, Heart, Search, Share2, Sparkles, X } from 'lucide-react'
import type { MenuResponse } from '../../api/menu'
import { AiAssistant } from '../components/AiAssistant'
import { useBooking } from '../store/booking'
import { useFavs } from '../store/favs'
import { CUISINES, DIETS, EQUIPMENTS, RECIPES, SNACKS, srcSet, type Cuisine, type Diet, type Recipe } from '../data/recipes'
import { Button, Container, HeatBar, SectionTitle, Sheet } from '../components/ui'
import { cx, share } from '../lib/utils'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function Menus() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [diet, setDiet] = useState<Diet | null>(null)
  const [cuisine, setCuisine] = useState<Cuisine | null>(null)
  const [kids, setKids] = useState(false)
  const onlyFavs = params.get('favoris') === '1'
  const favs = useFavs()
  const open = RECIPES.find((r) => r.id === params.get('plat')) ?? null

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  const list = useMemo(
    () =>
      RECIPES.filter(
        (r) =>
          (!onlyFavs || favs.ids.includes(r.id)) &&
          (!diet || r.diets.includes(diet)) &&
          (!cuisine || r.cuisine === cuisine) &&
          (!kids || r.kids) &&
          (!q || norm(r.name + ' ' + r.ingredients.join(' ')).includes(norm(q))),
      ),
    [q, diet, cuisine, kids, onlyFavs, favs.ids],
  )
  const filtered = !!(q || diet || cuisine || kids || onlyFavs)
  const clear = () => {
    setQ('')
    setDiet(null)
    setCuisine(null)
    setKids(false)
    setParam('favoris', null)
  }

  return (
    <Container className="py-6 sm:py-10">
      <SectionTitle level={1} title="La carte" sub={`${RECIPES.length} recettes de saison, toutes sans porc. Touchez un plat pour voir ses ingrédients, gardez vos préférés avec le cœur.`} />

      <AiPicks />

      <div className="sticky top-[calc(4.5rem+env(safe-area-inset-top))] z-30 -mx-4 mb-6 space-y-3 border-b border-line bg-ink/95 p-3 sm:top-24 sm:mx-0 sm:mb-8 sm:rounded-[24px] sm:border sm:p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-mute" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un plat, un ingrédient : riz, saumon…" className="field !rounded-full !pl-11" />
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
          <Pill active={onlyFavs} onClick={() => setParam('favoris', onlyFavs ? null : '1')}>
            <Heart size={14} className={onlyFavs ? 'fill-coral text-coral' : ''} /> Favoris{favs.ids.length ? ` (${favs.ids.length})` : ''}
          </Pill>
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
      <div className="mb-5 flex items-center justify-between gap-3 text-sm text-mute">
        <span>{list.length} plat{list.length > 1 ? 's' : ''}</span>
        {filtered && <button onClick={clear} className="flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-white/[0.06] hover:text-white"><X size={14} /> Effacer les filtres</button>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((r) => (
          <RecipeCard key={r.id} r={r} onOpen={() => setParam('plat', r.id)} />
        ))}
      </div>
      {!list.length && (
        <div className="py-16 text-center">
          <p className="text-mute">{onlyFavs && !favs.ids.length ? 'Pas encore de favoris : touchez le cœur d’un plat pour le garder ici.' : 'Aucun plat ne correspond à ces filtres.'}</p>
          <Button onClick={clear} variant="ghost" className="mt-4">Voir toute la carte</Button>
        </div>
      )}

      <section className="mt-24">
        <SectionTitle title="Et pour le goûter" sub="En option, un goûter maison préparé en double pour toute la famille." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {SNACKS.map((s) => (
            <figure key={s.name} className="relative aspect-square overflow-hidden rounded-[24px] ring-1 ring-white/10">
              <img src={s.img} srcSet={srcSet(s.img)} sizes="(min-width: 640px) 33vw, 50vw" alt={s.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <figcaption className="absolute inset-x-3 bottom-3 rounded-2xl bg-ink/80 px-4 py-3 text-sm font-medium">{s.name}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10"><Button to="/reservation" size="lg">Composer mon menu</Button></div>
      </section>

      <RecipeSheet r={open} onClose={() => setParam('plat', null)} />
    </Container>
  )
}

function RecipeCard({ r, onOpen }: { r: Recipe; onOpen: () => void }) {
  const favs = useFavs()
  const fav = favs.ids.includes(r.id)
  return (
    <article className="fade-in glass group relative overflow-hidden rounded-[22px]">
      <button onClick={onOpen} className="block w-full text-left" aria-label={`Voir ${r.name}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={r.img} srcSet={srcSet(r.img)} sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2.5 py-1 text-[11px] sm:bottom-3 sm:left-3 sm:text-xs">{r.tag}</span>
          {r.kids && <span className="absolute right-2 bottom-2 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-ink sm:right-3 sm:bottom-3 sm:text-xs">Kids</span>}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-display text-[13px] leading-snug font-medium tracking-tight sm:text-[15px]">{r.name}</h3>
          <div className="mt-2.5 flex items-center gap-2">
            <HeatBar value={r.minutes} max={25} className="flex-1" />
            <span className="text-[11px] text-mute tabular-nums sm:text-xs">{r.minutes} min</span>
          </div>
        </div>
      </button>
      <button onClick={() => favs.toggle(r.id)} aria-pressed={fav} aria-label={fav ? `Retirer ${r.name} des favoris` : `Ajouter ${r.name} aux favoris`} className="absolute top-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-ink/70 sm:top-3 sm:right-3">
        <Heart size={18} className={fav ? 'fill-coral text-coral' : 'text-white'} />
      </button>
    </article>
  )
}

/** Fiche d'un plat : ingrédients, régimes, équipement, réchauffage, et ajout au menu. */
function RecipeSheet({ r, onClose }: { r: Recipe | null; onClose: () => void }) {
  const favs = useFavs()
  const { menus, pinned, set } = useBooking()
  const nav = useNavigate()
  const [shared, setShared] = useState('')
  if (!r) return <Sheet open={false} onClose={onClose}>{null}</Sheet>
  const fav = favs.ids.includes(r.id)
  const want = () => {
    set({ pinned: [r.id, ...pinned.filter((x) => x !== r.id)].slice(0, 7), menus: { ...menus, 1: [r.id, ...(menus[1] ?? []).filter((x) => x !== r.id)] } })
    if (!fav) favs.toggle(r.id)
    nav('/reservation')
  }
  const onShare = async () => {
    const res = await share({ title: r.name, text: `${r.name}, cuisiné chez vous par Hannane Cooking`, url: `${location.origin}/menus?plat=${r.id}` })
    setShared(res === 'copied' ? 'Lien copié' : res === 'shared' ? 'Partagé' : '')
    setTimeout(() => setShared(''), 1800)
  }
  return (
    <Sheet open onClose={onClose} title={<span className="block truncate">{r.name}</span>} wide>
      <div className="px-5 pb-6 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[22px]">
          <img src={r.img} srcSet={srcSet(r.img)} sizes="(min-width: 640px) 720px, 100vw" alt={r.name} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 bg-gradient-to-t from-ink/90 to-transparent p-3 pt-10">
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs">{r.tag}</span>
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs">{CUISINES.find((c) => c.id === r.cuisine)?.emoji} {CUISINES.find((c) => c.id === r.cuisine)?.label}</span>
            {r.kids && <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink">Super kids</span>}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-mute">À réchauffer</h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-display text-2xl font-semibold">{r.minutes} min</span>
              <HeatBar value={r.minutes} max={25} className="flex-1" />
            </div>
            <h3 className="mt-5 text-sm font-medium text-mute">Convient aux régimes</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DIETS.filter((d) => r.diets.includes(d.id)).map((d) => (
                <span key={d.id} className="flex items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1 text-sm"><Check size={13} className="text-mint" /> {d.label}</span>
              ))}
            </div>
            <h3 className="mt-5 text-sm font-medium text-mute">Équipement nécessaire</h3>
            <p className="mt-1.5 text-sm">{r.needs.length ? EQUIPMENTS.filter((e) => r.needs.includes(e.id)).map((e) => `${e.emoji} ${e.label}`).join(', ') : 'Aucun en particulier'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-mute">Ingrédients principaux</h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {r.ingredients.map((i) => (
                <li key={i} className="rounded-full border border-line px-3 py-1 text-sm first-letter:uppercase">{i}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-mute">Une allergie ? Indiquez-la à la réservation : les plats concernés sont écartés automatiquement.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
          <Button onClick={want} size="lg"><ChefHat size={18} /> Je le veux à mon menu</Button>
          <Button onClick={() => favs.toggle(r.id)} variant="ghost" size="lg"><Heart size={18} className={fav ? 'fill-coral text-coral' : ''} /> {fav ? 'Dans mes favoris' : 'Ajouter aux favoris'}</Button>
          <Button onClick={onShare} variant="ghost" size="lg"><Share2 size={18} /> {shared || 'Partager'}</Button>
        </div>
      </div>
    </Sheet>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={cx('flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition', active ? 'border-sun/70 bg-sun/[0.12] text-white' : 'border-line text-white/70 hover:text-white')}>
      {children}
    </button>
  )
}

/** « Que cuisiner avec ce que j'ai ? » : Claude choisit des plats de la carte à partir des ingrédients ou d'une photo. */
function AiPicks() {
  const [res, setRes] = useState<MenuResponse | null>(null)
  const [open, setOpen] = useState(false)
  const set = useBooking((s) => s.set)
  const nav = useNavigate()
  const picks = (res?.weeks[0] ?? []).map((d) => ({ ...d, r: RECIPES.find((x) => x.id === d.id)! })).filter((d) => d.r)

  const book = () => {
    const ids = picks.slice(0, 5).map((d) => d.id)
    set({ menus: { 1: ids }, pinned: ids, aiNotes: Object.fromEntries(picks.map((d) => [d.id, d.why])), aiMessage: res?.message ?? '' })
    nav('/reservation')
  }

  return (
    <section className="mb-8">
      {open ? (
        <AiAssistant dinners={6} weeks={1} inBooking={false} onResult={setRes} title="Que cuisiner avec ce que j’ai ?" sub="Listez vos ingrédients, dictez-les ou prenez votre frigo en photo : l’IA choisit les plats de la carte qui vont avec." />
      ) : (
        <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-[22px] border border-violet/35 bg-[radial-gradient(120%_140%_at_0%_0%,rgba(123,92,255,0.2),transparent_60%)] p-4 text-left transition hover:border-violet/60 sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet/20 text-[#c9bcff] ring-1 ring-violet/50"><Sparkles size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Que cuisiner avec ce que j’ai ?</span>
            <span className="block text-sm text-mute">Vos ingrédients ou une photo du frigo : l’IA choisit les plats qui vont avec.</span>
          </span>
          <span className="hidden shrink-0 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium sm:block">Essayer</span>
        </button>
      )}
      {res && (
        <div className="mt-5">
          {res.message && <p className="mb-4 text-sm text-white/85">{res.message}</p>}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {picks.map(({ r, why }) => (
              <article key={r.id} className="fade-in glass overflow-hidden rounded-[22px]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={r.img} srcSet={srcSet(r.img)} sizes="(min-width: 1024px) 33vw, 50vw" alt={r.name} decoding="async" className="h-full w-full object-cover" />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-display text-sm leading-snug font-medium sm:text-base">{r.name}</h3>
                  {why && <p className="mt-1.5 text-xs leading-snug text-[#b9a8ff] sm:text-sm">{why}</p>}
                </div>
              </article>
            ))}
          </div>
          {!!picks.length && (
            <div className="mt-6">
              <Button onClick={book} size="lg">Réserver avec ces plats <ArrowRight size={18} /></Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
