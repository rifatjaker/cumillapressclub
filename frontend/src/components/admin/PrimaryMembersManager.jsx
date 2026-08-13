import { useEffect, useState } from 'react'

import { API_BASE } from '../../apiBase.js'
import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const initialForm = {
  name: '',
  role: 'প্রাথমিক সদস্য',
  tenure: '',
  contribution: '',
  sort_order: 0,
  is_active: true,
  photo: null
}

export default function PrimaryMembersManager({ token }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetMessages = () => {}

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
    setExistingPhotoUrl('')
  }

  const loadItems = async () => {
    if (!token) {
      return
    }

    resetMessages()
    setIsLoading(true)

    try {
      const response = await adminFetch(`/api/v1/admin/primary-members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'প্রাথমিক সদস্য লোড করা যায়নি')
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
      name: item.name || '',
      role: item.role || 'প্রাথমিক সদস্য',
      tenure: item.tenure || '',
      contribution: item.contribution || '',
      sort_order: item.sort_order ?? 0,
      is_active: Number(item.is_active) === 1,
      photo: null
    })
    setExistingPhotoUrl(item.photo_url || '')
    resetMessages()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('role', form.role)
      formData.append('tenure', form.tenure)
      formData.append('contribution', form.contribution)
      formData.append('sort_order', String(Number(form.sort_order) || 0))
      formData.append('is_active', form.is_active ? '1' : '0')
      if (form.photo) {
        formData.append('photo', form.photo)
      }

      const url = editingId
        ? `/api/v1/admin/primary-members/${editingId}`
        : `/api/v1/admin/primary-members`

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

      toastSuccess(editingId ? 'প্রাথমিক সদস্য আপডেট হয়েছে' : 'নতুন প্রাথমিক সদস্য যোগ হয়েছে')
      resetForm()
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'সেভে সমস্যা হয়েছে')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('এই প্রাথমিক সদস্য মুছে ফেলবেন?')) {
      return
    }

    resetMessages()

    try {
      const response = await adminFetch(`/api/v1/admin/primary-members/${id}`, {
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
      toastSuccess('প্রাথমিক সদস্য মুছে ফেলা হয়েছে')
      await loadItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'ডিলিটে সমস্যা')
    }
  }

  const previewSrc = form.photo ? URL.createObjectURL(form.photo) : existingPhotoUrl

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">প্রাথমিক সদস্য</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">নাম, পদবী, সময়কাল, অবদান ও ছবি ম্যানেজ করুন</p>
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
          <h4 className="text-sm font-bold text-ink dark:text-white">{editingId ? 'সদস্য এডিট' : 'নতুন সদস্য'}</h4>
          <input
            required
            value={form.name}
            onChange={handleChange('name')}
            placeholder="নাম"
            className="neo-field"
          />
          <input
            required
            value={form.role}
            onChange={handleChange('role')}
            placeholder="পদবী"
            className="neo-field"
          />
          <input
            value={form.tenure}
            onChange={handleChange('tenure')}
            placeholder="সময়কাল (যেমন: ২০২০ - বর্তমান)"
            className="neo-field"
          />
          <textarea
            rows={3}
            value={form.contribution}
            onChange={handleChange('contribution')}
            placeholder="অবদান / কন্ট্রিবিউশন"
            className="w-full resize-none rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          />
          <input
            type="number"
            value={form.sort_order}
            onChange={handleChange('sort_order')}
            placeholder="Sort Order"
            className="neo-field"
          />
          <div className="flex items-center gap-3">
            <span className="inline-flex h-16 w-12 overflow-hidden rounded-lg border border-ink/15 bg-white dark:border-white/20">
              {previewSrc ? (
                <img src={previewSrc} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[9px] text-ink/45">Photo</span>
              )}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setForm((prev) => ({ ...prev, photo: event.target.files?.[0] || null }))}
              className="neo-field file:mr-3 file:rounded-md file:border-0 file:bg-river file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>
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
                <th className="px-2 py-2">ছবি</th>
                <th className="px-2 py-2">নাম</th>
                <th className="px-2 py-2">পদবী</th>
                <th className="px-2 py-2">সময়কাল</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো সদস্য নেই</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                    <td className="px-2 py-2">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name} className="h-12 w-9 rounded object-cover" />
                      ) : (
                        <span className="text-xs text-ink/50">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 font-medium">{item.name}</td>
                    <td className="px-2 py-2">{item.role}</td>
                    <td className="px-2 py-2">{item.tenure || '—'}</td>
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
