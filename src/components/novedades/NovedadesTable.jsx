import { Eye, Edit2, Trash2 } from 'lucide-react'
import { normalizarConcepto, CONCEPTO_COLORS } from '../../utils/parseExcel'
import { hoyISO } from '../../utils/fecha'
import { PAGE_SIZE } from '../../utils/novedadesConstants'
import { EditablePill, SortIcon, IncompleteIndicator } from './Pills'
import Paginacion from '../ui/Paginacion'

// Cabecera de columna ordenable
function Th({ field, children, style = {}, sortField, sortDir, onSort }) {
  return (
    <th
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', ...style }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </span>
    </th>
  )
}

export default function NovedadesTable({
  loading, filtered, paged, page, totalPages,
  sortField, sortDir, onSort,
  highlightId, soloActivas,
  quickSave, onView, onEdit, onDelete,
  setPage,
}) {
  if (loading) {
    return <div className="empty-state"><p>Cargando...</p></div>
  }
  if (filtered.length === 0) {
    return <div className="empty-state"><p>No hay registros que coincidan.</p></div>
  }

  return (
    <>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <Th field="nombre_empleado" sortField={sortField} sortDir={sortDir} onSort={onSort}>Empleado</Th>
              <Th field="concepto" sortField={sortField} sortDir={sortDir} onSort={onSort}>Concepto</Th>
              <Th field="fecha_inicio" sortField={sortField} sortDir={sortDir} onSort={onSort}>Inicio</Th>
              <Th field="fecha_fin" sortField={sortField} sortDir={sortDir} onSort={onSort}>Fin</Th>
              <Th field="total_dias" style={{ textAlign: 'center' }} sortField={sortField} sortDir={sortDir} onSort={onSort}>Días</Th>
              <Th field="dependencia" sortField={sortField} sortDir={sortDir} onSort={onSort}>Área</Th>
              <Th field="periodo" sortField={sortField} sortDir={sortDir} onSort={onSort}>Periodo</Th>
              <th style={{ minWidth: 80 }}>Diag.</th>
              <th style={{ textAlign: 'center', minWidth: 80, borderLeft: '2px solid var(--border)' }}>Válid. Inc.</th>
              <th style={{ textAlign: 'center', minWidth: 70 }}>Prórroga</th>
              <th style={{ textAlign: 'center', minWidth: 70 }}>Rad. Inc.</th>
              <th style={{ textAlign: 'center', minWidth: 70 }}>Obs. Cont.</th>
              <th style={{ textAlign: 'center', minWidth: 70 }}>Nómina E.</th>
              <th style={{ textAlign: 'center', minWidth: 70 }}>Seg. Soc.</th>
              <th style={{ minWidth: 160 }}>Observación</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => {
              const tipo = normalizarConcepto(row.concepto)
              const color = CONCEPTO_COLORS[tipo] || '#374151'
              return (
                <tr
                  key={row.id}
                  className={`nv-anim-row${row.id === highlightId ? ' nv-row-highlight' : ''}`}
                  style={{ animationDelay: `${Math.min(i, 20) * 20}ms` }}
                >
                  <td style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {row.nombre_empleado}
                      <IncompleteIndicator row={row} />
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: color + '20', color }}>{row.concepto}</span>
                    {row.jornada === 'Medio día' && (
                      <span title="Medio día" style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, color: '#92400E', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 999, padding: '1px 6px', whiteSpace: 'nowrap' }}>🕐 ½ día</span>
                    )}
                    {soloActivas && row.fecha_inicio && row.fecha_fin && (
                      row.fecha_inicio <= hoyISO()
                        ? <span style={{ marginLeft: 5, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#166534', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 999, padding: '1px 7px', whiteSpace: 'nowrap' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />En curso</span>
                        : <span style={{ marginLeft: 5, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#1E40AF', background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: 999, padding: '1px 7px', whiteSpace: 'nowrap' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#3B82F6' }} />Próxima</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12.5 }}>{row.fecha_inicio || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12.5 }}>{row.fecha_fin || '—'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.total_dias ?? '—'}</td>
                  <td style={{ color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.dependencia || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12.5 }}>{row.periodo || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {row.diagnostico
                      ? <span className="mono" style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px' }}>{row.diagnostico}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'center', borderLeft: '2px solid var(--border)' }}>
                    <EditablePill field="validacion_incapacidad" value={row.validacion_incapacidad} rowId={row.id} onSave={quickSave} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <EditablePill field="prorroga" value={row.prorroga} rowId={row.id} onSave={quickSave} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <EditablePill field="radicacion_incapacidad" value={row.radicacion_incapacidad} rowId={row.id} onSave={quickSave} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <EditablePill field="observacion_contabilidad" value={row.observacion_contabilidad} rowId={row.id} onSave={quickSave} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <EditablePill field="nomina_electronica" value={row.nomina_electronica} rowId={row.id} onSave={quickSave} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <EditablePill field="seguridad_social" value={row.seguridad_social} rowId={row.id} onSave={quickSave} />
                  </td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 12 }} title={row.observacion || ''}>
                    {row.observacion || <span style={{ color: '#D1D5DB' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" title="Ver detalle" onClick={() => onView(row)}><Eye size={13} /></button>
                      <button className="icon-btn" title="Editar" onClick={() => onEdit(row)}><Edit2 size={13} /></button>
                      <button className="icon-btn icon-btn--danger" title="Eliminar" onClick={() => onDelete(row.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <Paginacion total={filtered.length} page={page} totalPages={totalPages} onChange={setPage} info={`Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length}`} />
    </>
  )
}
