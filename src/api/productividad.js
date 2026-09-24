// =============================================================
// API: Productividad
// Peticiones a Supabase relacionadas con las tablas `productividad`,
// `productividad_resumen` y `cierre_meses` (vista de Cierre).
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'
import { resolverIdsEnLote } from './idResolvers'

// ── productividad (Ventas / UW-BS) ──────────────────────────────────────────

/** Filas de productividad de un departamento + métrica (usado en la vista principal). */
export function listarProductividadPorDepartamento(departamento, metrica, empresa) {
  let query = supabase.from('productividad').select('*').eq('departamento', departamento).eq('metrica', metrica)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/**
 * Solo los campos usados en Colaboradores. Acepta una métrica o una lista:
 * "Producción" (departamentos de un solo valor) y "Clientes Resueltos" (Ventas / UW-BS).
 */
export function listarProductividadParaColaboradores(metricas = ['Producción', 'Clientes Resueltos'], empresa) {
  let query = supabase
    .from('productividad')
    .select('nombre_empleado, departamento, periodo, anio, valor, metrica, empresa')
    .in('metrica', [].concat(metricas))
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export async function upsertProductividad(filas, empresa = 'ameriglobal') {
  // Se guarda igual que antes (nombre_empleado/departamento/empresa en
  // texto); además se resuelven en lote empleado_id/departamento_id/empresa_id.
  const formateados = await resolverIdsEnLote(filas, empresa, 'departamento')
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

export async function upsertResumen(payload, empresa = 'ameriglobal') {
  const eraArray = Array.isArray(payload)
  const filas = eraArray ? payload : [payload]
  const formateados = await resolverIdsEnLote(filas, empresa, 'departamento')
  return supabase
    .from('productividad_resumen')
    .upsert(eraArray ? formateados : formateados[0], { onConflict: 'nombre_empleado,departamento' })
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

export async function upsertCierreMeses(filas, empresa = 'ameriglobal') {
  // cierre_meses no tiene columna de departamento, por eso no se pasa
  // campoDependencia (queda en null y no se agrega departamento_id).
  const formateados = await resolverIdsEnLote(filas, empresa)
  return supabase.from('cierre_meses').upsert(formateados, { onConflict: 'nombre_empleado,anio,mes' })
}
