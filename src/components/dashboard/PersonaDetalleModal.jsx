import { X } from 'lucide-react'

export default function PersonaDetalleModal({ personaDetalle, onCerrar }) {
  if (!personaDetalle) return null
  const registrosOrdenados = [...personaDetalle.registros].sort((a, b) =>
    (b.fecha_inicio || '').localeCompare(a.fecha_inicio || '')
  )
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              className="badge"
              style={{ background: personaDetalle.color + '20', color: personaDetalle.color, fontSize: 12, padding: '3px 10px' }}
            >
              {personaDetalle.concepto}
            </span>
            <h2 style={{ margin: 0, fontSize: 16 }}>{personaDetalle.nombre}</h2>
          </div>
          <button className="modal-close" onClick={onCerrar}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            {registrosOrdenados.length} registro{registrosOrdenados.length !== 1 ? 's' : ''} de {personaDetalle.concepto}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {registrosOrdenados.map((r, i) => (
              <div key={r.id || i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {r.fecha_inicio || '—'}{r.fecha_fin ? ` → ${r.fecha_fin}` : ''}
                  </span>
                  {r.total_dias != null && r.total_dias !== '' && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: personaDetalle.color }}>{r.total_dias} días</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>📍 {r.dependencia || 'Sin área'}</span>
                  {r.periodo && <span>📅 {r.periodo}</span>}
                  {r.diagnostico && <span>🩺 {r.diagnostico}</span>}
                </div>
                {(r.validacion_incapacidad || r.radicacion_incapacidad || r.prorroga || r.nomina_electronica || r.seguridad_social) && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {r.validacion_incapacidad && <span style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>Validación: {r.validacion_incapacidad}</span>}
                    {r.radicacion_incapacidad && <span style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>Radicación: {r.radicacion_incapacidad}</span>}
                    {r.prorroga && <span style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>Prórroga: {r.prorroga}</span>}
                    {r.nomina_electronica && <span style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>Nómina e.: {r.nomina_electronica}</span>}
                    {r.seguridad_social && <span style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>Seg. social: {r.seguridad_social}</span>}
                  </div>
                )}
                {r.observacion && (
                  <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 8, whiteSpace: 'pre-wrap', background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
                    {r.observacion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
