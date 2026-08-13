import { useEffect, useState } from 'react'

import { API_BASE } from '../../apiBase.js'
import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const initialForm = {
  year_label: '',
  title: '',
  doc_type: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
  file: null
}

export default function ArchiveManager({ token }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [existingFileUrl, setExistingFileUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetMessages = () => {}

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
    setExistingFileUrl('')
  }

  const loadItems = async () => {
    if (!token) {
      return
    }

    resetMessages()
    setIsLoading(true)

    try {
      const response = await adminFetch(`/api/v1/admin/archive-items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'আর্কাইভ লোড করা যায়নি')
      }

      setItems(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'লিস্ট লোডে সমস্যা')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [token])

  const handleChange = (field) => (event) => {
    const value = field === 'is_active' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      year_label: item.year_label || '',
      title: item.title || '',
      doc_type: item.doc_type || '',
      link_url: item.link_url || '',
      sort_order: item.sort_order ?? 0,
      is_active: Number(item.is_active) === 1,
      file: null
    })
    setExistingFileUrl(item.file_url || '')
    resetMessages()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!editingId && !form.file && !form.link_url.trim()) {
      toastError('লিংক অথবা ফাইল আপলোড দিন।')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('year_label', form.year_label)
      formData.append('title', form.title)
      formData.append('doc_type', form.doc_type)
      formData.append('link_url', form.link_url)
      formData.append('sort_order', String(Number(form.sort_order) || 0))
      formData.append('is_active', form.is_active ? '1' : '0')
      if (form.file) {
        formData.append('file', form.file)
      }

      const url = editingId
        ? `/api/v1/admin/archive-items/${editingId}`
        : `/api/v1/admin/archive-items`

      const response = await adminFetch(url, {
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

      toastSuccess(editingId ? 'আর্কাইভ আপডেট হয়েছে' : 'নতুন আর্কাইভ যোগ হয়েছে')
      resetForm()
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'সেভে সমস্যা হয়েছে')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('এই আর্কাইভ আইটেম মুছে ফেলবেন?')) {
      return
    }

    resetMessages()

    try {
      const response = await adminFetch(`/api/v1/admin/archive-items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'মুছা যায়নি')
      }

      if (editingId === id) {
        resetForm()
      }
      toastSuccess('আর্কাইভ মুছে ফেলা হয়েছে')
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'ডিলিটে সমস্যা')
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">ই-লাইব্রেরি ও আর্কাইভ</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">বছর, শিরোনাম, টাইপ, লিংক বা ফাইল আপলোড ম্যানেজ করুন</p>
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
        <form className="space-y-2 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-white/15 dark:bg-white/5 lg:col-span-2" onSubmit={handleSubmit}>
          <h4 className="text-sm font-bold text-ink dark:text-white">{editingId ? 'আর্কাইভ এডিট' : 'নতুন আর্কাইভ'}</h4>
          <input
            required
            value={form.year_label}
            onChange={handleChange('year_label')}
            placeholder="বছর (যেমন: ১৯৬৮ বা 1968)"
            className="neo-field"
          />
          <input
            required
            value={form.title}
            onChange={handleChange('title')}
            placeholder="শিরোনাম"
            className="neo-field"
          />
          <input
            required
            value={form.doc_type}
            onChange={handleChange('doc_type')}
            placeholder="টাইপ (সংবাদপত্র / ম্যাগাজিন / প্রকাশনা)"
            className="neo-field"
          />
          <input
            value={form.link_url}
            onChange={handleChange('link_url')}
            placeholder="External URL (ঐচ্ছিক)"
            className="neo-field"
          />
          <input
            type="number"
            value={form.sort_order}
            onChange={handleChange('sort_order')}
            placeholder="Sort Order"
            className="neo-field"
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp"
            onChange={(event) => setForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
            className="neo-field file:mr-3 file:rounded-md file:border-0 file:bg-river file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          {existingFileUrl && !form.file && (
            <a href={existingFileUrl} target="_blank" rel="noreferrer" className="block text-xs font-semibold text-river underline">
              বর্তমান ফাইল দেখুন
            </a>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-ink/80 dark:text-white/80">
            <input type="checkbox" checked={form.is_active} onChange={handleChange('is_active')} />
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
              onClick={resetForm}
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
                <th className="px-2 py-2">বছর</th>
                <th className="px-2 py-2">শিরোনাম</th>
                <th className="px-2 py-2">টাইপ</th>
                <th className="px-2 py-2">Status</th>
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
                  <td colSpan={5} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো আর্কাইভ নেই</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                    <td className="px-2 py-2 font-semibold">{item.year_label}</td>
                    <td className="px-2 py-2">{item.title}</td>
                    <td className="px-2 py-2">{item.doc_type}</td>
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
