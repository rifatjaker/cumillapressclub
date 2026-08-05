import { useEffect, useMemo, useState } from 'react'
import { navItems } from '../data/content'

function toBanglaDigits(value) {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(value).replace(/[0-9]/g, (d) => digits[Number(d)])
}

function NavIcon({ type }) {
  const iconClass = 'h-4 w-4'

  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M6 9.5V20h12V9.5" />
      </svg>
    )
  }

  if (type === 'about') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'committee') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M4 20c0-2.5 2-4.5 4.5-4.5S13 17.5 13 20" />
        <path d="M11 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      </svg>
    )
  }

  if (type === 'members') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M13 11h4" />
        <path d="M7 15h10" />
      </svg>
    )
  }

  if (type === 'news') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true">
        <path d="M5 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5z" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
      </svg>
    )
  }

  if (type === 'gallery') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.8" />
        <path d="M6 17l4.5-4 3 2.5 2.5-2 2 3.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true">
      <path d="M4 12h16" />
      <path d="M12 4v16" />
    </svg>
  )
}

function navIconTone(type) {
  if (type === 'home') return 'bg-orange-500/20 text-orange-600 dark:text-orange-300'
  if (type === 'about') return 'bg-sky-500/20 text-sky-600 dark:text-sky-300'
  if (type === 'committee') return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
  if (type === 'members') return 'bg-violet-500/20 text-violet-600 dark:text-violet-300'
  if (type === 'news') return 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
  if (type === 'gallery') return 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
  return 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300'
}

export default function Header({ darkMode, onToggleTheme, onAdminOpen }) {
  const [isNavFixed, setIsNavFixed] = useState(false)
  const [isLogoZoomOpen, setIsLogoZoomOpen] = useState(false)
  const siteLogo = `${import.meta.env.BASE_URL}logo.jpg`
  const now = useMemo(() => new Date(), [])
  const enDate = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const enTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  const enDateTime = `${enDate} at ${enTime}`
  const bnDate = toBanglaDigits(now.toLocaleDateString('bn-BD', { dateStyle: 'full' }))

  useEffect(() => {
    function onScroll() {
      setIsNavFixed(window.scrollY > 140)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isLogoZoomOpen) {
      return
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsLogoZoomOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isLogoZoomOpen])

  return (
    <header className="border-b border-ink/10 bg-white/90 dark:border-white/10 dark:bg-ink/85">
      <div className="w-full px-3 py-2.5 sm:px-5 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-gradient-to-r from-[#fff4e6] via-white to-[#eaf5ff] px-3 py-2 shadow-sm dark:border-white/15 dark:from-[#1f1a27] dark:via-[#171b2b] dark:to-[#162235]">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-coral/15 px-2 py-1 text-[11px] font-bold text-coral dark:bg-coral/20 dark:text-orange-200">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              LIVE
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink/90 dark:text-white/90">{bnDate}</p>
              <p className="truncate text-[12px] text-ink/70 dark:text-white/70">{enDateTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAdminOpen}
              className="rounded-full bg-gradient-to-r from-river to-[#005790] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              অ্যাডমিন লগইন
            </button>
            <button
              onClick={onToggleTheme}
              className="rounded-full border border-ink/20 bg-white/80 px-4 py-1.5 text-sm font-semibold text-ink transition hover:bg-white dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              {darkMode ? 'লাইট' : 'ডার্ক'} মোড
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start justify-between gap-4 px-3 py-5 sm:px-5 lg:px-8 md:flex-row md:items-center">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm dark:border-white/20 dark:bg-white/95" aria-label="কুমিল্লা প্রেসক্লাব লোগো">
            <img
              src={siteLogo}
              alt="Cumilla Press Club logo"
              className="h-full w-full cursor-zoom-in object-contain p-1.5"
              onClick={() => setIsLogoZoomOpen(true)}
              loading="eager"
              decoding="async"
            />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink dark:text-white">কুমিল্লা প্রেসক্লাব</h1>
            <p className="text-sm font-medium italic text-ink/70 dark:text-white/70">কুমিল্লা প্রেসক্লাব ডিজিটাল পোর্টাল</p>
          </div>
        </div>
        <div className="w-full rounded-2xl bg-gradient-to-r from-coral to-river px-6 py-4 text-white md:w-[440px]">
          <p className="text-xs uppercase tracking-widest">Sponsored Banner</p>
          <p className="mt-1 text-lg font-semibold">জাতীয় উন্নয়ন ও স্থানীয় উদ্যোগের পাশে</p>
        </div>
      </div>

      <div className={isNavFixed ? 'h-[62px]' : ''}>
        <nav
          className={
            isNavFixed
              ? 'main-nav fixed left-0 right-0 top-0 z-50 main-nav--fixed dark:border-white/10 dark:bg-ink/90'
              : 'main-nav dark:border-white/10 dark:bg-ink/90'
          }
          aria-label="প্রধান নেভিগেশন"
        >
          <div className="main-nav__container">
            <ul className="no-scrollbar main-nav__list">
              {navItems.map((item) => (
                <li key={item.label} className="main-nav__item">
                  <a href={item.href} className="main-nav__link">
                    <span className={`main-nav__icon ${navIconTone(item.icon)}`}>
                      <NavIcon type={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {isLogoZoomOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsLogoZoomOpen(false)}
          role="presentation"
        >
          <article
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/25 bg-[#0b1220] p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="লোগো জুম প্রিভিউ"
          >
            <div className="mb-2 flex items-center justify-between gap-3 px-1 py-1">
              <h4 className="line-clamp-1 text-sm font-semibold text-white sm:text-base">কুমিল্লা প্রেস ক্লাব লোগো</h4>
              <button
                type="button"
                onClick={() => setIsLogoZoomOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 text-white/90 transition hover:bg-white/10"
                aria-label="লোগো প্রিভিউ বন্ধ করুন"
              >
                ✕
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-black/60 p-3">
              <img
                src={siteLogo}
                alt="Cumilla Press Club logo বড় প্রিভিউ"
                className="mx-auto h-auto max-h-[70vh] w-full max-w-[320px] object-contain"
              />
            </div>
          </article>
        </div>
      )}
    </header>
  )
}
