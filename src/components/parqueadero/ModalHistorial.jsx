import { X } from 'lucide-react'
import { MESES } from '../../utils/parqueaderoConstants'
import { TipoBadge, ObsBadge } from './Badges'

export default function ModalHistorial({ nombre, placa, allRows, onClose }) {
  const historial = allRows
    .filter(r => r.nombre_empleado === nombre || r.placa === placa)
    .sort((a, b) => {
      const ya = parseInt(a.anio || 0), yb = parseInt(b.anio || 0)
      if (ya !== yb) return yb - ya
      return MESES.indexOf(b.mes) - MESES.indexOf(a.mes)
    })
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Historial — {nombre}</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Placa: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{placa}</span> · {historial.length} registro(s)</div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Año</th><th>Mes</th><th>Placa</th><th>Tipo</th><th>F. Ingreso</th><th>F. Retiro</th><th>Observación</th></tr>
              </thead>
              <tbody>
                {historial.map(r => (
                  <tr key={r.id}>
                    <td>{r.anio || '—'}</td>
                    <td>{r.mes || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.placa || '—'}</td>
                    <td>{r.tipo ? <TipoBadge tipo={r.tipo} /> : '—'}</td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.fecha_ingreso || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.fecha_retiro || '—'}</td>
                    <td style={{ fontSize: 12 }}><ObsBadge obs={r.observacion} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
