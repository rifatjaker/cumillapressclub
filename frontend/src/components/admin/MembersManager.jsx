import { useEffect, useState } from 'react'

import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const initialForm = {
  member_code: '',
  name: '',
  media_house: '',
  designation: '',
  phone: '',
  email: '',
  status: 'active',
  expires_at: '',
  sort_order: 0,
  show_in_leadership: false,
  show_in_committee: false,
  leadership_sort_order: 0,
  committee_sort_order: 0,
  profile_message: '',
  photo: null
}

const designationOptions = [
  'সভাপতি',
  'সহ-সভাপতি',
  'সাধারণ সম্পাদক',
  'সহ-সাধারণ সম্পাদক',
  'সাংগঠনিক সম্পাদক',
  'অর্থ সম্পাদক',
  'দপ্তর সম্পাদক',
  'পাঠাগার সম্পাদক',
  'প্রচার ও প্রকাশনা সম্পাদক',
  'বিজ্ঞান, তথ্য প্রযুক্তি ও গবেষণা সম্পাদক',
  'সাহিত্য, সাংস্কৃতিক ও ক্রীড়া সম্পাদক',
  'নির্বাহী সদস্য'
]

function suggestNextMemberCode(items) {
  let maxNum = 0
  for (const item of items) {
    const code = String(item.member_code || '').trim()
    const match = code.match(/^CPC-(\d+)$/i) || code.match(/^CPC-M-(\d+)$/i)
    if (match) {
      maxNum = Math.max(maxNum, Number(match[1]) || 0)
    }
  }
  return `CPC-${String(maxNum + 1).padStart(3, '0')}`
}

function suggestNextSortOrder(items) {
  let maxSort = 0
  for (const item of items) {
    maxSort = Math.max(maxSort, Number(item.sort_order || 0))
  }
  return maxSort + 1
}

export default function MembersManager({ token }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const blankFormForList = (list) => ({
    ...initialForm,
    member_code: suggestNextMemberCode(list),
    sort_order: suggestNextSortOrder(list)
  })

  const resetForm = (list = items) => {
    setEditingId(null)
    setForm(blankFormForList(list))
    setExistingPhotoUrl('')
  }

  const loadItems = async (options = {}) => {
    if (!token) {
      return
    }

    const resetBlankForm = Boolean(options.resetBlankForm)
    setIsLoading(true)

    try {
      const response = await adminFetch(`/api/v1/admin/members`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'সদস্য তালিকা লোড করা যায়নি')
      }

      const list = Array.isArray(result.data) ? result.data : []
      setItems(list)
      if (resetBlankForm || !editingId) {
        setEditingId(null)
        setExistingPhotoUrl('')
        setForm(blankFormForList(list))
      }
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
      sort_order: Number(item.sort_order || 0),
      show_in_leadership: Boolean(item.show_in_leadership),
      show_in_committee: Boolean(item.show_in_committee),
      leadership_sort_order: Number(item.leadership_sort_order || 0),
      committee_sort_order: Number(item.committee_sort_order || 0),
      profile_message: item.profile_message || '',
      photo: null
    })
    setExistingPhotoUrl(item.photo_url || '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
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
      formData.append('sort_order', String(form.sort_order || 0))
      formData.append('show_in_leadership', form.show_in_leadership ? '1' : '0')
      formData.append('show_in_committee', form.show_in_committee ? '1' : '0')
      formData.append('leadership_sort_order', String(form.leadership_sort_order || 0))
      formData.append('committee_sort_order', String(form.committee_sort_order || 0))
      formData.append('profile_message', form.profile_message)
      if (form.photo) {
        formData.append('photo', form.photo)
      }

      const url = editingId
        ? `/api/v1/admin/members/${editingId}`
        : `/api/v1/admin/members`

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

      toastSuccess(editingId ? 'সদস্য আপডেট হয়েছে' : 'নতুন সদস্য যোগ হয়েছে')
      await loadItems({ resetBlankForm: true })
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'সেভে সমস্যা হয়েছে')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('এই সদস্য মুছে ফেলবেন?')) {
      return
    }

    try {
      const response = await adminFetch(`/api/v1/admin/members/${id}`, {
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
        await loadItems({ resetBlankForm: true })
      } else {
        await loadItems()
      }
      toastSuccess('সদস্য মুছে ফেলা হয়েছে')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'ডিলিটে সমস্যা')
    }
  }

  const previewSrc = form.photo ? URL.createObjectURL(form.photo) : existingPhotoUrl

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-ink dark:text-white">সদস্য যাচাইকরণ ও ডিরেক্টরি</h3>
          <p className="text-sm text-ink/70 dark:text-white/70">
            একবার সদস্য এন্ট্রি করুন। চাইলে একই ব্যক্তিকে নেতৃত্বের প্রোফাইল ও/অথবা কার্যনির্বাহী পরিষদে দেখান।
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
        <form className="space-y-2 rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 dark:border-white/15 dark:bg-white/5 lg:col-span-2" onSubmit={handleSubmit}>
          <h4 className="text-sm font-bold text-ink dark:text-white">{editingId ? 'সদস্য এডিট' : 'নতুন সদস্য'}</h4>
          <input
            required
            value={form.member_code}
            onChange={handleChange('member_code')}
            placeholder="Member ID (যেমন: CPC-001)"
            className="neo-field"
          />
          <p className="-mt-1 text-[11px] text-ink/55 dark:text-white/55">
            নতুন ফর্মে পরবর্তী ID সাজেস্ট হয় (`CPC-001`, `CPC-002`…); চাইলে নিজেও বদলাতে পারবেন।
          </p>
          <input
            type="number"
            required
            value={form.sort_order}
            onChange={handleChange('sort_order')}
            placeholder="Order Serial"
            className="neo-field"
          />
          <p className="-mt-1 text-[11px] text-ink/55 dark:text-white/55">
            ছোট সংখ্যা আগে দেখাবে (ডিরেক্টরি তালিকার ক্রম)।
          </p>
          <input
            required
            value={form.name}
            onChange={handleChange('name')}
            placeholder="পূর্ণ নাম"
            className="neo-field"
          />
          <select
            required
            value={form.designation}
            onChange={handleChange('designation')}
            className="neo-field"
          >
            <option value="">পদবী নির্বাচন করুন</option>
            {designationOptions.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
            {form.designation && !designationOptions.includes(form.designation) ? (
              <option value={form.designation}>{form.designation} (পুরনো)</option>
            ) : null}
          </select>
          <input
            required
            value={form.media_house}
            onChange={handleChange('media_house')}
            placeholder="মিডিয়া হাউজ"
            className="neo-field"
          />
          <input
            value={form.phone}
            onChange={handleChange('phone')}
            placeholder="ফোন"
            className="neo-field"
          />
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="ইমেইল (ঐচ্ছিক)"
            className="neo-field"
          />
          <select
            value={form.status}
            onChange={handleChange('status')}
            className="neo-field"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <input
            type="date"
            value={form.expires_at}
            onChange={handleChange('expires_at')}
            className="neo-field"
          />

          <div className="rounded-xl border border-ink/10 bg-white/80 p-3 dark:border-white/15 dark:bg-white/5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55 dark:text-white/55">হোমপেজে দেখানো</p>
            <label className="mb-2 flex items-start gap-2 text-sm text-ink dark:text-white">
              <input
                type="checkbox"
                checked={form.show_in_leadership}
                onChange={(event) => setForm((prev) => ({ ...prev, show_in_leadership: event.target.checked }))}
                className="mt-1"
              />
              <span>নেতৃত্বের প্রোফাইলে দেখাবে</span>
            </label>
            {form.show_in_leadership && (
              <input
                type="number"
                value={form.leadership_sort_order}
                onChange={handleChange('leadership_sort_order')}
                placeholder="নেতৃত্ব সর্ট অর্ডার"
                className="neo-field mb-2"
              />
            )}
            <label className="mb-2 flex items-start gap-2 text-sm text-ink dark:text-white">
              <input
                type="checkbox"
                checked={form.show_in_committee}
                onChange={(event) => setForm((prev) => ({ ...prev, show_in_committee: event.target.checked }))}
                className="mt-1"
              />
              <span>কার্যনির্বাহী পরিষদে দেখাবে</span>
            </label>
            {form.show_in_committee && (
              <input
                type="number"
                value={form.committee_sort_order}
                onChange={handleChange('committee_sort_order')}
                placeholder="পরিষদ সর্ট অর্ডার"
                className="neo-field"
              />
            )}
          </div>

          {(form.show_in_leadership || form.show_in_committee) && (
            <textarea
              value={form.profile_message}
              onChange={handleChange('profile_message')}
              placeholder="প্রোফাইল বার্তা / পরিচিতি (ঐচ্ছিক)"
              rows={3}
              className="neo-field"
            />
          )}

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
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">ছবি</th>
                <th className="px-2 py-2">Member ID</th>
                <th className="px-2 py-2">নাম</th>
                <th className="px-2 py-2">পদবী</th>
                <th className="px-2 py-2">দেখানো</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো সদস্য নেই</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                    <td className="px-2 py-2 font-semibold">{item.sort_order}</td>
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
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        {item.show_in_leadership ? (
                          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-400/20 dark:text-sky-100">নেতৃত্ব</span>
                        ) : null}
                        {item.show_in_committee ? (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-100">পরিষদ</span>
                        ) : null}
                        {!item.show_in_leadership && !item.show_in_committee ? (
                          <span className="text-xs text-ink/45">শুধু ডিরেক্টরি</span>
                        ) : null}
                      </div>
                    </td>
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
