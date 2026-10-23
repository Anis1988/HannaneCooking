import { Link } from 'react-router-dom'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
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
}

export function Button({ to, href, onClick, children, variant = 'primary', size = 'md', className, type = 'button', disabled }: BtnProps) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 select-none',
    size === 'lg' && 'px-7 py-4 text-base',
    size === 'md' && 'px-5 py-3 text-sm',
    size === 'sm' && 'px-4 py-2 text-sm',
    variant === 'primary' && 'shine bg-gradient-brand text-ink shadow-[0_10px_40px_-10px_rgba(255,93,115,0.7)] hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-12px_rgba(255,93,115,0.9)]',
    variant === 'ghost' && 'glass text-white hover:bg-white/10',
    variant === 'soft' && 'bg-white/5 text-white hover:bg-white/10 border border-line',
    disabled && 'pointer-events-none opacity-40',
    className,
  )
  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint shadow-[0_0_12px_var(--color-mint)]" />
      {children}
    </span>
  )
}

export function SectionTitle({ eyebrow, title, sub, center = true }: { eyebrow?: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <Reveal className={cx('mb-8 max-w-3xl sm:mb-12', center && 'mx-auto text-center')}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 font-display text-[2rem] font-bold leading-[1.05] tracking-tight sm:mt-5 sm:text-5xl">{title}</h2>
      {sub && <p className="mt-3 text-base text-mute sm:mt-4 sm:text-lg">{sub}</p>}
    </Reveal>
  )
}

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: boolean }) {
  return <div className={cx('glass rounded-3xl', glow && 'ring-glow', className)}>{children}</div>
}

export function Chip({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200',
        active ? 'border-sun/70 bg-sun/10 text-white shadow-[0_0_0_4px_rgba(255,181,71,0.08)]' : 'border-line bg-white/[0.03] text-white/80 hover:border-white/25 hover:bg-white/[0.06]',
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
