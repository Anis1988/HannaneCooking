import { Link } from 'react-router-dom'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from '../lib/utils'

// Un seul IntersectionObserver partagé + transition CSS : bien plus léger
// que d'animer chaque bloc en JavaScript.
let observer: IntersectionObserver | null = null
const getObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('in')
        observer!.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -40px 0px' },
  ))

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    // déjà à l'écran au montage : affiché tout de suite, sans attendre
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('in', 'now')
      return
    }
    const obs = getObserver()
    obs.observe(el)
    return () => obs.unobserve(el)
  }, [])
  return (
    <div ref={ref} className={cx('reveal', className)} style={delay ? { transitionDelay: `${Math.min(delay, 0.2)}s` } : undefined}>
      {children}
    </div>
  )
}

type BtnProps = {
  to?: string
  href?: string
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'soft'
  size?: 'md' | 'lg' | 'sm'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaLabel?: string
}

export function Button({ to, href, onClick, children, variant = 'primary', size = 'md', className, type = 'button', disabled, ariaLabel }: BtnProps) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,box-shadow,transform,color] duration-200 select-none active:scale-[0.98]',
    size === 'lg' && 'min-h-14 px-7 text-base',
    size === 'md' && 'min-h-12 px-5 text-sm',
    size === 'sm' && 'min-h-10 px-4 text-sm',
    variant === 'primary' && 'bg-sun text-ink shadow-[0_10px_34px_-12px_rgba(255,106,61,0.85)] hover:bg-hot hover:shadow-[0_14px_44px_-12px_rgba(255,106,61,1)]',
    variant === 'ghost' && 'border border-line bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08]',
    variant === 'soft' && 'bg-ink-3 text-white hover:bg-[#2f2768]',
    disabled && 'pointer-events-none opacity-40',
    className,
  )
  if (to) return <Link to={to} className={cls} aria-label={ariaLabel}>{children}</Link>
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls} aria-label={ariaLabel}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>{children}</button>
}

/** Petit indicateur d'état (point lumineux + texte), sans capitales ni pastille. */
export function Eyebrow({ children, tone = 'sun' }: { children: ReactNode; tone?: 'sun' | 'mint' | 'violet' }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-white/75">
      <span className={cx('h-1.5 w-1.5 rounded-full', tone === 'sun' && 'bg-sun shadow-[0_0_10px_var(--color-sun)]', tone === 'mint' && 'bg-mint shadow-[0_0_10px_var(--color-mint)]', tone === 'violet' && 'bg-violet shadow-[0_0_10px_var(--color-violet)]')} />
      {children}
    </span>
  )
}

export function SectionTitle({ eyebrow, title, sub, center = false, className, level = 2 }: { eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; center?: boolean; className?: string; level?: 1 | 2 }) {
  const H = level === 1 ? 'h1' : 'h2'
  return (
    <Reveal className={cx('mb-8 max-w-3xl sm:mb-12', center && 'mx-auto text-center', className)}>
      {eyebrow && <div className="mb-3"><Eyebrow>{eyebrow}</Eyebrow></div>}
      <H className={cx('font-display leading-[1.08] font-semibold tracking-[-0.03em]', level === 1 ? 'text-[2rem] sm:text-5xl' : 'text-[1.75rem] sm:text-[2.6rem]')}>{title}</H>
      {sub && <p className={cx('mt-3 max-w-[60ch] text-base text-mute sm:mt-4 sm:text-lg', center && 'mx-auto')}>{sub}</p>}
    </Reveal>
  )
}

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: boolean }) {
  return <div className={cx('glass rounded-[22px]', glow && 'ring-glow', className)}>{children}</div>
}

export function Chip({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-[border-color,background-color,box-shadow] duration-200',
        active ? 'border-sun/80 bg-sun/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,180,67,0.35),0_0_24px_-10px_rgba(255,180,67,0.8)]' : 'border-line bg-white/[0.03] text-white/80 hover:border-white/25 hover:bg-white/[0.06]',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

/** Fenêtre : feuille qui monte du bas sur mobile, boîte centrée sur grand écran. */
export function Sheet({ open, onClose, title, children, wide, className }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; wide?: boolean; className?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fade-in fixed inset-0 z-[70] flex items-end justify-center bg-[#07051a]/75 sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cx(
          'sheet-in relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[28px] border border-line bg-ink-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] sm:rounded-[28px]',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-xl',
          className,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-ink-2/95 px-5 pt-3 pb-3 sm:px-6 sm:pt-5">
          <span className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20 sm:hidden" aria-hidden />
          <div className="mt-2 min-w-0 font-display text-lg font-semibold tracking-tight sm:mt-0">{title}</div>
          <button onClick={onClose} className="mt-2 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.06] hover:bg-white/10 sm:mt-0" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Filtre SVG « caméra thermique » : mappe la luminosité d'une photo sur la rampe de chaleur. */
export function ThermalDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <filter id="thermal" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.06 0.23 0.48 0.94 1 1 1" />
          <feFuncG type="table" tableValues="0.05 0.15 0.36 0.27 0.42 0.71 0.95" />
          <feFuncB type="table" tableValues="0.18 0.77 1 0.61 0.24 0.26 0.79" />
        </feComponentTransfer>
      </filter>
    </svg>
  )
}

/** Barre de chaleur : longueur = durée, couleur = rampe thermique. */
export function HeatBar({ value, max, className }: { value: number; max: number; className?: string }) {
  return (
    <div className={cx('h-1.5 overflow-hidden rounded-full bg-white/[0.07]', className)}>
      <div className="h-full rounded-full bg-heat" style={{ width: `${Math.max(6, Math.min(100, (value / max) * 100))}%`, backgroundSize: `${(max / Math.max(value, 1)) * 100}% 100%` }} />
    </div>
  )
}
