import { useEffect, useState } from 'react'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

const initialForm = {
  member_code: '',
  name: '',
  media_house: '',
  designation: '',
  phone: '',
  email: '',
  status: 'active',
  expires_at: '',
  photo: null
}

export default function MembersManager({ token }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resetMessages = () => {
    setMessage('')
    setError('')
  }

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
      const response = await fetch(`${API_BASE}/api/v1/admin/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'সদস্য তালিকা লোড করা যায়নি')
      }

      setItems(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'লিস্ট লোডে সমস্যা')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [token])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({
      member_code: item.member_code || '',
      name: item.name || '',
      media_house: item.media_house || '',
      designation: item.designation || '',
      phone: item.phone || '',
      email: item.email || '',
      status: item.status || 'active',
      expires_at: item.expires_at || '',
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
      formData.append('member_code', form.member_code)
      formData.append('name', form.name)
      formData.append('media_house', form.media_house)
      formData.append('designation', form.designation)
      formData.append('phone', form.phone)
      formData.append('email', form.email)
      formData.append('status', form.status)
      formData.append('expires_at', form.expires_at)
      if (form.photo) {
        formData.append('photo', form.photo)
      }

      const url = editingId
        ? `${API_BASE}/api/v1/admin/members/${editingId}`
        : `${API_BASE}/api/v1/admin/members`

      const response = await fetch(url, {
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

      setMessage(editingId ? 'সদস্য আপডেট হয়েছে' : 'নতুন সদস্য যোগ হয়েছে')
      resetForm()
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'সেভে সমস্যা হয়েছে')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('এই সদস্য মুছে ফেলবেন?')) {
      return
    }

    resetMessages()

    try {
      const response = await fetch(`${API_BASE}/api/v1/admin/members/${id}`, {
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
      setMessage('সদস্য মুছে ফেলা হয়েছে')
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ডিলিটে সমস্যা')
    }
  }

  const previewSrc = form.photo ? URL.createObjectURL(form.photo) : existingPhotoUrl

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">সদস্য যাচাইকরণ ও ডিরেক্টরি</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">নিবন্ধিত সাংবাদিক সদস্য যোগ/এডিট করুন (Member ID দিয়ে verify হবে)</p>
        </div>
        <button
          type="button"
          onClick={loadItems}
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

      <div className="grid gap-5 lg:grid-cols-5">
        <form className="space-y-2 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-white/15 dark:bg-white/5 lg:col-span-2" onSubmit={handleSubmit}>
          <h4 className="text-sm font-bold text-ink dark:text-white">{editingId ? 'সদস্য এডিট' : 'নতুন সদস্য'}</h4>
          <input
            required
            value={form.member_code}
            onChange={handleChange('member_code')}
            placeholder="Member ID (যেমন: CPC-M-001)"
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          />
          <input
            required
            value={form.name}
            onChange={handleChange('name')}
            placeholder="পূর্ণ নাম"
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          />
          <input
            required
            value={form.designation}
            onChange={handleChange('designation')}
            placeholder="পদবী"
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          />
          <input
            required
            value={form.media_house}
            onChange={handleChange('media_house')}
            placeholder="মিডিয়া হাউজ"
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          />
          <input
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="ফোন"
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          />
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="ইমেইল (ঐচ্ছিক)"
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          />
          <select
            value={form.status}
            onChange={handleChange('status')}
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <input
            type="date"
            value={form.expires_at}
            onChange={handleChange('expires_at')}
            className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none dark:border-white/25 dark:bg-white/10 dark:text-white"
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
              className="w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-river file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white dark:border-white/25 dark:bg-white/10 dark:text-white"
            />
          </div>

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
                <th className="px-2 py-2">Member ID</th>
                <th className="px-2 py-2">নাম</th>
                <th className="px-2 py-2">পদবী</th>
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
                    <td className="px-2 py-2 font-semibold text-coral">{item.member_code}</td>
                    <td className="px-2 py-2 font-medium">{item.name}</td>
                    <td className="px-2 py-2">{item.designation}</td>
                    <td className="px-2 py-2">{item.status}</td>
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
