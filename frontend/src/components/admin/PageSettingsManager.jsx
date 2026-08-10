import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

const defaultImportantLinks = [
  { label: 'জেলা প্রশাসন', url: '#' },
  { label: 'পুলিশ সুপার কার্যালয়', url: '#' },
  { label: 'তথ্য মন্ত্রণালয়', url: '#' },
  { label: 'বাংলাদেশ প্রেস কাউন্সিল', url: '#' }
]

const defaultLocalNewspaperLinks = [
  { label: 'দৈনিক কুমিল্লা', url: '#' },
  { label: 'সমকাল কুমিল্লা', url: '#' },
  { label: 'কুমিল্লা বার্তা', url: '#' },
  { label: 'প্রতিদিনের সংবাদ', url: '#' }
]

const defaultForm = {
  site_name: 'কুমিল্লা প্রেস ক্লাব',
  address: '',
  phone: '',
  email: '',
  map_embed_url: '',
  facebook_url: '',
  youtube_url: '',
  twitter_url: '',
  credit_line1: '',
  credit_line2: '',
  credit_line3: ''
}

function normalizeLinks(links, fallback) {
  if (!Array.isArray(links) || links.length === 0) {
    return fallback.map((item) => ({ ...item }))
  }

  return links.map((item) => ({
    label: String(item?.label || ''),
    url: String(item?.url || '#')
  }))
}

function LinkEditor({ title, links, onChange }) {
  return (
    <div className="space-y-3 rounded-2xl border border-ink/10 bg-ink/[0.02] p-3 dark:border-white/15 dark:bg-white/5 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-ink dark:text-white">{title}</h4>
        <button
          type="button"
          onClick={() => onChange([...links, { label: '', url: '' }])}
          className="rounded-lg border border-river/30 bg-river/10 px-2.5 py-1 text-xs font-semibold text-river transition hover:bg-river/20"
        >
          + লিংক যোগ
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-xs text-ink/60 dark:text-white/65">কোনো লিংক নেই। উপরের বাটন দিয়ে যোগ করুন।</p>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={`link-${title}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
              <input
                value={link.label}
                onChange={(event) => {
                  const next = links.map((item, i) => (i === index ? { ...item, label: event.target.value } : item))
                  onChange(next)
                }}
                placeholder="লিংকের নাম"
                className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
              />
              <input
                value={link.url}
                onChange={(event) => {
                  const next = links.map((item, i) => (i === index ? { ...item, url: event.target.value } : item))
                  onChange(next)
                }}
                placeholder="https://..."
                className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
              />
              <button
                type="button"
                onClick={() => onChange(links.filter((_, i) => i !== index))}
                className="rounded-lg border border-rose-400/40 bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-400/20 dark:text-rose-100"
              >
                মুছুন
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PageSettingsManager({ token }) {
  const [form, setForm] = useState(defaultForm)
  const [importantLinks, setImportantLinks] = useState(defaultImportantLinks)
  const [localNewspaperLinks, setLocalNewspaperLinks] = useState(defaultLocalNewspaperLinks)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resetMessages = () => {
    setMessage('')
    setError('')
  }

  const applySettingsData = (data = {}) => {
    setForm({
      site_name: data.site_name || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
      map_embed_url: data.map_embed_url || '',
      facebook_url: data.facebook_url || '',
      youtube_url: data.youtube_url || '',
      twitter_url: data.twitter_url || '',
      credit_line1: data.credit_line1 || '',
      credit_line2: data.credit_line2 || '',
      credit_line3: data.credit_line3 || ''
    })
    setImportantLinks(normalizeLinks(data.important_links, defaultImportantLinks))
    setLocalNewspaperLinks(normalizeLinks(data.local_newspaper_links, defaultLocalNewspaperLinks))
    setLogoPreview(data.logo_url || '')
    setLogoFile(null)
  }

  const loadSettings = async () => {
    if (!token) {
      return
    }

    resetMessages()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/page-settings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'পেজ সেটিংস লোড করা যায়নি')
      }

      applySettingsData(result.data || {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পেজ সেটিংস লোডে সমস্যা')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [token])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()
    setIsSubmitting(true)

    try {
      const cleanedImportant = importantLinks
        .map((item) => ({ label: item.label.trim(), url: item.url.trim() || '#' }))
        .filter((item) => item.label !== '')
      const cleanedLocal = localNewspaperLinks
        .map((item) => ({ label: item.label.trim(), url: item.url.trim() || '#' }))
        .filter((item) => item.label !== '')

      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('important_links', JSON.stringify(cleanedImportant))
      formData.append('local_newspaper_links', JSON.stringify(cleanedLocal))
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const response = await fetch(`${API_BASE}/api/v1/admin/page-settings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'সেভ করা যায়নি')
      }

      applySettingsData(result.data || {})
      setMessage('পেজ সেটিংস সেভ হয়েছে')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সেভে সমস্যা হয়েছে')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">পেজ সেটিংস</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">লোগো, যোগাযোগ, ফুটার লিংক, সোশ্যাল ও ক্রেডিট</p>
        </div>
        <button
          type="button"
          onClick={loadSettings}
          className="rounded-lg border border-river/30 bg-river/10 px-3 py-1.5 text-xs font-semibold text-river transition hover:bg-river/20"
        >
          রিফ্রেশ
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-rose-300/35 bg-rose-100/75 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/15 dark:text-rose-100">{error}</p>
      )}
      {message && (
        <p className="mb-3 rounded-xl border border-emerald-300/35 bg-emerald-100/75 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100">{message}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-ink/65 dark:text-white/70">লোড হচ্ছে...</p>
      ) : (
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-ink/80 dark:text-white/80">সাইটের নাম</label>
            <input
              required
              value={form.site_name}
              onChange={handleChange('site_name')}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-ink/80 dark:text-white/80">লোগো</label>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-ink/15 bg-white dark:border-white/20 dark:bg-white/95">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Site logo preview"
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[10px] text-ink/50">No logo</span>
                )}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null
                  setLogoFile(file)
                  if (file) {
                    setLogoPreview(URL.createObjectURL(file))
                  }
                }}
                className="w-full max-w-sm rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-river file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white dark:border-white/25 dark:bg-white/10 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <h4 className="text-sm font-bold text-ink dark:text-white">যোগাযোগ ও মানচিত্র</h4>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">ঠিকানা</label>
            <input
              value={form.address}
              onChange={handleChange('address')}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">ফোন</label>
            <input
              value={form.phone}
              onChange={handleChange('phone')}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">ইমেইল</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">Google Map Embed URL</label>
            <input
              value={form.map_embed_url}
              onChange={handleChange('map_embed_url')}
              placeholder="https://www.google.com/maps?q=...&output=embed"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>

          <LinkEditor
            title="গুরুত্বপূর্ণ লিংক"
            links={importantLinks}
            onChange={setImportantLinks}
          />
          <LinkEditor
            title="স্থানীয় পত্রিকার লিঙ্ক"
            links={localNewspaperLinks}
            onChange={setLocalNewspaperLinks}
          />

          <div className="space-y-2 md:col-span-2">
            <h4 className="text-sm font-bold text-ink dark:text-white">সোশ্যাল মিডিয়া</h4>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">Facebook</label>
            <input
              value={form.facebook_url}
              onChange={handleChange('facebook_url')}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">YouTube</label>
            <input
              value={form.youtube_url}
              onChange={handleChange('youtube_url')}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold text-ink/70 dark:text-white/70">X (Twitter)</label>
            <input
              value={form.twitter_url}
              onChange={handleChange('twitter_url')}
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <h4 className="text-sm font-bold text-ink dark:text-white">ক্রেডিট / পরিকল্পনা</h4>
          </div>
          <div className="space-y-2 md:col-span-2">
            <input
              value={form.credit_line1}
              onChange={handleChange('credit_line1')}
              placeholder="লাইন ১"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              value={form.credit_line2}
              onChange={handleChange('credit_line2')}
              placeholder="লাইন ২"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
            <input
              value={form.credit_line3}
              onChange={handleChange('credit_line3')}
              placeholder="লাইন ৩"
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-river px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'সেভ হচ্ছে...' : 'পেজ সেটিংস সেভ করুন'}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
