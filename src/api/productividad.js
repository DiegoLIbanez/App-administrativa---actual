// =============================================================
// API: Productividad
// Peticiones a Supabase relacionadas con las tablas `productividad`,
// `productividad_resumen` y `cierre_meses` (vista de Cierre).
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'

// ── productividad (Ventas / UW-BS) ──────────────────────────────────────────

/** Filas de productividad de un departamento + métrica (usado en la vista principal). */
export function listarProductividadPorDepartamento(departamento, metrica, empresa) {
  let query = supabase.from('productividad').select('*').eq('departamento', departamento).eq('metrica', metrica)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Solo los campos usados en Colaboradores, filtrado por métrica "Producción". */
export function listarProductividadParaColaboradores(metrica = 'Producción', empresa) {
  let query = supabase
    .from('productividad')
    .select('nombre_empleado, departamento, periodo, anio, valor, empresa')
    .eq('metrica', metrica)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function upsertProductividad(filas, empresa = 'ameriglobal') {
  const formateados = (filas || []).map(f => ({
    ...f,
    empresa: f.empresa || empresa,
  }))
  return supabase
    .from('productividad')
    .upsert(formateados, { onConflict: 'nombre_empleado,departamento,periodo,metrica,anio' })
}

export function eliminarProductividadDePersona(nombre, departamento, empresa) {
  let query = supabase.from('productividad').delete().eq('nombre_empleado', nombre).eq('departamento', departamento)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

// ── productividad_resumen ───────────────────────────────────────────────────

export function listarResumenPorDepartamento(departamento, empresa) {
  let query = supabase.from('productividad_resumen').select('*').eq('departamento', departamento)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function upsertResumen(payload, empresa = 'ameriglobal') {
  const formateado = Array.isArray(payload)
    ? payload.map(p => ({ ...p, empresa: p.empresa || empresa }))
    : { ...payload, empresa: payload.empresa || empresa }
  return supabase
    .from('productividad_resumen')
    .upsert(formateado, { onConflict: 'nombre_empleado,departamento' })
}

export function eliminarResumenDePersona(nombre, departamento, empresa) {
  let query = supabase.from('productividad_resumen').delete().eq('nombre_empleado', nombre).eq('departamento', departamento)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

// ── cierre_meses ─────────────────────────────────────────────────────────────

export function listarCierreMesesPorAnio(anio, empresa) {
  let query = supabase.from('cierre_meses').select('*').eq('anio', anio)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Solo los campos usados en Colaboradores. */
export function listarCierreMesesParaColaboradores(empresa) {
  let query = supabase.from('cierre_meses').select('nombre_empleado, anio, mes, total_dollars, empresa')
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function upsertCierreMeses(filas, empresa = 'ameriglobal') {
  const formateados = (filas || []).map(f => ({
    ...f,
    empresa: f.empresa || empresa,
  }))
  return supabase.from('cierre_meses').upsert(formateados, { onConflict: 'nombre_empleado,anio,mes' })
}
