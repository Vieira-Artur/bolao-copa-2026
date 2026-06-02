import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Ranking' },
    { to: '/jogos', label: 'Jogos' },
  ]

  return (
    <header className="bg-green-800 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-wide">
          Bolão dos Corneteiros ⚽
        </Link>
        <nav className="flex gap-4">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium hover:text-green-200 transition-colors ${
                pathname === l.to ? 'text-yellow-300' : 'text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
