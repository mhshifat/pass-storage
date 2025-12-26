import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PassBangla - Secure Password Manager'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 50%, #1a1a1a 100%)',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 10L15 25V45C15 65 25 80 50 90C75 80 85 65 85 45V25L50 10Z"
              fill="#6366f1"
              opacity="0.2"
            />
            <path
              d="M50 10L15 25V45C15 65 25 80 50 90C75 80 85 65 85 45V25L50 10Z"
              stroke="#6366f1"
              strokeWidth="3"
              fill="none"
            />
            <rect
              x="35"
              y="50"
              width="30"
              height="25"
              rx="3"
              fill="#6366f1"
            />
            <path
              d="M42 50V42C42 37.5817 45.5817 34 50 34C54.4183 34 58 37.5817 58 42V50"
              stroke="#6366f1"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle
              cx="50"
              cy="60"
              r="3.5"
              fill="#ffffff"
            />
            <rect
              x="48.5"
              y="62"
              width="3"
              height="7"
              rx="1.5"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            PassBangla
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#a78bfa',
              margin: '0',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            Secure Password Manager for Teams
          </p>
          <p
            style={{
              fontSize: '24px',
              color: '#9ca3af',
              margin: '20px 0 0 0',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Enterprise password management with client-side encryption
          </p>
        </div>

        {/* Security Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '40px',
            padding: '12px 24px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              color: '#10b981',
            }}
          >
            ✓
          </span>
          <span
            style={{
              fontSize: '18px',
              color: '#ffffff',
            }}
          >
            Zero-Knowledge Architecture • SOC 2 Compliant
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

