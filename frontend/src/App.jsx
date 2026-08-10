import { useEffect, useState } from 'react'
import AdminDashboard from './components/admin/AdminDashboard'
import Header from './components/Header'
import Homepage from './components/Homepage'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

const defaultPageSettings = {
  site_name: 'কুমিল্লা প্রেস ক্লাব',
  logo_url: null,
  address: 'কুমিল্লা প্রেস ক্লাব, কুমিল্লা শহর, বাংলাদেশ',
  phone: '+8801XXXXXXXXX',
  email: 'info@cumillapressclub.org',
  map_embed_url: 'https://www.google.com/maps?q=Comilla%20Bangladesh&output=embed',
  facebook_url: 'https://www.facebook.com/share/19Dr5t8wkK/',
  youtube_url: 'https://www.youtube.com',
  twitter_url: 'https://x.com',
  credit_line1: 'সার্বিক পরিকল্পনা ও বাস্তবায়নে: মো: আসিফ হোসাইন মান্না',
  credit_line2: 'বিজ্ঞান,তথ্য প্রযুক্তি ও গবেষণা সম্পাদক',
  credit_line3: 'কুমিল্লা প্রেসক্লাব',
  important_links: [
    { label: 'জেলা প্রশাসন', url: '#' },
    { label: 'পুলিশ সুপার কার্যালয়', url: '#' },
    { label: 'তথ্য মন্ত্রণালয়', url: '#' },
    { label: 'বাংলাদেশ প্রেস কাউন্সিল', url: '#' }
  ],
  local_newspaper_links: [
    { label: 'দৈনিক কুমিল্লা', url: '#' },
    { label: 'সমকাল কুমিল্লা', url: '#' },
    { label: 'কুমিল্লা বার্তা', url: '#' },
    { label: 'প্রতিদিনের সংবাদ', url: '#' }
  ]
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [isAdminView, setIsAdminView] = useState(window.location.hash === '#admin')
  const [pageSettings, setPageSettings] = useState(defaultPageSettings)

  useEffect(() => {
    const saved = localStorage.getItem('cpc-theme')
    const isDark = saved === 'dark'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  useEffect(() => {
    const syncViewWithHash = () => {
      setIsAdminView(window.location.hash === '#admin')
    }

    syncViewWithHash()
    window.addEventListener('hashchange', syncViewWithHash)

    return () => {
      window.removeEventListener('hashchange', syncViewWithHash)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadPageSettings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/page-settings`)
        const result = await response.json().catch(() => ({}))
        if (!response.ok || !result.success || cancelled) {
          return
        }

        setPageSettings((prev) => ({
          ...prev,
          ...(result.data || {})
        }))
      } catch {
        // Keep defaults when API is offline.
      }
    }

    if (!isAdminView) {
      loadPageSettings()
    }

    return () => {
      cancelled = true
    }
  }, [isAdminView])

  function handleToggleTheme() {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('cpc-theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  function openAdminView() {
    window.location.hash = 'admin'
  }

  if (isAdminView) {
    return <AdminDashboard darkMode={darkMode} onToggleTheme={handleToggleTheme} />
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-pattern text-ink transition-colors dark:bg-[#11131f]">
      <Header
        darkMode={darkMode}
        onToggleTheme={handleToggleTheme}
        onAdminOpen={openAdminView}
        siteName={pageSettings.site_name}
        siteLogo={pageSettings.logo_url}
      />
      <Homepage pageSettings={pageSettings} />
    </div>
  )
}
