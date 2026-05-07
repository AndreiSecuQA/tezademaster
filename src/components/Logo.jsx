export function Logo({ size = 32, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-label="Teza de Master"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logo-grad)" />
      <path
        d="M20 18h18l8 8v22a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V22a4 4 0 0 1 4-4z"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M38 18v8h8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M44 11l1.6 3.4L49 16l-3.4 1.6L44 21l-1.6-3.4L39 16l3.4-1.6z" fill="#fff" />
      <circle cx="26" cy="40" r="1.4" fill="#fff" />
      <circle cx="32" cy="40" r="1.4" fill="#fff" />
      <circle cx="38" cy="40" r="1.4" fill="#fff" />
    </svg>
  )
}
