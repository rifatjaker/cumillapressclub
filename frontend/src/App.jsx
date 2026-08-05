import { useEffect, useState } from 'react'
import AdminDashboard from './components/admin/AdminDashboard'
import Header from './components/Header'
import Homepage from './components/Homepage'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [isAdminView, setIsAdminView] = useState(window.location.hash === '#admin')

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
      <Header darkMode={darkMode} onToggleTheme={handleToggleTheme} onAdminOpen={openAdminView} />
      <Homepage />
    </div>
  )
}
