import { useEffect, useState } from 'react'

import { API_BASE } from '../../apiBase.js'
import { adminFetch } from '../../adminFetch.js'
import { toastError, toastSuccess } from '../../adminToast.js'

const initialSliderForm = {
  title: '',
  slide_date: '',
  sort_order: 0,
  is_active: true,
  image: null
}

export default function SliderManager({ token }) {
  const [sliderItems, setSliderItems] = useState([])
  const [sliderForm, setSliderForm] = useState(initialSliderForm)
  const [editingSliderId, setEditingSliderId] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetMessages = () => {}

  const loadSliderItems = async () => {
    if (!token) {
      return
    }

    resetMessages()
    setIsLoading(true)

    try {
      const response = await adminFetch(`/api/v1/admin/slider-items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Slider list load failed')
      }

      setSliderItems(Array.isArray(result.data) ? result.data : [])
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Slider list load failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSliderItems()
  }, [token])

  const handleSliderSubmit = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!editingSliderId && !sliderForm.image) {
      toastError('নতুন স্লাইডের জন্য ছবি আপলোড আবশ্যক।')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', sliderForm.title)
      formData.append('slide_date', sliderForm.slide_date)
      formData.append('sort_order', String(Number(sliderForm.sort_order) || 0))
      formData.append('is_active', sliderForm.is_active ? '1' : '0')
      if (sliderForm.image) {
        formData.append('image', sliderForm.image)
      }

      const endpoint = editingSliderId
        ? `/api/v1/admin/slider-items/${editingSliderId}`
        : `/api/v1/admin/slider-items`

      const response = await adminFetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Slider save failed')
      }

      toastSuccess(editingSliderId ? 'Slider updated successfully' : 'Slider uploaded successfully')
      setEditingSliderId(null)
      setExistingImageUrl('')
      setSliderForm(initialSliderForm)
      await loadSliderItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Slider save failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    resetMessages()
    setEditingSliderId(item.id)
    setExistingImageUrl(item.image_url || '')
    setSliderForm({
      title: item.title || '',
      slide_date: item.slide_date || '',
      sort_order: Number(item.sort_order || 0),
      is_active: Number(item.is_active) === 1,
      image: null
    })
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('এই স্লাইডটি ডিলিট করতে চান?')
    if (!confirmed) {
      return
    }

    resetMessages()

    try {
      const response = await adminFetch(`/api/v1/admin/slider-items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Delete failed')
      }

      toastSuccess('Slider deleted successfully')
      await loadSliderItems()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-[#101827]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-ink dark:text-white">স্লাইডার আপলোড ম্যানেজার</h3>
        <button
          type="button"
          onClick={loadSliderItems}
          className="rounded-lg border border-river/30 bg-river/10 px-3 py-1.5 text-xs font-semibold text-river transition hover:bg-river/20"
        >
          রিফ্রেশ
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h4 className="mb-2 text-sm font-semibold text-ink/80 dark:text-white/80">{editingSliderId ? 'স্লাইড এডিট' : 'নতুন স্লাইড আপলোড'}</h4>
          <form className="space-y-2" onSubmit={handleSliderSubmit}>
            <input
              required
              value={sliderForm.title}
              onChange={(event) => setSliderForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Slide title"
              className="neo-field"
            />
            <input
              required
              value={sliderForm.slide_date}
              onChange={(event) => setSliderForm((prev) => ({ ...prev, slide_date: event.target.value }))}
              placeholder="Slide date (যেমন: আগস্ট ২০২৬)"
              className="neo-field"
            />
            <input
              type="number"
              value={sliderForm.sort_order}
              onChange={(event) => setSliderForm((prev) => ({ ...prev, sort_order: event.target.value }))}
              placeholder="Sort order"
              className="neo-field"
            />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setSliderForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
              className="neo-field file:mr-3 file:rounded-md file:border-0 file:bg-river file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
            {existingImageUrl && (
              <img src={existingImageUrl} alt="Current slide" className="h-24 w-full rounded-lg object-cover" />
            )}
            <label className="inline-flex items-center gap-2 text-sm text-ink/80 dark:text-white/80">
              <input
                type="checkbox"
                checked={sliderForm.is_active}
                onChange={(event) => setSliderForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
              Active
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-river px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'সেভ হচ্ছে...' : editingSliderId ? 'আপডেট' : 'আপলোড'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingSliderId(null)
                  setExistingImageUrl('')
                  setSliderForm(initialSliderForm)
                  resetMessages()
                }}
                className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                রিসেট
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto lg:col-span-3">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-ink/70 dark:border-white/20 dark:text-white/75">
                <th className="px-2 py-2">Preview</th>
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Sort</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">লোড হচ্ছে...</td>
                </tr>
              ) : sliderItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-center text-ink/65 dark:text-white/70">কোনো স্লাইড পাওয়া যায়নি</td>
                </tr>
              ) : (
                sliderItems.map((item) => (
                  <tr key={item.id} className="border-b border-ink/10 dark:border-white/10">
                    <td className="px-2 py-2">
                      <img src={item.image_url} alt={item.title} className="h-10 w-16 rounded object-cover" />
                    </td>
                    <td className="px-2 py-2">{item.title}</td>
                    <td className="px-2 py-2">{item.slide_date}</td>
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
      </div>
    </section>
  )
}
