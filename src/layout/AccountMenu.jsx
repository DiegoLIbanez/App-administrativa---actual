import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { KeyRound, Palette, LogOut, ChevronUp } from 'lucide-react'

export default function AccountMenu({ onChangePassword, onChangeApariencia }) {
  const { user, perfil, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.account-dropdown-portal')) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setPos({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 6,
        width: Math.max(rect.width, 200),
      })
    }
    setOpen(o => !o)
  }

  const nombre = perfil?.nombre_completo || user?.email || 'Usuario'
  const inicial = nombre.trim().split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'

  return (
    <div className="account-menu" ref={ref}>
      {open && pos && createPortal(
        <div
          className="account-dropdown account-dropdown-portal"
          style={{ position: 'fixed', left: pos.left, bottom: pos.bottom, width: pos.width, right: 'auto' }}
        >
          <button
            className="account-dropdown-item"
            onClick={() => { setOpen(false); onChangePassword() }}
          >
            <KeyRound size={15} /> Cambiar contraseña
          </button>
          <button
            className="account-dropdown-item"
            onClick={() => { setOpen(false); onChangeApariencia() }}
          >
            <Palette size={15} /> Apariencia
          </button>
          <div className="account-dropdown-sep" />
          <button
            className="account-dropdown-item account-dropdown-item--danger"
            onClick={signOut}
          >
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>,
        document.body
      )}
      <button
        className="account-trigger"
        data-open={open ? 'true' : 'false'}
        onClick={toggleOpen}
        title={nombre}
      >
        <div className="account-avatar">{inicial}</div>
        <div className="account-info">
          <div className="account-name">{nombre}</div>
          <div className="account-email">{user?.email}</div>
        </div>
        <ChevronUp size={14} className="account-chevron" />
      </button>
    </div>
  )
}
