import PageTitle from '../components/ui/PageTitle'
import { FileBarChart as TitleIcon } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import * as novedadesApi from '../api/novedades'
import * as empleadosApi from '../api/empleados'
import { hoyISO } from '../utils/fecha'
import { normalizarConcepto, CONCEPTO_COLORS } from '../utils/parseExcel'
import { crearLibro, crearHoja, descargarWorkbook } from '../utils/exportarExcel'
import {
  FileBarChart, Download, Loader2, FileText, Building2,
  Calendar, TrendingUp, AlertCircle, RefreshCw,
} from 'lucide-react'

function formatPeriodo(p) {
  if (!p) return 'Sin periodo'
  const MESES = ['', 'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const m = p.match(/^(\d{4})-(\d{2})$/)
  if (m) return `${MESES[parseInt(m[2])]} ${m[1]}`
  return p
}

export default function Informe() {
  const [novedades, setNovedades]   = useState([])
  const [empleados, setEmpleados]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [exportando, setExportando] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: nov, error: novErr }, { data: emp, error: empErr }] = await Promise.all([
        novedadesApi.listarNovedadesCompleto(),
        empleadosApi.listarEmpleados(),
      ])
      if (novErr) throw novErr
      if (empErr) throw empErr
      setNovedades(nov || [])
      setEmpleados(emp || [])
    } catch (e) {
      setError(e.message || 'No se pudo cargar la información.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { Promise.resolve().then(() => load()) }, [])

  // ── Cálculos del informe ──────────────────────────────────────────────────
  const informe = useMemo(() => {
    // Por concepto
    const porConcepto = {}
    novedades.forEach(r => {
      const c = normalizarConcepto(r.concepto)
      if (!porConcepto[c]) porConcepto[c] = { concepto: c, registros: 0, dias: 0 }
      porConcepto[c].registros += 1
      porConcepto[c].dias += parseFloat(r.total_dias) || 0
    })
    const listaConcepto = Object.values(porConcepto).sort((a, b) => b.registros - a.registros)

    // Por área/dependencia
    const porArea = {}
    novedades.forEach(r => {
      const a = r.dependencia?.trim() || 'Sin área'
      if (!porArea[a]) porArea[a] = { area: a, registros: 0, dias: 0 }
      porArea[a].registros += 1
      porArea[a].dias += parseFloat(r.total_dias) || 0
    })
    const listaArea = Object.values(porArea).sort((a, b) => b.registros - a.registros)

    // Por periodo/mes
    const porPeriodo = {}
    novedades.forEach(r => {
      const p = r.periodo?.trim() || 'Sin periodo'
      if (!porPeriodo[p]) porPeriodo[p] = { periodo: p, registros: 0, dias: 0 }
      porPeriodo[p].registros += 1
      porPeriodo[p].dias += parseFloat(r.total_dias) || 0
    })
    const listaPeriodo = Object.values(porPeriodo).sort((a, b) => (a.periodo > b.periodo ? 1 : -1))

    // Top empleados con más novedades
    const porEmpleado = {}
    novedades.forEach(r => {
      const n = r.nombre_empleado?.trim() || 'Sin nombre'
      if (!porEmpleado[n]) porEmpleado[n] = { nombre: n, registros: 0, dias: 0, conceptos: new Set() }
      porEmpleado[n].registros += 1
      porEmpleado[n].dias += parseFloat(r.total_dias) || 0
      porEmpleado[n].conceptos.add(normalizarConcepto(r.concepto))
    })
    const listaEmpleados = Object.values(porEmpleado)
      .map(e => ({ ...e, conceptos: e.conceptos.size }))
      .sort((a, b) => b.registros - a.registros)
      .slice(0, 20)

    // Resumen general
    const totalDias = novedades.reduce((s, r) => s + (parseFloat(r.total_dias) || 0), 0)
    const empleadosActivos   = empleados.filter(e => e.activo !== false).length
    const empleadosInactivos = empleados.filter(e => e.activo === false).length
    const empleadosConNovedad = new Set(novedades.map(r => r.nombre_empleado?.trim()).filter(Boolean)).size

    return {
      listaConcepto, listaArea, listaPeriodo, listaEmpleados,
      totalNovedades: novedades.length,
      totalDias,
      totalEmpleados: empleados.length,
      empleadosActivos, empleadosInactivos, empleadosConNovedad,
    }
  }, [novedades, empleados])

  const exportarInforme = async () => {
    setExportando(true)
    try {
      const wb = await crearLibro()

      // Hoja 1: Resumen general
      await crearHoja(wb, 'Resumen', [
        { Indicador: 'Total de novedades',           Valor: informe.totalNovedades },
        { Indicador: 'Total de días',                Valor: informe.totalDias.toFixed(1) },
        { Indicador: 'Total de empleados',            Valor: informe.totalEmpleados },
        { Indicador: 'Empleados activos',              Valor: informe.empleadosActivos },
        { Indicador: 'Empleados inactivos',            Valor: informe.empleadosInactivos },
        { Indicador: 'Empleados con alguna novedad',   Valor: informe.empleadosConNovedad },
        { Indicador: 'Fecha del informe',              Valor: new Date().toLocaleDateString('es-CO') },
      ], { anchosColumnas: [32, 18], titulo: 'Resumen general' })

      // Hoja 2: Por concepto
      await crearHoja(wb, 'Por Concepto',
        informe.listaConcepto.map(c => ({ Concepto: c.concepto, Registros: c.registros, 'Total Días': c.dias.toFixed(1) })),
        { anchosColumnas: [22, 12, 12], titulo: 'Novedades por concepto' }
      )

      // Hoja 3: Por área
      await crearHoja(wb, 'Por Área',
        informe.listaArea.map(a => ({ Área: a.area, Registros: a.registros, 'Total Días': a.dias.toFixed(1) })),
        { anchosColumnas: [24, 12, 12], titulo: 'Novedades por área' }
      )

      // Hoja 4: Por periodo
      await crearHoja(wb, 'Por Periodo',
        informe.listaPeriodo.map(p => ({ Periodo: formatPeriodo(p.periodo), Registros: p.registros, 'Total Días': p.dias.toFixed(1) })),
        { anchosColumnas: [18, 12, 12], titulo: 'Novedades por periodo' }
      )

      // Hoja 5: Top empleados
      await crearHoja(wb, 'Top Empleados',
        informe.listaEmpleados.map((e, i) => ({
          '#': i + 1, 'Nombre Completo': e.nombre, Registros: e.registros,
          'Total Días': e.dias.toFixed(1), 'Tipos de Novedad': e.conceptos,
        })),
        { anchosColumnas: [5, 30, 12, 12, 16], titulo: 'Top empleados' }
      )

      const hoy = hoyISO()
      await descargarWorkbook(wb, `Informe_General_AmeriGlobal_${hoy}.xlsx`)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <PageTitle icon={TitleIcon}>Informe General</PageTitle>
          <p>Resumen completo de novedades y empleados en la base de datos.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Actualizar
          </button>
          <button className="btn btn-primary" onClick={exportarInforme} disabled={loading || exportando || informe.totalNovedades === 0}>
            {exportando ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
            {exportando ? 'Generando...' : 'Exportar a Excel'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state"><Loader2 size={28} className="spin" /><p>Cargando información...</p></div>
      ) : informe.totalNovedades === 0 ? (
        <div className="empty-state">
          <FileBarChart size={32} style={{ color: '#D1D5DB', marginBottom: 8 }} />
          <p>Todavía no hay novedades registradas en la base de datos.</p>
        </div>
      ) : (
        <>
          {/* ── Resumen general ── */}
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card accent">
              <div className="stat-label">Total novedades</div>
              <div className="stat-value">{informe.totalNovedades}</div>
              <div className="stat-sub">{informe.totalDias.toFixed(0)} días en total</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Empleados activos</div>
              <div className="stat-value" style={{ color: 'var(--success-text)' }}>{informe.empleadosActivos}</div>
              <div className="stat-sub">de {informe.totalEmpleados} registrados</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Empleados inactivos</div>
              <div className="stat-value" style={{ color: 'var(--danger-text)' }}>{informe.empleadosInactivos}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Con alguna novedad</div>
              <div className="stat-value" style={{ color: '#7C3AED' }}>{informe.empleadosConNovedad}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* ── Por concepto ── */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <FileText size={16} style={{ color: 'var(--primary)' }} /> Por concepto
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {informe.listaConcepto.map(c => {
                  const max = informe.listaConcepto[0]?.registros || 1
                  const pct = Math.max(4, (c.registros / max) * 100)
                  const color = CONCEPTO_COLORS[c.concepto] || '#374151'
                  return (
                    <div key={c.concepto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 110, fontSize: 12, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.concepto}</span>
                      <div style={{ flex: 1, height: 16, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, width: 30, textAlign: 'right', flexShrink: 0 }}>{c.registros}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Por área ── */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Building2 size={16} style={{ color: 'var(--primary)' }} /> Por área
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                {informe.listaArea.map(a => {
                  const max = informe.listaArea[0]?.registros || 1
                  const pct = Math.max(4, (a.registros / max) * 100)
                  return (
                    <div key={a.area} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 110, fontSize: 12, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.area}</span>
                      <div style={{ flex: 1, height: 16, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#7C3AED', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, width: 30, textAlign: 'right', flexShrink: 0 }}>{a.registros}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Por periodo ── */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} /> Por periodo
              </h3>
              <div className="table-container" style={{ maxHeight: 280, overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr><th>Periodo</th><th style={{ textAlign: 'center' }}>Registros</th><th style={{ textAlign: 'center' }}>Días</th></tr>
                  </thead>
                  <tbody>
                    {informe.listaPeriodo.map(p => (
                      <tr key={p.periodo}>
                        <td style={{ fontSize: 12.5 }}>{formatPeriodo(p.periodo)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{p.registros}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{p.dias.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Top empleados ── */}
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> Top empleados con más novedades
              </h3>
              <div className="table-container" style={{ maxHeight: 280, overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr><th>Empleado</th><th style={{ textAlign: 'center' }}>Registros</th><th style={{ textAlign: 'center' }}>Días</th></tr>
                  </thead>
                  <tbody>
                    {informe.listaEmpleados.map((e, i) => (
                      <tr key={e.nombre}>
                        <td style={{ fontSize: 12.5, fontWeight: i < 3 ? 700 : 400 }}>
                          {i < 3 && <span style={{ marginRight: 5 }}>{['🥇', '🥈', '🥉'][i]}</span>}
                          {e.nombre}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>{e.registros}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{e.dias.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}
