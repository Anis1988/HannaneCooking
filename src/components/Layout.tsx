import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Instagram, Mail, Menu, MessageCircle, Phone, X } from 'lucide-react'
import { SITE, ZONES } from '../config'
import { cx, whatsappLink } from '../lib/utils'
import { Button, Container } from './ui'

const NAV = [
  { to: '/', label: 'Accueil' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/menus', label: 'Menus' },
  { to: '/post-partum', label: 'Post-partum' },
  { to: '/cartes-cadeaux', label: 'Carte cadeau' },
  { to: '/faq', label: 'FAQ' },
]

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label={SITE.name}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand font-display text-lg font-extrabold text-ink shadow-[0_0_24px_-4px_rgba(255,93,115,0.8)] transition-transform group-hover:rotate-6">
        H
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        hannane<span className="text-gradient">.cooking</span>
      </span>
    </Link>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [loc.pathname])
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        className={cx(
          'mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5',
          scrolled ? 'glass shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]' : 'bg-transparent',
        )}
      >
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end
                className={({ isActive }) =>
                  cx('relative rounded-full px-4 py-2 text-sm font-medium transition-colors', isActive ? 'text-white' : 'text-white/60 hover:text-white')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/10" />}
                    {n.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {!loc.pathname.startsWith('/reservation') && (
            <span className="hidden sm:block">
              <Button to="/reservation" size="sm">
                Réserver ma semaine <ArrowRight size={16} />
              </Button>
            </span>
          )}
          <button onClick={() => setOpen((o) => !o)} className="glass grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label="Menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="glass mx-auto mt-2 max-w-7xl rounded-3xl p-3 lg:hidden"
          >
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) => cx('block rounded-2xl px-4 py-3 text-base font-medium', isActive ? 'bg-white/10' : 'text-white/75')}
              >
                {n.label}
              </NavLink>
            ))}
            <Button to="/reservation" className="mt-2 w-full">
              Réserver ma semaine <ArrowRight size={16} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  return (
    <footer className="no-print relative mt-24 border-t border-line">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-mute">Votre cheffe cuisine vos dîners de la semaine, chez vous, en 2 heures. Sans compte. Paiement en espèces.</p>
          <div className="mt-6 flex gap-2">
            <a href={whatsappLink('Bonjour Hannane Cooking !')} target="_blank" rel="noreferrer" className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="WhatsApp"><MessageCircle size={18} /></a>
            <a href={`mailto:${SITE.email}`} className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="E-mail"><Mail size={18} /></a>
            <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Téléphone"><Phone size={18} /></a>
            <a href={SITE.instagram} target="_blank" rel="noreferrer" className="glass grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Instagram"><Instagram size={18} /></a>
          </div>
        </div>
        <FooterCol title="Service" links={[['Réserver', '/reservation'], ['Tarifs', '/tarifs'], ['Menus', '/menus'], ['Post-partum', '/post-partum']]} />
        <FooterCol title="Aide" links={[['FAQ', '/faq'], ['Nous contacter', '/contact'], ['Carte cadeau', '/cartes-cadeaux'], ['Devenir cheffe', '/devenir-cheffe']]} />
        <div>
          <h3 className="text-sm font-semibold text-white">Nous intervenons à</h3>
          <ul className="mt-4 space-y-2 text-sm text-mute">{ZONES.map((z) => <li key={z.name}>{z.name}</li>)}</ul>
        </div>
      </Container>
      <Container className="flex flex-col items-start justify-between gap-3 border-t border-line py-6 text-xs text-mute sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} {SITE.name}. Tous droits réservés.</span>
        <span className="flex flex-wrap gap-x-4 gap-y-2">
          <Link to="/cgv" className="hover:text-white">CGV</Link>
          <Link to="/confidentialite" className="hover:text-white">Confidentialité</Link>
          <span>💶 Paiement en espèces uniquement</span>
        </span>
      </Container>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-mute">
        {links.map(([l, to]) => (
          <li key={to}><Link to={to} className="hover:text-white">{l}</Link></li>
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

export default function Layout() {
  const { pathname } = useLocation()
  const inBooking = pathname.startsWith('/reservation')
  return (
    <>
      <div className="aurora"><div className="grid-bg" /></div>
      <ScrollToTop />
      <Navbar />
      <main className="pt-24">
        <AnimatePresence mode="wait">
          <motion.div key={inBooking ? 'booking' : pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!inBooking && <Footer />}
      {!inBooking && (
        <a
          href={whatsappLink('Bonjour, j’ai une question sur Hannane Cooking.')}
          target="_blank"
          rel="noreferrer"
          aria-label="Écrire sur WhatsApp"
          className="no-print fixed right-4 bottom-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-ink shadow-[0_10px_40px_-6px_rgba(37,211,102,0.7)] transition-transform hover:scale-110"
        >
          <MessageCircle size={24} />
        </a>
      )}
    </>
  )
}
