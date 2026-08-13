import { API_BASE } from './apiBase'

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = localStorage.getItem('cpc-admin-refresh-token') || ''
  if (!refresh) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refresh })
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok || !result.success || !result.data?.access_token) {
      return null
    }

    const access = String(result.data.access_token || '')
    const nextRefresh = String(result.data.refresh_token || '')

    localStorage.setItem('cpc-admin-access-token', access)
    if (nextRefresh) {
      localStorage.setItem('cpc-admin-refresh-token', nextRefresh)
    }

    window.dispatchEvent(
      new CustomEvent('cpc-admin-token-refreshed', {
        detail: {
          access_token: access,
          refresh_token: nextRefresh || refresh
        }
      })
    )

    return access
  } catch {
    return null
  }
}

export function forceAdminLogout(message = 'সেশন শেষ হয়েছে। আবার লগইন করুন।') {
  localStorage.removeItem('cpc-admin-access-token')
  localStorage.removeItem('cpc-admin-refresh-token')
  window.dispatchEvent(
    new CustomEvent('cpc-admin-unauthorized', {
      detail: { message }
    })
  )
}

/**
 * Authenticated admin fetch with one-time token refresh.
 * On unrecoverable 401, clears session and emits logout event.
 */
export async function adminFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const { skipAuth = false, ...fetchOptions } = options

  const doFetch = (accessToken) => {
    const headers = new Headers(fetchOptions.headers || {})

    if (!skipAuth && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    // Let the browser set multipart boundary for FormData.
    if (fetchOptions.body instanceof FormData) {
      headers.delete('Content-Type')
    }

    return fetch(url, {
      ...fetchOptions,
      headers
    })
  }

  let accessToken = skipAuth ? '' : localStorage.getItem('cpc-admin-access-token') || ''
  let response = await doFetch(accessToken)

  if (!skipAuth && response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const newToken = await refreshPromise
    if (!newToken) {
      forceAdminLogout()
      throw new Error('সেশন শেষ হয়েছে। আবার লগইন করুন।')
    }

    response = await doFetch(newToken)
    if (response.status === 401) {
      forceAdminLogout()
      throw new Error('সেশন শেষ হয়েছে। আবার লগইন করুন।')
    }
  }

  return response
}
