import { useEffect, useState } from 'react'

import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const SECTION_KEY = 'hero_highlights'

const SCOPE_OPTIONS = [
  { label: 'কুমিল্লা', value: 'কুমিল্লা', tone: 'local' },
  { label: 'সারাদেশ', value: 'সারাদেশ', tone: 'national' }
]

const initialForm = {
  title: '',
  scope: 'কুমিল্লা',
  time: '',
  sort_order: 0,
  is_active: true
}

function encodeBody({ scope, time, tone }) {
  return [scope.trim(), time.trim(), tone.trim() || 'local'].join('\n')
}

function decodeBody(body) {
  const lines = String(body || '')
    .split(/\r?\n/)
    .map((line) => line.trim())

  const scope = lines[0] || 'কুমিল্লা'
  const time = lines[1] || ''
  const tone = lines[2] || (scope === 'সারাদেশ' ? 'national' : 'local')

  return { scope, time, tone }
}

function toneForScope(scope) {
  const match = SCOPE_OPTIONS.find((item) => item.value === scope)
  return match?.tone || (scope === 'সারাদেশ' ? 'national' : 'local')
}

export default function HeroHighlightsManager({ token }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const loadItems = async () => {
    if (!token) {
      return
    }

    setIsLoading(true)

    try {
      const response = await adminFetch('/api/v1/admin/contents', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'হাইলাইট লোড করা যায়নি')
      }

      const list = (Array.isArray(result.data) ? result.data : [])
        .filter((item) => String(item.section_key || '') === SECTION_KEY)
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || Number(b.id) - Number(a.id))
        .map((item) => ({
          ...item,
          ...decodeBody(item.body)
        }))

      setItems(list)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'লিস্ট লোডে সমস্যা')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [token])

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      title: item.title || '',
      scope: item.scope || 'কুমিল্লা',
      time: item.time || '',
      sort_order: Number(item.sort_order || 0),
      is_active: Number(item.is_active) === 1
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const scope = form.scope.trim() || 'কুমিল্লা'
      const time = form.time.trim() || 'এইমাত্র'
      const payload = {
        section_key: SECTION_KEY,
        title: form.title.trim(),
        body: encodeBody({
          scope,
          time,
          tone: toneForScope(scope)
        }),
        sort_order: Number(form.sort_order) || 0,
        is_active: Boolean(form.is_active)
      }

      const endpoint = editingId
        ? `/api/v1/admin/contents/${editingId}`
        : '/api/v1/admin/contents'
      const method = editingId ? 'PUT' : 'POST'

      const response = await adminFetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'সেভ করা যায়নি')
      }

      toastSuccess(editingId ? 'হাইলাইট আপডেট হয়েছে' : 'নতুন হাইলাইট যোগ হয়েছে')
      resetForm()
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'সেভে সমস্যা')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('এই হাইলাইট মুছে ফেলবেন?')) {
      return
    }

    try {
      const response = await adminFetch(`/api/v1/admin/contents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'মুছা যায়নি')
      }

      if (editingId === id) {
        resetForm()
      }
      toastSuccess('হাইলাইট মুছে ফেলা হয়েছে')
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'ডিলিটে সমস্যা')
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">প্রধান খবরের হাইলাইট</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">
            ফিচার্ড সেকশনের ডান পাশের হাইলাইট তালিকা — হোমপেজে প্রথম ৩টি দেখায়।
          </p>
        </div>
        <button
          type="button"
          onClick={loadItems}
          className="rounded-lg border border-river/30 bg-river/10 px-3 py-1.5 text-xs font-semibold text-river transition hover:bg-river/20"
        >
          রিফ্রেশ
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <form className="space-y-3 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-white/15 dark:bg-white/5 lg:col-span-2" onSubmit={handleSubmit}>
          <h4 className="text-sm font-bold text-ink dark:text-white">{editingId ? 'হাইলাইট এডিট' : 'নতুন হাইলাইট'}</h4>
          <textarea
            required
            rows={3}
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="শিরোনাম"
            className="neo-field resize-none"
          />
          <select
            value={form.scope}
            onChange={(event) => setForm((prev) => ({ ...prev, scope: event.target.value }))}
            className="neo-field"
          >
            {SCOPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            value={form.time}
            onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
            placeholder="সময় (যেমন: ১০ মিনিট আগে)"
            className="neo-field"
          />
          <input
            type="number"
            value={form.sort_order}
            onChange={(event) => setForm((prev) => ({ ...prev, sort_order: event.target.value }))}
            placeholder="Order Serial (ছোট সংখ্যা আগে)"
            className="neo-field"
          />
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink/80 dark:text-white/80">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              className="h-4 w-4 rounded border-ink/30"
            />
            সক্রিয় (হোমপেজে দেখাবে)
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="neo-btn neo-btn-primary flex-1"
            >
              {isSubmitting ? 'সেভ হচ্ছে...' : editingId ? 'আপডেট' : 'যোগ করুন'}
            </button>
            <button type="button" onClick={resetForm} className="neo-btn neo-btn-ghost">
              রিসেট
            </button>
          </div>
        </form>

        <div className="overflow-x-auto lg:col-span-3">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-ink/70 dark:border-white/20 dark:text-white/75">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">স্কোপ</th>
                <th className="px-2 py-2">শিরোনাম</th>
                <th className="px-2 py-2">স্ট্যাটাস</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো হাইলাইট নেই</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                    <td className="px-2 py-2 font-semibold">{item.sort_order}</td>
                    <td className="px-2 py-2">
                      <div className="text-xs font-semibold">{item.scope}</div>
                      <div className="text-[11px] text-ink/55 dark:text-white/55">{item.time}</div>
                    </td>
                    <td className="px-2 py-2 font-medium">{item.title}</td>
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
      </div>
    </section>
  )
}
