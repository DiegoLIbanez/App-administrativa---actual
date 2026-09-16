import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Activity, Mail, Lock, Eye, EyeOff, AlertCircle,
  CheckCircle2, Loader2, Clock, LogOut, ArrowLeft,
} from 'lucide-react'

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="password-field">
      <input
        className="form-control"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

function Brand() {
  return (
    <div className="auth-brand">
      <Activity size={22} strokeWidth={2.5} />
      <span>AmeriGlobal</span>
    </div>
  )
}

// ─── Pantalla: establecer nueva contraseña (viene del link de recuperación) ──
function NuevaPasswordForm() {
  const { updatePassword, clearRecoveryMode, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    setLoading(true)
    const { error: err } = await updatePassword(password)
    setLoading(false)
    if (err) return setError('No se pudo actualizar la contraseña: ' + err.message)
    setDone(true)
    setTimeout(() => clearRecoveryMode(), 1600)
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Brand />
        {done ? (
          <>
            <div className="auth-pending-icon" style={{ background: '#DCFCE7', color: '#166534' }}>
              <CheckCircle2 size={26} />
            </div>
            <h1 className="auth-title" style={{ textAlign: 'center' }}>Contraseña actualizada</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>Ya puedes continuar usando la aplicación.</p>
          </>
        ) : (
          <>
            <h1 className="auth-title">Crea una nueva contraseña</h1>
            <p className="auth-subtitle">Escríbela dos veces para confirmar.</p>
            {error && (
              <div className="alert alert-error"><AlertCircle size={15} /> {error}</div>
            )}
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Nueva contraseña</label>
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label>Confirmar contraseña</label>
                <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" autoComplete="new-password" />
              </div>
              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? <Loader2 size={15} className="spin" /> : <Lock size={15} />}
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
            <div className="auth-footer-link">
              <button onClick={signOut}>Cancelar y cerrar sesión</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Pantalla: cuenta creada pero aún no aprobada por un admin ───────────────
export function CuentaPendiente() {
  const { signOut, refreshPerfil, perfilLoading, perfil } = useAuth()
  const [checking, setChecking] = useState(false)

  const reintentar = async () => {
    setChecking(true)
    await refreshPerfil()
    setChecking(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-pending-card">
        <div className="auth-pending-icon"><Clock size={26} /></div>
        <h1 className="auth-title">Cuenta pendiente de aprobación</h1>
        <p className="auth-subtitle" style={{ marginBottom: 24 }}>
          Hola{perfil?.nombre_completo ? `, ${perfil.nombre_completo}` : ''}. Tu cuenta ({perfil?.correo}) fue
          creada correctamente, pero un administrador debe activarla antes de que puedas ingresar.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={signOut}>
            <LogOut size={15} /> Cerrar sesión
          </button>
          <button className="btn btn-primary" onClick={reintentar} disabled={checking || perfilLoading}>
            {(checking || perfilLoading) ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
            Ya fui aprobado
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Pantalla: perfil no encontrado (caso raro / error de trigger) ──────────
export function PerfilNoEncontrado() {
  const { signOut, refreshPerfil } = useAuth()
  return (
    <div className="auth-shell">
      <div className="auth-pending-card">
        <div className="auth-pending-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
          <AlertCircle size={26} />
        </div>
        <h1 className="auth-title">No encontramos tu perfil</h1>
        <p className="auth-subtitle" style={{ marginBottom: 24 }}>
          Tu cuenta inició sesión correctamente, pero no existe un perfil asociado.
          Contacta al administrador del sistema.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={signOut}><LogOut size={15} /> Cerrar sesión</button>
          <button className="btn btn-primary" onClick={refreshPerfil}>Reintentar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Pantalla de carga inicial ───────────────────────────────────────────────
export function AuthLoading() {
  return (
    <div className="auth-loading-shell">
      <Loader2 size={28} className="spin" style={{ color: 'var(--primary)' }} />
      <span>Cargando...</span>
    </div>
  )
}

// ─── Login / Olvidé mi contraseña ───────────────────────────────────────────
export default function Login() {
  const { signIn, resetPassword, recoveryMode } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // El return condicional va DESPUÉS de declarar todos los hooks (regla de Hooks):
  // así el orden de hooks nunca cambia entre renders, sin importar recoveryMode.
  if (recoveryMode) return <NuevaPasswordForm />

  const reset = () => { setError(''); setInfo('') }
  const goTo = (m) => { reset(); setPassword(''); setMode(m) }

  const submitLogin = async (e) => {
    e.preventDefault()
    reset()
    if (!email.trim() || !password) return setError('Ingresa tu correo y tu contraseña.')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) setError(err.message === 'Invalid login credentials'
      ? 'Correo o contraseña incorrectos.'
      : err.message)
  }

  const submitForgot = async (e) => {
    e.preventDefault()
    reset()
    if (!email.trim()) return setError('Ingresa tu correo.')
    setLoading(true)
    const { error: err } = await resetPassword(email)
    setLoading(false)
    if (err) return setError(err.message)
    setInfo('Si el correo existe, te enviamos un enlace para restablecer tu contraseña.')
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Brand />

        {mode === 'forgot' ? (
          <>
            <button className="auth-footer-link" style={{ textAlign: 'left', marginBottom: 10 }} onClick={() => goTo('login')}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <ArrowLeft size={13} /> Volver
              </span>
            </button>
            <h1 className="auth-title">Recuperar contraseña</h1>
            <p className="auth-subtitle">Te enviaremos un enlace a tu correo para restablecerla.</p>

            {error && <div className="alert alert-error"><AlertCircle size={15} /> {error}</div>}
            {info && <div className="alert alert-success"><CheckCircle2 size={15} /> {info}</div>}

            <form onSubmit={submitForgot}>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@empresa.com" autoComplete="email" />
              </div>
              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? <Loader2 size={15} className="spin" /> : <Mail size={15} />}
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Iniciar sesión</h1>
            <p className="auth-subtitle">Ingresa con tu correo y contraseña.</p>

            {error && <div className="alert alert-error"><AlertCircle size={15} /> {error}</div>}
            {info && <div className="alert alert-success"><CheckCircle2 size={15} /> {info}</div>}

            <form onSubmit={submitLogin}>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@empresa.com" autoComplete="email" />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" autoComplete="current-password" />
              </div>
              <div className="auth-link-row">
                <button type="button" onClick={() => goTo('forgot')}>¿Olvidaste tu contraseña?</button>
              </div>
              <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
                {loading ? <Loader2 size={15} className="spin" /> : <Lock size={15} />}
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center' }}>
              ¿Necesitas una cuenta? Pídele a un administrador que te cree una desde la sección Usuarios.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
