// =============================================================
// API: Novedades
// Peticiones a Supabase relacionadas con la tabla `novedades`.
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'
import { diasHabilesEntre } from '../utils/diasHabiles'

const TABLA = 'novedades'

/** Lista completa de novedades de una empresa, más recientes primero. */
export function listarNovedades(empresa) {
  let query = supabase.from(TABLA).select('*').order('fecha_inicio', { ascending: false })
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Todas las novedades sin filtros (usado en Dashboard/Informe/Colaboradores). */
export function listarNovedadesCompleto(empresa) {
  let query = supabase.from(TABLA).select('*')
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function crearNovedad(payload, empresa = 'ameriglobal') {
  return supabase.from(TABLA).insert([{
    ...payload,
    empresa: payload.empresa || empresa,
  }]).select()
}

/** Busca una novedad existente por empleado + concepto + fecha de inicio (evita duplicados al reflejar vacaciones). */
export function buscarNovedadPorEmpleadoConceptoYFecha(nombreEmpleado, concepto, fechaInicio, empresa) {
  let query = supabase
    .from(TABLA)
    .select('id')
    .eq('nombre_empleado', nombreEmpleado)
    .eq('concepto', concepto)
    .eq('fecha_inicio', fechaInicio)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function actualizarNovedad(id, payload) {
  return supabase.from(TABLA).update(payload).eq('id', id).select()
}

/** Actualiza un solo campo de una novedad (edición inline en la tabla). */
export function actualizarCampoNovedad(id, field, value) {
  return supabase.from(TABLA).update({ [field]: value }).eq('id', id)
}

export function eliminarNovedad(id) {
  return supabase.from(TABLA).delete().eq('id', id)
}

/**
 * Recalcula los días de TODAS las novedades con concepto "Vacaciones",
 * usando días hábiles en vez de días de calendario.
 * Devuelve la cantidad de registros actualizados.
 */
export async function recalcularDiasVacaciones(empresa) {
  let query = supabase
    .from(TABLA)
    .select('id, fecha_inicio, fecha_fin, total_dias')
    .eq('concepto', 'Vacaciones')
  if (empresa) query = query.eq('empresa', empresa)
  const { data, error } = await query
  if (error) throw error

  let actualizados = 0
  for (const r of data || []) {
    if (!r.fecha_inicio || !r.fecha_fin) continue
    const nuevoTotal = diasHabilesEntre(r.fecha_inicio, r.fecha_fin)
    if (nuevoTotal !== r.total_dias) {
      const { error: errorUpdate } = await supabase
        .from(TABLA)
        .update({ total_dias: nuevoTotal })
        .eq('id', r.id)
      if (!errorUpdate) actualizados++
    }
  }
  return actualizados
}
