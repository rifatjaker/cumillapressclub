import { useEffect, useRef, useState } from 'react'
import { breakingNews, categories, committee, deceasedMembers, departmentsOverview, donorMembers, featuredNews, galleryItems, heroHighlights, importantLinks, leadershipProfiles, localNewspaperLinks, notices, organizationSpotlight, programSliderImages, upcomingEvents } from '../data/content'

export default function Homepage({ pageSettings }) {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
  const categoryRef = useRef(null)
  const mediaSliderRef = useRef(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [canMediaScrollPrev, setCanMediaScrollPrev] = useState(false)
  const [canMediaScrollNext, setCanMediaScrollNext] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [selectedProfileGroup, setSelectedProfileGroup] = useState('')
  const [selectedDeceasedMember, setSelectedDeceasedMember] = useState(null)
  const [selectedDonorMember, setSelectedDonorMember] = useState(null)
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [eventCountdown, setEventCountdown] = useState({ days: 0, hours: 0, minutes: 0 })
  const [activeVideo, setActiveVideo] = useState(null)
  const [activePhoto, setActivePhoto] = useState(null)
  const [activeProgramSlide, setActiveProgramSlide] = useState(0)
  const [memberQuery, setMemberQuery] = useState('')
  const [deceasedPage, setDeceasedPage] = useState(1)
  const [donorPage, setDonorPage] = useState(1)
  const [isAllMembersModalOpen, setIsAllMembersModalOpen] = useState(false)
  const [membershipForm, setMembershipForm] = useState({
    type: 'new',
    name: '',
    phone: '',
    media: '',
    nidLast4: ''
  })
  const [membershipSubmitted, setMembershipSubmitted] = useState(false)
  const [verificationInput, setVerificationInput] = useState('')
  const [verificationMember, setVerificationMember] = useState(null)
  const [pressReleaseForm, setPressReleaseForm] = useState({
    sender: '',
    organization: '',
    email: '',
    title: '',
    details: ''
  })
  const [pressReleaseSubmitted, setPressReleaseSubmitted] = useState(false)
  const [complaintForm, setComplaintForm] = useState({
    name: '',
    phone: '',
    address: '',
    complaint: ''
  })
  const [complaintSubmitted, setComplaintSubmitted] = useState(false)
  const [complaintError, setComplaintError] = useState('')
  const [isComplaintSubmitting, setIsComplaintSubmitting] = useState(false)
  const [liveBreakingNews, setLiveBreakingNews] = useState(breakingNews)
  const [liveFeaturedNews, setLiveFeaturedNews] = useState(featuredNews)
  const [liveNotices, setLiveNotices] = useState(notices)
  const [liveUpcomingEvents, setLiveUpcomingEvents] = useState(upcomingEvents)
  const [liveGalleryItems, setLiveGalleryItems] = useState(galleryItems)
  const [liveProgramSlides, setLiveProgramSlides] = useState(programSliderImages)
  const [liveLeadershipProfiles, setLiveLeadershipProfiles] = useState(leadershipProfiles)
  const [liveCommittee, setLiveCommittee] = useState(committee)
  const [liveRegisteredMembers, setLiveRegisteredMembers] = useState([])
  const [liveArchiveItems, setLiveArchiveItems] = useState([
    {
      year: '১৯৬৮',
      title: 'কুমিল্লা বার্তা: স্বাধীনতা-পূর্ব বিশেষ সংখ্যা',
      type: 'সংবাদপত্র',
      url: '#'
    },
    {
      year: '১৯৮৪',
      title: 'প্রেস ক্লাব স্মারক ম্যাগাজিন',
      type: 'ম্যাগাজিন',
      url: '#'
    },
    {
      year: '১৯৯৬',
      title: 'জেলা উন্নয়ন বিশেষ প্রতিবেদন',
      type: 'প্রকাশনা',
      url: '#'
    },
    {
      year: '২০০৮',
      title: 'সাংবাদিকতা নৈতিকতা কর্মশালা নথি',
      type: 'আর্কাইভ ডকুমেন্ট',
      url: '#'
    }
  ])
  const [liveDeceasedMembers, setLiveDeceasedMembers] = useState(deceasedMembers)
  const [livePrimaryMembers, setLivePrimaryMembers] = useState(donorMembers)
  const [archiveQuery, setArchiveQuery] = useState('')
  const primaryFeaturedNews = liveFeaturedNews[0] || featuredNews[0]
  const secondaryFeaturedNews = liveFeaturedNews[1] || featuredNews[1] || primaryFeaturedNews
  const visibleHeroHighlights = heroHighlights.slice(0, 3)
  const hasMoreHeroHighlights = heroHighlights.length > 3
  const visibleLeadershipProfiles = liveLeadershipProfiles
  const hasMoreLeadershipProfiles = false
  const visibleCommittee = liveCommittee
  const hasMoreCommittee = false
  const siteLogo = pageSettings?.logo_url || `${import.meta.env.BASE_URL}logo.jpg`
  const siteName = pageSettings?.site_name || 'কুমিল্লা প্রেস ক্লাব'
  const contactAddress = pageSettings?.address || 'কুমিল্লা প্রেস ক্লাব, কুমিল্লা শহর, বাংলাদেশ'
  const contactPhone = pageSettings?.phone || '+8801XXXXXXXXX'
  const contactEmail = pageSettings?.email || 'info@cumillapressclub.org'
  const mapEmbedUrl = pageSettings?.map_embed_url || 'https://www.google.com/maps?q=Comilla%20Bangladesh&output=embed'
  const facebookUrl = pageSettings?.facebook_url || 'https://www.facebook.com/share/19Dr5t8wkK/'
  const youtubeUrl = pageSettings?.youtube_url || 'https://www.youtube.com'
  const twitterUrl = pageSettings?.twitter_url || 'https://x.com'
  const creditLine1 = pageSettings?.credit_line1 || 'সার্বিক পরিকল্পনা ও বাস্তবায়নে: মো: আসিফ হোসাইন মান্না'
  const creditLine2 = pageSettings?.credit_line2 || 'বিজ্ঞান,তথ্য প্রযুক্তি ও গবেষণা সম্পাদক'
  const creditLine3 = pageSettings?.credit_line3 || 'কুমিল্লা প্রেসক্লাব'
  const footerImportantLinks = Array.isArray(pageSettings?.important_links) && pageSettings.important_links.length > 0
    ? pageSettings.important_links
    : importantLinks
  const footerLocalNewspaperLinks = Array.isArray(pageSettings?.local_newspaper_links) && pageSettings.local_newspaper_links.length > 0
    ? pageSettings.local_newspaper_links
    : localNewspaperLinks
  const memberPlaceholderImage = `${import.meta.env.BASE_URL}member-placeholder.png`
  const fallbackMemberDirectory = [
    ...liveLeadershipProfiles.map((person, index) => ({
      id: `CPC-L-${String(index + 1).padStart(3, '0')}`,
      name: person.name,
      role: person.role,
      media: person.media || 'কুমিল্লা প্রেস ক্লাব',
      phone: person.phone,
      photoUrl: person.photoUrl || memberPlaceholderImage,
      group: 'leadership',
      profile: person
    })),
    ...liveCommittee.map((person, index) => ({
      id: `CPC-M-${String(index + 1).padStart(3, '0')}`,
      name: person.name,
      role: person.role,
      media: person.media,
      phone: person.phone,
      photoUrl: person.photoUrl || memberPlaceholderImage,
      group: 'committee',
      profile: person
    }))
  ]
  const registeredMemberDirectory = liveRegisteredMembers.map((person) => ({
    id: person.member_code,
    name: person.name,
    role: person.designation,
    media: person.media_house,
    phone: person.phone,
    email: person.email,
    photoUrl: person.photoUrl || memberPlaceholderImage,
    group: 'member',
    profile: {
      name: person.name,
      role: person.designation,
      media: person.media_house,
      phone: person.phone,
      email: person.email,
      photoUrl: person.photoUrl || memberPlaceholderImage,
      message: `সদস্য আইডি: ${person.member_code}`
    }
  }))
  const memberDirectory = registeredMemberDirectory.length > 0 ? registeredMemberDirectory : fallbackMemberDirectory
  const designationRank = {
    সভাপতি: 1,
    'সাধারণ সম্পাদক': 2,
    'যুগ্ম সম্পাদক': 3,
    'সাংগঠনিক সম্পাদক': 4
  }
  const membersByDesignation = [...memberDirectory].sort((a, b) => {
    const rankDiff = (designationRank[a.role] || 999) - (designationRank[b.role] || 999)
    if (rankDiff !== 0) {
      return rankDiff
    }

    return a.role.localeCompare(b.role, 'bn') || a.name.localeCompare(b.name, 'bn')
  })
  const normalizedMemberQuery = memberQuery.trim().toLowerCase()
  const hasMemberQuery = normalizedMemberQuery.length > 0
  const deceasedMembersPerPage = 6
  const donorMembersPerPage = 3
  const filteredMembers = hasMemberQuery
    ? membersByDesignation.filter((member) => [member.name, member.id, member.role, member.media]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(normalizedMemberQuery)))
    : membersByDesignation
  const visibleFilteredMembers = hasMemberQuery
    ? filteredMembers.slice(0, 20)
    : filteredMembers.slice(0, 10)
  const deceasedTotalPages = Math.max(1, Math.ceil(liveDeceasedMembers.length / deceasedMembersPerPage))
  const deceasedPageNumbers = Array.from({ length: deceasedTotalPages }, (_, index) => index + 1)
  const deceasedCompactPageItems = (() => {
    if (deceasedTotalPages <= 5) {
      return deceasedPageNumbers
    }

    const items = [1]
    const start = Math.max(2, deceasedPage - 1)
    const end = Math.min(deceasedTotalPages - 1, deceasedPage + 1)

    if (start > 2) {
      items.push('start-ellipsis')
    }

    for (let page = start; page <= end; page += 1) {
      items.push(page)
    }

    if (end < deceasedTotalPages - 1) {
      items.push('end-ellipsis')
    }

    items.push(deceasedTotalPages)
    return items
  })()
  const visibleDeceasedMembers = liveDeceasedMembers.slice(
    (deceasedPage - 1) * deceasedMembersPerPage,
    deceasedPage * deceasedMembersPerPage
  )
  const donorTotalPages = Math.max(1, Math.ceil(livePrimaryMembers.length / donorMembersPerPage))
  const donorPageNumbers = Array.from({ length: donorTotalPages }, (_, index) => index + 1)
  const donorCompactPageItems = (() => {
    if (donorTotalPages <= 5) {
      return donorPageNumbers
    }

    const items = [1]
    const start = Math.max(2, donorPage - 1)
    const end = Math.min(donorTotalPages - 1, donorPage + 1)

    if (start > 2) {
      items.push('start-ellipsis')
    }

    for (let page = start; page <= end; page += 1) {
      items.push(page)
    }

    if (end < donorTotalPages - 1) {
      items.push('end-ellipsis')
    }

    items.push(donorTotalPages)
    return items
  })()
  const visibleDonorMembers = livePrimaryMembers.slice(
    (donorPage - 1) * donorMembersPerPage,
    donorPage * donorMembersPerPage
  )
  const normalizedArchiveQuery = archiveQuery.trim().toLowerCase()
  const filteredArchiveItems = liveArchiveItems.filter((item) => {
    if (!normalizedArchiveQuery) {
      return true
    }

    return [item.year, item.title, item.type].some((field) => field.toLowerCase().includes(normalizedArchiveQuery))
  })

  const openProfileModal = (profile, group) => {
    setSelectedProfile(profile)
    setSelectedProfileGroup(group)
  }

  const closeProfileModal = () => {
    setSelectedProfile(null)
    setSelectedProfileGroup('')
  }

  const openDeceasedProfileModal = (member) => {
    setSelectedDeceasedMember(member)
  }

  const closeDeceasedProfileModal = () => {
    setSelectedDeceasedMember(null)
  }

  const openDonorProfileModal = (member) => {
    setSelectedDonorMember(member)
  }

  const closeDonorProfileModal = () => {
    setSelectedDonorMember(null)
  }

  const openNoticeModal = (notice) => {
    setSelectedNotice(notice)
  }

  const closeNoticeModal = () => {
    setSelectedNotice(null)
  }

  const toBanglaDigits = (value) =>
    String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])

  const getYoutubeEmbedUrl = (url) => {
    if (!url) {
      return ''
    }

    try {
      const parsed = new URL(url)
      let videoId = ''

      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.replace('/', '')
      } else {
        videoId = parsed.searchParams.get('v') || ''
      }

      if (!videoId) {
        return ''
      }

      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    } catch {
      return ''
    }
  }

  const openVideoModal = (item) => {
    if (!item?.youtubeUrl) {
      return
    }

    setActiveVideo(item)
  }

  const closeVideoModal = () => {
    setActiveVideo(null)
  }

  const openPhotoModal = (item) => {
    if (!item?.imageUrl) {
      return
    }

    setActivePhoto(item)
  }

  const closePhotoModal = () => {
    setActivePhoto(null)
  }

  const openPersonPhotoModal = (name, imageUrl) => {
    openPhotoModal({
      title: `${name} - প্রোফাইল ছবি`,
      imageUrl: imageUrl || memberPlaceholderImage,
      isProfileImage: true
    })
  }

  const openAllMembersModal = () => {
    setIsAllMembersModalOpen(true)
  }

  const closeAllMembersModal = () => {
    setIsAllMembersModalOpen(false)
  }

  const showNextProgramSlide = () => {
    if (liveProgramSlides.length === 0) {
      return
    }

    setActiveProgramSlide((current) => (current + 1) % liveProgramSlides.length)
  }

  const showPrevProgramSlide = () => {
    if (liveProgramSlides.length === 0) {
      return
    }

    setActiveProgramSlide((current) => (current - 1 + liveProgramSlides.length) % liveProgramSlides.length)
  }

  const handleMembershipSubmit = (event) => {
    event.preventDefault()
    setMembershipSubmitted(true)
  }

  const handleIdVerification = async (event) => {
    event.preventDefault()
    const query = verificationInput.trim()
    if (!query) {
      setVerificationMember(null)
      return
    }

    try {
      const response = await fetch(`${apiBase}/api/v1/members/verify/${encodeURIComponent(query)}`)
      const result = await response.json().catch(() => ({}))

      if (response.ok && result.success && result.data) {
        const member = result.data
        setVerificationMember({
          id: member.member_code,
          name: member.name,
          role: member.designation,
          media: member.media_house,
          phone: member.phone,
          photoUrl: member.photoUrl || memberPlaceholderImage
        })
        return
      }
    } catch {
      // Fall back to local directory lookup.
    }

    const foundMember = memberDirectory.find((member) => member.id.toLowerCase() === query.toLowerCase())
    setVerificationMember(foundMember || null)
  }

  const handlePressReleaseSubmit = (event) => {
    event.preventDefault()
    setPressReleaseSubmitted(true)
  }

  const handleComplaintSubmit = async (event) => {
    event.preventDefault()
    setComplaintSubmitted(false)
    setComplaintError('')
    setIsComplaintSubmitting(true)

    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
      const response = await fetch(`${apiBase}/api/v1/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complaintForm)
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'অভিযোগ পাঠানো সম্ভব হয়নি।')
      }

      setComplaintSubmitted(true)
      setComplaintForm({
        name: '',
        phone: '',
        address: '',
        complaint: ''
      })
    } catch (error) {
      setComplaintError(error instanceof Error ? error.message : 'সার্ভার সংযোগে সমস্যা হয়েছে।')
    } finally {
      setIsComplaintSubmitting(false)
    }
  }

  useEffect(() => {
    const loadBreakingNews = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/contents/breaking_news`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const headlines = result.data
          .map((item) => (item.title || item.body || '').trim())
          .filter(Boolean)

        if (headlines.length > 0) {
          setLiveBreakingNews(headlines)
        }
      } catch {
        // Fallback to static headlines if backend is unavailable.
      }
    }

    loadBreakingNews()
  }, [apiBase])

  useEffect(() => {
    const loadFeaturedNews = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/contents/featured_news`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalized = result.data
          .map((item) => ({
            title: (item.title || '').trim(),
            summary: (item.body || '').trim(),
            category: 'ফিচার্ড'
          }))
          .filter((item) => item.title && item.summary)

        if (normalized.length > 0) {
          setLiveFeaturedNews(normalized)
        }
      } catch {
        // Keep static featured news if backend is unavailable.
      }
    }

    loadFeaturedNews()
  }, [apiBase])

  useEffect(() => {
    const loadNoticesAndEvents = async () => {
      try {
        const [noticesResponse, eventsResponse] = await Promise.all([
          fetch(`${apiBase}/api/v1/notices`),
          fetch(`${apiBase}/api/v1/club-events`)
        ])

        const noticesResult = await noticesResponse.json().catch(() => ({}))
        const eventsResult = await eventsResponse.json().catch(() => ({}))

        if (noticesResponse.ok && noticesResult.success && Array.isArray(noticesResult.data)) {
          const normalizedNotices = noticesResult.data
            .map((item) => ({
              id: item.id,
              title: String(item.title || '').trim(),
              date: String(item.date || '').trim(),
              details: String(item.details || '').trim(),
              url: item.url || item.fileUrl || item.linkUrl || null
            }))
            .filter((item) => item.title)

          if (normalizedNotices.length > 0) {
            setLiveNotices(normalizedNotices)
          }
        }

        if (eventsResponse.ok && eventsResult.success && Array.isArray(eventsResult.data)) {
          const normalizedEvents = eventsResult.data
            .map((item) => ({
              id: item.id,
              title: String(item.title || '').trim(),
              date: String(item.date || '').trim(),
              time: String(item.time || '').trim(),
              venue: String(item.venue || '').trim(),
              startsAt: item.startsAt || null
            }))
            .filter((item) => item.title)

          if (normalizedEvents.length > 0) {
            setLiveUpcomingEvents(normalizedEvents)
          }
        }
      } catch {
        // Keep static notices/events if backend is unavailable.
      }
    }

    loadNoticesAndEvents()
  }, [apiBase])

  useEffect(() => {
    const loadProgramSlides = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/slider-items`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalizedSlides = result.data
          .map((item) => ({
            title: item.title,
            date: item.date,
            imageUrl: item.imageUrl
          }))
          .filter((item) => item.title && item.imageUrl)

        if (normalizedSlides.length > 0) {
          setLiveProgramSlides(normalizedSlides)
          setActiveProgramSlide(0)
        }
      } catch {
        // Keep static slides if backend is unavailable.
      }
    }

    loadProgramSlides()
  }, [apiBase])

  useEffect(() => {
    const loadLeadershipProfiles = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/leadership-profiles`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalized = result.data
          .map((item) => ({
            id: item.id,
            name: String(item.name || '').trim(),
            role: String(item.role || '').trim(),
            message: String(item.message || '').trim(),
            phone: String(item.phone || '').trim(),
            email: String(item.email || '').trim(),
            social: String(item.social || '').trim(),
            media: String(item.media || '').trim(),
            photoTag: String(item.photoTag || '').trim(),
            photoUrl: item.photoUrl || null
          }))
          .filter((item) => item.name && item.role)

        if (normalized.length > 0) {
          setLiveLeadershipProfiles(normalized)
        }
      } catch {
        // Keep static leadership profiles if backend is unavailable.
      }
    }

    loadLeadershipProfiles()
  }, [apiBase])

  useEffect(() => {
    const loadCommitteeMembers = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/committee-members`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalized = result.data
          .map((item) => ({
            id: item.id,
            name: String(item.name || '').trim(),
            role: String(item.role || '').trim(),
            message: String(item.message || '').trim(),
            phone: String(item.phone || '').trim(),
            email: String(item.email || '').trim(),
            social: String(item.social || '').trim(),
            media: String(item.media || '').trim(),
            photoUrl: item.photoUrl || null
          }))
          .filter((item) => item.name && item.role)

        if (normalized.length > 0) {
          setLiveCommittee(normalized)
        }
      } catch {
        // Keep static committee if backend is unavailable.
      }
    }

    loadCommitteeMembers()
  }, [apiBase])

  useEffect(() => {
    const loadRegisteredMembers = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/members`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalized = result.data
          .map((item) => ({
            id: item.id,
            member_code: String(item.member_code || '').trim(),
            name: String(item.name || '').trim(),
            media_house: String(item.media_house || '').trim(),
            designation: String(item.designation || '').trim(),
            phone: String(item.phone || '').trim(),
            email: String(item.email || '').trim(),
            photoUrl: item.photoUrl || null,
            status: String(item.status || 'active')
          }))
          .filter((item) => item.member_code && item.name)

        setLiveRegisteredMembers(normalized)
      } catch {
        // Keep fallback directory if backend is unavailable.
      }
    }

    loadRegisteredMembers()
  }, [apiBase])

  useEffect(() => {
    const loadArchiveItems = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/archive-items`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalized = result.data
          .map((item) => ({
            id: item.id,
            year: String(item.year || '').trim(),
            title: String(item.title || '').trim(),
            type: String(item.type || '').trim(),
            url: String(item.url || '#').trim() || '#'
          }))
          .filter((item) => item.year && item.title)

        if (normalized.length > 0) {
          setLiveArchiveItems(normalized)
        }
      } catch {
        // Keep static archive items if backend is unavailable.
      }
    }

    loadArchiveItems()
  }, [apiBase])

  useEffect(() => {
    const loadDeceasedMembers = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/deceased-members`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalized = result.data
          .map((item) => ({
            id: item.id,
            name: String(item.name || '').trim(),
            role: String(item.role || '').trim(),
            tenure: String(item.tenure || '').trim(),
            photoUrl: item.photoUrl || null
          }))
          .filter((item) => item.name && item.role)

        if (normalized.length > 0) {
          setLiveDeceasedMembers(normalized)
        }
      } catch {
        // Keep static deceased members if backend is unavailable.
      }
    }

    loadDeceasedMembers()
  }, [apiBase])

  useEffect(() => {
    const loadPrimaryMembers = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/primary-members`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalized = result.data
          .map((item) => ({
            id: item.id,
            name: String(item.name || '').trim(),
            role: String(item.role || '').trim(),
            tenure: String(item.tenure || '').trim(),
            contribution: String(item.contribution || '').trim(),
            photoUrl: item.photoUrl || null
          }))
          .filter((item) => item.name && item.role)

        if (normalized.length > 0) {
          setLivePrimaryMembers(normalized)
        }
      } catch {
        // Keep static primary members if backend is unavailable.
      }
    }

    loadPrimaryMembers()
  }, [apiBase])

  useEffect(() => {
    const parseGalleryBody = (body) => {
      const rawBody = (body || '').trim()

      if (!rawBody) {
        return {
          type: '',
          imageUrl: '',
          youtubeUrl: ''
        }
      }

      try {
        const parsed = JSON.parse(rawBody)
        if (parsed && typeof parsed === 'object') {
          return {
            type: String(parsed.type || '').trim(),
            imageUrl: String(parsed.imageUrl || '').trim(),
            youtubeUrl: String(parsed.youtubeUrl || '').trim()
          }
        }
      } catch {
        // Fall back to line-based parsing.
      }

      const lines = rawBody
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      return {
        type: lines[0] || '',
        imageUrl: lines[1] || '',
        youtubeUrl: lines[2] || ''
      }
    }

    const loadGalleryItems = async () => {
      try {
        const response = await fetch(`${apiBase}/api/v1/contents/media_gallery`)
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          return
        }

        const normalizedItems = result.data
          .map((item) => {
            const parsed = parseGalleryBody(item.body)
            const type = (parsed.type || 'Photo').trim() || 'Photo'

            return {
              title: (item.title || '').trim(),
              type,
              imageUrl: parsed.imageUrl,
              youtubeUrl: parsed.youtubeUrl
            }
          })
          .filter((item) => item.title && item.imageUrl)

        if (normalizedItems.length > 0) {
          setLiveGalleryItems(normalizedItems)
        }
      } catch {
        // Keep static media items if backend is unavailable.
      }
    }

    loadGalleryItems()
  }, [apiBase])

  useEffect(() => {
    setDeceasedPage((current) => Math.min(Math.max(current, 1), deceasedTotalPages))
  }, [deceasedTotalPages])

  useEffect(() => {
    setDonorPage((current) => Math.min(Math.max(current, 1), donorTotalPages))
  }, [donorTotalPages])

  useEffect(() => {
    const nextEvent = liveUpcomingEvents.find((item) => item.startsAt && !Number.isNaN(Date.parse(item.startsAt)))
    if (!nextEvent) {
      setEventCountdown({ days: 0, hours: 0, minutes: 0 })
      return
    }

    const updateCountdown = () => {
      const diffMs = Math.max(0, Date.parse(nextEvent.startsAt) - Date.now())
      const totalMinutes = Math.floor(diffMs / 60000)
      const days = Math.floor(totalMinutes / (60 * 24))
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
      const minutes = totalMinutes % 60
      setEventCountdown({ days, hours, minutes })
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 30000)
    return () => window.clearInterval(timer)
  }, [liveUpcomingEvents])

  useEffect(() => {
    const el = categoryRef.current
    if (!el) {
      return
    }

    const updateScrollState = () => {
      const max = el.scrollWidth - el.clientWidth
      setCanScrollPrev(el.scrollLeft > 2)
      setCanScrollNext(max > 2 && el.scrollLeft < max - 2)
    }

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  useEffect(() => {
    const el = mediaSliderRef.current
    if (!el) {
      return
    }

    const updateMediaScrollState = () => {
      const max = el.scrollWidth - el.clientWidth
      setCanMediaScrollPrev(el.scrollLeft > 2)
      setCanMediaScrollNext(max > 2 && el.scrollLeft < max - 2)
    }

    updateMediaScrollState()
    el.addEventListener('scroll', updateMediaScrollState, { passive: true })
    window.addEventListener('resize', updateMediaScrollState)

    return () => {
      el.removeEventListener('scroll', updateMediaScrollState)
      window.removeEventListener('resize', updateMediaScrollState)
    }
  }, [])

  useEffect(() => {
    if (!selectedProfile) {
      return
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeProfileModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedProfile])

  useEffect(() => {
    if (!selectedNotice) {
      return
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeNoticeModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedNotice])

  useEffect(() => {
    if (!activeVideo) {
      return
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeVideoModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activeVideo])

  useEffect(() => {
    if (!activePhoto) {
      return
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closePhotoModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [activePhoto])

  useEffect(() => {
    if (!isAllMembersModalOpen) {
      return
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeAllMembersModal()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isAllMembersModalOpen])

  useEffect(() => {
    if (liveProgramSlides.length < 2) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveProgramSlide((current) => (current + 1) % liveProgramSlides.length)
    }, 5500)

    return () => window.clearInterval(intervalId)
  }, [liveProgramSlides])

  const scrollCategories = (direction) => {
    const el = categoryRef.current
    if (!el) {
      return
    }

    const step = Math.max(180, Math.floor(el.clientWidth * 0.65))
    el.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' })
  }

  const scrollMediaSlider = (direction) => {
    const el = mediaSliderRef.current
    if (!el) {
      return
    }

    const step = Math.max(260, Math.floor(el.clientWidth * 0.75))
    el.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' })
  }

  const breakingCards = (suffix) =>
    liveBreakingNews.map((headline, index) => (
      <a key={`${suffix}-${index}`} href="#news-notices" className="breaking-mini-item">
        <span className="breaking-mini-item__title">{headline}</span>
      </a>
    ))

  const renderDepartmentIcon = (type) => {
    if (type === 'chat') {
      return <path d="M5 6h14v9H9l-4 3V6zM9 10h.01M12 10h.01M15 10h.01" />
    }
    if (type === 'group') {
      return <path d="M8 9a2.5 2.5 0 1 0 0-.01zM16 9a2.5 2.5 0 1 0 0-.01zM3.5 19c0-2.4 2-4.2 4.5-4.2s4.5 1.8 4.5 4.2M11.5 19c0-2.1 1.8-3.8 4.2-3.8S20 16.9 20 19" />
    }
    if (type === 'library') {
      return <path d="M5 5h3v14H5zM10 5h3v14h-3zM15 5h4v14h-4zM4 19h16" />
    }
    if (type === 'sport') {
      return <path d="M12 5l2.6 2.6L12 10l-2.6-2.4L12 5zM7 19l4-4m6-1l-3 3M7 9l2 2m6 6l2 2" />
    }
    if (type === 'video') {
      return <path d="M4 7h11v10H4zM15 10l5-2v8l-5-2M8 11l3 2-3 2z" />
    }
    if (type === 'grid') {
      return <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" />
    }
    if (type === 'puzzle') {
      return <path d="M8 7h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 1-4 0H8v-3a2 2 0 1 1 0-4V7z" />
    }
    if (type === 'clipboard') {
      return <path d="M9 4h6v3H9zM6 6h12v14H6zM9 11h6M9 15h4" />
    }
    if (type === 'users') {
      return <path d="M8 10a2.3 2.3 0 1 0 0-.01zM16 10a2.3 2.3 0 1 0 0-.01zM4.5 18c0-2.2 1.9-3.8 4.2-3.8s4.2 1.6 4.2 3.8M11.1 18c.2-1.8 1.8-3.1 3.8-3.1 2.1 0 3.8 1.4 4.1 3.1" />
    }
    if (type === 'flower') {
      return <path d="M12 12a2.2 2.2 0 1 0 0-.01zM12 6c1.7 0 2.3 1.6 2.3 3.1M6 12c0-1.7 1.6-2.3 3.1-2.3M12 18c-1.7 0-2.3-1.6-2.3-3.1M18 12c0 1.7-1.6 2.3-3.1 2.3M12 14v5" />
    }
    if (type === 'briefcase') {
      return <path d="M3.5 8h17v10h-17zM9 8V6h6v2M3.5 12h17" />
    }

    return <path d="M12 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM12 10v4" />
  }

  return (
    <main id="home" className="mx-auto w-[min(1200px,94vw)] py-6">
      <section id="news-notices" className="scroll-mt-24 overflow-hidden rounded-2xl bg-ink text-white">
        <div className="flex items-center">
          <div className="shrink-0 whitespace-nowrap bg-coral px-4 py-3 text-sm font-bold tracking-wide">ব্রেকিং নিউজ</div>
          <div className="breaking-mini group relative w-full px-2 py-2" aria-label="ট্রেন্ডিং ও সর্বশেষ সংবাদ">
            <div className="breaking-mini__viewport">
              <div className="breaking-mini__track breaking-mini__track--ticker">
                <div className="breaking-mini__marquee-set">{breakingCards('a')}</div>
                <div className="breaking-mini__marquee-set" aria-hidden>
                  {breakingCards('b')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl border border-ink/10 bg-white p-2 shadow-card dark:border-white/20 dark:bg-white/10 sm:p-3">
        <div className="relative overflow-hidden rounded-2xl">
          <div className="relative h-[220px] sm:h-[260px] lg:h-[300px]">
            {liveProgramSlides.map((slide, index) => (
              <article
                key={`${slide.title}-${index}`}
                className={`absolute inset-0 transition-opacity duration-700 ${activeProgramSlide === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                aria-hidden={activeProgramSlide !== index}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <p className="inline-flex rounded-full border border-white/35 bg-black/30 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white/95">
                    প্রোগ্রাম গ্যালারি
                  </p>
                  <h3 className="mt-2 max-w-2xl text-base font-bold leading-snug text-white sm:text-xl">{slide.title}</h3>
                  <p className="mt-1 text-xs font-medium text-white/85 sm:text-sm">{slide.date}</p>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={showPrevProgramSlide}
            className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label="আগের স্লাইড"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={showNextProgramSlide}
            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label="পরের স্লাইড"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/35 px-2 py-1 backdrop-blur-sm">
            {liveProgramSlides.map((slide, index) => (
              <button
                key={`${slide.title}-dot`}
                type="button"
                onClick={() => setActiveProgramSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${activeProgramSlide === index ? 'bg-white' : 'bg-white/45 hover:bg-white/70'}`}
                aria-label={`${index + 1} নম্বর স্লাইড দেখুন`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid scroll-mt-24 gap-5 lg:grid-cols-3">
        <article className="animate-floatIn min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#12324a] via-[#174763] to-[#202737] p-4 text-white shadow-card sm:p-6 lg:col-span-2">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <span className="inline-flex rounded-full border border-[#f4e9d7]/35 bg-[#f4e9d7]/12 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#fff7eb] backdrop-blur-sm">
                হাইলাইট ডেস্ক
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-white md:text-[1.9rem]">
                ফিচার্ড ও ট্রেন্ডিং সংবাদ
              </h2>
            </div>
            <span className="hidden rounded-full border border-[#ffd9a6]/45 bg-[#ffd9a6]/12 px-2.5 py-1 text-xs font-semibold text-[#fff2dc] sm:inline-flex">
              লাইভ আপডেট
            </span>
          </div>

          <div className="mt-2 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <div className="rounded-2xl border border-[#f4e9d7]/28 bg-[#f4e9d7]/10 p-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[#f4e9d7]/16 px-2.5 py-1 font-semibold text-[#fff7ec]">কুমিল্লা</span>
                <span className="rounded-full bg-[#f4e9d7]/16 px-2.5 py-1 font-semibold text-[#fff7ec]">সারাদেশ</span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight">{primaryFeaturedNews?.title}</h2>
              <p className="mt-3 text-[#fff2df]">{primaryFeaturedNews?.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#fff0dd]">
                <span className="rounded-full border border-[#f4e9d7]/35 px-2.5 py-1">প্রধান শিরোনাম</span>
                <span className="rounded-full border border-[#f4e9d7]/35 px-2.5 py-1">সর্বশেষ আপডেট</span>
                <span className="rounded-full border border-[#f4e9d7]/35 px-2.5 py-1">বিশেষ প্রতিবেদন</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff4e33]">বিস্তারিত পড়ুন</button>
                <button className="rounded-xl border border-[#f4e9d7]/35 bg-[#f4e9d7]/10 px-4 py-2 text-sm font-semibold text-[#fff7ec] transition hover:bg-[#f4e9d7]/20">সব শিরোনাম</button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#f4e9d7]/28 bg-[#f4e9d7]/10 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#ffebc8]">প্রধান খবরের হাইলাইট</p>
                <span className="text-xs text-[#f6e6d0]">লাইভ</span>
              </div>
              <div className="space-y-2.5">
                {visibleHeroHighlights.map((item) => (
                  <a
                    key={item.title}
                    href="#news-notices"
                    className="block rounded-xl border border-[#f4e9d7]/20 bg-[#f4e9d7]/10 p-3 transition hover:border-[#f4e9d7]/45 hover:bg-[#f4e9d7]/18"
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold">
                      <span className={item.tone === 'local' ? 'text-[#ffd69f]' : 'text-[#bfe9ff]'}>{item.scope}</span>
                      <span className="text-[#f6e6d0]/70">•</span>
                      <span className="text-[#f6e6d0]">{item.time}</span>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-[#fff6ea]">{item.title}</p>
                  </a>
                ))}
              </div>
              {hasMoreHeroHighlights && (
                <a
                  href="#news-notices"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#ffe5c4] underline decoration-[#ffd7a8]/70 underline-offset-2 hover:text-white"
                >
                  আরও দেখুন
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#f4e9d7]/30 bg-[#f4e9d7]/10 p-4">
            <p className="text-xs font-semibold tracking-wide text-mint">ট্রেন্ডিং এখন</p>
            <h3 className="mt-1 text-lg font-bold leading-snug">{secondaryFeaturedNews?.title}</h3>
            <p className="mt-1 text-sm text-[#f8ead6]">{secondaryFeaturedNews?.summary}</p>
          </div>

          <div className="topic-strip mt-8" aria-label="আলোচিত বিষয়">
            <span className="topic-strip__label">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 4L8 20M16 4l-2 16M4 9h16M3 15h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              আলোচিত বিষয়
            </span>
            <div className="topic-strip__rail">
              <button
                type="button"
                className="topic-strip__nav"
                onClick={() => scrollCategories('prev')}
                disabled={!canScrollPrev}
                aria-label="আগের বিষয়গুলো"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div ref={categoryRef} className="topic-strip__scroller no-scrollbar">
                <div className="topic-strip__track">
                  {categories.map((c) => (
                    <a key={c} href="#news-notices" className="topic-strip__pill">
                      {c}
                    </a>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="topic-strip__nav"
                onClick={() => scrollCategories('next')}
                disabled={!canScrollNext}
                aria-label="পরের বিষয়গুলো"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </article>

        <aside id="about" className="scroll-mt-24 min-w-0 rounded-3xl border border-ink/10 bg-white p-4 shadow-card dark:border-white/20 dark:bg-white/10 sm:p-5">
          <div className="rounded-2xl bg-gradient-to-r from-[#0f4d73] to-[#246c8f] p-4 text-white">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/80">NOTICE BOARD & EVENTS</p>
            <h3 className="mt-1 text-xl font-bold">প্রেস ক্লাবের নোটিশ ও ইভেন্ট</h3>
            <p className="mt-1 text-sm text-white/85">নতুন দিকনির্দেশনা, প্রেস রিলিজ ও অফিসিয়াল নোটিশ</p>
          </div>

          <div className="mt-4 space-y-3">
            {liveNotices.map((notice, index) => (
              <div key={notice.id ?? notice.title} className="rounded-xl border border-ink/10 bg-ink/5 p-3 dark:border-white/20 dark:bg-white/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold leading-snug text-ink dark:text-white">{notice.title}</p>
                  <span className="rounded-full bg-river/15 px-2 py-0.5 text-[11px] font-semibold text-river dark:bg-white/15 dark:text-white/90">
                    #{index + 1}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-ink/65 dark:text-white/70">প্রকাশ: {notice.date || '—'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {notice.url ? (
                    <a
                      href={notice.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-river px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 3v12" />
                        <path d="M7 10l5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                      PDF ডাউনলোড
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-ink/20 px-3 py-1.5 text-xs font-semibold text-ink/60 dark:bg-white/10 dark:text-white/60">
                      PDF নেই
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => openNoticeModal(notice)}
                    className="rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                  >
                    বিস্তারিত
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-coral/35 bg-gradient-to-br from-[#fff2e8] to-[#ffe6d3] p-4 dark:border-coral/40 dark:from-[#2a1f24] dark:to-[#3a2624]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink dark:text-white">আগামী ইভেন্ট কাউন্টডাউন</p>
              <span className="rounded-full bg-coral/20 px-2.5 py-0.5 text-[11px] font-semibold text-coral dark:bg-coral/30 dark:text-orange-100">LIVE</span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/90 p-2 text-center dark:bg-white/10">
                <p className="text-lg font-bold text-coral">{toBanglaDigits(String(eventCountdown.days).padStart(2, '0'))}</p>
                <p className="text-[11px] font-semibold text-ink/70 dark:text-white/75">দিন</p>
              </div>
              <div className="rounded-xl bg-white/90 p-2 text-center dark:bg-white/10">
                <p className="text-lg font-bold text-coral">{toBanglaDigits(String(eventCountdown.hours).padStart(2, '0'))}</p>
                <p className="text-[11px] font-semibold text-ink/70 dark:text-white/75">ঘন্টা</p>
              </div>
              <div className="rounded-xl bg-white/90 p-2 text-center dark:bg-white/10">
                <p className="text-lg font-bold text-coral">{toBanglaDigits(String(eventCountdown.minutes).padStart(2, '0'))}</p>
                <p className="text-[11px] font-semibold text-ink/70 dark:text-white/75">মিনিট</p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {liveUpcomingEvents.map((eventItem) => (
                <div key={eventItem.id ?? eventItem.title} className="rounded-xl border border-ink/10 bg-white/80 p-2.5 dark:border-white/20 dark:bg-white/5">
                  <p className="text-sm font-semibold text-ink dark:text-white">{eventItem.title}</p>
                  <p className="mt-0.5 text-xs text-ink/70 dark:text-white/70">{eventItem.date}{eventItem.time ? ` • ${eventItem.time}` : ''}</p>
                  {eventItem.venue && <p className="text-xs text-ink/70 dark:text-white/70">স্থান: {eventItem.venue}</p>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-gradient-to-br from-white via-[#f8fcff] to-[#eef7ff] p-4 shadow-card dark:border-white/20 dark:from-[#0f1d2c] dark:via-[#122538] dark:to-[#0f2a34] sm:p-6">
        <div className="grid items-center gap-5 lg:grid-cols-[1fr_1.25fr]">
          <div className="relative mx-auto w-full max-w-[460px]">
            <div className="aspect-square overflow-hidden rounded-[2.2rem] border border-ink/10 bg-black shadow-xl dark:border-white/20">
              <img
                src={organizationSpotlight.imageUrl}
                alt="কুমিল্লা প্রেস ক্লাব"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -left-4 top-5 rounded-full border border-white/35 bg-coral px-4 py-3 text-center text-white shadow-lg sm:-left-6 sm:px-5">
              <p className="text-[11px] font-semibold tracking-wide">প্রতিষ্ঠিত</p>
              <p className="text-2xl font-bold leading-none">{organizationSpotlight.established}</p>
            </div>
            <div className="absolute -bottom-5 right-4 w-[220px] rounded-2xl border border-white/30 bg-[#063d14] p-3 text-white shadow-xl sm:right-6">
              <p className="text-4xl font-bold leading-none">{organizationSpotlight.statNumber}</p>
              <p className="mt-1 text-sm font-semibold text-[#d5f8d2]">{organizationSpotlight.statLabel}</p>
              <p className="text-xs text-[#b9ecb5]">{organizationSpotlight.statCaption}</p>
            </div>
          </div>

          <div>
            <p className="inline-flex items-center rounded-full border border-river/25 bg-river/10 px-3 py-1 text-xs font-semibold tracking-wide text-river dark:border-sky-200/35 dark:bg-sky-200/10 dark:text-sky-100">
              {organizationSpotlight.badge}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-ink dark:text-white sm:text-4xl">
              {organizationSpotlight.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/80 dark:text-white/82 sm:text-base">
              {organizationSpotlight.summary}
            </p>

            <div className="mt-4 divide-y divide-ink/12 rounded-2xl border border-ink/10 bg-white/75 dark:divide-white/12 dark:border-white/20 dark:bg-white/5">
              {organizationSpotlight.highlights.map((item) => (
                <a
                  key={item}
                  href="#about"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#0f5132] transition hover:bg-[#e8f6ee] dark:text-mint dark:hover:bg-white/10"
                >
                  <span aria-hidden="true">⊕</span>
                  <span>{item}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mt-6 overflow-hidden rounded-3xl border border-emerald-900/20 bg-[#0d3f2f] p-4 text-white shadow-card sm:p-6">
        <div className="absolute inset-0">
          <img
            src={departmentsOverview.backgroundImageUrl}
            alt="কুমিল্লা প্রেস ক্লাব ব্যাকগ্রাউন্ড"
            className="h-full w-full object-cover opacity-15"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(134,239,172,0.12),transparent_48%)]" aria-hidden="true" />

        <div className="relative">
          <div className="text-center">
            <p className="text-sm font-semibold tracking-wide text-[#d5f3df]">{departmentsOverview.kicker}</p>
            <h3 className="mt-1 text-2xl font-bold text-white sm:text-4xl">{departmentsOverview.title}</h3>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {departmentsOverview.items.map((item) => (
              <article
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/95 p-3 text-[#0f5132] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-[#16a34a]">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {renderDepartmentIcon(item.icon)}
                  </svg>
                </span>
                <p className="text-sm font-semibold leading-snug">{item.title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid scroll-mt-24 gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-white/10">
          <h3 className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-river/15 text-river dark:bg-white/15 dark:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M4.5 20c0-4.1 3.4-6.8 7.5-6.8s7.5 2.7 7.5 6.8" />
              </svg>
            </span>
            নেতৃত্বের প্রোফাইল
          </h3>
          <div className="mt-4 space-y-4">
            {visibleLeadershipProfiles.map((leader) => (
              <article
                key={leader.name}
                className="cursor-pointer rounded-2xl border border-ink/10 bg-gradient-to-r from-white to-[#eef7ff] p-4 transition hover:border-river/35 hover:shadow-md dark:border-white/20 dark:from-white/5 dark:to-white/10 dark:hover:border-sky-300/45"
                role="button"
                tabIndex={0}
                onClick={() => openProfileModal(leader, 'leadership')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openProfileModal(leader, 'leadership')
                  }
                }}
                aria-label={`${leader.name} এর প্রোফাইল দেখুন`}
              >
                <div className="flex gap-3">
                  <img
                    src={leader.photoUrl || memberPlaceholderImage}
                    alt={`${leader.name} প্রোফাইল ছবি`}
                    className="h-16 w-12 shrink-0 cursor-zoom-in rounded-lg border border-ink/15 object-cover dark:border-white/20"
                    onClick={(event) => {
                      event.stopPropagation()
                      openPersonPhotoModal(leader.name, leader.photoUrl)
                    }}
                    onError={(event) => {
                      event.currentTarget.src = memberPlaceholderImage
                    }}
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold tracking-wide text-river dark:text-sky-200">{leader.role}</p>
                    <h4 className="text-lg font-bold text-ink dark:text-white">{leader.name}</h4>
                    <p className="mt-1 text-sm text-ink/75 dark:text-white/80">{leader.message}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                  <a onClick={(event) => event.stopPropagation()} href="#contact" className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-ink/80 transition hover:bg-ink/5 dark:border-white/20 dark:bg-white/5 dark:text-white/85 dark:hover:bg-white/10">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-300/20 dark:text-sky-200">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></svg>
                    </span>
                    <span className="min-w-0 truncate"><strong>Mail:</strong> {leader.email}</span>
                  </a>
                  <a onClick={(event) => event.stopPropagation()} href="#contact" className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-ink/80 transition hover:bg-ink/5 dark:border-white/20 dark:bg-white/5 dark:text-white/85 dark:hover:bg-white/10">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-300/20 dark:text-emerald-200">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.3.56 3.6.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.5 21 3 13.5 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.56 3.6a1 1 0 0 1-.25 1z" /></svg>
                    </span>
                    <span className="min-w-0 truncate"><strong>Phone:</strong> {leader.phone}</span>
                  </a>
                  <a onClick={(event) => event.stopPropagation()} href="#contact" className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-2.5 py-1.5 text-ink/80 transition hover:bg-ink/5 dark:border-white/20 dark:bg-white/5 dark:text-white/85 dark:hover:bg-white/10">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-300/20 dark:text-blue-200">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v5h3v-5h2.2l.8-3H13V9c0-.6.4-1 1-1z" /></svg>
                    </span>
                    <span className="min-w-0 truncate"><strong>Facebook:</strong> {leader.social}</span>
                  </a>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openProfileModal(leader, 'leadership')
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-river px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 dark:bg-sky-600"
                >
                  প্রোফাইল দেখুন
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
            {hasMoreLeadershipProfiles && (
              <a
                href="#committee"
                className="inline-flex items-center gap-1 text-xs font-semibold text-river underline decoration-river/60 underline-offset-2 transition hover:text-coral dark:text-sky-200 dark:decoration-sky-200/60"
              >
                আরও দেখুন
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>

        <div id="committee" className="scroll-mt-24 rounded-3xl border border-ink/10 bg-white p-5 shadow-card dark:border-white/20 dark:bg-white/10">
          <h3 className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-coral/15 text-coral dark:bg-coral/25 dark:text-orange-100">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <circle cx="8" cy="8" r="2.5" />
                <circle cx="16" cy="8" r="2.5" />
                <path d="M4.5 19c0-2.8 2.2-4.8 4.9-4.8 2.5 0 4.6 1.7 4.9 4" />
                <path d="M11.5 19c.3-2.3 2.4-4 4.8-4 2.6 0 4.7 1.9 4.7 4" />
              </svg>
            </span>
            বর্তমান নির্বাহী কমিটি
          </h3>
          <p className="mt-1 text-sm text-ink/65 dark:text-white/70">গ্রিড ভিউতে কমিটির সদস্যদের দ্রুত তথ্য</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {visibleCommittee.map((person) => (
              <article
                key={person.id || `${person.name}-${person.role}`}
                className="flex h-full min-h-[132px] cursor-pointer flex-col rounded-xl border border-ink/10 bg-gradient-to-r from-white to-[#fff3eb] p-3 transition hover:border-coral/35 hover:shadow-md dark:border-white/20 dark:from-white/5 dark:to-white/10 dark:hover:border-orange-200/45"
                role="button"
                tabIndex={0}
                onClick={() => openProfileModal(person, 'committee')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openProfileModal(person, 'committee')
                  }
                }}
                aria-label={`${person.name} এর প্রোফাইল দেখুন`}
              >
                <div className="flex items-start gap-2.5">
                  <img
                    src={person.photoUrl || memberPlaceholderImage}
                    alt={`${person.name} প্রোফাইল ছবি`}
                    className="h-14 w-11 shrink-0 cursor-zoom-in rounded-md border border-ink/15 object-cover dark:border-white/20"
                    onClick={(event) => {
                      event.stopPropagation()
                      openPersonPhotoModal(person.name, person.photoUrl)
                    }}
                    onError={(event) => {
                      event.currentTarget.src = memberPlaceholderImage
                    }}
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink dark:text-white">{person.name}</p>
                    <p className="text-sm font-medium text-river dark:text-sky-200">{person.role}</p>
                  </div>
                </div>
                <p className="mt-1 flex-1 rounded-md bg-ink/5 px-2 py-1 text-xs font-semibold text-[#111827] dark:bg-white/10 dark:text-[#f8fafc]">{person.media}</p>
                <p className="mt-2 inline-flex w-fit rounded-full bg-river/10 px-2 py-0.5 text-xs font-semibold text-river dark:bg-white/15 dark:text-white/90">{person.phone}</p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openProfileModal(person, 'committee')
                  }}
                  className="mt-2 inline-flex w-fit items-center gap-1 rounded-lg border border-river/25 bg-river/10 px-2.5 py-1 text-xs font-semibold text-river transition hover:bg-river/20 dark:border-sky-200/30 dark:bg-sky-200/10 dark:text-sky-100"
                >
                  প্রোফাইল দেখুন
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
          {hasMoreCommittee && (
            <a
              href="#committee"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-river underline decoration-river/60 underline-offset-2 transition hover:text-coral dark:text-sky-200 dark:decoration-sky-200/60"
            >
              আরও দেখুন
              <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </section>

      <aside
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-coral to-river px-6 py-5 text-white"
        aria-label="স্পনসরড ব্যানার"
      >
        <p className="text-xs uppercase tracking-widest">Sponsored Banner</p>
        <p className="mt-1 text-lg font-semibold sm:text-xl">জাতীয় উন্নয়ন ও স্থানীয় উদ্যোগের পাশে</p>
      </aside>

      <section
        id="media-gallery"
        className="relative mt-8 scroll-mt-24 overflow-hidden rounded-3xl border border-ink/10 bg-gradient-to-br from-[#fff7ef] via-[#eef7ff] to-[#e7fff3] p-5 shadow-card dark:border-white/20 dark:from-[#0f1d2b] dark:via-[#11283c] dark:to-[#143226]"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-coral/20 blur-3xl dark:bg-coral/25" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-river/20 blur-3xl dark:bg-river/25" aria-hidden="true" />

        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-coral/20 text-coral dark:bg-coral/25 dark:text-orange-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <circle cx="8.2" cy="10" r="1.8" />
                  <path d="M12 14l2.8-3 4.2 5" />
                </svg>
              </span>
              মিডিয়া গ্যালারি
            </h3>
            <p className="mt-1 text-sm font-medium text-ink/75 dark:text-white/75">
              প্রেস ক্লাবের অনুষ্ঠান, প্রেস কনফারেন্স এবং কুমিল্লার ইতিহাস-ঐতিহ্যের আকর্ষণীয় ছবি ও ভিডিও স্লাইডার।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollMediaSlider('prev')}
              disabled={!canMediaScrollPrev}
              aria-label="আগের মিডিয়া"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-river/35 bg-white/70 text-river transition hover:bg-river/10 disabled:cursor-not-allowed disabled:opacity-45 dark:border-sky-200/40 dark:bg-white/10 dark:text-sky-100 dark:hover:bg-sky-200/15"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollMediaSlider('next')}
              disabled={!canMediaScrollNext}
              aria-label="পরের মিডিয়া"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-river/35 bg-white/70 text-river transition hover:bg-river/10 disabled:cursor-not-allowed disabled:opacity-45 dark:border-sky-200/40 dark:bg-white/10 dark:text-sky-100 dark:hover:bg-sky-200/15"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative mt-5">
          <div ref={mediaSliderRef} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-1 pr-1">
          {liveGalleryItems.map((item, index) => (
            <article
              key={item.title}
              className={`group min-w-[250px] flex-none overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-3 shadow-sm backdrop-blur-sm transition duration-300 sm:min-w-[280px] lg:min-w-[285px] dark:border-white/20 dark:bg-white/10 ${(item.type.toLowerCase() === 'video' || item.type.toLowerCase() === 'photo') ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''}`}
              role={(item.type.toLowerCase() === 'video' || item.type.toLowerCase() === 'photo') ? 'button' : undefined}
              tabIndex={(item.type.toLowerCase() === 'video' || item.type.toLowerCase() === 'photo') ? 0 : undefined}
              onClick={
                item.type.toLowerCase() === 'video'
                  ? () => openVideoModal(item)
                  : item.type.toLowerCase() === 'photo'
                    ? () => openPhotoModal(item)
                    : undefined
              }
              onKeyDown={(item.type.toLowerCase() === 'video' || item.type.toLowerCase() === 'photo')
                ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    if (item.type.toLowerCase() === 'video') {
                      openVideoModal(item)
                    } else {
                      openPhotoModal(item)
                    }
                  }
                }
                : undefined}
              aria-label={item.type.toLowerCase() === 'video' ? `${item.title} ভিডিও চালান` : item.type.toLowerCase() === 'photo' ? `${item.title} বড় করে দেখুন` : undefined}
            >
              <div className="relative h-28 overflow-hidden rounded-xl bg-gradient-to-br from-river/35 via-coral/25 to-mint/35 dark:from-river/45 dark:via-coral/35 dark:to-emerald-300/25">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_55%)]" aria-hidden="true" />
                <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {item.type}
                </span>
                <span className="absolute right-2 top-2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="absolute inset-0 m-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-river shadow-md transition group-hover:scale-110 dark:bg-white dark:text-coral">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path d="M8 6.5v11l9-5.5-9-5.5z" />
                  </svg>
                </span>
                {item.type.toLowerCase() === 'video' && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                    ক্লিক করে প্লে
                  </span>
                )}
                {item.type.toLowerCase() === 'photo' && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
                    ক্লিক করে জুম
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-2 font-semibold text-ink dark:text-white">{item.title}</p>
              <p className="mt-1 text-xs font-medium text-ink/70 dark:text-white/70">{item.type} • কুমিল্লা প্রেস ক্লাব</p>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section id="members" className="mt-8 grid scroll-mt-24 gap-5 lg:grid-cols-5">
        <div className="flex h-full min-h-0 flex-col rounded-3xl border border-ink/10 bg-gradient-to-br from-[#fff7ec] via-[#f3f9ff] to-[#eefef5] p-5 shadow-card dark:border-white/20 dark:from-[#111d2a] dark:via-[#112a3a] dark:to-[#123526] lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-river/15 text-river dark:bg-sky-200/20 dark:text-sky-100">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                    <circle cx="8" cy="8" r="3" />
                    <path d="M2.5 19c0-3.3 2.7-5.4 5.5-5.4S13.5 15.7 13.5 19" />
                    <rect x="14" y="5" width="7" height="4" rx="1" />
                    <path d="M14 13h7M14 17h5" />
                  </svg>
                </span>
                সদস্য যাচাইকরণ ও ডিরেক্টরি
              </h3>
              <p className="mt-1 text-sm text-ink/75 dark:text-white/75">
                নাম বা আইডি দিয়ে নিবন্ধিত সাংবাদিকদের প্রোফাইল, মিডিয়া হাউজের নাম এবং পদবী সার্চ করুন।
              </p>
            </div>
            <button
              type="button"
              onClick={openAllMembersModal}
              className="rounded-full border border-river/30 bg-river/10 px-3 py-1 text-xs font-semibold text-river transition hover:bg-river/15 dark:border-sky-200/35 dark:bg-sky-200/10 dark:text-sky-100 dark:hover:bg-sky-200/20"
              aria-label="সকল সদস্য তালিকা দেখুন"
            >
              মোট সদস্য: {memberDirectory.length}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={memberQuery}
              onChange={(event) => setMemberQuery(event.target.value)}
              className="rounded-xl border border-ink/20 bg-white/80 px-4 py-3 outline-none ring-river/40 placeholder:text-ink/50 focus:ring dark:border-white/30 dark:bg-white/10 dark:text-white dark:placeholder:text-white/55"
              placeholder="নাম, সদস্য আইডি, পদবী বা মিডিয়া হাউজ লিখুন"
            />
            <button
              type="button"
              className="rounded-xl bg-coral px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!hasMemberQuery}
            >
              সার্চ
            </button>
            <button
              type="button"
              onClick={() => setMemberQuery('')}
              className="rounded-xl border border-ink/20 bg-white/85 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              রিসেট
            </button>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-2xl border border-ink/10 bg-white/80 p-3 dark:border-white/20 dark:bg-white/10">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wide text-ink/70 dark:text-white/75">
                {hasMemberQuery ? 'SEARCH RESULT' : 'সদস্য তালিকা'}
              </p>
              <p className="text-xs font-semibold text-river dark:text-sky-200">
                {hasMemberQuery ? `ম্যাচ: ${filteredMembers.length}` : `দেখানো হচ্ছে: ${visibleFilteredMembers.length}`}
              </p>
            </div>

            <div className="min-h-[16rem] flex-1 space-y-2 overflow-y-auto pr-1">
              {visibleFilteredMembers.length > 0 ? (
                visibleFilteredMembers.map((member) => (
                  <article
                    key={member.id}
                    className="cursor-pointer rounded-xl border border-ink/10 bg-white p-3 transition hover:border-river/35 hover:shadow-sm dark:border-white/15 dark:bg-white/5 dark:hover:border-sky-300/40"
                    role="button"
                    tabIndex={0}
                    onClick={() => openProfileModal(member.profile, member.group)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openProfileModal(member.profile, member.group)
                      }
                    }}
                    aria-label={`${member.name} এর প্রোফাইল দেখুন`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <img
                          src={member.photoUrl}
                          alt={`${member.name} ছবি`}
                          className="h-14 w-11 shrink-0 cursor-zoom-in rounded-md border border-ink/15 object-cover dark:border-white/20"
                          onClick={(event) => {
                            event.stopPropagation()
                            openPersonPhotoModal(member.name, member.photoUrl)
                          }}
                          onError={(event) => {
                            event.currentTarget.src = memberPlaceholderImage
                          }}
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-ink dark:text-white">{member.name}</h4>
                          <p className="text-sm text-river dark:text-sky-200">{member.role}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-coral/15 px-2.5 py-0.5 text-xs font-semibold text-coral dark:bg-coral/25 dark:text-orange-100">{member.id}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink/75 dark:text-white/80">মিডিয়া: {member.media}</p>
                    <p className="mt-1 text-xs text-ink/65 dark:text-white/70">ফোন: {member.phone}</p>
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-ink/20 bg-ink/5 px-3 py-6 text-center text-sm text-ink/65 dark:border-white/25 dark:bg-white/5 dark:text-white/70">
                  কোনো সদস্য পাওয়া যায়নি। অন্য নাম/আইডি/মিডিয়া দিয়ে চেষ্টা করুন।
                </p>
              )}
            </div>
            {hasMemberQuery && filteredMembers.length > visibleFilteredMembers.length && (
              <p className="mt-2 text-xs text-ink/65 dark:text-white/70">
                {visibleFilteredMembers.length} জন দেখানো হচ্ছে, আরও ফলাফল পেতে সার্চ আরও নির্দিষ্ট করুন।
              </p>
            )}
          </div>

        </div>

        <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-[#132432] via-[#1b3347] to-[#15323a] p-5 text-white shadow-card dark:border-white/20 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-mint">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                <path d="M4 8h16M4 12h10M4 16h8" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
              </svg>
            </span>
            বিশেষ আকর্ষণীয় ফিচারসমূহ
          </h3>

          <div className="mt-4 space-y-4">
            <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-mint">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint/20 text-[11px] font-bold text-mint">1</span>
                অনলাইন সদস্যপদ ফর্ম ও ই-আইডি কার্ড
              </h4>

              <form className="mt-2 space-y-2" onSubmit={handleMembershipSubmit}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={membershipForm.type}
                    onChange={(event) => setMembershipForm((prev) => ({ ...prev, type: event.target.value }))}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="new" className="text-ink">নতুন সদস্যপদ</option>
                    <option value="renew" className="text-ink">নবায়ন সদস্যপদ</option>
                  </select>
                  <input
                    value={membershipForm.name}
                    onChange={(event) => setMembershipForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="পূর্ণ নাম"
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                  <input
                    value={membershipForm.phone}
                    onChange={(event) => setMembershipForm((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="মোবাইল নম্বর"
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                  <input
                    value={membershipForm.media}
                    onChange={(event) => setMembershipForm((prev) => ({ ...prev, media: event.target.value }))}
                    placeholder="মিডিয়া হাউজ"
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                </div>
                <input
                  value={membershipForm.nidLast4}
                  onChange={(event) => setMembershipForm((prev) => ({ ...prev, nidLast4: event.target.value }))}
                  placeholder="NID শেষ ৪ ডিজিট"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <button type="submit" className="w-full rounded-lg bg-coral px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                  আবেদন জমা দিন
                </button>
              </form>

              {membershipSubmitted && (
                <p className="mt-2 rounded-lg border border-emerald-300/35 bg-emerald-300/15 px-3 py-2 text-xs text-emerald-100">
                  আবেদন গ্রহণ করা হয়েছে। যাচাই শেষে আপনার স্মার্ট ই-আইডি কার্ড ইমেইলে পাঠানো হবে।
                </p>
              )}

              <form className="mt-3 space-y-2" onSubmit={handleIdVerification}>
                <p className="text-xs font-semibold text-white/80">QR ই-কার্ড ভেরিফিকেশন (Member ID দিয়ে)</p>
                <div className="flex gap-2">
                  <input
                    value={verificationInput}
                    onChange={(event) => setVerificationInput(event.target.value)}
                    placeholder="উদাহরণ: CPC-M-001"
                    className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                  <button type="submit" className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15">
                    Verify
                  </button>
                </div>
              </form>

              {verificationMember && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-2.5">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=74x74&data=${encodeURIComponent(verificationMember.id)}`}
                    alt={`${verificationMember.id} QR`}
                    className="h-[74px] w-[74px] rounded-md bg-white p-1"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{verificationMember.name}</p>
                    <p className="text-xs text-white/80">{verificationMember.role} • {verificationMember.id}</p>
                    <p className="text-xs text-mint">Status: Verified Member</p>
                  </div>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-mint">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint/20 text-[11px] font-bold text-mint">2</span>
                ই-লাইব্রেরি ও আর্কাইভ
              </h4>
              <input
                value={archiveQuery}
                onChange={(event) => setArchiveQuery(event.target.value)}
                placeholder="বছর, শিরোনাম বা টাইপ দিয়ে সার্চ করুন"
                className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
              />
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
                {filteredArchiveItems.map((item) => (
                  <div key={item.id || `${item.year}-${item.title}`} className="rounded-lg border border-white/15 bg-black/20 px-3 py-2">
                    <p className="text-xs text-mint">{item.year} • {item.type}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block text-sm font-medium text-white transition hover:text-mint"
                    >
                      {item.title}
                    </a>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-200 underline decoration-sky-200/60 underline-offset-2 hover:text-mint"
                    >
                      আর্কাইভ দেখুন
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                ))}
                {filteredArchiveItems.length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/20 px-3 py-4 text-center text-xs text-white/70">
                    কোনো আর্কাইভ পাওয়া যায়নি।
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-mint">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint/20 text-[11px] font-bold text-mint">3</span>
                প্রেস রিলিজ সাবমিশন
              </h4>
              <form className="mt-2 space-y-2" onSubmit={handlePressReleaseSubmit}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    value={pressReleaseForm.sender}
                    onChange={(event) => setPressReleaseForm((prev) => ({ ...prev, sender: event.target.value }))}
                    placeholder="প্রেরকের নাম"
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                  <input
                    value={pressReleaseForm.organization}
                    onChange={(event) => setPressReleaseForm((prev) => ({ ...prev, organization: event.target.value }))}
                    placeholder="প্রতিষ্ঠান"
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                </div>
                <input
                  type="email"
                  value={pressReleaseForm.email}
                  onChange={(event) => setPressReleaseForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="ইমেইল"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <input
                  value={pressReleaseForm.title}
                  onChange={(event) => setPressReleaseForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="প্রেস রিলিজ শিরোনাম"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <textarea
                  value={pressReleaseForm.details}
                  onChange={(event) => setPressReleaseForm((prev) => ({ ...prev, details: event.target.value }))}
                  placeholder="বিস্তারিত বার্তা লিখুন"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <button type="submit" className="w-full rounded-lg bg-river px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                  বার্তা পাঠান
                </button>
              </form>
              {pressReleaseSubmitted && (
                <p className="mt-2 rounded-lg border border-sky-300/35 bg-sky-300/15 px-3 py-2 text-xs text-sky-100">
                  প্রেস রিলিজ সফলভাবে সাবমিট হয়েছে। রিভিউ শেষে আপনাকে নোটিফাই করা হবে।
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-mint">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint/20 text-[11px] font-bold text-mint">4</span>
                অভিযোগ বক্স
              </h4>
              <p className="mt-1 text-xs text-white/75">
                কুমিল্লা প্রেসক্লাব বরাবর আপনার অভিযোগ পাঠান। সাবমিট করলে অভিযোগটি সরাসরি সার্ভার থেকে ইমেইলে যাবে।
              </p>
              <form className="mt-2 space-y-2" onSubmit={handleComplaintSubmit}>
                <input
                  value={complaintForm.name}
                  onChange={(event) => setComplaintForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="নাম"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <input
                  value={complaintForm.phone}
                  onChange={(event) => setComplaintForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="মোবাইল নম্বর"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <input
                  value={complaintForm.address}
                  onChange={(event) => setComplaintForm((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="ঠিকানা"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <textarea
                  value={complaintForm.complaint}
                  onChange={(event) => setComplaintForm((prev) => ({ ...prev, complaint: event.target.value }))}
                  placeholder="অভিযোগের বিস্তারিত লিখুন"
                  rows={3}
                  required
                  className="w-full resize-none rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/70 outline-none"
                />
                <button
                  type="submit"
                  disabled={isComplaintSubmitting}
                  className="w-full rounded-lg bg-coral px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isComplaintSubmitting ? 'পাঠানো হচ্ছে...' : 'অভিযোগ পাঠান'}
                </button>
              </form>
              {complaintSubmitted && (
                <p className="mt-2 rounded-lg border border-emerald-300/35 bg-emerald-300/15 px-3 py-2 text-xs text-emerald-100">
                  আপনার অভিযোগ সফলভাবে পাঠানো হয়েছে: cumillapressclub1964@gmail.com
                </p>
              )}
              {complaintError && (
                <p className="mt-2 rounded-lg border border-rose-300/35 bg-rose-300/15 px-3 py-2 text-xs text-rose-100">
                  {complaintError}
                </p>
              )}
            </article>
          </div>
        </div>
      </section>

      <section id="deceased-members" className="mt-8 scroll-mt-24">
        <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-[#fff9f3] via-[#f6fbff] to-[#f3fff8] p-5 shadow-card dark:border-white/20 dark:from-[#121f2c] dark:via-[#112635] dark:to-[#143428]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-coral/15 text-coral dark:bg-orange-200/20 dark:text-orange-100">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                    <path d="M12 4v16" />
                    <path d="M5 11h14" />
                    <path d="M8 20h8" />
                  </svg>
                </span>
                প্রয়াত সদস্য
              </h3>
              <p className="mt-1 text-sm text-ink/75 dark:text-white/75">ছবি সহ স্মরণ তালিকা</p>
            </div>
            <span className="rounded-full border border-coral/30 bg-coral/10 px-3 py-1 text-xs font-semibold text-coral dark:border-orange-200/35 dark:bg-orange-200/10 dark:text-orange-100">
              মোট: {liveDeceasedMembers.length}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 700px' }}>
            {visibleDeceasedMembers.map((member) => (
              <article
                key={member.id || `${member.name}-${member.tenure}`}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 transition hover:border-coral/35 hover:shadow-sm dark:border-white/15 dark:bg-white/5 dark:hover:border-orange-200/40"
                role="button"
                tabIndex={0}
                onClick={() => openDeceasedProfileModal(member)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openDeceasedProfileModal(member)
                  }
                }}
                aria-label={`${member.name} এর প্রোফাইল দেখুন`}
              >
                <img
                  src={member.photoUrl || memberPlaceholderImage}
                  alt={`${member.name} ছবি`}
                  className="h-16 w-14 shrink-0 cursor-zoom-in rounded-md border border-ink/15 object-cover dark:border-white/20"
                  onClick={(event) => {
                    event.stopPropagation()
                    openPersonPhotoModal(member.name, member.photoUrl)
                  }}
                  onError={(event) => {
                    event.currentTarget.src = memberPlaceholderImage
                  }}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-ink dark:text-white">{member.name}</h4>
                  <p className="text-xs text-river dark:text-sky-200">{member.role}</p>
                  <p className="text-xs text-ink/65 dark:text-white/70">সময়কাল: {member.tenure}</p>
                </div>
              </article>
            ))}
          </div>

          {deceasedTotalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/75 px-3 py-2 dark:border-white/15 dark:bg-white/10">
              <p className="text-xs font-semibold text-ink/70 dark:text-white/75">
                পেজ {deceasedPage} / {deceasedTotalPages}
              </p>

              <div className="flex items-center gap-1.5 sm:hidden">
                <button
                  type="button"
                  onClick={() => setDeceasedPage((current) => Math.max(1, current - 1))}
                  disabled={deceasedPage === 1}
                  className="rounded-lg border border-ink/20 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  Previous
                </button>
                {deceasedCompactPageItems.map((item, index) => (
                  item === 'start-ellipsis' || item === 'end-ellipsis'
                    ? (
                      <span
                        key={`deceased-mobile-ellipsis-${index}`}
                        className="px-1 text-xs font-bold text-ink/60 dark:text-white/70"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                      )
                    : (
                      <button
                        key={`deceased-mobile-page-${item}`}
                        type="button"
                        onClick={() => setDeceasedPage(item)}
                        aria-current={deceasedPage === item ? 'page' : undefined}
                        className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                          deceasedPage === item
                            ? 'border border-river/45 bg-river text-white dark:border-sky-200/60 dark:bg-sky-200 dark:text-[#102439]'
                            : 'border border-ink/20 bg-white text-ink hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
                        }`}
                      >
                        {item}
                      </button>
                      )
                ))}
                <button
                  type="button"
                  onClick={() => setDeceasedPage((current) => Math.min(deceasedTotalPages, current + 1))}
                  disabled={deceasedPage === deceasedTotalPages}
                  className="rounded-lg border border-river/35 bg-river/10 px-2.5 py-1.5 text-[11px] font-semibold text-river transition hover:bg-river/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-200/35 dark:bg-sky-200/10 dark:text-sky-100 dark:hover:bg-sky-200/20"
                >
                  Next
                </button>
              </div>

              <div className="hidden flex-wrap items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setDeceasedPage((current) => Math.max(1, current - 1))}
                  disabled={deceasedPage === 1}
                  className="rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  Previous
                </button>
                {deceasedPageNumbers.map((pageNumber) => (
                  <button
                    key={`deceased-page-${pageNumber}`}
                    type="button"
                    onClick={() => setDeceasedPage(pageNumber)}
                    aria-current={deceasedPage === pageNumber ? 'page' : undefined}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      deceasedPage === pageNumber
                        ? 'border border-river/45 bg-river text-white dark:border-sky-200/60 dark:bg-sky-200 dark:text-[#102439]'
                        : 'border border-ink/20 bg-white text-ink hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDeceasedPage((current) => Math.min(deceasedTotalPages, current + 1))}
                  disabled={deceasedPage === deceasedTotalPages}
                  className="rounded-lg border border-river/35 bg-river/10 px-3 py-1.5 text-xs font-semibold text-river transition hover:bg-river/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-200/35 dark:bg-sky-200/10 dark:text-sky-100 dark:hover:bg-sky-200/20"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="donor-members" className="mt-6 scroll-mt-24">
        <div className="rounded-3xl border border-ink/10 bg-gradient-to-br from-[#f4fbff] via-[#f8fff8] to-[#fffdf5] p-5 shadow-card dark:border-white/20 dark:from-[#122134] dark:via-[#102b28] dark:to-[#2a2513]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-ink dark:text-white">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-river/15 text-river dark:bg-sky-200/20 dark:text-sky-100">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                    <path d="M7.5 7.5 16.5 16.5" />
                    <path d="M16.5 7.5 7.5 16.5" />
                  </svg>
                </span>
                প্রাথমিক সদস্য
              </h3>
              <p className="mt-1 text-sm text-ink/75 dark:text-white/75">ছবি সহ প্রাথমিক সদস্য তালিকা</p>
            </div>
            <span className="rounded-full border border-river/30 bg-river/10 px-3 py-1 text-xs font-semibold text-river dark:border-sky-200/35 dark:bg-sky-200/10 dark:text-sky-100">
              মোট: {livePrimaryMembers.length}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" style={{ contentVisibility: 'auto', containIntrinsicSize: '1px 700px' }}>
            {visibleDonorMembers.map((member) => (
              <article
                key={member.id ?? `${member.name}-${member.tenure}`}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 transition hover:border-river/35 hover:shadow-sm dark:border-white/15 dark:bg-white/5 dark:hover:border-sky-200/40"
                role="button"
                tabIndex={0}
                onClick={() => openDonorProfileModal(member)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openDonorProfileModal(member)
                  }
                }}
                aria-label={`${member.name} এর প্রোফাইল দেখুন`}
              >
                <img
                  src={member.photoUrl || memberPlaceholderImage}
                  alt={`${member.name} ছবি`}
                  className="h-16 w-14 shrink-0 cursor-zoom-in rounded-md border border-ink/15 object-cover dark:border-white/20"
                  onClick={(event) => {
                    event.stopPropagation()
                    openPersonPhotoModal(member.name, member.photoUrl)
                  }}
                  onError={(event) => {
                    event.currentTarget.src = memberPlaceholderImage
                  }}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-ink dark:text-white">{member.name}</h4>
                  <p className="text-xs text-river dark:text-sky-200">{member.role}</p>
                  <p className="text-xs text-ink/65 dark:text-white/70">সময়কাল: {member.tenure}</p>
                </div>
              </article>
            ))}
          </div>

          {donorTotalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/75 px-3 py-2 dark:border-white/15 dark:bg-white/10">
              <p className="text-xs font-semibold text-ink/70 dark:text-white/75">
                পেজ {donorPage} / {donorTotalPages}
              </p>

              <div className="flex items-center gap-1.5 sm:hidden">
                <button
                  type="button"
                  onClick={() => setDonorPage((current) => Math.max(1, current - 1))}
                  disabled={donorPage === 1}
                  className="rounded-lg border border-ink/20 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  Previous
                </button>
                {donorCompactPageItems.map((item, index) => (
                  item === 'start-ellipsis' || item === 'end-ellipsis'
                    ? (
                      <span
                        key={`donor-mobile-ellipsis-${index}`}
                        className="px-1 text-xs font-bold text-ink/60 dark:text-white/70"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                      )
                    : (
                      <button
                        key={`donor-mobile-page-${item}`}
                        type="button"
                        onClick={() => setDonorPage(item)}
                        aria-current={donorPage === item ? 'page' : undefined}
                        className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                          donorPage === item
                            ? 'border border-river/45 bg-river text-white dark:border-sky-200/60 dark:bg-sky-200 dark:text-[#102439]'
                            : 'border border-ink/20 bg-white text-ink hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
                        }`}
                      >
                        {item}
                      </button>
                      )
                ))}
                <button
                  type="button"
                  onClick={() => setDonorPage((current) => Math.min(donorTotalPages, current + 1))}
                  disabled={donorPage === donorTotalPages}
                  className="rounded-lg border border-river/35 bg-river/10 px-2.5 py-1.5 text-[11px] font-semibold text-river transition hover:bg-river/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-200/35 dark:bg-sky-200/10 dark:text-sky-100 dark:hover:bg-sky-200/20"
                >
                  Next
                </button>
              </div>

              <div className="hidden flex-wrap items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setDonorPage((current) => Math.max(1, current - 1))}
                  disabled={donorPage === 1}
                  className="rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  Previous
                </button>
                {donorPageNumbers.map((pageNumber) => (
                  <button
                    key={`donor-page-${pageNumber}`}
                    type="button"
                    onClick={() => setDonorPage(pageNumber)}
                    aria-current={donorPage === pageNumber ? 'page' : undefined}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                      donorPage === pageNumber
                        ? 'border border-river/45 bg-river text-white dark:border-sky-200/60 dark:bg-sky-200 dark:text-[#102439]'
                        : 'border border-ink/20 bg-white text-ink hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDonorPage((current) => Math.min(donorTotalPages, current + 1))}
                  disabled={donorPage === donorTotalPages}
                  className="rounded-lg border border-river/35 bg-river/10 px-3 py-1.5 text-xs font-semibold text-river transition hover:bg-river/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-200/35 dark:bg-sky-200/10 dark:text-sky-100 dark:hover:bg-sky-200/20"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside
        className="mt-10 mb-8 w-full rounded-2xl bg-gradient-to-r from-coral to-river px-6 py-5 text-white"
        aria-label="স্পনসরড ব্যানার"
      >
        <p className="text-xs uppercase tracking-widest">Sponsored Banner</p>
        <p className="mt-1 text-lg font-semibold sm:text-xl">জাতীয় উন্নয়ন ও স্থানীয় উদ্যোগের পাশে</p>
      </aside>

      <footer
        id="contact"
        className="relative left-1/2 mt-0 w-[100dvw] max-w-[100dvw] -translate-x-1/2 scroll-mt-24 overflow-hidden border-y border-white/10 bg-gradient-to-br from-[#091722] via-[#0e2536] to-[#173844] px-3 py-8 text-white shadow-card sm:px-4"
      >
        <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-coral/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-mint/10 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-[1200px]">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/25 bg-white/95 shadow-sm">
                <img
                  src={siteLogo}
                  alt={`${siteName} logo`}
                  className="h-full w-full object-contain p-1"
                  loading="lazy"
                />
              </span>
              <h4 className="font-display text-2xl font-bold text-white">{siteName}</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/82">
              স্বাধীন, দায়িত্বশীল ও আধুনিক সাংবাদিকতার চর্চায় কুমিল্লা প্রেস ক্লাব দীর্ঘদিন ধরে আস্থা, পেশাদারিত্ব ও জনস্বার্থভিত্তিক সংবাদকর্মের একটি শক্তিশালী প্ল্যাটফর্ম।
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/72">
              সদস্য উন্নয়ন, তথ্যভিত্তিক প্রতিবেদন এবং গণমাধ্যমের নৈতিক মানদণ্ড রক্ষায় আমরা প্রতিশ্রুতিবদ্ধ।
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <h5 className="text-base font-semibold text-mint">গুরুত্বপূর্ণ লিংক</h5>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              {footerImportantLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.url} className="inline-flex items-center gap-2 transition hover:text-mint">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <h5 className="text-base font-semibold text-mint">স্থানীয় পত্রিকার লিঙ্ক</h5>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              {footerLocalNewspaperLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-mint">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <h5 className="text-base font-semibold text-mint">যোগাযোগ ও মানচিত্র</h5>
            <div className="mt-3 space-y-1.5 text-sm text-white/85">
              <p>ঠিকানা: {contactAddress}</p>
              <p>ফোন: {contactPhone}</p>
              <p>ইমেইল: {contactEmail}</p>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-white/20">
              <iframe
                title="Cumilla Press Club Map"
                src={mapEmbedUrl}
                className="h-36 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <div>
              <h5 className="text-base font-semibold text-mint">সোশ্যাল মিডিয়া</h5>
              <p className="mt-1 text-xs text-white/70">আপডেট পেতে আমাদের অফিসিয়াল চ্যানেলগুলোতে যুক্ত থাকুন</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 transition hover:bg-white/20">
                <span aria-hidden="true">f</span>
                Facebook
              </a>
              <a href={youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 transition hover:bg-white/20">
                <span aria-hidden="true">▶</span>
                YouTube
              </a>
              <a href={twitterUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 transition hover:bg-white/20">
                <span aria-hidden="true">X</span>
                X (Twitter)
              </a>
            </div>
          </div>

          <div className="relative mt-7 border-t border-white/20 pt-4 text-sm text-white/75 md:flex md:items-center md:justify-between">
            <p>© ২০২৬ কুমিল্লা প্রেস ক্লাব। সর্বস্বত্ব সংরক্ষিত।</p>
            <p className="mt-2 md:mt-0">
              Developed by{' '}
              <a
                href="https://a2technologiesbd.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-mint underline decoration-mint/60 underline-offset-2 hover:text-white"
              >
                A2 Technologies
              </a>
            </p>
          </div>

          <div className="mt-4 text-center text-sm text-white/80">
            {creditLine1 && <p>{creditLine1}</p>}
            {creditLine2 && <p>{creditLine2}</p>}
            {creditLine3 && <p>{creditLine3}</p>}
          </div>
        </div>
      </footer>

      {selectedProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/65 p-4 backdrop-blur-[1px]"
          onClick={closeProfileModal}
          role="presentation"
        >
          <article
            className="w-full max-w-xl rounded-3xl border border-ink/15 bg-white p-5 shadow-2xl dark:border-white/20 dark:bg-[#0f1722]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="প্রোফাইল ডিটেইলস"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfile.photoUrl || memberPlaceholderImage}
                  alt={`${selectedProfile.name} প্রোফাইল ছবি`}
                  className="h-24 w-20 shrink-0 cursor-zoom-in rounded-lg border border-ink/15 object-cover shadow-sm dark:border-white/20"
                  onClick={() => {
                    openPersonPhotoModal(selectedProfile.name, selectedProfile.photoUrl)
                  }}
                  onError={(event) => {
                    event.currentTarget.src = memberPlaceholderImage
                  }}
                  loading="lazy"
                />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-river dark:text-sky-200">
                    {selectedProfileGroup === 'leadership'
                      ? 'নেতৃত্ব'
                      : selectedProfileGroup === 'committee'
                        ? 'নির্বাহী কমিটি'
                        : 'নিবন্ধিত সদস্য'}
                  </p>
                  <h4 className="text-xl font-bold text-ink dark:text-white">{selectedProfile.name}</h4>
                  <p className="text-sm font-medium text-ink/75 dark:text-white/75">{selectedProfile.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeProfileModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition hover:bg-ink/5 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
                aria-label="প্রোফাইল বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-ink/10 bg-ink/5 p-4 dark:border-white/15 dark:bg-white/5">
              {selectedProfile.message ? (
                <p className="text-sm leading-relaxed text-ink/85 dark:text-white/85">{selectedProfile.message}</p>
              ) : (
                <p className="text-sm leading-relaxed text-ink/75 dark:text-white/75">এই সদস্যের বিস্তারিত প্রোফাইল তথ্য শিগগিরই যুক্ত হবে।</p>
              )}

              {selectedProfile.media && (
                <p className="text-sm text-ink/80 dark:text-white/80">
                  <strong>মিডিয়া:</strong> {selectedProfile.media}
                </p>
              )}
              {selectedProfile.email && (
                <p className="text-sm text-ink/80 dark:text-white/80">
                  <strong>ইমেইল:</strong> {selectedProfile.email}
                </p>
              )}
              {selectedProfile.phone && (
                <p className="text-sm text-ink/80 dark:text-white/80">
                  <strong>ফোন:</strong> {selectedProfile.phone}
                </p>
              )}
              {selectedProfile.social && (
                <p className="text-sm text-ink/80 dark:text-white/80">
                  <strong>সোশ্যাল:</strong> {selectedProfile.social}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closeProfileModal}
                className="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                বন্ধ করুন
              </button>
            </div>
          </article>
        </div>
      )}

      {selectedDeceasedMember && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-ink/65 p-4 backdrop-blur-[1px]"
          onClick={closeDeceasedProfileModal}
          role="presentation"
        >
          <article
            className="w-full max-w-lg rounded-3xl border border-ink/15 bg-white p-5 shadow-2xl dark:border-white/20 dark:bg-[#0f1722]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="প্রয়াত সদস্য প্রোফাইল"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDeceasedMember.photoUrl || memberPlaceholderImage}
                  alt={`${selectedDeceasedMember.name} প্রোফাইল ছবি`}
                  className="h-24 w-20 shrink-0 cursor-zoom-in rounded-lg border border-ink/15 object-cover shadow-sm dark:border-white/20"
                  onClick={() => {
                    openPersonPhotoModal(selectedDeceasedMember.name, selectedDeceasedMember.photoUrl)
                  }}
                  onError={(event) => {
                    event.currentTarget.src = memberPlaceholderImage
                  }}
                  loading="lazy"
                />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-coral dark:text-orange-100">স্মরণে</p>
                  <h4 className="text-xl font-bold text-ink dark:text-white">{selectedDeceasedMember.name}</h4>
                  <p className="text-sm font-medium text-ink/75 dark:text-white/75">{selectedDeceasedMember.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDeceasedProfileModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition hover:bg-ink/5 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
                aria-label="প্রয়াত সদস্য প্রোফাইল বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-ink/10 bg-ink/5 p-4 dark:border-white/15 dark:bg-white/5">
              <p className="text-sm text-ink/80 dark:text-white/80">
                <strong>পদবী:</strong> {selectedDeceasedMember.role}
              </p>
              <p className="text-sm text-ink/80 dark:text-white/80">
                <strong>সময়কাল:</strong> {selectedDeceasedMember.tenure}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closeDeceasedProfileModal}
                className="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                বন্ধ করুন
              </button>
            </div>
          </article>
        </div>
      )}

      {selectedDonorMember && (
        <div
          className="fixed inset-0 z-[56] flex items-center justify-center bg-ink/65 p-4 backdrop-blur-[1px]"
          onClick={closeDonorProfileModal}
          role="presentation"
        >
          <article
            className="w-full max-w-lg rounded-3xl border border-ink/15 bg-white p-5 shadow-2xl dark:border-white/20 dark:bg-[#0f1722]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="প্রাথমিক সদস্য প্রোফাইল"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDonorMember.photoUrl || memberPlaceholderImage}
                  alt={`${selectedDonorMember.name} প্রোফাইল ছবি`}
                  className="h-24 w-20 shrink-0 cursor-zoom-in rounded-lg border border-ink/15 object-cover shadow-sm dark:border-white/20"
                  onClick={() => {
                    openPersonPhotoModal(selectedDonorMember.name, selectedDonorMember.photoUrl)
                  }}
                  onError={(event) => {
                    event.currentTarget.src = memberPlaceholderImage
                  }}
                  loading="lazy"
                />
                <div>
                  <p className="text-xs font-semibold tracking-wide text-river dark:text-sky-200">সম্মাননায়</p>
                  <h4 className="text-xl font-bold text-ink dark:text-white">{selectedDonorMember.name}</h4>
                  <p className="text-sm font-medium text-ink/75 dark:text-white/75">{selectedDonorMember.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDonorProfileModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition hover:bg-ink/5 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
                aria-label="প্রাথমিক সদস্য প্রোফাইল বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl border border-ink/10 bg-ink/5 p-4 dark:border-white/15 dark:bg-white/5">
              <p className="text-sm text-ink/80 dark:text-white/80">
                <strong>পদবী:</strong> {selectedDonorMember.role}
              </p>
              <p className="text-sm text-ink/80 dark:text-white/80">
                <strong>সময়কাল:</strong> {selectedDonorMember.tenure}
              </p>
              {selectedDonorMember.contribution && (
                <p className="text-sm text-ink/80 dark:text-white/80">
                  <strong>অবদান:</strong> {selectedDonorMember.contribution}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closeDonorProfileModal}
                className="rounded-xl bg-river px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                বন্ধ করুন
              </button>
            </div>
          </article>
        </div>
      )}

      {selectedNotice && (
        <div
          className="fixed inset-0 z-[56] flex items-center justify-center bg-ink/65 p-4 backdrop-blur-[1px]"
          onClick={closeNoticeModal}
          role="presentation"
        >
          <article
            className="w-full max-w-lg rounded-3xl border border-ink/15 bg-white p-5 shadow-2xl dark:border-white/20 dark:bg-[#0f1722]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="নোটিশ বিস্তারিত"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-river dark:text-sky-200">নোটিশ</p>
                <h4 className="mt-1 text-xl font-bold text-ink dark:text-white">{selectedNotice.title}</h4>
                <p className="mt-1 text-sm text-ink/70 dark:text-white/70">প্রকাশ: {selectedNotice.date || '—'}</p>
              </div>
              <button
                type="button"
                onClick={closeNoticeModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition hover:bg-ink/5 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
                aria-label="নোটিশ বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-ink/10 bg-ink/5 p-4 dark:border-white/15 dark:bg-white/5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80 dark:text-white/80">
                {selectedNotice.details || 'এই নোটিশের অতিরিক্ত বিবরণ নেই।'}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {selectedNotice.url && (
                <a
                  href={selectedNotice.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-river px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  PDF ডাউনলোড
                </a>
              )}
              <button
                type="button"
                onClick={closeNoticeModal}
                className="rounded-xl border border-ink/20 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                বন্ধ করুন
              </button>
            </div>
          </article>
        </div>
      )}

      {activeVideo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
          onClick={closeVideoModal}
          role="presentation"
        >
          <article
            className="w-full max-w-4xl rounded-2xl border border-white/20 bg-[#0b1220] p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="ভিডিও প্লেয়ার"
          >
            <div className="mb-2 flex items-center justify-between gap-3 px-1 py-1">
              <h4 className="line-clamp-1 text-sm font-semibold text-white sm:text-base">{activeVideo.title}</h4>
              <button
                type="button"
                onClick={closeVideoModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 text-white/90 transition hover:bg-white/10"
                aria-label="ভিডিও বন্ধ করুন"
              >
                ✕
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-black">
              <iframe
                className="aspect-video w-full"
                src={getYoutubeEmbedUrl(activeVideo.youtubeUrl)}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex justify-end">
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-coral px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
              >
                YouTube এ খুলুন
              </a>
            </div>
          </article>
        </div>
      )}

      {activePhoto && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"
          onClick={closePhotoModal}
          role="presentation"
        >
          <article
            className={`w-full overflow-hidden rounded-2xl border border-white/20 bg-[#0b1220] p-3 shadow-2xl ${activePhoto.isProfileImage ? 'max-w-md' : 'max-w-5xl'}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="ছবি জুম প্রিভিউ"
          >
            <div className="mb-2 flex items-center justify-between gap-3 px-1 py-1">
              <h4 className="line-clamp-1 text-sm font-semibold text-white sm:text-base">{activePhoto.title}</h4>
              <button
                type="button"
                onClick={closePhotoModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 text-white/90 transition hover:bg-white/10"
                aria-label="ছবি বন্ধ করুন"
              >
                ✕
              </button>
            </div>
            <div className="overflow-hidden rounded-xl bg-black/60">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className={activePhoto.isProfileImage
                  ? 'mx-auto h-[320px] w-[240px] max-w-full rounded-lg object-cover sm:h-[420px] sm:w-[300px]'
                  : 'max-h-[78vh] w-full object-contain'}
              />
            </div>
          </article>
        </div>
      )}

      {isAllMembersModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-[1px]"
          onClick={closeAllMembersModal}
          role="presentation"
        >
          <article
            className="w-full max-w-3xl rounded-3xl border border-ink/15 bg-white p-5 shadow-2xl dark:border-white/20 dark:bg-[#0f1722]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="সকল সদস্য তালিকা"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xl font-bold text-ink dark:text-white">সকল সদস্য</h4>
                <p className="text-sm text-ink/70 dark:text-white/75">মোট সদস্য: {membersByDesignation.length}</p>
              </div>
              <button
                type="button"
                onClick={closeAllMembersModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-ink/70 transition hover:bg-ink/5 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10"
                aria-label="সদস্য তালিকা বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[68vh] space-y-2 overflow-y-auto pr-1">
              {membersByDesignation.map((member) => (
                <article
                  key={`all-${member.id}`}
                  className="cursor-pointer rounded-xl border border-ink/10 bg-white p-3 transition hover:border-river/35 hover:shadow-sm dark:border-white/15 dark:bg-white/5 dark:hover:border-sky-300/40"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    closeAllMembersModal()
                    openProfileModal(member.profile, member.group)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      closeAllMembersModal()
                      openProfileModal(member.profile, member.group)
                    }
                  }}
                  aria-label={`${member.name} এর প্রোফাইল দেখুন`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <img
                        src={member.photoUrl}
                        alt={`${member.name} ছবি`}
                        className="h-14 w-11 shrink-0 cursor-zoom-in rounded-md border border-ink/15 object-cover dark:border-white/20"
                        onClick={(event) => {
                          event.stopPropagation()
                          openPersonPhotoModal(member.name, member.photoUrl)
                        }}
                        onError={(event) => {
                          event.currentTarget.src = memberPlaceholderImage
                        }}
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h5 className="truncate font-semibold text-ink dark:text-white">{member.name}</h5>
                        <p className="text-sm text-river dark:text-sky-200">{member.role}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-coral/15 px-2.5 py-0.5 text-xs font-semibold text-coral dark:bg-coral/25 dark:text-orange-100">{member.id}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink/75 dark:text-white/80">মিডিয়া: {member.media}</p>
                  <p className="mt-1 text-xs text-ink/65 dark:text-white/70">ফোন: {member.phone}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      )}
    </main>
  )
}
