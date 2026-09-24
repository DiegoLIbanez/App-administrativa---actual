// =============================================================
// src/utils/cierreExport.js
// -------------------------------------------------------------
// Generación y descarga de archivo Excel para Productividad de Cierre
// con estilo institucional AmeriGlobal, consolidado anual y detalle por mes.
// =============================================================
import { crearLibro, crearHoja, descargarWorkbook } from './exportarExcel'
import { fmtFecha, calcPct } from './productividadHelpers'

export async function exportarCierreExcel({ anio, empleados, datosPorMes, mesesOrdenados }) {
  const wb = await crearLibro()

  // 1. Hoja Consolidado Anual
  const resumenFilas = empleados.map(emp => {
    let sumAsignados = 0
    let sumCerrados = 0
    let sumTotalPlata = 0
    let sumPlataPrestada = 0
    let mesesConDatos = 0

    mesesOrdenados.forEach(mes => {
      const row = datosPorMes[mes]?.[emp.nombre]
      if (row) {
        sumAsignados += Number(row.cierres_asignados ?? row.new_offers_units) || 0
        sumCerrados += Number(row.cierres_cerrados ?? row.new_offers_dollars) || 0
        sumTotalPlata += Number(row.total_plata ?? row.renewal_dollars) || 0
        sumPlataPrestada += Number(row.plata_prestada ?? row.total_units) || 0
        mesesConDatos += 1
      }
    })

    const pctCierres = calcPct(sumCerrados, sumAsignados)
    const pctPlata = sumTotalPlata > 0 ? Math.round((sumPlataPrestada / sumTotalPlata) * 100) : 0

    return {
      'Analista / Empleado': emp.nombre,
      'Cargo': emp.cargo || 'Analista de Cierre',
      'Fecha Ingreso': fmtFecha(emp.ingreso),
      'Meses Reportados': mesesConDatos,
      'Clientes Asignados': sumAsignados,
      'Clientes Resueltos': sumCerrados,
      '% Efectividad Anual': `${pctCierres}%`,
      'Total Plata ($)': sumTotalPlata,
      'Plata Prestada ($)': sumPlataPrestada,
      '% Plata Colocada': `${pctPlata}%`,
      'Procesos Disciplinarios': emp.procesos?.length || 0,
    }
  })

  await crearHoja(wb, `Consolidado ${anio}`, resumenFilas, {
    titulo: `Productividad de Cierre — Consolidado Anual ${anio}`,
    anchosColumnas: [28, 22, 16, 16, 18, 18, 16, 20, 20, 18, 22],
    marca: true,
  })

  // 2. Hoja Detalle Mensual
  const detalleFilas = []
  mesesOrdenados.forEach(mes => {
    const mesData = datosPorMes[mes] || {}
    empleados.forEach(emp => {
      const row = mesData[emp.nombre]
      if (row) {
        const asignados = Number(row.cierres_asignados ?? row.new_offers_units) || 0
        const cerrados = Number(row.cierres_cerrados ?? row.new_offers_dollars) || 0
        const pctCierres = calcPct(cerrados, asignados)
        const totalPlata = Number(row.total_plata ?? row.renewal_dollars) || 0
        const plataPrestada = Number(row.plata_prestada ?? row.total_units) || 0
        const pctPlata = Number(row.porcentaje_plata ?? row.total_dollars) || (totalPlata > 0 ? Math.round((plataPrestada / totalPlata) * 100) : 0)

        detalleFilas.push({
          'Año': anio,
          'Mes': mes,
          'Analista / Empleado': emp.nombre,
          'Cargo': emp.cargo || 'Analista de Cierre',
          'Clientes Asignados': asignados,
          'Clientes Resueltos': cerrados,
          '% Efectividad': `${pctCierres}%`,
          'Total Plata ($)': totalPlata,
          'Plata Prestada ($)': plataPrestada,
          '% Plata': `${pctPlata}%`,
        })
      }
    })
  })

  if (detalleFilas.length > 0) {
    await crearHoja(wb, `Detalle Mensual ${anio}`, detalleFilas, {
      titulo: `Productividad de Cierre — Detalle Mensual por Analista ${anio}`,
      anchosColumnas: [10, 15, 28, 22, 18, 18, 14, 20, 20, 14],
      marca: true,
    })
  }

  const hoy = new Date().toISOString().slice(0, 10)
  await descargarWorkbook(wb, `Productividad_Cierre_${anio}_${hoy}.xlsx`)
}
