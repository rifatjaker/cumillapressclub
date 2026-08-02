import { useEffect, useState } from 'react'
import Header from './components/Header'
import Homepage from './components/Homepage'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cpc-theme')
    const isDark = saved === 'dark'
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function handleToggleTheme() {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('cpc-theme', next ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-pattern text-ink transition-colors dark:bg-[#11131f]">
      <Header darkMode={darkMode} onToggleTheme={handleToggleTheme} />
      <Homepage />
    </div>
  )
}
