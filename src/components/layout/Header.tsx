import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Ranking' },
    { to: '/jogos', label: 'Jogos' },
  ]

  return (
    <header style={{
      background: 'linear-gradient(180deg, #081625 0%, #0C1B2E 100%)',
      borderBottom: '1px solid rgba(0, 209, 102, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              background: 'var(--green-dim)',
              border: '1px solid rgba(0, 209, 102, 0.3)',
              borderRadius: '8px',
              fontSize: '16px',
            }}>⚽</span>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text)',
                lineHeight: 1.1,
              }}>
                Bolão dos Corneteiros
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.65rem',
                color: 'var(--green)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                Copa do Mundo 2026
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: '4px' }}>
            {links.map(l => {
              const active = pathname === l.to
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    color: active ? '#07111D' : 'var(--text-muted)',
                    background: active ? 'var(--green)' : 'transparent',
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
