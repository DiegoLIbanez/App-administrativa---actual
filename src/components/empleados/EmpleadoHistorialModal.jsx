// =============================================================
// src/components/empleados/EmpleadoHistorialModal.jsx
// -------------------------------------------------------------
// Modal con el historial de novedades de un empleado (KPIs por
// concepto + tabla de registros).
// =============================================================
import { X, Edit2 } from 'lucide-react'
import { normalizarConcepto, CONCEPTO_COLORS } from '../../utils/parseExcel'
import { CONCEPTOS_CON_FECHA } from './empleadosConstants'

export default function EmpleadoHistorialModal({ selectedEmp, novedadesPorEmpleado, onClose, onEdit }) {
  const nov = novedadesPorEmpleado[selectedEmp.nombre_completo]

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <div>
            <h2>{selectedEmp.nombre_completo}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedEmp.dependencia || '—'}{selectedEmp.cargo ? ` · ${selectedEmp.cargo}` : ''}</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {!nov || nov.novedades.length === 0 ? (
            <div className="empty-state"><p>Este empleado no tiene novedades registradas.</p></div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 18 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2563EB' }}>{nov.novedades.length}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total novedades</div>
                </div>
                {CONCEPTOS_CON_FECHA.filter(c => nov.porConcepto[c]).map(concepto => {
                  const data = nov.porConcepto[concepto]
                  const color = CONCEPTO_COLORS[concepto] || '#374151'
                  return (
                    <div key={concepto} style={{ background: color + '10', border: `1px solid ${color}35`, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color }}>{data.episodios}</div>
                      <div style={{ fontSize: 12, color, fontWeight: 600, marginBottom: 2 }}>{concepto}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{data.dias.toFixed(0)} día{data.dias !== 1 ? 's' : ''}</div>
                    </div>
                  )
                })}
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Concepto</th><th>F. Inicio</th><th>F. Fin</th><th>Días</th><th>Periodo</th></tr></thead>
                  <tbody>
                    {[...nov.novedades].sort((a, b) => (b.fecha_inicio || '').localeCompare(a.fecha_inicio || '')).map(r => {
                      const tipo = normalizarConcepto(r.concepto)
                      const color = CONCEPTO_COLORS[tipo] || '#374151'
                      return (
                        <tr key={r.id}>
                          <td><span className="badge tag-c" style={{ '--tag': color }}>{r.concepto}</span></td>
                          <td>{r.fecha_inicio || '—'}</td>
                          <td>{r.fecha_fin || '—'}</td>
                          <td>{r.total_dias ?? '—'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{r.periodo || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={onEdit}><Edit2 size={14} /> Editar empleado</button>
        </div>
      </div>
    </div>
  )
}