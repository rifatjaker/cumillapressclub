import { useEffect, useState } from 'react'

import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const defaultHighlights = [
  { label: 'কুমিল্লা প্রেস ক্লাবের ইতিহাস', body: '' },
  { label: 'কুমিল্লা প্রেস ক্লাবের গঠনতন্ত্র', body: '' },
  { label: 'কুমিল্লা প্রেস ক্লাবের লক্ষ্য ও উদ্দেশ্য', body: '' }
]

const defaultForm = {
  badge: 'কুমিল্লা প্রেস ক্লাব',
  title: 'জনতার আস্থা, জনতার অধিকার',
  established: '১৯৬৮',
  summary: '',
  stat_number: '৮০০+',
  stat_label: 'পেশাদার সাংবাদিক',
  stat_caption: 'কুমিল্লা প্রেস ক্লাবের সদস্য',
  image_url: '',
  image: null
}

function normalizeHighlights(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return defaultHighlights.map((item) => ({ ...item }))
  }

  return items.map((item) => {
    if (typeof item === 'string') {
      return { label: item, body: '' }
    }
    return {
      label: String(item?.label || ''),
      body: String(item?.body || item?.content || item?.information || '')
    }
  })
}

export default function OrganizationSpotlightManager({ token }) {
  const [form, setForm] = useState(defaultForm)
  const [highlights, setHighlights] = useState(defaultHighlights)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetMessages = () => {}

  const loadSettings = async () => {
    if (!token) {
      return
    }

    resetMessages()
    setIsLoading(true)

    try {
      const response = await adminFetch(`/api/v1/admin/organization-spotlight`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'স্পটলাইট লোড করা যায়নি')
      }

      const data = result.data || {}
      setForm({
        badge: data.badge || defaultForm.badge,
        title: data.title || defaultForm.title,
        established: data.established || defaultForm.established,
        summary: data.summary || '',
        stat_number: data.statNumber || defaultForm.stat_number,
        stat_label: data.statLabel || defaultForm.stat_label,
        stat_caption: data.statCaption || defaultForm.stat_caption,
        image_url: data.image_url || '',
        image: null
      })
      setHighlights(normalizeHighlights(data.highlights))
      setPreviewUrl(data.imageUrl || '')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'লোডে সমস্যা')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('badge', form.badge)
      formData.append('title', form.title)
      formData.append('established', form.established)
      formData.append('summary', form.summary)
      formData.append('stat_number', form.stat_number)
      formData.append('stat_label', form.stat_label)
      formData.append('stat_caption', form.stat_caption)
      formData.append('image_url', form.image_url)
      formData.append('highlights', JSON.stringify(highlights))
      if (form.image) {
        formData.append('image', form.image)
      }

      const response = await adminFetch(`/api/v1/admin/organization-spotlight`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'সেভ করা যায়নি')
      }

      toastSuccess('জনতার আস্থা সেকশন আপডেট হয়েছে')
      const data = result.data || {}
      setForm((prev) => ({
        ...prev,
        badge: data.badge || prev.badge,
        title: data.title || prev.title,
        established: data.established || prev.established,
        summary: data.summary || prev.summary,
        stat_number: data.statNumber || prev.stat_number,
        stat_label: data.statLabel || prev.stat_label,
        stat_caption: data.statCaption || prev.stat_caption,
        image_url: data.image_url || '',
        image: null
      }))
      setHighlights(normalizeHighlights(data.highlights))
      setPreviewUrl(data.imageUrl || '')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'সেভে সমস্যা')
    } finally {
      setIsSubmitting(false)
    }
  }

  const livePreview = form.image ? URL.createObjectURL(form.image) : previewUrl

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">জনতার আস্থা, জনতার অধিকার</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">শিরোনাম, সারাংশ, স্ট্যাট, ছবি ও হাইলাইট তথ্য ম্যানেজ করুন (পাবলিক সাইটে মোডালে খুলবে)</p>
        </div>
        <button
          type="button"
          onClick={loadSettings}
          className="rounded-lg border border-river/30 bg-river/10 px-3 py-1.5 text-xs font-semibold text-river transition hover:bg-river/20"
        >
          রিফ্রেশ
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink/65 dark:text-white/70">লোড হচ্ছে...</p>
      ) : (
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <input
              required
              value={form.badge}
              onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
              placeholder="ব্যাজ (যেমন: কুমিল্লা প্রেস ক্লাব)"
              className="neo-field"
            />
            <input
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="শিরোনাম"
              className="neo-field"
            />
            <input
              value={form.established}
              onChange={(event) => setForm((prev) => ({ ...prev, established: event.target.value }))}
              placeholder="প্রতিষ্ঠিত (যেমন: ১৯৬৮)"
              className="neo-field"
            />
            <textarea
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
              placeholder="সারাংশ"
              rows={5}
              className="neo-field"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                value={form.stat_number}
                onChange={(event) => setForm((prev) => ({ ...prev, stat_number: event.target.value }))}
                placeholder="স্ট্যাট সংখ্যা"
                className="neo-field"
              />
              <input
                value={form.stat_label}
                onChange={(event) => setForm((prev) => ({ ...prev, stat_label: event.target.value }))}
                placeholder="স্ট্যাট লেবেল"
                className="neo-field"
              />
              <input
                value={form.stat_caption}
                onChange={(event) => setForm((prev) => ({ ...prev, stat_caption: event.target.value }))}
                placeholder="স্ট্যাট ক্যাপশন"
                className="neo-field"
              />
            </div>
          </div>

          <div className="space-y-2">
            <input
              value={form.image_url}
              onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
              placeholder="ছবির External URL (ঐচ্ছিক)"
              className="neo-field"
            />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
              className="neo-field file:mr-3 file:rounded-md file:border-0 file:bg-river file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
            {livePreview && (
              <img
                src={livePreview}
                alt="Spotlight preview"
                className="h-40 w-full rounded-xl border border-ink/10 object-cover dark:border-white/15"
              />
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-ink/10 bg-ink/[0.02] p-3 dark:border-white/15 dark:bg-white/5 lg:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-ink dark:text-white">হাইলাইট তথ্য</h4>
              <button
                type="button"
                onClick={() => setHighlights((prev) => [...prev, { label: '', body: '' }])}
                className="rounded-lg border border-river/30 bg-river/10 px-2.5 py-1 text-xs font-semibold text-river"
              >
                + যোগ
              </button>
            </div>
            <p className="text-xs text-ink/60 dark:text-white/65">প্রতিটি আইটেমে শিরোনাম ও বিস্তারিত তথ্য দিন — সাইটে ক্লিক করলে মোডালে দেখাবে।</p>
            {highlights.map((item, index) => (
              <div key={`hl-${index}`} className="space-y-2 rounded-xl border border-ink/10 bg-white p-3 dark:border-white/15 dark:bg-white/5">
                <div className="flex flex-wrap items-start gap-2">
                  <input
                    value={item.label}
                    onChange={(event) => {
                      const next = highlights.map((row, i) => (i === index ? { ...row, label: event.target.value } : row))
                      setHighlights(next)
                    }}
                    placeholder="শিরোনাম (যেমন: কুমিল্লা প্রেস ক্লাবের ইতিহাস)"
                    className="neo-field min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== index))}
                    className="rounded-lg border border-rose-400/40 bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-400/20 dark:text-rose-100"
                  >
                    মুছুন
                  </button>
                </div>
                <textarea
                  value={item.body}
                  onChange={(event) => {
                    const next = highlights.map((row, i) => (i === index ? { ...row, body: event.target.value } : row))
                    setHighlights(next)
                  }}
                  placeholder="বিস্তারিত তথ্য / তথ্যের বিবরণ"
                  rows={4}
                  className="neo-field"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-river px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 lg:col-span-2"
          >
            {isSubmitting ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </button>
        </form>
      )}
    </section>
  )
}
