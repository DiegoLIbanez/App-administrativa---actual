// =============================================================
// src/utils/cierreFilas.js
// -------------------------------------------------------------
// Armado de filas de la tabla "cierre_meses". Lo comparten el guardado
// manual del mes (CierreView) y la importación desde Excel, para que
// ambos escriban EXACTAMENTE lo mismo (incluidas las columnas heredadas
// que sigue usando la base de datos).
// =============================================================
import { calcPct } from './productividadHelpers'

/** Lee los 4 valores de una fila de BD (nombres nuevos o los heredados). */
export function valoresDeFilaCierre(row) {
  return {
    cierres_asignados: Number(row.cierres_asignados ?? row.new_offers_units) || 0,
    cierres_cerrados: Number(row.cierres_cerrados ?? row.new_offers_dollars) || 0,
    total_plata: Number(row.total_plata ?? row.renewal_dollars) || 0,
    plata_prestada: Number(row.plata_prestada ?? row.total_units) || 0,
  }
}

/**
 * v: { cierres_asignados, cierres_cerrados, total_plata, plata_prestada, porcentaje_plata? }
 * El % de cierres SIEMPRE sale de resueltos ÷ asignados.
 */
export function armarFilaCierre(nombre, anio, mes, v) {
  const asig = Number(v.cierres_asignados) || 0
  const cerr = Number(v.cierres_cerrados) || 0
  const pctC = calcPct(cerr, asig)
  const totP = Number(v.total_plata) || 0
  const presP = Number(v.plata_prestada) || 0
  const pctP = Number(v.porcentaje_plata) || (totP > 0 ? Math.round((presP / totP) * 100) : 0)

  return {
    nombre_empleado: nombre,
    anio,
    mes,
    // Columnas nuevas
    cierres_asignados: asig,
    cierres_cerrados: cerr,
    porcentaje_cierres: pctC,
    total_plata: totP,
    plata_prestada: presP,
    porcentaje_plata: pctP,
    // Compatibilidad con columnas existentes de base de datos
    new_offers_units: asig,
    new_offers_dollars: cerr,
    renewal_units: pctC,
    renewal_dollars: totP,
    total_units: presP,
    total_dollars: pctP,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Upsert con reintento: si la BD aún no tiene las columnas nuevas, reintenta
 * solo con las heredadas. Devuelve el error (o null).
 */
export async function upsertCierreConFallback(upsert, filas) {
  let { error } = await upsert(filas)
  if (error && error.message && error.message.includes('column')) {
    const res2 = await upsert(filas.map(f => ({
      nombre_empleado: f.nombre_empleado, anio: f.anio, mes: f.mes,
      new_offers_units: f.new_offers_units, new_offers_dollars: f.new_offers_dollars,
      renewal_units: f.renewal_units, renewal_dollars: f.renewal_dollars,
      total_units: f.total_units, total_dollars: f.total_dollars, updated_at: f.updated_at,
    })))
    error = res2.error
  }
  return error || null
}
