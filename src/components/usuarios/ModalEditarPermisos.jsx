import { useState } from 'react'
import * as perfilesApi from '../../api/perfiles'
import {
  X, Check, Shield, CheckCircle2,
  AlertCircle, Loader2, LayoutDashboard, FileText,
  ShieldAlert, Sun, UserCog, Users, ParkingCircle, TrendingUp,
} from 'lucide-react'

const SECCIONES_APP = [
  { id: 'dashboard',      label: 'Dashboard',           icon: LayoutDashboard, emoji: '🏠' },
  { id: 'novedades',      label: 'Novedades',           icon: FileText,        emoji: '📋' },
  { id: 'disciplinarios', label: 'Proc. disciplinarios', icon: ShieldAlert,    emoji: '⚖️' },
  { id: 'vacaciones',     label: 'Vacaciones',          icon: Sun,             emoji: '🌴' },
  { id: 'empleados',     label: 'Empleados',           icon: UserCog,         emoji: '👥' },
  { id: 'colaboradores', label: 'Colaboradores',       icon: Users,           emoji: '🤝' },
  { id: 'parqueadero',   label: 'Parqueadero',         icon: ParkingCircle,   emoji: '🅿️' },
  { id: 'productividad', label: 'Productividad',       icon: TrendingUp,      emoji: '📈' },
]

export default function ModalEditarPermisos({ user, onClose, onUpdated }) {
  const [empresas, setEmpresas] = useState(() => {
    if (Array.isArray(user.empresas) && user.empresas.length > 0) return user.empresas
    return ['ameriglobal']
  })

  const [permisos, setPermisos] = useState(() => {
    const p = user.permisos || {}
    return {
      ameriglobal: Array.isArray(p.ameriglobal) ? p.ameriglobal : ['all'],
      global_link: Array.isArray(p.global_link) ? p.global_link : ['all'],
    }
  })

  const [rol, setRol] = useState(user.rol || 'operativo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const toggleEmpresa = (empId) => {
    setEmpresas(prev => {
      if (prev.includes(empId)) {
        if (prev.length === 1) return prev // Debe tener al menos una empresa
        return prev.filter(e => e !== empId)
      } else {
        return [...prev, empId]
      }
    })
  }

  const togglePermiso = (empresa, seccionId) => {
    setPermisos(prev => {
      const currentList = prev[empresa] || []
      const isAll = currentList.includes('all')

      let nextList
      if (isAll) {
        // Estaba en 'all', ahora pasa a tener todos excepto el desmarcado
        nextList = SECCIONES_APP.map(s => s.id).filter(s => s !== seccionId)
      } else if (currentList.includes(seccionId)) {
        nextList = currentList.filter(s => s !== seccionId)
      } else {
        nextList = [...currentList, seccionId]
        if (nextList.length === SECCIONES_APP.length) {
          nextList = ['all']
        }
      }

      return {
        ...prev,
        [empresa]: nextList,
      }
    })
  }

  const toggleAccesoTotal = (empresa) => {
    setPermisos(prev => {
      const currentList = prev[empresa] || []
      const isAll = currentList.includes('all') || currentList.length === SECCIONES_APP.length
      return {
        ...prev,
        [empresa]: isAll ? [] : ['all'],
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (empresas.length === 0) {
      return setError('Debes asignar al menos una empresa al usuario.')
    }

    setLoading(true)
    try {
      const { error: updateError } = await perfilesApi.actualizarPermisosYEmpresasPerfil(user.id, {
        empresas,
        permisos,
        rol,
      })

      if (updateError) {
        setLoading(false)
        return setError(updateError.message || 'No se pudieron guardar los cambios.')
      }

      setLoading(false)
      setDone(true)
      setTimeout(() => {
        onUpdated()
      }, 1000)
    } catch (err) {
      setLoading(false)
      setError('Error inesperado: ' + err.message)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal" style={{ maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <Shield size={18} style={{ color: 'var(--primary)' }} />
            Permisos y Empresas — {user.nombre_completo || user.correo}
          </h2>
          <button className="modal-close" onClick={onClose} disabled={loading}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '18px 24px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="auth-pending-icon" style={{ background: 'var(--success-bg)', color: 'var(--success-text)', margin: '0 auto 14px' }}>
                <CheckCircle2 size={28} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Permisos actualizados correctamente.</p>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><AlertCircle size={15} /> {error}</div>}

              {/* ── 1. Rol de usuario ── */}
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Rol del usuario
                </label>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  {[
                    { id: 'operativo', label: 'Operativo / Estándar', desc: 'Acceso a las secciones autorizadas' },
                    { id: 'supervisor', label: 'Supervisor / Auditor', desc: 'Visualización y seguimiento' },
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRol(r.id)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: rol === r.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: rol === r.id ? 'rgba(37,99,235,0.06)' : 'var(--bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: rol === r.id ? 'var(--primary)' : 'var(--text)' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── 2. Selección de Empresas ── */}
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Empresas con Acceso
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                  {/* AmeriGlobal */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: empresas.includes('ameriglobal') ? '2px solid #2563EB' : '1px solid var(--border)',
                      background: empresas.includes('ameriglobal') ? 'var(--info-bg)' : 'var(--bg)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={empresas.includes('ameriglobal')}
                      onChange={() => toggleEmpresa('ameriglobal')}
                      style={{ accentColor: '#2563EB', width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--info-text)' }}>🏢 AmeriGlobal</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>Gestión de novedades e incapacidades</div>
                    </div>
                  </label>

                  {/* Global Link */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: empresas.includes('global_link') ? '2px solid #0D9488' : '1px solid var(--border)',
                      background: empresas.includes('global_link') ? '#F0FDFA' : 'var(--bg)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={empresas.includes('global_link')}
                      onChange={() => toggleEmpresa('global_link')}
                      style={{ accentColor: '#0D9488', width: 16, height: 16 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#0F766E' }}>🌐 Global Link</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>Cobranza & nuevos departamentos</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ── 3. Permisos por Secciones (AmeriGlobal) ── */}
              {empresas.includes('ameriglobal') && (
                <div style={{ marginBottom: 20, padding: 14, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--info-text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🏢 Secciones permitidas en AmeriGlobal
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleAccesoTotal('ameriglobal')}
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      {permisos.ameriglobal?.includes('all') ? 'Desmarcar todo' : 'Acceso total (Todo)'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {SECCIONES_APP.map(sec => {
                      const isAllowed = permisos.ameriglobal?.includes('all') || permisos.ameriglobal?.includes(sec.id)
                      return (
                        <label
                          key={`ag-${sec.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: isAllowed ? 'var(--info-bg)' : '#FFF',
                            border: isAllowed ? '1px solid color-mix(in srgb, var(--info) 30%, transparent)' : '1px solid #E2E8F0',
                            fontSize: 12,
                            fontWeight: isAllowed ? 600 : 400,
                            cursor: 'pointer',
                            color: isAllowed ? 'var(--info-text)' : 'var(--text)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!isAllowed}
                            onChange={() => togglePermiso('ameriglobal', sec.id)}
                            style={{ accentColor: '#2563EB' }}
                          />
                          <span>{sec.emoji}</span>
                          <span>{sec.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── 4. Permisos por Secciones (Global Link) ── */}
              {empresas.includes('global_link') && (
                <div style={{ marginBottom: 20, padding: 14, background: '#F0FDFA', borderRadius: 12, border: '1px solid #CCFBF1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0F766E', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🌐 Secciones permitidas en Global Link
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleAccesoTotal('global_link')}
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      {permisos.global_link?.includes('all') ? 'Desmarcar todo' : 'Acceso total (Todo)'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {SECCIONES_APP.map(sec => {
                      const isAllowed = permisos.global_link?.includes('all') || permisos.global_link?.includes(sec.id)
                      return (
                        <label
                          key={`gl-${sec.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: isAllowed ? '#CCFBF1' : '#FFF',
                            border: isAllowed ? '1px solid #99F6E4' : '1px solid #E2E8F0',
                            fontSize: 12,
                            fontWeight: isAllowed ? 600 : 400,
                            cursor: 'pointer',
                            color: isAllowed ? '#0F766E' : 'var(--text)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!isAllowed}
                            onChange={() => togglePermiso('global_link', sec.id)}
                            style={{ accentColor: '#0D9488' }}
                          />
                          <span>{sec.emoji}</span>
                          <span>{sec.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {loading ? <Loader2 size={15} className="spin" /> : <Check size={15} />}
                  {loading ? 'Guardando...' : 'Guardar Permisos'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
