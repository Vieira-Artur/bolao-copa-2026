import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Ranking } from './pages/Ranking'
import { Participante } from './pages/Participante'
import { MeusPalpites } from './pages/MeusPalpites'
import { Jogos } from './pages/Jogos'
import { Admin } from './pages/Admin'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Ranking />} />
          <Route path="/participante/:nome" element={<Participante />} />
          <Route path="/jogos" element={<Jogos />} />
        </Route>
        <Route path="/p/:token" element={<MeusPalpites />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
