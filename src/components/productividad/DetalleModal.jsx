import { useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { MESES, MESES_FULL } from '../../utils/productividadConstants'
import { iniciales, fmtFecha, noHabiaIngresado, calcPct, colorPct } from '../../utils/productividadHelpers'

const ceros = () => Array(MESES.length).fill(0)
const suma = (arr) => arr.reduce((s, v) => s + v, 0)

export default function DetalleModal({ persona, anio, cfg, onCerrar, onEditar }) {
  const [anioVista, setAnioVista] = useState(anio)

  const aniosConDatos = Array.from(new Set([
    ...Object.keys(persona.resueltosPorAnio),
    ...Object.keys(persona.asignadosPorAnio),
  ])).map(Number).sort((a, b) => b - a)

  const histResueltos = aniosConDatos.reduce((s, a) => s + suma(persona.resueltosPorAnio[a] || ceros()), 0)
  const histAsignados = aniosConDatos.reduce((s, a) => s + suma(persona.asignadosPorAnio[a] || ceros()), 0)

  const resueltos = persona.resueltosPorAnio[anioVista] || ceros()
  const asignados = persona.asignadosPorAnio[anioVista] || ceros()
  const totalResueltosAnio = suma(resueltos)
  const totalAsignadosAnio = suma(asignados)
  const pctAnio = calcPct(totalResueltosAnio, totalAsignadosAnio)

  return (
    <div className="pr-modal-overlay" onMouseDown={e => e.target === e.currentTarget && onCerrar()}>
      <div className="pr-modal">
        <div className="pr-modal-head">
          <div className="pr-view-head">
            <div className="pr-view-avatar">{iniciales(persona.nombre)}</div>
            <div>
              <div className="pr-view-name">{persona.nombre}</div>
              <div className="pr-view-sub">{persona.cargo || 'Sin cargo'} · Ingreso: {fmtFecha(persona.ingreso)}</div>
            </div>
          </div>
          <button className="pr-modal-close" onClick={onCerrar}><X size={18} /></button>
        </div>
        <div className="pr-modal-body">
          <div className={`pr-view-stats ${cfg.usaClientes ? 'pr-view-stats--3' : ''}`}>
            {cfg.usaClientes ? (
              <>
                <div className="pr-view-stat">
                  <div className="pr-view-stat-val">{histAsignados.toLocaleString('es-CO')}</div>
                  <div className="pr-view-stat-label">Asignados (histórico)</div>
                </div>
                <div className="pr-view-stat">
                  <div className="pr-view-stat-val">{histResueltos.toLocaleString('es-CO')}</div>
                  <div className="pr-view-stat-label">Resueltos (histórico)</div>
                </div>
                <div className="pr-view-stat">
                  <div className="pr-view-stat-val" style={{ color: histAsignados > 0 ? colorPct(calcPct(histResueltos, histAsignados)) : undefined }}>
                    {calcPct(histResueltos, histAsignados)}%
                  </div>
                  <div className="pr-view-stat-label">% de resolución</div>
                </div>
              </>
            ) : (
              <div className="pr-view-stat">
                <div className="pr-view-stat-val">{histResueltos}</div>
                <div className="pr-view-stat-label">Total histórico</div>
              </div>
            )}
            <div className="pr-view-stat" style={cfg.usaClientes ? { gridColumn: '1 / -1' } : undefined}>
              <div className="pr-view-stat-val" style={{ color: (persona.procesos?.length || 0) > 0 ? '#DC2626' : undefined }}>
                {persona.procesos?.length || 0}
              </div>
              <div className="pr-view-stat-label">Procesos disciplinarios</div>
            </div>
          </div>

          {aniosConDatos.length === 0 ? (
            <div className="pr-view-empty">
              {cfg.usaClientes
                ? 'Todavía no hay clientes asignados/resueltos registrados para esta persona.'
                : `Todavía no hay ${cfg.unidadPlural} registradas para esta persona.`}
            </div>
          ) : (
            <div className="pr-view-year-block">
              <div className="pr-view-year-title">
                {aniosConDatos.length > 1 ? (
                  <select className="pr-select" value={anioVista} onChange={e => setAnioVista(Number(e.target.value))}>
                    {aniosConDatos.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                ) : (
                  <span>{anioVista}</span>
                )}
                <span className="pr-view-year-total">
                  {cfg.usaClientes
                    ? `${totalResueltosAnio} de ${totalAsignadosAnio} resueltos · ${pctAnio}%`
                    : `${totalResueltosAnio} ${cfg.unidadPlural}`}
                </span>
              </div>
              <div className="pr-detail-grid">
                {MESES.map((m, i) => {
                  const sinIngreso = noHabiaIngresado(persona, MESES_FULL[i], anioVista)
                  const pct = calcPct(resueltos[i], asignados[i])
                  return (
                    <div className="pr-detail-chip" key={m}>
                      <span className="pr-detail-mes">{m}</span>
                      {sinIngreso ? (
                        <span className="ci-na-cell" title={`Ingresó el ${fmtFecha(persona.ingreso)}`}>N/A</span>
                      ) : cfg.usaClientes ? (
                        <>
                          <span className="pr-detail-valor">{resueltos[i]}<span style={{ color: 'var(--text-muted)', fontSize: 12 }}>/{asignados[i]}</span></span>
                          <span className="pr-detail-sub" style={asignados[i] > 0 ? { color: colorPct(pct) } : undefined}>
                            {asignados[i] > 0 ? `${pct}%` : '—'}
                          </span>
                        </>
                      ) : (
                        <span className="pr-detail-valor">{resueltos[i]}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              {cfg.usaClientes && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Cada mes: clientes resueltos / clientes asignados y el % de resolución.
                </span>
              )}
            </div>
          )}
        </div>
        <div className="pr-modal-foot">
          <button className="pr-btn pr-btn--ghost" onClick={onCerrar}>Cerrar</button>
          <button className="pr-btn pr-btn--primary" onClick={onEditar}><Pencil size={13} /> Editar</button>
        </div>
      </div>
    </div>
  )
}
