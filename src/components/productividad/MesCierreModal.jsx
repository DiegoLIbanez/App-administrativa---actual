import { useState, Fragment } from 'react'
import { X, Loader2, Sparkles, DollarSign, Target, CheckCircle2 } from 'lucide-react'
import { MESES_FULL, CIERRE_METRICAS } from '../../utils/productividadConstants'
import { calcPct } from '../../utils/productividadHelpers'

export default function MesCierreModal({
  mesInicial,
  anio,
  empleados,
  datosIniciales,
  mesesOcupados,
  onGuardar,
  onCerrar,
  guardando,
  errorGuardado,
}) {
  const esNuevo = !mesInicial
  const mesesDisponibles = MESES_FULL.filter(m => m === mesInicial || !mesesOcupados.includes(m))
  const [mes, setMes] = useState(mesInicial || mesesDisponibles[0] || MESES_FULL[0])

  const [valores, setValores] = useState(() => {
    const m = {}
    empleados.forEach(e => {
      const init = datosIniciales?.[e.nombre] || {}
      const asignados = Number(init.cierres_asignados ?? init.new_offers_units) || 0
      const cerrados = Number(init.cierres_cerrados ?? init.new_offers_dollars) || 0
      // El % de resolución siempre sale de resueltos ÷ asignados (solo esos dos)
      const pctCierres = calcPct(cerrados, asignados)

      const totalPlata = Number(init.total_plata ?? init.renewal_dollars) || 0
      const plataPrestada = Number(init.plata_prestada ?? init.total_units) || 0
      let pctPlata = Number(init.porcentaje_plata ?? init.total_dollars) || 0
      if (!pctPlata && totalPlata > 0) {
        pctPlata = Math.round((plataPrestada / totalPlata) * 100)
      }

      m[e.nombre] = {
        cierres_asignados: asignados,
        cierres_cerrados: cerrados,
        porcentaje_cierres: pctCierres,
        total_plata: totalPlata,
        plata_prestada: plataPrestada,
        porcentaje_plata: pctPlata,
      }
    })
    return m
  })

  const setCampo = (nombre, key, rawValor) => {
    const valor = rawValor === '' ? '' : Number(rawValor)
    setValores(prev => {
      const actual = { ...prev[nombre], [key]: valor }
      
      // Auto-cálculo del % de resolución: clientes resueltos ÷ clientes asignados
      if (key === 'cierres_asignados' || key === 'cierres_cerrados') {
        actual.porcentaje_cierres = calcPct(actual.cierres_cerrados, actual.cierres_asignados)
      }

      // Auto-cálculo de porcentaje de plata
      if (key === 'total_plata' || key === 'plata_prestada') {
        const tot = Number(key === 'total_plata' ? valor : actual.total_plata) || 0
        const pres = Number(key === 'plata_prestada' ? valor : actual.plata_prestada) || 0
        if (tot > 0) {
          actual.porcentaje_plata = Math.round((pres / tot) * 100)
        }
      }

      return { ...prev, [nombre]: actual }
    })
  }

  return (
    <div className="pr-modal-overlay" onMouseDown={e => e.target === e.currentTarget && onCerrar()}>
      <div className="pr-modal" style={{ maxWidth: 1040 }}>
        <div className="pr-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div className="ci-mes-icon" style={{ width: 28, height: 28 }}>
              <Sparkles size={14} />
            </div>
            <div>
              <span className="pr-modal-title">
                {esNuevo ? 'Registrar mes de productividad de Cierre' : `Editar Productividad de Cierre — ${mes} ${anio}`}
              </span>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Ingresa los clientes asignados, clientes resueltos y montos de dinero para cada analista.
              </div>
            </div>
          </div>
          <button className="pr-modal-close" onClick={onCerrar}><X size={18} /></button>
        </div>

        <div className="pr-modal-body">
          {errorGuardado && <div className="pr-modal-error">{errorGuardado}</div>}

          {esNuevo && (
            <div className="pr-field" style={{ maxWidth: 260 }}>
              <span className="pr-field-label">Mes a registrar ({anio})</span>
              <select className="pr-input" value={mes} onChange={e => setMes(e.target.value)}>
                {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}

          <div className="ci-group-info">
            <div className="ci-group-chip">
              <Target size={13} color="#2563EB" /> <b>Gestión de Clientes:</b> Clientes Asignados, Clientes Resueltos y % de efectividad (automático)
            </div>
            <div className="ci-group-chip">
              <DollarSign size={13} color="#16A34A" /> <b>Gestión Financiera:</b> Total Plata, Plata Prestada y % de colocación
            </div>
          </div>

          <div className="ci-table-scroll">
            <table className="ci-table ci-table--edit">
              <thead>
                <tr>
                  <th style={{ minWidth: 210 }}>Métrica / Analista</th>
                  {empleados.map(e => (
                    <th key={e.nombre} style={{ minWidth: 130 }}>
                      <div className="ci-th-nombre">{e.nombre}</div>
                      <div className="ci-th-ingreso">{e.cargo || 'Analista'}</div>
                    </th>
                  ))}
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
                    <tr className={met.tipo === 'pct' ? 'ci-row--pct' : met.tipo === 'moneda' ? 'ci-row--moneda' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {met.grupo === 'financiero' ? <DollarSign size={12} color="#16A34A" /> : <Target size={12} color="#2563EB" />}
                          <b>{met.label}</b>
                          {met.tipo === 'pct' && <span className="ci-auto-badge">Auto</span>}
                        </div>
                      </td>
                      {empleados.map(e => (
                        <td key={e.nombre}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            {met.tipo === 'moneda' && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>$</span>}
                            <input
                              className={`pr-input ci-input-cell ${met.tipo === 'pct' ? 'ci-input-cell--pct' : ''}`}
                              type="number"
                              step={met.tipo === 'moneda' ? '0.01' : '1'}
                              min="0"
                              value={valores[e.nombre]?.[met.key] ?? ''}
                              readOnly={met.key === 'porcentaje_cierres'}
                              title={met.key === 'porcentaje_cierres' ? 'Se calcula solo: resueltos ÷ asignados' : undefined}
                              placeholder="0"
                              onChange={ev => setCampo(e.nombre, met.key, ev.target.value)}
                            />
                            {met.tipo === 'pct' && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>%</span>}
                          </div>
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
          <button className="pr-btn pr-btn--ghost" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button
            className="pr-btn pr-btn--primary"
            disabled={guardando || !mes}
            onClick={() => onGuardar(mes, valores)}
          >
            {guardando ? <Loader2 size={14} className="pr-refresh--spin" /> : <CheckCircle2 size={14} />}
            {guardando ? 'Guardando…' : 'Guardar Cierre'}
          </button>
        </div>
      </div>
    </div>
  )
}
