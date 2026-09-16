// =============================================================
// API: Perfiles
// Peticiones a Supabase relacionadas con la tabla `perfiles`
// (usuarios de la aplicación, distinto de la tabla `empleados`).
// =============================================================
import { supabase } from '../supabaseClient'

const TABLA = 'perfiles'

export function listarPerfiles() {
  return supabase.from(TABLA).select('*').order('created_at', { ascending: false })
}

export function obtenerPerfilPorId(userId) {
  return supabase.from(TABLA).select('*').eq('id', userId).maybeSingle()
}

/** Cuenta cuántos perfiles siguen inactivos (pendientes de aprobación), sin traer las filas. */
export function contarPerfilesPendientes() {
  return supabase.from(TABLA).select('*', { count: 'exact', head: true }).eq('activo', false)
}

export function actualizarPerfil(id, payload) {
  return supabase.from(TABLA).update(payload).eq('id', id)
}

export function activarPerfil(id, activo, esAdmin, empresas = ['ameriglobal'], permisos = { ameriglobal: ['all'] }, rol = 'operativo') {
  return supabase.from(TABLA).update({
    activo,
    es_admin: esAdmin,
    empresas,
    permisos,
    rol,
  }).eq('id', id)
}

export function alternarActivoPerfil(id, activo) {
  return supabase.from(TABLA).update({ activo }).eq('id', id)
}

export function alternarAdminPerfil(id, esAdmin) {
  return supabase.from(TABLA).update({ es_admin: esAdmin }).eq('id', id)
}

export function actualizarNombrePerfil(id, nombreCompleto) {
  return supabase.from(TABLA).update({ nombre_completo: nombreCompleto }).eq('id', id)
}

export function actualizarPermisosYEmpresasPerfil(id, { empresas, permisos, rol, es_admin, activo }) {
  const payload = {}
  if (empresas !== undefined) payload.empresas = empresas
  if (permisos !== undefined) payload.permisos = permisos
  if (rol !== undefined) payload.rol = rol
  if (es_admin !== undefined) payload.es_admin = es_admin
  if (activo !== undefined) payload.activo = activo
  return supabase.from(TABLA).update(payload).eq('id', id)
}
