import { AuthProvider, useAuth } from './context/AuthContext'
import { CompanyProvider } from './context/CompanyContext'
import Login, { CuentaPendiente, PerfilNoEncontrado, AuthLoading } from './pages/Login'
import AppShell from './layout/AppShell'

// ── AuthGate ──────────────────────────────────────────────────────────────────
function AuthGate() {
  const { loading, session, perfil, perfilLoading } = useAuth()
  if (loading)                    return <AuthLoading />
  if (!session)                   return <Login />
  if (!perfil && perfilLoading)   return <AuthLoading />
  if (!perfil)                    return <PerfilNoEncontrado />
  if (!perfil.activo)             return <CuentaPendiente />
  return (
    <CompanyProvider>
      <AppShell />
    </CompanyProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
