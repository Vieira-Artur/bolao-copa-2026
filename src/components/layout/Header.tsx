import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

export function Header() {
  const { pathname } = useLocation()
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const links = [
    { to: '/', label: 'Ranking' },
    { to: '/jogos', label: 'Jogos' },
  ]

  return (
    <header style={{
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--header-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--icon-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 16px var(--green-glow)',
              flexShrink: 0,
            }}>
              ⚽
            </div>

            <div style={{ lineHeight: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text)',
                }}>
                  Bolão
                </span>
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 400,
                  fontSize: '1.35rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--green)',
                }}>
                  dos
                </span>
                <span style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text)',
                }}>
                  Corneteiros
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <div style={{ width: '16px', height: '2px', background: 'var(--green)', borderRadius: '99px' }} />
                <span style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}>
                  Copa do Mundo · FIFA 2026
                </span>
              </div>
            </div>
          </Link>

          {/* Right: nav + theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <nav style={{ display: 'flex', gap: '2px' }}>
              {links.map(l => {
                const active = pathname === l.to
                return (
                  <Link key={l.to} to={l.to} style={{
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    padding: '7px 16px',
                    borderRadius: '6px',
                    color: active ? (isDark ? '#060E1A' : '#FFFFFF') : 'var(--text-muted)',
                    background: active ? 'var(--green)' : 'transparent',
                    boxShadow: active ? '0 0 12px var(--green-glow)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {l.label}
                  </Link>
                )
              })}
            </nav>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'background 0.2s, border-color 0.2s',
                flexShrink: 0,
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
