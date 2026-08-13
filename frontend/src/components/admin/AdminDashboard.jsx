import { useEffect, useMemo, useState } from 'react'
import ArchiveManager from './ArchiveManager'
import AccountSecurityManager from './AccountSecurityManager'
import BreakingNewsManager from './BreakingNewsManager'
import DeceasedMembersManager from './DeceasedMembersManager'
import DiscussedTopicsManager from './DiscussedTopicsManager'
import FeaturedNewsManager from './FeaturedNewsManager'
import HeroHighlightsManager from './HeroHighlightsManager'
import MediaGalleryManager from './MediaGalleryManager'
import MembersManager from './MembersManager'
import PageSettingsManager from './PageSettingsManager'
import PrimaryMembersManager from './PrimaryMembersManager'
import NoticesEventsManager from './NoticesEventsManager'
import OrganizationSpotlightManager from './OrganizationSpotlightManager'
import SliderManager from './SliderManager'
import AdminToastHost from './AdminToastHost'
import { AdminMenuIcon } from './AdminMenuIcon'

import { API_BASE } from '../../apiBase.js'
import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const adminMenus = [
  { id: 'breaking-news', label: 'ব্রেকিং নিউজ' },
  { id: 'featured-news', label: 'ফিচার্ড ও ট্রেন্ডিং' },
  { id: 'hero-highlights', label: 'প্রধান খবরের হাইলাইট' },
  { id: 'discussed-topics', label: 'আলোচিত বিষয়' },
  { id: 'media-gallery', label: 'মিডিয়া গ্যালারি' },
  { id: 'slider', label: 'স্লাইডার' },
  { id: 'notices-events', label: 'নোটিশ ও ইভেন্ট' },
  { id: 'spotlight', label: 'জনতার আস্থা' },
  { id: 'members', label: 'সদস্য ডিরেক্টরি' },
  { id: 'archive', label: 'ই-লাইব্রেরি ও আর্কাইভ' },
  { id: 'deceased', label: 'প্রয়াত সদস্য' },
  { id: 'primary', label: 'প্রাথমিক সদস্য' },
  { id: 'page-settings', label: 'সাইট সেটিংস' },
  { id: 'account', label: 'অ্যাকাউন্ট ও নিরাপত্তা' }
]

export default function AdminDashboard({ darkMode, onToggleTheme, siteName, siteLogo }) {
  const [token, setToken] = useState(localStorage.getItem('cpc-admin-access-token') || '')
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('cpc-admin-refresh-token') || '')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const brandName = siteName || 'কুমিল্লা প্রেস ক্লাব'
  const brandLogo = siteLogo || `${import.meta.env.BASE_URL}logo.jpg`
  const [activeMenu, setActiveMenu] = useState('breaking-news')

  const loggedIn = token.length > 0
  const dashboardTitle = useMemo(() => 'অ্যাডমিন ড্যাশবোর্ড', [])

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token])

  const applyLoginState = (payload) => {
    const access = payload?.access_token || ''
    const refresh = payload?.refresh_token || ''

    setToken(access)
    setRefreshToken(refresh)

    localStorage.setItem('cpc-admin-access-token', access)
    localStorage.setItem('cpc-admin-refresh-token', refresh)
  }

  const clearAuthState = async () => {
    try {
      if (token && refreshToken) {
        await adminFetch(`/api/v1/auth/logout`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ refresh_token: refreshToken })
        })
      }
    } catch {
      // Ignore logout errors during local reset.
    }

    setToken('')
    setRefreshToken('')
    setActiveMenu('breaking-news')
    localStorage.removeItem('cpc-admin-access-token')
    localStorage.removeItem('cpc-admin-refresh-token')
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    const minDelay = new Promise((resolve) => {
      window.setTimeout(resolve, 1600)
    })

    await Promise.all([clearAuthState(), minDelay])
    setIsLoggingOut(false)
  }

  useEffect(() => {
    const onUnauthorized = (event) => {
      setToken('')
      setRefreshToken('')
      toastError(event?.detail?.message || 'সেশন শেষ হয়েছে। আবার লগইন করুন।')
      setActiveMenu('breaking-news')
    }

    const onTokenRefreshed = (event) => {
      const access = event?.detail?.access_token || ''
      const refresh = event?.detail?.refresh_token || ''
      if (access) {
        setToken(access)
      }
      if (refresh) {
        setRefreshToken(refresh)
      }
    }

    window.addEventListener('cpc-admin-unauthorized', onUnauthorized)
    window.addEventListener('cpc-admin-token-refreshed', onTokenRefreshed)

    return () => {
      window.removeEventListener('cpc-admin-unauthorized', onUnauthorized)
      window.removeEventListener('cpc-admin-token-refreshed', onTokenRefreshed)
    }
  }, [])

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsLoggingIn(true)

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'লগইন ব্যর্থ')
      }

      applyLoginState(result.data)
      toastSuccess('সফলভাবে লগইন হয়েছে')
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'লগইন করা যায়নি')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const renderLogin = () => (
    <div className="mx-auto mt-10 w-full max-w-md overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="px-6 pb-2 pt-6 text-center">
        <img
          src={brandLogo}
          alt={brandName}
          className="mx-auto h-20 w-20 rounded-2xl border border-ink/10 object-cover shadow-sm dark:border-white/20"
          onError={(event) => {
            event.currentTarget.src = `${import.meta.env.BASE_URL}logo.jpg`
          }}
        />
        <h2 className="mt-4 text-2xl font-bold text-ink dark:text-white">{brandName}</h2>
        <p className="mt-1 text-sm text-ink/70 dark:text-white/70">অ্যাডমিন প্যানেলে প্রবেশ করতে লগইন করুন</p>
      </div>

      <form className="space-y-3 px-6 pb-4 pt-2" onSubmit={handleLoginSubmit}>
        <input
          type="email"
          required
          value={loginForm.email}
          onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="ইমেইল"
          className="neo-field"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={loginForm.password}
            onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="পাসওয়ার্ড"
            className="neo-field pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-river"
          >
            {showPassword ? 'লুকাও' : 'দেখাও'}
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoggingIn}
          className="neo-btn neo-btn-primary w-full"
        >
          {isLoggingIn ? 'লগইন হচ্ছে...' : 'লগইন'}
        </button>
      </form>
    </div>
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef6ff,_#f7fafc_45%,_#edf2f7)] px-3 py-4 dark:bg-[radial-gradient(circle_at_top,_#0b1524,_#0f172a_50%,_#111827)] sm:px-5">
      <AdminToastHost />
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/10 bg-white/90 px-4 py-3 shadow-card backdrop-blur dark:border-white/15 dark:bg-[#101827]/95">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-river dark:text-sky-200">ADMIN</p>
            <h1 className="text-xl font-bold text-ink dark:text-white sm:text-2xl">{dashboardTitle}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="neo-btn neo-btn-ghost !py-2 !text-xs"
            >
              {darkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
            </button>
            {loggedIn && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="neo-btn neo-btn-primary !py-2 !text-xs"
              >
                লগআউট
              </button>
            )}
          </div>
        </div>

        {isLoggingOut && (
          <div className="admin-logout-overlay" role="status" aria-live="polite" aria-busy="true">
            <div className="admin-logout-card">
              <div className="admin-logout-ring" aria-hidden="true">
                <span className="admin-logout-ring__spin" />
                <span className="admin-logout-ring__dot" />
              </div>
              <p className="admin-logout-kicker">SESSION</p>
              <h2 className="admin-logout-title">সেশন লগআউট হচ্ছে...</h2>
              <p className="admin-logout-copy">নিরাপদে সাইন আউট করা হচ্ছে। লগইন পেজে নিয়ে যাওয়া হচ্ছে।</p>
              <div className="admin-logout-track" aria-hidden="true">
                <span className="admin-logout-track__bar" />
              </div>
            </div>
          </div>
        )}

        {!loggedIn ? (
          renderLogin()
        ) : (
          <>
            <nav className="mt-5 flex flex-wrap gap-2.5" aria-label="Admin menus">
              {adminMenus.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => setActiveMenu(menu.id)}
                  className={`admin-menu-btn ${activeMenu === menu.id ? 'is-active' : ''}`}
                >
                  <span className="admin-menu-btn__icon">
                    <AdminMenuIcon id={menu.id} />
                  </span>
                  <span>{menu.label}</span>
                </button>
              ))}
            </nav>

            {activeMenu === 'breaking-news' && <BreakingNewsManager token={token} />}
            {activeMenu === 'featured-news' && <FeaturedNewsManager token={token} />}
            {activeMenu === 'hero-highlights' && <HeroHighlightsManager token={token} />}
            {activeMenu === 'discussed-topics' && <DiscussedTopicsManager token={token} />}
            {activeMenu === 'media-gallery' && <MediaGalleryManager token={token} />}
            {activeMenu === 'slider' && <SliderManager token={token} />}
            {activeMenu === 'notices-events' && <NoticesEventsManager token={token} />}
            {activeMenu === 'spotlight' && <OrganizationSpotlightManager token={token} />}
            {activeMenu === 'members' && <MembersManager token={token} />}
            {activeMenu === 'archive' && <ArchiveManager token={token} />}
            {activeMenu === 'deceased' && <DeceasedMembersManager token={token} />}
            {activeMenu === 'primary' && <PrimaryMembersManager token={token} />}
            {activeMenu === 'page-settings' && <PageSettingsManager token={token} />}
            {activeMenu === 'account' && <AccountSecurityManager />}
          </>
        )}

        <footer className="mt-8 rounded-3xl border border-ink/10 bg-white px-4 py-3 shadow-card dark:border-white/20 dark:bg-[#101827]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/65 dark:text-white/70">
            <p>
              Developed By{' '}
              <a
                href="https://a2technologiesbd.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-river underline-offset-2 transition hover:underline dark:text-sky-200"
              >
                A2 Technologies
              </a>
            </p>
            <p className="font-semibold tracking-wide">Admin v1</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
