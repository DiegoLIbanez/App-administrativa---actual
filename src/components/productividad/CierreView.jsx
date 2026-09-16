import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import {
  TrendingUp, Trophy, Medal, AlertTriangle, Award,
  Pencil, Loader2, ChevronDown, ChevronUp, DollarSign, Sparkles, Layers, ShieldAlert,
} from 'lucide-react'
import { MESES_FULL, CIERRE_CFG, CIERRE_METRICAS, normalizeNombre } from '../../utils/productividadConstants'
import { fmtMoneda, iniciales, fmtFecha, noHabiaIngresado } from '../../utils/productividadHelpers'
import * as empleadosApi from '../../api/empleados'
import * as productividadApi from '../../api/productividad'
import * as procesosApi from '../../api/procesosDisciplinarios'
import PctBar from './PctBar'
import MesCierreModal from './MesCierreModal'
import ProcesosDisciplinariosModal from './ProcesosDisciplinariosModal'

export default function CierreView({ anioActivo }) {
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [empleados, setEmpleados] = useState([]) // [{nombre, cargo, ingreso, procesos}]
  const [datosPorMes, setDatosPorMes] = useState({}) // { 'Marzo': { 'Juan...': {new_offers_units:..., ...} } }
  const [mesesAbiertos, setMesesAbiertos] = useState(new Set())

  const [modalMes, setModalMes] = useState(null) // { mesInicial } | null
  const [verProcesos, setVerProcesos] = useState(null) // persona (empleados item) | null
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(null)
  const [mesFiltro, setMesFiltro] = useState('todos') // 'todos' | nombre del mes (ej. 'Marzo')

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga(null)
    try {
      const [empleadosRes, mesesRes, procesosRes] = await Promise.all([
        empleadosApi.listarEmpleadosActivosPorDependencia(CIERRE_CFG.dependenciaEmpleados),
        productividadApi.listarCierreMesesPorAnio(anioActivo),
        // Procesos disciplinarios de este departamento (misma tabla que usa ProcesosDisciplinarios.jsx).
        procesosApi.listarProcesosDisciplinariosPorDepartamento(CIERRE_CFG.dependenciaEmpleados),
      ])
      if (empleadosRes.error) throw empleadosRes.error
      if (mesesRes.error) throw mesesRes.error
      // Los procesos disciplinarios son un "plus" informativo: si falla esa consulta
      // (p.ej. permisos) no debe romper toda la vista de Cierre.
      if (procesosRes.error) console.error('No se pudieron cargar procesos disciplinarios:', procesosRes.error)

      // Agrupamos los procesos disciplinarios por nombre normalizado, más recientes primero.
      const procesosPorNombre = new Map()
      ;(procesosRes.data || [])
        .slice()
        .sort((a, b) => {
          const fa = a.fecha_inicio || a.fecha || a.created_at || ''
          const fb = b.fecha_inicio || b.fecha || b.created_at || ''
          return fa < fb ? 1 : fa > fb ? -1 : 0
        })
        .forEach(p => {
          const key = normalizeNombre(p.nombre_empleado)
          if (!key) return
          if (!procesosPorNombre.has(key)) procesosPorNombre.set(key, [])
          procesosPorNombre.get(key).push(p)
        })

      const porNombre = new Map()
      empleadosRes.data.forEach(e => {
        porNombre.set(e.nombre_completo, {
          nombre: e.nombre_completo, cargo: e.cargo || '', ingreso: e.fecha_ingreso || '',
          procesos: procesosPorNombre.get(normalizeNombre(e.nombre_completo)) || [],
        })
      })

      const porMes = {}
      mesesRes.data.forEach(row => {
        if (!porNombre.has(row.nombre_empleado)) return
        if (!porMes[row.mes]) porMes[row.mes] = {}
        porMes[row.mes][row.nombre_empleado] = row
      })

      setEmpleados(Array.from(porNombre.values()))
      setDatosPorMes(porMes)
      const ordenados = MESES_FULL.filter(m => porMes[m])
      setMesesAbiertos(new Set(ordenados.length ? [ordenados[ordenados.length - 1]] : []))
    } catch (err) {
      console.error(err)
      setErrorCarga(err.message || 'No se pudieron cargar los datos de Cierre.')
    } finally {
      setCargando(false)
    }
  }, [anioActivo])

  useEffect(() => { Promise.resolve().then(() => cargar()) }, [anioActivo, cargar])

  const mesesOrdenados = MESES_FULL.filter(m => datosPorMes[m])
  const mesesVisibles = mesFiltro === 'todos' ? mesesOrdenados : mesesOrdenados.filter(m => m === mesFiltro)

  const toggleMes = (mes) => setMesesAbiertos(prev => {
    const next = new Set(prev)
    next.has(mes) ? next.delete(mes) : next.add(mes)
    return next
  })
  const expandirTodos = () => setMesesAbiertos(new Set(mesesOrdenados))
  const colapsarTodos = () => setMesesAbiertos(new Set())

  // ── Métricas agregadas para KPIs / podio / gráfico ──────────────────────
  // Todas se calculan sobre `mesesVisibles`, que respeta el filtro de mes.
  const etiquetaPeriodo = mesFiltro === 'todos' ? String(anioActivo) : `${mesFiltro} ${anioActivo}`

  const resumenEquipo = useMemo(() => {
    const porPersona = new Map(empleados.map(e => [e.nombre, { nombre: e.nombre, totalDolares: 0, totalUnidades: 0, sumaNewOffers: 0, conteoNewOffers: 0 }]))
    mesesVisibles.forEach(mes => {
      const fila = datosPorMes[mes] || {}
      empleados.forEach(e => {
        const d = fila[e.nombre]
        if (!d) return
        const p = porPersona.get(e.nombre)
        p.totalDolares += Number(d.total_dollars) || 0
        p.totalUnidades += Number(d.total_units) || 0
        p.sumaNewOffers += Number(d.new_offers_units) || 0
        p.conteoNewOffers += 1
      })
    })
    return Array.from(porPersona.values())
  }, [empleados, datosPorMes, mesesVisibles])

  const monthlyDollarTotals = mesesVisibles.map(mes => {
    const fila = datosPorMes[mes] || {}
    return empleados.reduce((s, e) => s + (Number(fila[e.nombre]?.total_dollars) || 0), 0)
  })
  const totalDolaresAnio = monthlyDollarTotals.reduce((s, v) => s + v, 0)
  const totalUnidadesAnio = resumenEquipo.reduce((s, p) => s + p.totalUnidades, 0)
  const promedioNewOffers = (() => {
    const conDatos = resumenEquipo.filter(p => p.conteoNewOffers > 0)
    if (!conDatos.length) return 0
    return conDatos.reduce((s, p) => s + p.sumaNewOffers / p.conteoNewOffers, 0) / conDatos.length
  })()
  const rankedDolares = useMemo(() => [...resumenEquipo].sort((a, b) => b.totalDolares - a.totalDolares), [resumenEquipo])
  const top3 = rankedDolares.filter(p => p.totalDolares > 0).slice(0, 3)
  const maxMensual = Math.max(...monthlyDollarTotals, 1)
  const mejorMesIdx = monthlyDollarTotals.length
    ? monthlyDollarTotals.reduce((best, v, i) => (v > monthlyDollarTotals[best] ? i : best), 0)
    : -1

  async function guardarMes(mes, valores) {
    setGuardando(true)
    setErrorGuardado(null)
    try {
      const filas = Object.entries(valores).map(([nombre, v]) => ({
        nombre_empleado: nombre,
        anio: anioActivo,
        mes,
        new_offers_units: Number(v.new_offers_units) || 0,
        new_offers_dollars: Number(v.new_offers_dollars) || 0,
        renewal_units: Number(v.renewal_units) || 0,
        renewal_dollars: Number(v.renewal_dollars) || 0,
        total_units: Number(v.total_units) || 0,
        total_dollars: Number(v.total_dollars) || 0,
        updated_at: new Date().toISOString(),
      }))
      const { error } = await productividadApi.upsertCierreMeses(filas)
      if (error) throw error
      await cargar()
      setMesesAbiertos(prev => new Set(prev).add(mes))
      setModalMes(null)
    } catch (err) {
      console.error(err)
      setErrorGuardado(err.message || 'No se pudo guardar.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="pr-state">
        <Loader2 size={26} />
        <span className="pr-state-title">Cargando productividad de Cierre…</span>
      </div>
    )
  }
  if (errorCarga) {
    return (
      <div className="pr-state pr-state-error">
        <AlertTriangle size={26} />
        <span className="pr-state-title">No se pudieron cargar los datos</span>
        <span className="pr-state-sub">{errorCarga}</span>
        <button className="pr-btn pr-btn--primary" onClick={cargar}>Reintentar</button>
      </div>
    )
  }

  return (
    <>
      {verProcesos && (
        <ProcesosDisciplinariosModal persona={verProcesos} onCerrar={() => setVerProcesos(null)} />
      )}
      {modalMes && (
        <MesCierreModal
          mesInicial={modalMes.mesInicial}
          anio={anioActivo}
          empleados={empleados}
          datosIniciales={modalMes.mesInicial ? datosPorMes[modalMes.mesInicial] : null}
          mesesOcupados={mesesOrdenados}
          guardando={guardando}
          errorGuardado={errorGuardado}
          onGuardar={guardarMes}
          onCerrar={() => { if (!guardando) { setModalMes(null); setErrorGuardado(null) } }}
        />
      )}

      {empleados.length === 0 ? (
        <div className="pr-card">
          <div className="ci-empty-mes">
            No hay empleados activos con dependencia {CIERRE_CFG.dependenciaEmpleados}. Agrégalos o actívalos en la sección Empleados.
          </div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="pr-kpis">
            <div className="pr-kpi">
              <div className="pr-kpi-accent" />
              <span className="pr-kpi-label">Total cerrado {etiquetaPeriodo}</span>
              <span className="pr-kpi-value">{fmtMoneda(totalDolaresAnio)}</span>
              <span className="pr-kpi-sub"><DollarSign size={12} /> en dólares cerrados</span>
            </div>
            <div className="pr-kpi">
              <div className="pr-kpi-accent" />
              <span className="pr-kpi-label">Unidades cerradas</span>
              <span className="pr-kpi-value">{totalUnidadesAnio.toLocaleString('es-CO')}</span>
              <span className="pr-kpi-sub"><Layers size={12} /> {empleados.length} analistas</span>
            </div>
            <div className="pr-kpi">
              <div className="pr-kpi-accent" />
              <span className="pr-kpi-label">Promedio New Offers %</span>
              <span className="pr-kpi-value">{promedioNewOffers.toFixed(1)}%</span>
              <span className="pr-kpi-sub"><TrendingUp size={12} /> cierre de ofertas nuevas</span>
            </div>
            {mesFiltro === 'todos' ? (
              <div className="pr-kpi">
                <div className="pr-kpi-accent" />
                <span className="pr-kpi-label">Mejor mes del equipo</span>
                <span className="pr-kpi-value">{mejorMesIdx >= 0 ? mesesVisibles[mejorMesIdx] : '—'}</span>
                <span className="pr-kpi-sub">{mejorMesIdx >= 0 ? `${fmtMoneda(monthlyDollarTotals[mejorMesIdx])} cerrados` : 'sin datos aún'}</span>
              </div>
            ) : (
              <div className="pr-kpi">
                <div className="pr-kpi-accent" />
                <span className="pr-kpi-label">Líder de {mesFiltro}</span>
                <span className="pr-kpi-value">{top3[0]?.nombre || '—'}</span>
                <span className="pr-kpi-sub">{top3[0] ? `${fmtMoneda(top3[0].totalDolares)} cerrados` : 'sin datos aún'}</span>
              </div>
            )}
          </div>

          {/* Podio top 3 por $ cerrado */}
          {top3.length > 0 && (
            <div className="pr-card">
              <div className="pr-card-head">
                <span className="pr-card-title"><Award size={15} color="#0F2A47" /> Top 3 analistas · {etiquetaPeriodo}</span>
              </div>
              <div className="pr-podio">
                {top3[1] && (
                  <div className="pr-podio-item pr-podio-2">
                    <div className="pr-podio-avatar">{iniciales(top3[1].nombre)}</div>
                    <span className="pr-podio-name">{top3[1].nombre}</span>
                    <span className="pr-podio-total">{fmtMoneda(top3[1].totalDolares)}</span>
                    <div className="pr-podio-bar" />
                  </div>
                )}
                {top3[0] && (
                  <div className="pr-podio-item pr-podio-1">
                    <Medal size={16} color="#F59E0B" />
                    <div className="pr-podio-avatar">{iniciales(top3[0].nombre)}</div>
                    <span className="pr-podio-name">{top3[0].nombre}</span>
                    <span className="pr-podio-total">{fmtMoneda(top3[0].totalDolares)}</span>
                    <div className="pr-podio-bar" />
                  </div>
                )}
                {top3[2] && (
                  <div className="pr-podio-item pr-podio-3">
                    <div className="pr-podio-avatar">{iniciales(top3[2].nombre)}</div>
                    <span className="pr-podio-name">{top3[2].nombre}</span>
                    <span className="pr-podio-total">{fmtMoneda(top3[2].totalDolares)}</span>
                    <div className="pr-podio-bar" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gráfico mensual de $ cerrados */}
          {mesesVisibles.length > 0 && (
            <div className="pr-card">
              <div className="pr-card-head">
                <span className="pr-card-title"><TrendingUp size={15} color="#0F2A47" /> Dólares cerrados · {etiquetaPeriodo}</span>
                <span className="pr-count">Click en un mes para expandir su detalle</span>
              </div>
              <div className="pr-chart">
                {mesesVisibles.map((mes, i) => (
                  <div className="pr-chart-col" key={mes}>
                    <span className="pr-chart-val">{monthlyDollarTotals[i] ? fmtMoneda(monthlyDollarTotals[i]) : ''}</span>
                    <div
                      className={`pr-chart-bar ${i === mejorMesIdx ? 'pr-chart-bar--best' : ''} ${monthlyDollarTotals[i] === 0 ? 'pr-chart-bar--empty' : ''} ${mesesAbiertos.has(mes) ? 'pr-chart-bar--selected' : ''}`}
                      style={{ height: `${Math.max((monthlyDollarTotals[i] / maxMensual) * 100, monthlyDollarTotals[i] === 0 ? 4 : 6)}%` }}
                    />
                    <span className="pr-chart-label" onClick={() => toggleMes(mes)}>{mes.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Procesos disciplinarios */}
          <div className="pr-card">
            <div className="pr-card-head">
              <span className="pr-card-title"><ShieldAlert size={15} color="#DC2626" /> Procesos disciplinarios</span>
            </div>
            <div className="ci-table-scroll">
              <table className="ci-table">
                <thead>
                  <tr>
                    <th>Nombre completo</th>
                    {empleados.map(e => (
                      <th key={e.nombre}>
                        <div className="ci-th-nombre">{e.nombre}</div>
                        {e.ingreso && <div className="ci-th-ingreso">Ingreso: {fmtFecha(e.ingreso)}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Procesos disciplinarios</td>
                    {empleados.map(e => (
                      <td key={e.nombre}>
                        {(e.procesos?.length || 0) > 0 ? (
                          <button
                            className="pr-flag pr-flag--warn"
                            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'none' }}
                            title="Ver procesos disciplinarios"
                            onClick={() => setVerProcesos(e)}
                          >
                            <ShieldAlert size={12} /> {e.procesos.length}
                          </button>
                        ) : (
                          <span className="pr-flag pr-flag--ok">0</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="pr-btn pr-btn--primary" onClick={() => setModalMes({ mesInicial: null })}>
              <Sparkles size={13} /> Agregar mes de cierre
            </button>
            {mesesOrdenados.length > 0 && (
              <>
                <select className="pr-select" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)}>
                  <option value="todos">Todos los meses</option>
                  {mesesOrdenados.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button className="pr-btn pr-btn--ghost" onClick={expandirTodos}>Expandir todos</button>
                <button className="pr-btn pr-btn--ghost" onClick={colapsarTodos}>Colapsar todos</button>
              </>
            )}
          </div>

          {mesesOrdenados.length === 0 ? (
            <div className="pr-card">
              <div className="ci-empty-mes">
                Todavía no hay meses de cierre registrados para {anioActivo}. Usa "Agregar mes de cierre" para empezar.
              </div>
            </div>
          ) : mesesVisibles.length === 0 ? (
            <div className="pr-card">
              <div className="ci-empty-mes">
                No hay datos de cierre para {mesFiltro} de {anioActivo}.
              </div>
            </div>
          ) : mesesVisibles.map((mes) => {
            const idx = mesesVisibles.indexOf(mes)
            const datos = datosPorMes[mes]
            const abierto = mesesAbiertos.has(mes)
            const dolaresMes = monthlyDollarTotals[idx]
            const unidadesMes = empleados.reduce((s, e) => s + (Number(datos[e.nombre]?.total_units) || 0), 0)
            // Analista con más $ cerrados este mes, para la corona
            let mejorNombre = null, mejorValor = 0
            empleados.forEach(e => {
              const v = Number(datos[e.nombre]?.total_dollars) || 0
              if (v > mejorValor) { mejorValor = v; mejorNombre = e.nombre }
            })
            return (
              <div className="pr-card ci-mes-card" key={mes}>
                <div className="ci-mes-title" onClick={() => toggleMes(mes)}>
                  <div className="ci-mes-title-left">
                    <div className="ci-mes-icon"><TrendingUp size={15} /></div>
                    <div>
                      <b>Cierre de {mes} · {anioActivo}</b>
                      <div className="ci-mes-sub">{fmtMoneda(dolaresMes)} · {unidadesMes.toLocaleString('es-CO')} unidades</div>
                    </div>
                  </div>
                  <div className="ci-mes-actions">
                    <button
                      className="pr-btn pr-btn--ghost"
                      onClick={e => { e.stopPropagation(); setModalMes({ mesInicial: mes }) }}
                    ><Pencil size={13} /> Editar</button>
                    {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {abierto && (
                  <div className="ci-table-scroll">
                    <table className="ci-table">
                      <thead>
                        <tr>
                          <th>Métrica</th>
                          {empleados.map(e => (
                            <th key={e.nombre}>
                              <div className="ci-th-nombre">{e.nombre}</div>
                              {e.ingreso && <div className="ci-th-ingreso">Ingreso: {fmtFecha(e.ingreso)}</div>}
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
                            <tr className={met.tipo === 'moneda' || met.key === 'total_units' ? 'ci-row--total' : ''}>
                              <td>{met.label}</td>
                              {empleados.map(e => {
                                if (noHabiaIngresado(e, mes, anioActivo)) {
                                  return <td key={e.nombre}><span className="ci-na-cell" title={`Ingresó el ${fmtFecha(e.ingreso)}`}>N/A</span></td>
                                }
                                const v = datos[e.nombre]?.[met.key]
                                if (v == null) return <td key={e.nombre}>—</td>
                                if (met.tipo === 'pct') return <td key={e.nombre}><PctBar value={v} /></td>
                                if (met.tipo === 'moneda') return (
                                  <td key={e.nombre}>
                                    <span className="ci-total-cell">
                                      {fmtMoneda(v)}
                                      {e.nombre === mejorNombre && mejorValor > 0 && <Trophy size={12} className="ci-crown" />}
                                    </span>
                                  </td>
                                )
                                return <td key={e.nombre}>{v}</td>
                              })}
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}
    </>
  )
}
