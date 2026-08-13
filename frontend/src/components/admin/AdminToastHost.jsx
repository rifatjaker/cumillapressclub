import { useEffect, useState } from 'react'

export default function AdminToastHost() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const timers = new Map()

    const onToast = (event) => {
      const detail = event?.detail || {}
      const id = detail.id || Date.now()
      const duration = Number(detail.duration) > 0 ? Number(detail.duration) : 3800
      const next = {
        id,
        type: detail.type || 'success',
        message: String(detail.message || ''),
        leaving: false
      }

      if (!next.message) {
        return
      }

      setToasts((prev) => [...prev.slice(-4), next])

      const leaveTimer = window.setTimeout(() => {
        setToasts((prev) => prev.map((item) => (item.id === id ? { ...item, leaving: true } : item)))
      }, Math.max(duration - 280, 800))

      const removeTimer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id))
        timers.delete(id)
      }, duration)

      timers.set(id, [leaveTimer, removeTimer])
    }

    window.addEventListener('cpc-admin-toast', onToast)
    return () => {
      window.removeEventListener('cpc-admin-toast', onToast)
      timers.forEach((pair) => {
        pair.forEach((timer) => window.clearTimeout(timer))
      })
      timers.clear()
    }
  }, [])

  const dismiss = (id) => {
    setToasts((prev) => prev.map((item) => (item.id === id ? { ...item, leaving: true } : item)))
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 220)
  }

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="admin-toast-host" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`admin-toast admin-toast--${toast.type}${toast.leaving ? ' is-leaving' : ''}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className="admin-toast__icon" aria-hidden="true">
            {toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓'}
          </span>
          <p className="admin-toast__message">{toast.message}</p>
          <button
            type="button"
            className="admin-toast__close"
            onClick={() => dismiss(toast.id)}
            aria-label="বন্ধ"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
