import { Search, ArrowUp, ArrowDown, ArrowUpDown, Eye, Pencil, Trash2, Loader2, ShieldAlert } from 'lucide-react'
import { MESES_FULL } from '../../utils/productividadConstants'
import { iniciales, fmtFecha, noHabiaIngresado } from '../../utils/productividadHelpers'

function ThOrdenable({ col, children, center, ordenCol, ordenDir, onToggle }) {
  return (
    <th className={center ? 'pr-th-num' : ''} onClick={() => onToggle(col)}>
      <span className="pr-th-inner">
        {children}
        {ordenCol === col
          ? (ordenDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)
          : <ArrowUpDown size={11} style={{ opacity: .4 }} />}
      </span>
    </th>
  )
}

export default function ProductividadTable({
  cfg, datos, filas, datosCrudos, anioActivo, mesFiltroIdx, valorPeriodo,
  busqueda, setBusqueda, filtroCargo, setFiltroCargo, cargosUnicos,
  mesFiltro, setMesFiltro,
  ordenCol, ordenDir, toggleOrden,
  eliminandoNombre,
  abrirVer, abrirEditar, eliminarPersona, setVerProcesos,
}) {
  return (
    <div className="pr-card">
      <div className="pr-toolbar">
        <div className="pr-search">
          <Search size={14} className="pr-search-icon" />
          <input
            className="pr-search-input"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <select className="pr-select" value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)}>
          <option value="todos">Todos los cargos</option>
          {cargosUnicos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="pr-select" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}>
          <option value="todos">Todos los meses</option>
          {MESES_FULL.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <span className="pr-count">{filas.length} de {datos.length}</span>
      </div>

      <div className="pr-table-scroll">
        <table className="pr-table">
          <thead>
            <tr>
              <th className="pr-th-num">#</th>
              <ThOrdenable col="nombre" ordenCol={ordenCol} ordenDir={ordenDir} onToggle={toggleOrden}>{cfg.personaLabel}</ThOrdenable>
              <ThOrdenable col="cargo" ordenCol={ordenCol} ordenDir={ordenDir} onToggle={toggleOrden}>Cargo</ThOrdenable>
              <th>Tendencia (Ene→Dic)</th>
              <ThOrdenable col="total" ordenCol={ordenCol} ordenDir={ordenDir} onToggle={toggleOrden}>{mesFiltroIdx >= 0 ? MESES_FULL[mesFiltroIdx] : 'Total'}</ThOrdenable>
              <th className="pr-th-num">Disciplinario</th>
              <th className="pr-th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr><td colSpan={7} className="pr-empty">
                {datos.length === 0
                  ? `No hay empleados activos con dependencia ${cfg.dependenciaEmpleados} (${cfg.tabLabel}). Agrégalos o actívalos en la sección Empleados.`
                  : 'No se encontraron resultados para tu búsqueda.'}
              </td></tr>
            ) : filas.map(v => {
              const maxRow = Math.max(...v.meses, 1)
              return (
                <tr key={v.nombre}>
                  <td>
                    <span className={`pr-rank pr-rank--${v.rank <= 3 ? v.rank : ''}`}>{v.rank}</span>
                  </td>
                  <td>
                    <div className="pr-person">
                      <div className="pr-person-avatar">{iniciales(v.nombre)}</div>
                      <div>
                        <div className="pr-person-name">{v.nombre}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Ingreso: {fmtFecha(v.ingreso)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`pr-cargo-badge ${v.cargo.toLowerCase().includes('supervisor') ? 'pr-cargo-badge--sup' : ''}`}>
                      {v.cargo || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="pr-spark" title={v.meses.join(' · ')} onClick={() => abrirVer(v)}>
                      {v.meses.map((m, i) => {
                        const sinIngreso = noHabiaIngresado(v, MESES_FULL[i], anioActivo)
                        return (
                          <div
                            key={i}
                            className={`pr-spark-bar ${sinIngreso ? 'pr-spark-bar--na' : (m === maxRow && m > 0 ? 'pr-spark-bar--peak' : '')}`}
                            style={{ height: sinIngreso ? '100%' : `${Math.max((m / maxRow) * 100, 6)}%` }}
                          />
                        )
                      })}
                    </div>
                  </td>
                  <td>
                    {mesFiltroIdx >= 0 && noHabiaIngresado(v, MESES_FULL[mesFiltroIdx], anioActivo)
                      ? <span className="ci-na-cell" title={`Ingresó el ${fmtFecha(v.ingreso)}`}>N/A</span>
                      : <span className="pr-total-cell">{valorPeriodo(v)}{cfg.esPorcentaje ? '%' : ''}</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {(v.procesos?.length || 0) > 0 ? (
                      <button
                        className="pr-flag pr-flag--warn"
                        style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        title="Ver procesos disciplinarios"
                        onClick={() => setVerProcesos(datosCrudos.find(p => p.nombre === v.nombre))}
                      >
                        <ShieldAlert size={12} /> {v.procesos.length}
                      </button>
                    ) : (
                      <span className="pr-flag pr-flag--ok">0</span>
                    )}
                  </td>
                  <td>
                    <div className="pr-actions">
                      <button className="pr-icon-btn" title="Ver detalle" onClick={() => abrirVer(v)}>
                        <Eye size={13} />
                      </button>
                      <button className="pr-icon-btn" title="Editar" onClick={() => abrirEditar(v)}>
                        <Pencil size={13} />
                      </button>
                      {cfg.id !== 'ventas' && (
                        <button
                          className="pr-icon-btn pr-icon-btn--danger"
                          title="Reiniciar historial a 0"
                          disabled={eliminandoNombre === v.nombre}
                          onClick={() => eliminarPersona(v.nombre)}
                        >
                          {eliminandoNombre === v.nombre ? <Loader2 size={13} /> : <Trash2 size={13} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
