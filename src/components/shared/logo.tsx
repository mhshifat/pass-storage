interface LogoProps {
  className?: string
}

export function Logo({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer shield */}
      <path
        d="M50 10L15 25V45C15 65 25 80 50 90C75 80 85 65 85 45V25L50 10Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.2"
      />
      
      {/* Inner shield border */}
      <path
        d="M50 10L15 25V45C15 65 25 80 50 90C75 80 85 65 85 45V25L50 10Z"
        stroke="currentColor"
        strokeWidth="3"
        className="text-primary"
        fill="none"
      />
      
      {/* Lock body */}
      <rect
        x="35"
        y="50"
        width="30"
        height="25"
        rx="3"
        fill="currentColor"
        className="text-primary"
      />
      
      {/* Lock shackle */}
      <path
        d="M42 50V42C42 37.5817 45.5817 34 50 34C54.4183 34 58 37.5817 58 42V50"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="text-primary"
        fill="none"
      />
      
      {/* Keyhole */}
      <circle
        cx="50"
        cy="60"
        r="3.5"
        fill="currentColor"
        className="text-primary-foreground"
      />
      <rect
        x="48.5"
        y="62"
        width="3"
        height="7"
        rx="1.5"
        fill="currentColor"
        className="text-primary-foreground"
      />
      
      {/* Decorative dots */}
      <circle cx="28" cy="35" r="2" fill="currentColor" className="text-primary" opacity="0.4" />
      <circle cx="72" cy="35" r="2" fill="currentColor" className="text-primary" opacity="0.4" />
      <circle cx="50" cy="20" r="2" fill="currentColor" className="text-primary" opacity="0.6" />
    </svg>
  )
}
