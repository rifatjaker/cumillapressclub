import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

const noticeInitial = {
  title: '',
  date_label: '',
  details: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
  file: null
}

const eventInitial = {
  title: '',
  date_label: '',
  time_label: '',
  venue: '',
  starts_at: '',
  sort_order: 0,
  is_active: true
}

const toDatetimeLocal = (value) => {
  if (!value) {
    return ''
  }
  const normalized = String(value).replace(' ', 'T')
  return normalized.slice(0, 16)
}

export default function NoticesEventsManager({ token }) {
  const [activeTab, setActiveTab] = useState('notices')

  const [notices, setNotices] = useState([])
  const [noticeForm, setNoticeForm] = useState(noticeInitial)
  const [editingNoticeId, setEditingNoticeId] = useState(null)
  const [existingFileUrl, setExistingFileUrl] = useState('')
  const [noticesLoading, setNoticesLoading] = useState(false)
  const [noticeSubmitting, setNoticeSubmitting] = useState(false)

  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState(eventInitial)
  const [editingEventId, setEditingEventId] = useState(null)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventSubmitting, setEventSubmitting] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resetMessages = () => {
    setMessage('')
    setError('')
  }

  const resetNoticeForm = () => {
    setEditingNoticeId(null)
    setNoticeForm(noticeInitial)
    setExistingFileUrl('')
  }

  const resetEventForm = () => {
    setEditingEventId(null)
    setEventForm(eventInitial)
  }

  const loadNotices = async () => {
    if (!token) {
      return
    }

    setNoticesLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'নোটিশ লোড করা যায়নি')
      }
      setNotices(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'নোটিশ লোডে সমস্যা')
    } finally {
      setNoticesLoading(false)
    }
  }

  const loadEvents = async () => {
    if (!token) {
      return
    }

    setEventsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/club-events`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ইভেন্ট লোড করা যায়নি')
      }
      setEvents(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ইভেন্ট লোডে সমস্যা')
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    resetMessages()
    loadNotices()
    loadEvents()
  }, [token])

  const handleNoticeSubmit = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!editingNoticeId && !noticeForm.file && !noticeForm.link_url.trim()) {
      setError('PDF ফাইল অথবা লিংক দিন।')
      return
    }

    setNoticeSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', noticeForm.title)
      formData.append('date_label', noticeForm.date_label)
      formData.append('details', noticeForm.details)
      formData.append('link_url', noticeForm.link_url)
      formData.append('sort_order', String(Number(noticeForm.sort_order) || 0))
      formData.append('is_active', noticeForm.is_active ? '1' : '0')
      if (noticeForm.file) {
        formData.append('file', noticeForm.file)
      }

      const url = editingNoticeId
        ? `${API_BASE}/api/v1/admin/notices/${editingNoticeId}`
        : `${API_BASE}/api/v1/admin/notices`

      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'নোটিশ সেভ করা যায়নি')
      }

      setMessage(editingNoticeId ? 'নোটিশ আপডেট হয়েছে' : 'নতুন নোটিশ যোগ হয়েছে')
      resetNoticeForm()
      await loadNotices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'নোটিশ সেভে সমস্যা')
    } finally {
      setNoticeSubmitting(false)
    }
  }

  const handleEventSubmit = async (event) => {
    event.preventDefault()
    resetMessages()
    setEventSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', eventForm.title)
      formData.append('date_label', eventForm.date_label)
      formData.append('time_label', eventForm.time_label)
      formData.append('venue', eventForm.venue)
      formData.append('starts_at', eventForm.starts_at)
      formData.append('sort_order', String(Number(eventForm.sort_order) || 0))
      formData.append('is_active', eventForm.is_active ? '1' : '0')

      const url = editingEventId
        ? `${API_BASE}/api/v1/admin/club-events/${editingEventId}`
        : `${API_BASE}/api/v1/admin/club-events`

      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ইভেন্ট সেভ করা যায়নি')
      }

      setMessage(editingEventId ? 'ইভেন্ট আপডেট হয়েছে' : 'নতুন ইভেন্ট যোগ হয়েছে')
      resetEventForm()
      await loadEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ইভেন্ট সেভে সমস্যা')
    } finally {
      setEventSubmitting(false)
    }
  }

  const handleNoticeDelete = async (id) => {
    if (!window.confirm('এই নোটিশ মুছে ফেলবেন?')) {
      return
    }
    resetMessages()
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'নোটিশ মুছা যায়নি')
      }
      if (editingNoticeId === id) {
        resetNoticeForm()
      }
      setMessage('নোটিশ মুছে ফেলা হয়েছে')
      await loadNotices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'নোটিশ ডিলিটে সমস্যা')
    }
  }

  const handleEventDelete = async (id) => {
    if (!window.confirm('এই ইভেন্ট মুছে ফেলবেন?')) {
      return
    }
    resetMessages()
    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/club-events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ইভেন্ট মুছা যায়নি')
      }
      if (editingEventId === id) {
        resetEventForm()
      }
      setMessage('ইভেন্ট মুছে ফেলা হয়েছে')
      await loadEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ইভেন্ট ডিলিটে সমস্যা')
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">প্রেস ক্লাবের নোটিশ ও ইভেন্ট</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">নোটিশ PDF আপলোড ও আগামী ইভেন্ট ম্যানেজ করুন</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'notices'
                ? 'bg-river text-white'
                : 'border border-ink/20 bg-white text-ink dark:border-white/25 dark:bg-white/10 dark:text-white'
            }`}
          >
            নোটিশ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'events'
                ? 'bg-river text-white'
                : 'border border-ink/20 bg-white text-ink dark:border-white/25 dark:bg-white/10 dark:text-white'
            }`}
          >
            ইভেন্ট
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-rose-300/35 bg-rose-100/75 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/15 dark:text-rose-100">{error}</p>
      )}
      {message && (
        <p className="mb-3 rounded-xl border border-emerald-300/35 bg-emerald-100/75 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100">{message}</p>
      )}

      {activeTab === 'notices' && (
        <div className="grid gap-5 lg:grid-cols-5">
          <form className="space-y-2 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-white/15 dark:bg-white/5 lg:col-span-2" onSubmit={handleNoticeSubmit}>
            <h4 className="text-sm font-bold text-ink dark:text-white">{editingNoticeId ? 'নোটিশ এডিট' : 'নতুন নোটিশ'}</h4>
            <input
              required
              value={noticeForm.title}
              onChange={(event) => setNoticeForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="শিরোনাম"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              value={noticeForm.date_label}
              onChange={(event) => setNoticeForm((prev) => ({ ...prev, date_label: event.target.value }))}
              placeholder="প্রকাশের তারিখ (যেমন: ০৮ আগস্ট ২০২৬)"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <textarea
              value={noticeForm.details}
              onChange={(event) => setNoticeForm((prev) => ({ ...prev, details: event.target.value }))}
              placeholder="বিস্তারিত (ঐচ্ছিক)"
              rows={3}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              value={noticeForm.link_url}
              onChange={(event) => setNoticeForm((prev) => ({ ...prev, link_url: event.target.value }))}
              placeholder="External URL (ঐচ্ছিক)"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              type="number"
              value={noticeForm.sort_order}
              onChange={(event) => setNoticeForm((prev) => ({ ...prev, sort_order: event.target.value }))}
              placeholder="Sort Order"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => setNoticeForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-river file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            {existingFileUrl && !noticeForm.file && (
              <a href={existingFileUrl} target="_blank" rel="noreferrer" className="block text-xs font-semibold text-river underline">
                বর্তমান ফাইল দেখুন
              </a>
            )}
            <label className="inline-flex items-center gap-2 text-sm text-ink/80 dark:text-white/80">
              <input
                type="checkbox"
                checked={noticeForm.is_active}
                onChange={(event) => setNoticeForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
              Active
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={noticeSubmitting}
                className="flex-1 rounded-lg bg-river px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {noticeSubmitting ? 'সেভ হচ্ছে...' : editingNoticeId ? 'আপডেট' : 'যোগ করুন'}
              </button>
              <button
                type="button"
                onClick={resetNoticeForm}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                রিসেট
              </button>
            </div>
          </form>

          <div className="overflow-x-auto lg:col-span-3">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-left text-ink/70 dark:border-white/20 dark:text-white/75">
                  <th className="px-2 py-2">শিরোনাম</th>
                  <th className="px-2 py-2">তারিখ</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {noticesLoading ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                  </tr>
                ) : notices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো নোটিশ নেই</td>
                  </tr>
                ) : (
                  notices.map((item) => (
                    <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                      <td className="px-2 py-2 font-semibold">{item.title}</td>
                      <td className="px-2 py-2">{item.date_label || '—'}</td>
                      <td className="px-2 py-2">{Number(item.is_active) === 1 ? 'Active' : 'Inactive'}</td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoticeId(item.id)
                              setNoticeForm({
                                title: item.title || '',
                                date_label: item.date_label || '',
                                details: item.details || '',
                                link_url: item.link_url || '',
                                sort_order: item.sort_order ?? 0,
                                is_active: Number(item.is_active) === 1,
                                file: null
                              })
                              setExistingFileUrl(item.file_url || '')
                              resetMessages()
                            }}
                            className="rounded-md border border-river/35 bg-river/10 px-2 py-1 text-xs font-semibold text-river"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNoticeDelete(item.id)}
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
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid gap-5 lg:grid-cols-5">
          <form className="space-y-2 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-white/15 dark:bg-white/5 lg:col-span-2" onSubmit={handleEventSubmit}>
            <h4 className="text-sm font-bold text-ink dark:text-white">{editingEventId ? 'ইভেন্ট এডিট' : 'নতুন ইভেন্ট'}</h4>
            <input
              required
              value={eventForm.title}
              onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="ইভেন্ট শিরোনাম"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              value={eventForm.date_label}
              onChange={(event) => setEventForm((prev) => ({ ...prev, date_label: event.target.value }))}
              placeholder="তারিখ লেবেল (যেমন: ১০ আগস্ট ২০২৬)"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              value={eventForm.time_label}
              onChange={(event) => setEventForm((prev) => ({ ...prev, time_label: event.target.value }))}
              placeholder="সময় (যেমন: বিকাল ৪:০০)"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              value={eventForm.venue}
              onChange={(event) => setEventForm((prev) => ({ ...prev, venue: event.target.value }))}
              placeholder="স্থান"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">
              কাউন্টডাউন তারিখ/সময়
              <input
                type="datetime-local"
                value={eventForm.starts_at}
                onChange={(event) => setEventForm((prev) => ({ ...prev, starts_at: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
              />
            </label>
            <input
              type="number"
              value={eventForm.sort_order}
              onChange={(event) => setEventForm((prev) => ({ ...prev, sort_order: event.target.value }))}
              placeholder="Sort Order"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <label className="inline-flex items-center gap-2 text-sm text-ink/80 dark:text-white/80">
              <input
                type="checkbox"
                checked={eventForm.is_active}
                onChange={(event) => setEventForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
              Active
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={eventSubmitting}
                className="flex-1 rounded-lg bg-river px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {eventSubmitting ? 'সেভ হচ্ছে...' : editingEventId ? 'আপডেট' : 'যোগ করুন'}
              </button>
              <button
                type="button"
                onClick={resetEventForm}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                রিসেট
              </button>
            </div>
          </form>

          <div className="overflow-x-auto lg:col-span-3">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-left text-ink/70 dark:border-white/20 dark:text-white/75">
                  <th className="px-2 py-2">শিরোনাম</th>
                  <th className="px-2 py-2">তারিখ</th>
                  <th className="px-2 py-2">স্থান</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {eventsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো ইভেন্ট নেই</td>
                  </tr>
                ) : (
                  events.map((item) => (
                    <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                      <td className="px-2 py-2 font-semibold">{item.title}</td>
                      <td className="px-2 py-2">{item.date_label || '—'}</td>
                      <td className="px-2 py-2">{item.venue || '—'}</td>
                      <td className="px-2 py-2">{Number(item.is_active) === 1 ? 'Active' : 'Inactive'}</td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEventId(item.id)
                              setEventForm({
                                title: item.title || '',
                                date_label: item.date_label || '',
                                time_label: item.time_label || '',
                                venue: item.venue || '',
                                starts_at: toDatetimeLocal(item.starts_at),
                                sort_order: item.sort_order ?? 0,
                                is_active: Number(item.is_active) === 1
                              })
                              resetMessages()
                            }}
                            className="rounded-md border border-river/35 bg-river/10 px-2 py-1 text-xs font-semibold text-river"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEventDelete(item.id)}
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
        </div>
      )}
    </section>
  )
}
