// =============================================================
// API: Departamentos
// Peticiones a Supabase relacionadas con la tabla `departamentos`
// para soporte dinámico de áreas/departamentos por empresa.
// =============================================================
import { supabase } from '../supabaseClient'

const TABLA = 'departamentos'

/** Lista de departamentos activos de una empresa ('ameriglobal' o 'global_link'). */
export async function listarDepartamentos(empresa = 'ameriglobal') {
  return supabase
    .from(TABLA)
    .select('*')
    .eq('empresa', empresa)
    .eq('activo', true)
    .order('nombre', { ascending: true })
}

/** Lista todos los departamentos (activos e inactivos) para la administración. */
export async function listarTodosLosDepartamentos(empresa) {
  let query = supabase.from(TABLA).select('*').order('nombre', { ascending: true })
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export async function crearDepartamento(payload) {
  const nombreNormalizado = payload.nombre?.trim().toUpperCase()
  return supabase.from(TABLA).insert([{
    ...payload,
    nombre: nombreNormalizado,
    empresa: payload.empresa || 'global_link',
  }]).select().single()
}

export async function actualizarDepartamento(id, payload) {
  const dataToUpdate = { ...payload }
  if (dataToUpdate.nombre) {
    dataToUpdate.nombre = dataToUpdate.nombre.trim().toUpperCase()
  }
  return supabase.from(TABLA).update(dataToUpdate).eq('id', id).select().single()
}

export async function alternarEstadoDepartamento(id, activo) {
  return supabase.from(TABLA).update({ activo }).eq('id', id)
}

export async function eliminarDepartamento(id) {
  return supabase.from(TABLA).delete().eq('id', id)
}
