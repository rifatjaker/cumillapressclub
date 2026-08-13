const raw = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').trim()

// Host origin only. Paths always start with /api/v1/...
// Accepts either:
//   https://cumillapressclub.com
//   https://cumillapressclub.com/api   (trailing /api is stripped)
export const API_BASE = raw.replace(/\/$/, '').replace(/\/api$/i, '')
