import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarCheck, ChefHat, House, Instagram, Mail, Menu, MessageCircle, Phone, Search, Sparkles, UtensilsCrossed, X } from 'lucide-react'
import { SITE, ZONES } from '../config'
import { cx, getSubmissions, whatsappLink } from '../lib/utils'
import { useUi } from '../store/ui'
import { Button, Container, ThermalDefs } from './ui'
import { CommandPalette } from './CommandPalette'
import { Assistant } from './Assistant'

const NAV = [
  { to: '/menus', label: 'Menus' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/post-partum', label: 'Post-partum' },
  { to: '/cartes-cadeaux', label: 'Carte cadeau' },
  { to: '/faq', label: 'FAQ' },
]

const MORE = [
  { to: '/', label: 'Accueil' },
  ...NAV,
  { to: '/mes-reservations', label: 'Mes réservations' },
  { to: '/contact', label: 'Nous contacter' },
  { to: '/devenir-cheffe', label: 'Devenir cheffe' },
]

/** Marque : un « feu » de plaque à induction vu en thermique, avec le H au centre. */
export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label={`${SITE.name}, accueil`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_210deg,#3a26c4,#7b5cff,#f0449b,#ff6a3d,#ffb443,#fff1c9,#3a26c4)] p-[3px] transition-transform duration-500 group-hover:rotate-90">
        <span className="grid h-full w-full place-items-center rounded-full bg-ink font-display text-[13px] font-bold text-hot transition-transform duration-500 group-hover:-rotate-90">H</span>
      </span>
      {!compact && (
        <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">
          hannane<span className="font-medium text-mute">cooking</span>
        </span>
      )}
    </Link>
  )
}

function useHasBookings() {
  const { pathname } = useLocation()
  const [has, setHas] = useState(false)
  useEffect(() => setHas(getSubmissions().some((s) => s.kind === 'Réservation')), [pathname])
  return has
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const { openSearch, openAssistant } = useUi()
  const hasBookings = useHasBookings()
  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  const inBooking = loc.pathname.startsWith('/reservation')

  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
      <nav
        className={cx(
          'mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full pr-2 pl-3 transition-[background-color,box-shadow,border-color] duration-300 sm:pl-4',
          scrolled || open ? 'glass-blur shadow-[0_20px_60px_-24px_rgba(0,0,0,0.9)]' : 'border border-transparent',
        )}
      >
        <Logo />
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  cx('relative block rounded-full px-3.5 py-2 text-sm font-medium transition-colors xl:px-4', isActive ? 'bg-white/[0.09] text-white' : 'text-white/65 hover:text-white')
                }
              >
                {n.label}
              </NavLink>
            </li>
          ))}
          {hasBookings && (
            <li>
              <NavLink to="/mes-reservations" className={({ isActive }) => cx('flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium', isActive ? 'bg-white/[0.09] text-white' : 'text-white/65 hover:text-white')}>
                <CalendarCheck size={15} /> Mes réservations
              </NavLink>
            </li>
          )}
        </ul>
        <div className="flex items-center gap-1.5">
          <button onClick={openSearch} className="flex h-10 items-center gap-2 rounded-full px-3 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white" aria-label="Rechercher (Ctrl K)">
            <Search size={17} />
            <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-sans text-[11px] text-mute xl:inline">⌘K</kbd>
          </button>
          <button onClick={() => openAssistant()} className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-white/80 hover:bg-white/[0.07] hover:text-white lg:flex">
            <Sparkles size={16} className="text-sun" /> Assistant
          </button>
          {!inBooking && (
            <span className="hidden sm:block">
              <Button to="/reservation" size="sm">Réserver ma semaine</Button>
            </span>
          )}
          <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] lg:hidden" aria-label="Menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      {/* Menu mobile toujours monté : ouverture/fermeture en CSS pur */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cx('fixed inset-0 -z-10 touch-none bg-[#07051a]/85 transition-opacity duration-200 lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />
      <div
        aria-hidden={!open}
        className={cx(
          'absolute inset-x-3 top-full mx-auto mt-2 max-h-[calc(100dvh-110px)] max-w-7xl origin-top overflow-y-auto overscroll-contain rounded-[28px] border border-line bg-ink-2 p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] transition-[opacity,transform,visibility] duration-200 sm:inset-x-5 lg:hidden',
          open ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0',
        )}
      >
        <div className="grid grid-cols-2 gap-1.5">
          {MORE.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) => cx('rounded-2xl px-4 py-3.5 text-[15px] font-medium active:bg-white/10', isActive ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/80')}
            >
              {n.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <a href={whatsappLink('Bonjour Hannane Cooking !')} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-[#25d366]/12 py-3.5 text-sm font-semibold text-[#5dea93]">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.05] py-3.5 text-sm font-semibold">
            <Phone size={16} /> Appeler
          </a>
        </div>
      </div>
    </header>
  )
}

/** Barre d'onglets façon application, en bas de l'écran sur mobile. */
function MobileDock() {
  const { openAssistant, assistantOpen } = useUi()
  const item = 'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1.5 text-[11px] font-medium'
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden" aria-label="Navigation rapide">
      <div className="glass-blur mx-auto flex max-w-md items-center gap-1 rounded-[26px] p-1.5 shadow-[0_-10px_50px_-20px_rgba(0,0,0,0.9)]">
        <NavLink to="/" end className={({ isActive }) => cx(item, isActive ? 'text-white' : 'text-white/55')}>
          <House size={20} /> Accueil
        </NavLink>
        <NavLink to="/menus" className={({ isActive }) => cx(item, isActive ? 'text-white' : 'text-white/55')}>
          <UtensilsCrossed size={20} /> Menus
        </NavLink>
        <Link to="/reservation" className="mx-0.5 flex h-14 flex-[1.3] flex-col items-center justify-center rounded-[20px] bg-sun text-ink shadow-[0_8px_28px_-8px_rgba(255,106,61,0.9)]">
          <ChefHat size={21} />
          <span className="text-[11px] font-bold">Réserver</span>
        </Link>
        <NavLink to="/mes-reservations" className={({ isActive }) => cx(item, isActive ? 'text-white' : 'text-white/55')}>
          <CalendarCheck size={20} /> Mes résas
        </NavLink>
        <button onClick={() => openAssistant()} className={cx(item, assistantOpen ? 'text-white' : 'text-white/55')}>
          <Sparkles size={20} className="text-sun" /> Assistant
        </button>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="no-print relative mt-20 border-t border-line pb-[calc(6rem+env(safe-area-inset-bottom))] sm:mt-28 lg:pb-0">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-16">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-mute">Votre cheffe cuisine vos dîners de la semaine, chez vous, en 2 heures. Sans compte, paiement en espèces.</p>
          <div className="mt-6 flex gap-2">
            {[
              [whatsappLink('Bonjour Hannane Cooking !'), 'WhatsApp', <MessageCircle size={18} key="w" />],
              [`mailto:${SITE.email}`, 'E-mail', <Mail size={18} key="m" />],
              [`tel:${SITE.phone.replace(/\s/g, '')}`, 'Téléphone', <Phone size={18} key="p" />],
              [SITE.instagram, 'Instagram', <Instagram size={18} key="i" />],
            ].map(([href, label, icon]) => (
              <a key={label as string} href={href as string} target={(href as string).startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="grid h-11 w-11 place-items-center rounded-full border border-line hover:bg-white/[0.07]" aria-label={label as string}>
                {icon}
              </a>
            ))}
          </div>
        </div>
        <FooterCol title="Service" links={[['Réserver', '/reservation'], ['Tarifs', '/tarifs'], ['Menus', '/menus'], ['Post-partum', '/post-partum'], ['Mes réservations', '/mes-reservations']]} />
        <FooterCol title="Aide" links={[['FAQ', '/faq'], ['Nous contacter', '/contact'], ['Carte cadeau', '/cartes-cadeaux'], ['Devenir cheffe', '/devenir-cheffe']]} />
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-sm font-semibold text-white">Nous venons à</h3>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm text-mute md:block md:space-y-2">
            {ZONES.map((z) => (
              <li key={z.name} className="rounded-full border border-line px-3 py-1 md:border-0 md:p-0">{z.name}</li>
            ))}
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col items-start justify-between gap-3 border-t border-line py-6 text-xs text-mute sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link to="/cgv" className="py-2 hover:text-white">CGV</Link>
          <Link to="/confidentialite" className="py-2 hover:text-white">Confidentialité</Link>
          <span>Paiement en espèces uniquement</span>
        </span>
      </Container>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-3 text-sm text-mute">
        {links.map(([l, to]) => (
          <li key={to}><Link to={to} className="block py-1.5 hover:text-white">{l}</Link></li>
        ))}
      </ul>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

/** Raccourcis clavier globaux : Ctrl/⌘ K ou « / » pour rechercher. */
function useShortcuts() {
  const { openSearch } = useUi()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openSearch()
      } else if (e.key === '/' && !typing) {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSearch])
}

export default function Layout() {
  const { pathname } = useLocation()
  const inBooking = pathname.startsWith('/reservation')
  const { openAssistant, assistantOpen } = useUi()
  useShortcuts()
  return (
    <>
      <div className="aurora"><div className="grid-bg" /></div>
      <ThermalDefs />
      <ScrollToTop />
      <Navbar />
      <main className="pt-[calc(5rem+env(safe-area-inset-top))] sm:pt-24">
        <Suspense fallback={<div className="min-h-[70vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      {!inBooking && <Footer />}
      {!inBooking && <MobileDock />}
      {!assistantOpen && (
        <button
          onClick={() => openAssistant()}
          aria-label="Ouvrir l’assistant"
          className={cx(
            'no-print fixed right-5 bottom-5 z-40 hidden items-center gap-2 rounded-full border border-sun/40 bg-ink-2 py-3 pr-5 pl-4 text-sm font-semibold shadow-[0_16px_50px_-14px_rgba(255,106,61,0.75)] transition-transform hover:-translate-y-0.5 lg:flex',
            inBooking && 'lg:hidden',
          )}
        >
          <Sparkles size={18} className="text-sun" /> Une question ?
        </button>
      )}
      <CommandPalette />
      <Assistant />
    </>
  )
}
