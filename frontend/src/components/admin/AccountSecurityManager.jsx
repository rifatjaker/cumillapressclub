import { useEffect, useState } from 'react'

import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const emptyPasswordForm = {
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
}

function InfoRow({ label, value }) {
  const empty = value === null || value === undefined || value === ''

  return (
    <div className="grid gap-1 border-b border-ink/10 py-2.5 last:border-b-0 dark:border-white/10 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/55 dark:text-white/55">{label}</dt>
      <dd className="break-all text-sm font-medium text-ink dark:text-white">{empty ? '—' : value}</dd>
    </div>
  )
}

function LoginCard({ title, eyebrow, login }) {
  if (!login) {
    return (
      <section className="neo-panel">
        <div className="neo-panel__head">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-river dark:text-sky-200">{eyebrow}</p>
          <h3 className="mt-1 text-lg font-bold text-ink dark:text-white">{title}</h3>
        </div>
        <p className="p-5 text-sm text-ink/65 dark:text-white/70">এখনো কোনো তথ্য নেই।</p>
      </section>
    )
  }

  return (
    <section className="neo-panel">
      <div className="neo-panel__head">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-river dark:text-sky-200">{eyebrow}</p>
        <h3 className="mt-1 text-lg font-bold text-ink dark:text-white">{title}</h3>
      </div>
      <dl className="px-5 pb-4 pt-2">
        <InfoRow label="তারিখ" value={login.date_bn || login.date} />
        <InfoRow label="সময়" value={login.time} />
        <InfoRow label="IP Address" value={login.ip} />
        <InfoRow label="Device / Browser" value={login.user_agent} />
      </dl>
    </section>
  )
}

export default function AccountSecurityManager() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const fetchProfile = async () => {
    setIsLoading(true)

    try {
      const response = await adminFetch('/api/v1/auth/me', { method: 'GET' })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'প্রোফাইল লোড করা যায়নি')
      }

      setProfile(result.data || null)
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'প্রোফাইল লোড করা যায়নি')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setIsSavingPassword(true)

    try {
      const response = await adminFetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm)
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'পাসওয়ার্ড পরিবর্তন করা যায়নি')
      }

      setPasswordForm(emptyPasswordForm)
      toastSuccess(result.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে')
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'পাসওয়ার্ড পরিবর্তন করা যায়নি')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const recentLogins = Array.isArray(profile?.recent_logins) ? profile.recent_logins : []

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="neo-panel">
          <div className="neo-panel__head flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-river dark:text-sky-200">STATUS</p>
              <h3 className="mt-1 text-lg font-bold text-ink dark:text-white">লগইন স্ট্যাটাস</h3>
            </div>
            <button
              type="button"
              onClick={fetchProfile}
              className="neo-btn neo-btn-ghost !py-2 !text-xs"
              disabled={isLoading}
            >
              {isLoading ? 'লোড...' : 'রিফ্রেশ'}
            </button>
          </div>

          {isLoading && !profile ? (
            <p className="p-5 text-sm text-ink/65 dark:text-white/70">লোড হচ্ছে...</p>
          ) : (
            <dl className="px-5 pb-4 pt-2">
              <InfoRow
                label="স্ট্যাটাস"
                value={
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    {profile?.status_label || 'লগইন আছে'}
                  </span>
                }
              />
              <InfoRow label="নাম" value={profile?.name} />
              <InfoRow label="ইমেইল" value={profile?.email} />
              <InfoRow label="রোল" value={profile?.role === 'admin' ? 'Admin' : profile?.role} />
              <InfoRow label="বর্তমান Request IP" value={profile?.current_request_ip} />
            </dl>
          )}
        </section>

        <LoginCard title="বর্তমান লগইন" eyebrow="CURRENT SESSION" login={profile?.current_login} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <LoginCard title="আগের লগইন" eyebrow="PREVIOUS" login={profile?.previous_login} />

        <section className="neo-panel">
          <div className="neo-panel__head">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-river dark:text-sky-200">SECURITY</p>
            <h3 className="mt-1 text-lg font-bold text-ink dark:text-white">পাসওয়ার্ড পরিবর্তন</h3>
          </div>
          <form className="space-y-3 p-5" onSubmit={handlePasswordSubmit}>
            <label className="block">
              <span className="neo-label">বর্তমান পাসওয়ার্ড</span>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={passwordForm.current_password}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))}
                  className="neo-field pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-ink/55 dark:text-white/60"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  aria-label="Toggle current password"
                >
                  {showPasswords.current ? 'লুকাও' : 'দেখাও'}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="neo-label">নতুন পাসওয়ার্ড</span>
              <div className="relative">
                <input
                  type={showPasswords.next ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwordForm.new_password}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))}
                  className="neo-field pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-ink/55 dark:text-white/60"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, next: !prev.next }))}
                  aria-label="Toggle new password"
                >
                  {showPasswords.next ? 'লুকাও' : 'দেখাও'}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="neo-label">নতুন পাসওয়ার্ড নিশ্চিত করুন</span>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwordForm.new_password_confirmation}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password_confirmation: event.target.value }))}
                  className="neo-field pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-ink/55 dark:text-white/60"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  aria-label="Toggle confirm password"
                >
                  {showPasswords.confirm ? 'লুকাও' : 'দেখাও'}
                </button>
              </div>
            </label>

            <p className="text-xs text-ink/60 dark:text-white/65">কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।</p>

            <button type="submit" disabled={isSavingPassword} className="neo-btn neo-btn-primary">
              {isSavingPassword ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
            </button>
          </form>
        </section>
      </div>

      <section className="neo-panel">
        <div className="neo-panel__head">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-river dark:text-sky-200">HISTORY</p>
          <h3 className="mt-1 text-lg font-bold text-ink dark:text-white">সাম্প্রতিক লগইন</h3>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-ink/70 dark:border-white/20 dark:text-white/75">
                <th className="px-2 py-2">তারিখ</th>
                <th className="px-2 py-2">সময়</th>
                <th className="px-2 py-2">IP</th>
                <th className="px-2 py-2">Device / Browser</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && recentLogins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                </tr>
              ) : recentLogins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">
                    এখনো লগইন হিস্ট্রি নেই। মাইগ্রেশন রান করে আবার লগইন করুন।
                  </td>
                </tr>
              ) : (
                recentLogins.map((item) => (
                  <tr key={item.id || `${item.at}-${item.ip}`} className="border-b border-ink/10 dark:border-white/10">
                    <td className="px-2 py-2">{item.date_bn || item.date}</td>
                    <td className="px-2 py-2">{item.time}</td>
                    <td className="px-2 py-2 font-mono text-xs">{item.ip}</td>
                    <td className="max-w-md truncate px-2 py-2 text-xs text-ink/75 dark:text-white/70" title={item.user_agent}>
                      {item.user_agent || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
