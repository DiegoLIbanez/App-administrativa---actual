// =============================================================
// src/components/empleados/EmpleadoTable.jsx
// -------------------------------------------------------------
// Vista de tabla de empleados con acciones rápidas.
// =============================================================
import { Edit2, Trash2, RotateCcw, Archive } from 'lucide-react'
import PersonCell from '../ui/PersonCell'

export default function EmpleadoTable({
  paged, novedadesPorEmpleado, onSelect, openEdit, toggleActivo, setDeleteId,
}) {
  return (
    <>
      <div className="table-container" style={{ marginBottom: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Nombre</th><th>Área</th><th>Cargo</th><th>Correo</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Novedades</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(emp => {
              const nov = novedadesPorEmpleado[emp.nombre_completo]
              return (
                <tr key={emp.id} style={{ cursor: 'pointer', opacity: emp.activo === false ? 0.55 : 1 }} onClick={() => onSelect(emp)}>
                  <td style={{ maxWidth: 240 }}><PersonCell nombre={emp.nombre_completo} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{emp.dependencia || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{emp.cargo || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{emp.correo || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {emp.activo === false
                      ? <span title={emp.fecha_retiro ? `Retiro: ${emp.fecha_retiro}` : 'Sin fecha de retiro registrada'} style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Inactivo</span>
                      : <span style={{ background: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Activo</span>}
                  </td>
                  <td style={{ textAlign: 'center', color: '#2563EB', fontWeight: 600 }}>{nov ? nov.novedades.length : 0}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" title="Editar" onClick={() => openEdit(emp)}><Edit2 size={12} /></button>
                      <button className="icon-btn" style={{ background: emp.activo === false ? 'var(--success-bg)' : 'var(--warning-bg)', color: emp.activo === false ? 'var(--success-text)' : 'var(--warning-text)', borderColor: 'transparent' }} title={emp.activo === false ? 'Reactivar' : 'Desactivar'} onClick={() => toggleActivo(emp)}>
                        {emp.activo === false ? <RotateCcw size={12} /> : <Archive size={12} />}
                      </button>
                      <button className="icon-btn icon-btn--danger" title="Eliminar" onClick={() => setDeleteId(emp.id)}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}