import { useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { MESES, MESES_FULL } from '../../utils/productividadConstants'
import { iniciales, fmtFecha, noHabiaIngresado } from '../../utils/productividadHelpers'

export default function DetalleModal({ persona, anio, cfg, onCerrar, onEditar }) {
  const [anioVista, setAnioVista] = useState(anio)
  const sufijo = cfg.esPorcentaje ? '%' : ''
  const aniosConDatos = Object.keys(persona.mesesPorAnio).map(Number).sort((a, b) => b - a)
  const todosLosMeses = aniosConDatos.flatMap(a => persona.mesesPorAnio[a])
  const totalHistorico = cfg.esPorcentaje
    ? (() => {
        const conDato = todosLosMeses.filter(v => v > 0)
        return conDato.length ? Math.round((conDato.reduce((s, v) => s + v, 0) / conDato.length) * 10) / 10 : 0
      })()
    : todosLosMeses.reduce((s, v) => s + v, 0)
  const meses = persona.mesesPorAnio[anioVista] || Array(MESES.length).fill(0)
  const totalAnio = cfg.esPorcentaje
    ? (() => {
        const conDato = meses.filter(v => v > 0)
        return conDato.length ? Math.round((conDato.reduce((s, v) => s + v, 0) / conDato.length) * 10) / 10 : 0
      })()
    : meses.reduce((s, v) => s + v, 0)

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
          <div className="pr-view-stats">
            <div className="pr-view-stat">
              <div className="pr-view-stat-val">{totalHistorico}{sufijo}</div>
              <div className="pr-view-stat-label">{cfg.esPorcentaje ? 'Promedio histórico' : 'Total histórico'}</div>
            </div>
            <div className="pr-view-stat">
              <div className="pr-view-stat-val" style={{ color: (persona.procesos?.length || 0) > 0 ? '#DC2626' : undefined }}>
                {persona.procesos?.length || 0}
              </div>
              <div className="pr-view-stat-label">Procesos disciplinarios</div>
            </div>
          </div>

          {aniosConDatos.length === 0 ? (
            <div className="pr-view-empty">Todavía no hay {cfg.unidadPlural} registradas para esta persona.</div>
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
                <span className="pr-view-year-total">{totalAnio}{sufijo} {cfg.unidadPlural}</span>
              </div>
              <div className="pr-detail-grid">
                {MESES.map((m, i) => {
                  const sinIngreso = noHabiaIngresado(persona, MESES_FULL[i], anioVista)
                  return (
                    <div className="pr-detail-chip" key={m}>
                      <span className="pr-detail-mes">{m}</span>
                      {sinIngreso
                        ? <span className="ci-na-cell" title={`Ingresó el ${fmtFecha(persona.ingreso)}`}>N/A</span>
                        : <span className="pr-detail-valor">{meses[i]}{sufijo}</span>}
                    </div>
                  )
                })}
              </div>
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
