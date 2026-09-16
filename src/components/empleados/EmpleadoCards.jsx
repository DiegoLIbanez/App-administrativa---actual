// =============================================================
// src/components/empleados/EmpleadoCards.jsx
// -------------------------------------------------------------
// Vista de tarjetas de empleados con acciones rápidas.
// =============================================================
import { Edit2, Trash2, RotateCcw, Archive, Briefcase, Mail, Calendar } from 'lucide-react'

function iniciales(nombre) {
  const partes = (nombre || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

export default function EmpleadoCards({
  paged, novedadesPorEmpleado, onSelect, openEdit, toggleActivo, setDeleteId,
}) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12, marginBottom: 16 }}>
        {paged.map(emp => {
          const nov = novedadesPorEmpleado[emp.nombre_completo]
          return (
            <div
              key={emp.id}
              className="card"
              style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, opacity: emp.activo === false ? 0.6 : 1, cursor: 'pointer' }}
              onClick={() => onSelect(emp)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Avatar con iniciales */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: emp.activo === false ? '#F3F4F6' : 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  color: emp.activo === false ? '#6B7280' : 'var(--primary)',
                  userSelect: 'none',
                }}>
                  {iniciales(emp.nombre_completo)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emp.nombre_completo}
                  </div>
                  <span style={{
                    fontSize: 10, borderRadius: 4, padding: '1px 6px', fontWeight: 600,
                    background: emp.activo === false ? '#FEE2E2' : '#DCFCE7',
                    color: emp.activo === false ? '#991B1B' : '#166534',
                  }}>{emp.activo === false ? 'Inactivo' : 'Activo'}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button className="icon-btn" title="Editar" onClick={() => openEdit(emp)}><Edit2 size={13} /></button>
                  <button className="btn btn-sm" style={{ background: emp.activo === false ? '#DCFCE7' : '#FEF3C7', color: emp.activo === false ? '#166534' : '#92400E', border: 'none' }} title={emp.activo === false ? 'Reactivar' : 'Desactivar'} onClick={() => toggleActivo(emp)}>
                    {emp.activo === false ? <RotateCcw size={13} /> : <Archive size={13} />}
                  </button>
                  <button className="icon-btn icon-btn--danger" title="Eliminar" onClick={() => setDeleteId(emp.id)}><Trash2 size={13} /></button>
                </div>
              </div>
              {(emp.cargo || emp.dependencia) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Briefcase size={12} style={{ flexShrink: 0 }} />
                  <span>{[emp.cargo, emp.dependencia].filter(Boolean).join(' · ')}</span>
                </div>
              )}
              {emp.correo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden' }}>
                  <Mail size={12} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.correo}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#92400E' }}>
                  <Mail size={12} style={{ flexShrink: 0 }} />
                  <span>Sin correo registrado</span>
                </div>
              )}
              {emp.fecha_ingreso && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Calendar size={12} style={{ flexShrink: 0 }} />
                  <span>Ingreso: {emp.fecha_ingreso}</span>
                </div>
              )}
              {emp.activo === false && emp.fecha_retiro && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#991B1B' }}>
                  <Calendar size={12} style={{ flexShrink: 0 }} />
                  <span>Retiro: {emp.fecha_retiro}</span>
                </div>
              )}
              {/* Chips de novedades */}
              <div style={{ display: 'flex', gap: 6, marginTop: 2, paddingTop: 8, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {nov && nov.novedades.length > 0 ? (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#E6F1FB', color: '#0C447C', border: '0.5px solid #B5D4F4' }}>
                      <Calendar size={10} /> {nov.novedades.length} novedad{nov.novedades.length !== 1 ? 'es' : ''}
                    </span>
                    {nov.episodiosInc > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: '#FEE2E2', color: '#791F1F', border: '0.5px solid #F7C1C1' }}>
                        {nov.episodiosInc} inc. · {nov.diasInc.toFixed(0)}d
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sin novedades</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}