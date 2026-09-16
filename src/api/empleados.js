// =============================================================
// API: Empleados
// Todas las peticiones a Supabase relacionadas con la tabla
// `empleados` viven aquí. Las páginas/hooks solo importan estas
// funciones y nunca llaman a `supabase` directamente.
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'

const TABLA = 'empleados'

/** Lista completa de empleados de una empresa, ordenados por nombre. */
export function listarEmpleados(empresa) {
  let query = supabase.from(TABLA).select('*').order('nombre_completo', { ascending: true })
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Empleados con solo los campos usados en Novedades (más liviano). */
export function listarEmpleadosParaNovedades(empresa) {
  let query = supabase
    .from(TABLA)
    .select('nombre_completo, activo, fecha_ingreso, fecha_retiro, dependencia, empresa')
    .order('nombre_completo')
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Empleados con solo los campos usados en Vacaciones. */
export function listarEmpleadosParaVacaciones(empresa) {
  let query = supabase
    .from(TABLA)
    .select('nombre_completo,dependencia,cargo,activo,empresa')
    .order('nombre_completo')
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Empleados con solo los campos usados en Parqueadero / Procesos disciplinarios. */
export function listarEmpleadosBasico(empresa) {
  let query = supabase.from(TABLA).select('nombre_completo, activo, empresa').order('nombre_completo')
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Empleados con el campo tiene_vehiculo, usado en Colaboradores. */
export function listarEmpleadosParaColaboradores(empresa) {
  let query = supabase
    .from(TABLA)
    .select('nombre_completo, activo, tiene_vehiculo, empresa')
    .order('nombre_completo')
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Empleados activos de una dependencia específica (usado en Productividad). */
export function listarEmpleadosActivosPorDependencia(dependencia, empresa) {
  let query = supabase.from(TABLA).select('*').eq('dependencia', dependencia).neq('activo', false)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function crearEmpleado(payload, empresa = 'ameriglobal') {
  return supabase.from(TABLA).insert([{
    ...payload,
    empresa: payload.empresa || empresa,
  }])
}

export function actualizarEmpleado(id, payload) {
  return supabase.from(TABLA).update(payload).eq('id', id)
}

export function eliminarEmpleado(id) {
  return supabase.from(TABLA).delete().eq('id', id)
}
