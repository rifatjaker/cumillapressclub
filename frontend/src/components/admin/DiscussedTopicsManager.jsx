import { useEffect, useState } from 'react'

import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const SECTION_KEY = 'discussed_topics'

const initialForm = {
  title: '',
  sort_order: 0,
  is_active: true
}

export default function DiscussedTopicsManager({ token }) {
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
        throw new Error(result.message || 'আলোচিত বিষয় লোড করা যায়নি')
      }

      const list = (Array.isArray(result.data) ? result.data : [])
        .filter((item) => String(item.section_key || '') === SECTION_KEY)
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || Number(b.id) - Number(a.id))

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
      sort_order: Number(item.sort_order || 0),
      is_active: Number(item.is_active) === 1
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const title = form.title.trim()
      const payload = {
        section_key: SECTION_KEY,
        title,
        body: title,
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

      toastSuccess(editingId ? 'বিষয় আপডেট হয়েছে' : 'নতুন বিষয় যোগ হয়েছে')
      resetForm()
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'সেভে সমস্যা')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('এই বিষয় মুছে ফেলবেন?')) {
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
      toastSuccess('বিষয় মুছে ফেলা হয়েছে')
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'ডিলিটে সমস্যা')
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">আলোচিত বিষয়</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">
            হোমপেজের টপিক ট্যাগ স্ট্রিপ — শুধু লেবেল হিসেবে দেখায় (ফিল্টার পেজ নয়)।
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
          <h4 className="text-sm font-bold text-ink dark:text-white">{editingId ? 'বিষয় এডিট' : 'নতুন বিষয়'}</h4>
          <input
            required
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="যেমন: রাজনীতি, স্থানীয় খবর"
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
                <th className="px-2 py-2">বিষয়</th>
                <th className="px-2 py-2">স্ট্যাটাস</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো বিষয় নেই</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                    <td className="px-2 py-2 font-semibold">{item.sort_order}</td>
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
