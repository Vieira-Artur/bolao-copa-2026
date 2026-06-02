import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { pathname } = useLocation()
  const links = [
    { to: '/', label: 'Ranking' },
    { to: '/jogos', label: 'Jogos' },
  ]

  return (
    <header style={{
      background: 'linear-gradient(180deg, #060E1A 0%, #0A1828 100%)',
      borderBottom: '1px solid rgba(0, 209, 102, 0.12)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Icon */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00D166 0%, #00A050 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 16px rgba(0,209,102,0.35)',
              flexShrink: 0,
            }}>
              ⚽
            </div>

            {/* Title block */}
            <div style={{ lineHeight: 1 }}>
              {/* Main title */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.75) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Bolão
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: '1.4rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--green)',
                }}>
                  dos
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.75) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Corneteiros
                </span>
              </div>

              {/* Subtitle strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '3px',
              }}>
                <div style={{
                  width: '16px',
                  height: '2px',
                  background: 'var(--green)',
                  borderRadius: '99px',
                }} />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}>
                  Copa do Mundo · FIFA 2026
                </span>
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: '2px' }}>
            {links.map(l => {
              const active = pathname === l.to
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    padding: '7px 16px',
                    borderRadius: '6px',
                    color: active ? '#060E1A' : 'var(--text-muted)',
                    background: active
                      ? 'linear-gradient(135deg, #00D166 0%, #00A850 100%)'
                      : 'transparent',
                    boxShadow: active ? '0 0 12px rgba(0,209,102,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

        </div>
      </div>
    </header>
  )
}
