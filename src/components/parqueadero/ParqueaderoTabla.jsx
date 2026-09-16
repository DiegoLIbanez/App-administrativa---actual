import { Eye, Edit2, Trash2 } from 'lucide-react'
import { PAGE_SIZE } from '../../utils/parqueaderoConstants'
import { TipoBadge, ObsBadge } from './Badges'
import Paginacion from '../ui/Paginacion'

export default function ParqueaderoTabla({
  paged, filtered, page, totalPages, setPage,
  setViewRow, setHistorial, openEdit, setDeleteId,
}) {
  return (
    <>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Empleado</th><th>Mes / Año</th><th>Placa</th>
              <th>Cédula</th><th>Teléfono</th>
              <th style={{ textAlign: 'center' }}>Tipo</th>
              <th>F. Ingreso</th><th>F. Retiro</th>
              <th style={{ textAlign: 'center' }}>Observación</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th>Nota vehículo</th>
              <th style={{ textAlign: 'center' }}>Envío Reporte</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => (
              <tr key={row.id} className="park-row" style={{
                animationDelay: `${Math.min(idx, 8) * 0.03}s`,
                background: row.retirado ? '#FEE2E2' : undefined,
                borderLeft: row.retirado ? '4px solid #DC2626' : '4px solid transparent',
              }}>
                <td style={{ fontWeight: 700, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: row.retirado ? '#991B1B' : undefined }}>
                  {row.nombre_empleado}
                </td>
                <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{[row.mes, row.anio].filter(Boolean).join(' ') || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>{row.placa || '—'}</td>
                <td style={{ color: 'var(--text-muted)' }}>{row.cedula || '—'}</td>
                <td style={{ color: 'var(--text-muted)' }}>{row.telefono || '—'}</td>
                <td style={{ textAlign: 'center' }}>{row.tipo ? <TipoBadge tipo={row.tipo} /> : '—'}</td>
                <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.fecha_ingreso || '—'}</td>
                <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.fecha_retiro || '—'}</td>
                <td style={{ textAlign: 'center' }}><ObsBadge obs={row.observacion} /></td>
                <td style={{ textAlign: 'center' }}>
                  {row.retirado
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: '#DC2626', color: '#fff', lineHeight: 1 }}><span style={{ fontSize: 8 }}>●</span>RETIRADO</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' }}>✓ Activo</span>}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.nota_vehiculo || ''}>{row.nota_vehiculo || '—'}</td>
                <td style={{ textAlign: 'center' }}>
                  {row.fecha_envio_reporte ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE' }}>
                      📤 {row.fecha_envio_reporte.split('T')[0]}
                    </span>
                  ) : <span style={{ color: '#FCD34D', fontSize: 12, fontWeight: 600 }}>● Pendiente</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" title="Ver detalle" onClick={() => setViewRow(row)}><Eye size={13} /></button>
                    <button className="btn btn-ghost btn-sm" title="Historial" onClick={() => setHistorial(row)} style={{ fontSize: 11, padding: '3px 7px' }}>📋</button>
                    <button className="icon-btn" title="Editar" onClick={() => openEdit(row)}><Edit2 size={13} /></button>
                    <button className="icon-btn icon-btn--danger" title="Eliminar" onClick={() => setDeleteId(row.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Paginacion total={filtered.length} page={page} totalPages={totalPages} onChange={setPage} info={`Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length}`} />
    </>
  )
}
