// =============================================================
// API: Empleados
// Todas las peticiones a Supabase relacionadas con la tabla
// `empleados` viven aquí. Las páginas/hooks solo importan estas
// funciones y nunca llaman a `supabase` directamente.
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'
import { resolverIdsRelacionales } from './idResolvers'

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

export async function crearEmpleado(payload, empresa = 'ameriglobal') {
  const empresaFinal = payload.empresa || empresa
  // Además de guardar 'empresa' y 'dependencia' como texto (igual que antes),
  // buscamos sus ids relacionales para dejar el registro ya conectado.
  const { empresa_id, departamento_id } = await resolverIdsRelacionales({
    empresa: empresaFinal,
    dependencia: payload.dependencia,
  })
  return supabase.from(TABLA).insert([{
    ...payload,
    empresa: empresaFinal,
    empresa_id,
    departamento_id,
  }])
}

export async function actualizarEmpleado(id, payload) {
  const dataToUpdate = { ...payload }

  // Solo recalculamos los ids si el update toca 'empresa' o 'dependencia'.
  // Si solo cambia una de las dos, igual hay que re-resolver el departamento
  // completo: la misma dependencia puede existir en más de una empresa.
  if (payload.empresa || payload.dependencia) {
    let { empresa: empresaParaResolver, dependencia: dependenciaParaResolver } = payload
    if (!empresaParaResolver || !dependenciaParaResolver) {
      const { data: actual } = await supabase
        .from(TABLA)
        .select('empresa, dependencia')
        .eq('id', id)
        .maybeSingle()
      empresaParaResolver = empresaParaResolver || actual?.empresa
      dependenciaParaResolver = dependenciaParaResolver || actual?.dependencia
    }
    const { empresa_id, departamento_id } = await resolverIdsRelacionales({
      empresa: empresaParaResolver,
      dependencia: dependenciaParaResolver,
    })
    dataToUpdate.empresa_id = empresa_id
    dataToUpdate.departamento_id = departamento_id
  }

  return supabase.from(TABLA).update(dataToUpdate).eq('id', id)
}

export function eliminarEmpleado(id) {
  return supabase.from(TABLA).delete().eq('id', id)
}
