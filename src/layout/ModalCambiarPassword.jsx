import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { X } from 'lucide-react'

export default function ModalCambiarPassword({ onClose }) {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (password.length < 6) return setMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
    if (password !== confirm) return setMsg({ type: 'error', text: 'Las contraseñas no coinciden.' })
    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) return setMsg({ type: 'error', text: 'No se pudo actualizar: ' + error.message })
    setMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' })
    setPassword(''); setConfirm('')
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>Cambiar contraseña</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Nueva contraseña</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input className="form-control" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" autoComplete="new-password" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
