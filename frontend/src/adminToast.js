let toastId = 0

/**
 * Show a toast in the admin dashboard (listened by AdminToastHost).
 * @param {'success'|'error'|'info'} type
 * @param {string} message
 * @param {{ duration?: number }} [options]
 */
export function showAdminToast(type, message, options = {}) {
  const text = String(message || '').trim()
  if (!text) {
    return
  }

  toastId += 1
  window.dispatchEvent(
    new CustomEvent('cpc-admin-toast', {
      detail: {
        id: toastId,
        type: type === 'error' || type === 'info' ? type : 'success',
        message: text,
        duration: Number(options.duration) > 0 ? Number(options.duration) : 3800
      }
    })
  )
}

export function toastSuccess(message, options) {
  showAdminToast('success', message, options)
}

export function toastError(message, options) {
  showAdminToast('error', message, options)
}
