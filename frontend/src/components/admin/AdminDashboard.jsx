import { useEffect, useMemo, useState } from 'react'
import ArchiveManager from './ArchiveManager'
import CommitteeManager from './CommitteeManager'
import DeceasedMembersManager from './DeceasedMembersManager'
import LeadershipManager from './LeadershipManager'
import MembersManager from './MembersManager'
import PageSettingsManager from './PageSettingsManager'
import PrimaryMembersManager from './PrimaryMembersManager'
import NoticesEventsManager from './NoticesEventsManager'
import SliderManager from './SliderManager'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

const initialForm = {
  section_key: '',
  title: '',
  body: '',
  sort_order: 0,
  is_active: true
}

const adminMenus = [
  { id: 'contents', label: 'ডাইনামিক কনটেন্ট' },
  { id: 'slider', label: 'স্লাইডার' },
  { id: 'notices-events', label: 'নোটিশ ও ইভেন্ট' },
  { id: 'leadership', label: 'নেতৃত্বের প্রোফাইল' },
  { id: 'committee', label: 'নির্বাহী কমিটি' },
  { id: 'members', label: 'সদস্য ডিরেক্টরি' },
  { id: 'archive', label: 'ই-লাইব্রেরি ও আর্কাইভ' },
  { id: 'deceased', label: 'প্রয়াত সদস্য' },
  { id: 'primary', label: 'প্রাথমিক সদস্য' },
  { id: 'page-settings', label: 'Page Settings' }
]

export default function AdminDashboard({ darkMode, onToggleTheme }) {
  const [token, setToken] = useState(localStorage.getItem('cpc-admin-access-token') || '')
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('cpc-admin-refresh-token') || '')
  const [loginForm, setLoginForm] = useState({
    email: 'admin@cumillapressclub.local',
    password: 'admin1234'
  })
  const [contents, setContents] = useState([])
  const [contentForm, setContentForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeMenu, setActiveMenu] = useState('contents')

  const loggedIn = token.length > 0
  const dashboardTitle = useMemo(() => 'অ্যাডমিন ড্যাশবোর্ড', [])

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token])

  const clearMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

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
        await fetch(`${API_BASE}/api/v1/auth/logout`, {
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
    setContents([])
    setEditingId(null)
    setContentForm(initialForm)
    localStorage.removeItem('cpc-admin-access-token')
    localStorage.removeItem('cpc-admin-refresh-token')
  }

  const fetchContents = async () => {
    if (!token) {
      return
    }

    clearMessages()
    setIsLoadingList(true)

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/contents`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'কনটেন্ট লোড করা যায়নি')
      }

      setContents(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'লিস্ট লোডে সমস্যা হয়েছে')
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchContents()
    }
  }, [token])

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    clearMessages()
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
      setSuccessMessage('সফলভাবে লগইন হয়েছে')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'লগইন করা যায়নি')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleContentSubmit = async (event) => {
    event.preventDefault()
    clearMessages()
    setIsSubmitting(true)

    const payload = {
      ...contentForm,
      sort_order: Number(contentForm.sort_order) || 0,
      is_active: Boolean(contentForm.is_active)
    }

    const endpoint = editingId
      ? `${API_BASE}/api/v1/admin/contents/${editingId}`
      : `${API_BASE}/api/v1/admin/contents`
    const method = editingId ? 'PUT' : 'POST'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload)
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'সেভ করা যায়নি')
      }

      setSuccessMessage(editingId ? 'কনটেন্ট আপডেট হয়েছে' : 'নতুন কনটেন্ট যোগ হয়েছে')
      setEditingId(null)
      setContentForm(initialForm)
      await fetchContents()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'সেভ করা যায়নি')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    clearMessages()
    setEditingId(item.id)
    setContentForm({
      section_key: item.section_key || '',
      title: item.title || '',
      body: item.body || '',
      sort_order: Number(item.sort_order || 0),
      is_active: Number(item.is_active) === 1
    })
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('এই কনটেন্টটি ডিলিট করতে চান?')
    if (!confirmed) {
      return
    }

    clearMessages()

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/contents/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ডিলিট করা যায়নি')
      }

      setSuccessMessage('কনটেন্ট ডিলিট হয়েছে')
      await fetchContents()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'ডিলিট করা যায়নি')
    }
  }

  const renderLogin = () => (
    <div className="mx-auto mt-10 w-full max-w-md rounded-3xl border border-ink/10 bg-white p-6 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <h2 className="text-2xl font-bold text-ink dark:text-white">অ্যাডমিন লগইন</h2>
      <p className="mt-1 text-sm text-ink/70 dark:text-white/70">অ্যাডমিন প্যানেলে প্রবেশ করতে লগইন করুন</p>

      <form className="mt-4 space-y-3" onSubmit={handleLoginSubmit}>
        <input
          type="email"
          required
          value={loginForm.email}
          onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="ইমেইল"
          className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-river/40 dark:border-white/25 dark:bg-white/10 dark:text-white"
        />
        <input
          type="password"
          required
          value={loginForm.password}
          onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="পাসওয়ার্ড"
          className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-river/40 dark:border-white/25 dark:bg-white/10 dark:text-white"
        />
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full rounded-xl bg-river px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoggingIn ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
        </button>
      </form>

      <p className="mt-3 text-xs text-ink/60 dark:text-white/65">ডেমো: admin@cumillapressclub.local / admin1234</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-pattern px-3 py-8 text-ink transition-colors dark:bg-[#11131f] sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/10 bg-white p-4 shadow-card dark:border-white/20 dark:bg-[#101827]">
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white">{dashboardTitle}</h1>
            <p className="text-sm text-ink/70 dark:text-white/70">ডাইনামিক কনটেন্ট, স্লাইডার, নেতৃত্ব ও পেজ সেটিংস</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="rounded-full border border-ink/20 bg-white/80 px-4 py-1.5 text-sm font-semibold text-ink transition hover:bg-white dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              {darkMode ? 'লাইট' : 'ডার্ক'} মোড
            </button>
            <a href="#home" className="rounded-full border border-ink/20 bg-white/85 px-4 py-1.5 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">সাইটে ফেরত</a>
            {loggedIn && (
              <button
                onClick={clearAuthState}
                className="rounded-full bg-coral px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                লগআউট
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-xl border border-rose-300/35 bg-rose-100/75 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/15 dark:text-rose-100">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="mt-4 rounded-xl border border-emerald-300/35 bg-emerald-100/75 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100">{successMessage}</p>
        )}

        {!loggedIn ? (
          renderLogin()
        ) : (
          <>
            <nav className="mt-5 flex flex-wrap gap-2" aria-label="Admin menus">
              {adminMenus.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => setActiveMenu(menu.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    activeMenu === menu.id
                      ? 'bg-river text-white'
                      : 'border border-ink/20 bg-white text-ink hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
                  }`}
                >
                  {menu.label}
                </button>
              ))}
            </nav>

            {activeMenu === 'contents' && (
            <div className="mt-6 grid gap-5 lg:grid-cols-5">
              <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827] lg:col-span-2">
                <h3 className="text-lg font-bold text-ink dark:text-white">{editingId ? 'কনটেন্ট এডিট' : 'নতুন কনটেন্ট'}</h3>
                <form className="mt-3 space-y-2" onSubmit={handleContentSubmit}>
                  <input
                    required
                    value={contentForm.section_key}
                    onChange={(event) => setContentForm((prev) => ({ ...prev, section_key: event.target.value }))}
                    placeholder="Section Key (যেমন: breaking_news, featured_news, notices, upcoming_events)"
                    className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
                  />
                  <input
                    required
                    value={contentForm.title}
                    onChange={(event) => setContentForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Title"
                    className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
                  />
                  <textarea
                    required
                    rows={5}
                    value={contentForm.body}
                    onChange={(event) => setContentForm((prev) => ({ ...prev, body: event.target.value }))}
                    placeholder="Body"
                    className="w-full resize-none rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
                  />
                  <input
                    type="number"
                    value={contentForm.sort_order}
                    onChange={(event) => setContentForm((prev) => ({ ...prev, sort_order: event.target.value }))}
                    placeholder="Sort Order"
                    className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-ink/80 dark:text-white/80">
                    <input
                      type="checkbox"
                      checked={contentForm.is_active}
                      onChange={(event) => setContentForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                    />
                    Active
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-lg bg-river px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSubmitting ? 'সেভ হচ্ছে...' : editingId ? 'আপডেট' : 'যোগ করুন'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setContentForm(initialForm)
                      }}
                      className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                    >
                      রিসেট
                    </button>
                  </div>
                </form>
              </section>

              <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827] lg:col-span-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-ink dark:text-white">ডাইনামিক কনটেন্ট তালিকা</h3>
                  <button
                    type="button"
                    onClick={fetchContents}
                    className="rounded-lg border border-river/30 bg-river/10 px-3 py-1.5 text-xs font-semibold text-river transition hover:bg-river/20"
                  >
                    রিফ্রেশ
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-ink/15 text-left text-ink/70 dark:border-white/20 dark:text-white/75">
                        <th className="px-2 py-2">ID</th>
                        <th className="px-2 py-2">Section</th>
                        <th className="px-2 py-2">Title</th>
                        <th className="px-2 py-2">Sort</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingList ? (
                        <tr>
                          <td colSpan={6} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                        </tr>
                      ) : contents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো কনটেন্ট পাওয়া যায়নি</td>
                        </tr>
                      ) : (
                        contents.map((item) => (
                          <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                            <td className="px-2 py-2">{item.id}</td>
                            <td className="px-2 py-2">{item.section_key}</td>
                            <td className="px-2 py-2">{item.title}</td>
                            <td className="px-2 py-2">{item.sort_order}</td>
                            <td className="px-2 py-2">{Number(item.is_active) === 1 ? 'Active' : 'Inactive'}</td>
                            <td className="px-2 py-2">
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(item)}
                                  className="rounded-md border border-river/35 bg-river/10 px-2 py-1 text-xs font-semibold text-river"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className="rounded-md border border-rose-400/40 bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-400/20 dark:text-rose-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            )}

            {activeMenu === 'slider' && <SliderManager token={token} />}
            {activeMenu === 'notices-events' && <NoticesEventsManager token={token} />}
            {activeMenu === 'leadership' && <LeadershipManager token={token} />}
            {activeMenu === 'committee' && <CommitteeManager token={token} />}
            {activeMenu === 'members' && <MembersManager token={token} />}
            {activeMenu === 'archive' && <ArchiveManager token={token} />}
            {activeMenu === 'deceased' && <DeceasedMembersManager token={token} />}
            {activeMenu === 'primary' && <PrimaryMembersManager token={token} />}
            {activeMenu === 'page-settings' && <PageSettingsManager token={token} />}
          </>
        )}
      </div>
    </div>
  )
}
