// =============================================================
// src/utils/productividadExport.js
// -------------------------------------------------------------
// Excel de Productividad para departamentos con Clientes Asignados /
// Clientes Resueltos (Ventas, UW-BS). Dos hojas: consolidado del año y
// detalle mes a mes. El % de resolución siempre es resueltos ÷ asignados.
// =============================================================
import { crearLibro, crearHoja, descargarWorkbook } from './exportarExcel'
import { MESES_FULL } from './productividadConstants'
import { fmtFecha, calcPct } from './productividadHelpers'

export async function exportarProductividadClientesExcel({ cfg, anio, filas }) {
  const wb = await crearLibro()

  // 1. Consolidado anual por persona
  const consolidado = filas.map(v => ({
    'Posición': v.rank,
    [cfg.personaLabel]: v.nombre,
    'Cargo': v.cargo || '—',
    'Fecha Ingreso': fmtFecha(v.ingreso),
    'Clientes Asignados': v.totalAsignados,
    'Clientes Resueltos': v.totalResueltos,
    '% Resolución': `${v.pct}%`,
    'Procesos Disciplinarios': v.procesos?.length || 0,
  }))
  await crearHoja(wb, `Consolidado ${anio}`, consolidado, {
    titulo: `Productividad — ${cfg.tabLabel} · Consolidado ${anio}`,
    anchosColumnas: [10, 28, 22, 16, 18, 18, 14, 22],
    marca: true,
  })

  // 2. Detalle mensual (una fila por persona + mes con datos)
  const detalle = []
  MESES_FULL.forEach((mes, i) => {
    filas.forEach(v => {
      const asig = v.asignados[i] || 0
      const resu = v.resueltos[i] || 0
      if (!asig && !resu) return
      detalle.push({
        'Año': anio,
        'Mes': mes,
        [cfg.personaLabel]: v.nombre,
        'Cargo': v.cargo || '—',
        'Clientes Asignados': asig,
        'Clientes Resueltos': resu,
        '% Resolución': `${calcPct(resu, asig)}%`,
      })
    })
  })
  if (detalle.length > 0) {
    await crearHoja(wb, `Detalle Mensual ${anio}`, detalle, {
      titulo: `Productividad — ${cfg.tabLabel} · Detalle mensual ${anio}`,
      anchosColumnas: [8, 14, 28, 22, 18, 18, 14],
      marca: true,
    })
  }

  const hoy = new Date().toISOString().slice(0, 10)
  await descargarWorkbook(wb, `Productividad_${cfg.tabLabel}_${anio}_${hoy}.xlsx`)
}
