import { useState, Fragment } from 'react'
import { X, Loader2 } from 'lucide-react'
import { MESES_FULL, CIERRE_METRICAS } from '../../utils/productividadConstants'

export default function MesCierreModal({ mesInicial, anio, empleados, datosIniciales, mesesOcupados, onGuardar, onCerrar, guardando, errorGuardado }) {
  const esNuevo = !mesInicial
  const mesesDisponibles = MESES_FULL.filter(m => m === mesInicial || !mesesOcupados.includes(m))
  const [mes, setMes] = useState(mesInicial || mesesDisponibles[0] || MESES_FULL[0])
  const [valores, setValores] = useState(() => {
    const m = {}
    empleados.forEach(e => {
      m[e.nombre] = { ...(datosIniciales?.[e.nombre] || {}) }
      CIERRE_METRICAS.forEach(met => { if (m[e.nombre][met.key] == null) m[e.nombre][met.key] = 0 })
    })
    return m
  })
  const setCampo = (nombre, key, valor) =>
    setValores(v => ({ ...v, [nombre]: { ...v[nombre], [key]: valor } }))

  return (
    <div className="pr-modal-overlay" onMouseDown={e => e.target === e.currentTarget && onCerrar()}>
      <div className="pr-modal" style={{ maxWidth: 960 }}>
        <div className="pr-modal-head">
          <span className="pr-modal-title">{esNuevo ? 'Agregar mes de cierre' : `Editar cierre de ${mes} ${anio}`}</span>
          <button className="pr-modal-close" onClick={onCerrar}><X size={18} /></button>
        </div>
        <div className="pr-modal-body">
          {errorGuardado && <div className="pr-modal-error">{errorGuardado}</div>}

          {esNuevo && (
            <div className="pr-field" style={{ maxWidth: 220 }}>
              <span className="pr-field-label">Mes de cierre ({anio})</span>
              <select className="pr-input" value={mes} onChange={e => setMes(e.target.value)}>
                {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          <div className="ci-table-scroll">
            <table className="ci-table ci-table--edit">
              <thead>
                <tr>
                  <th>Métrica</th>
                  {empleados.map(e => <th key={e.nombre}>{e.nombre}</th>)}
                </tr>
              </thead>
              <tbody>
                {CIERRE_METRICAS.map(met => (
                  <Fragment key={met.key}>
                    {met.espacioAntes && (
                      <tr className="ci-row--spacer">
                        <td colSpan={empleados.length + 1} />
                      </tr>
                    )}
                    <tr>
                      <td>{met.label}</td>
                      {empleados.map(e => (
                        <td key={e.nombre}>
                          <input
                            className="pr-input ci-input-cell" type="number" step="any"
                            value={valores[e.nombre]?.[met.key] ?? 0}
                            onChange={ev => setCampo(e.nombre, met.key, ev.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="pr-modal-foot">
          <button className="pr-btn pr-btn--ghost" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button className="pr-btn pr-btn--primary" disabled={guardando || !mes} onClick={() => onGuardar(mes, valores)}>
            {guardando ? <Loader2 size={14} /> : null}
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
