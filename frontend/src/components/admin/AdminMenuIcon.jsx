const iconClass = 'h-4 w-4 shrink-0'

function Icon({ children }) {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const icons = {
  'breaking-news': (
    <Icon>
      <path d="M4 7h12v10H4z" />
      <path d="M16 10l4-2v8l-4-2" />
      <path d="M7 10h6" />
      <path d="M7 13h4" />
    </Icon>
  ),
  'featured-news': (
    <Icon>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
      <path d="M4 17l4-3 3 2 5-5 4 3" />
    </Icon>
  ),
  'hero-highlights': (
    <Icon>
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </Icon>
  ),
  'discussed-topics': (
    <Icon>
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M9 17h6" />
      <circle cx="5" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="17" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  ),
  'media-gallery': (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M3 16l5-4 3 2 4-4 6 5" />
    </Icon>
  ),
  slider: (
    <Icon>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </Icon>
  ),
  'notices-events': (
    <Icon>
      <path d="M7 4h10v16l-5-3-5 3V4Z" />
      <path d="M9 8h6" />
      <path d="M9 12h4" />
    </Icon>
  ),
  spotlight: (
    <Icon>
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M5 8l2 2" />
      <path d="M17 14l2 2" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <circle cx="12" cy="12" r="4" />
    </Icon>
  ),
  leadership: (
    <Icon>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </Icon>
  ),
  committee: (
    <Icon>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3.5 19c.8-2.5 2.4-3.8 4.5-3.8" />
      <path d="M20.5 19c-.8-2.5-2.4-3.8-4.5-3.8" />
      <circle cx="12" cy="11" r="2.5" />
      <path d="M8 19c.9-2.4 2.5-3.5 4-3.5s3.1 1.1 4 3.5" />
    </Icon>
  ),
  members: (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M8 16c1-2 2.5-3 4-3s3 1 4 3" />
    </Icon>
  ),
  archive: (
    <Icon>
      <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
      <path d="M3 7h18V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2Z" />
      <path d="M10 12h4" />
    </Icon>
  ),
  deceased: (
    <Icon>
      <path d="M12 4v16" />
      <path d="M6 10h12" />
      <circle cx="12" cy="10" r="6" />
    </Icon>
  ),
  primary: (
    <Icon>
      <path d="M12 3l2.2 4.5L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.7L12 3Z" />
    </Icon>
  ),
  'page-settings': (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2" />
      <path d="M12 18.8V21" />
      <path d="M4.9 6.3l1.6 1.6" />
      <path d="M17.5 16.1l1.6 1.6" />
      <path d="M3 12h2.2" />
      <path d="M18.8 12H21" />
      <path d="M4.9 17.7l1.6-1.6" />
      <path d="M17.5 7.9l1.6-1.6" />
    </Icon>
  ),
  account: (
    <Icon>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="16" r="1.2" />
    </Icon>
  )
}

export function AdminMenuIcon({ id }) {
  return icons[id] || icons['page-settings']
}
