import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
