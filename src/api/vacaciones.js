// =============================================================
// API: Vacaciones
// Peticiones a Supabase relacionadas con la tabla `vacaciones`.
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'

const TABLA = 'vacaciones'

/** Lista completa de vacaciones de una empresa, más recientes primero. */
export function listarVacaciones(empresa) {
  let query = supabase.from(TABLA).select('*').order('fecha_inicio', { ascending: false })
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Busca vacaciones existentes por empleado + fecha de inicio (para evitar duplicados al importar). */
export function buscarVacacionPorEmpleadoYFecha(nombreEmpleado, fechaInicio, empresa) {
  let query = supabase.from(TABLA).select('id').eq('nombre_empleado', nombreEmpleado).eq('fecha_inicio', fechaInicio)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function crearVacacion(payload, empresa = 'ameriglobal') {
  return supabase.from(TABLA).insert([{
    ...payload,
    empresa: payload.empresa || empresa,
  }])
}

export function actualizarVacacion(id, payload) {
  return supabase.from(TABLA).update(payload).eq('id', id)
}

/** Actualiza solo el estado (aprobar/rechazar/pendiente) de una solicitud. */
export function actualizarEstadoVacacion(id, estado) {
  return supabase.from(TABLA).update({ estado }).eq('id', id)
}

export function eliminarVacacion(id) {
  return supabase.from(TABLA).delete().eq('id', id)
}
