// =============================================================
// API: Parqueadero
// Peticiones a Supabase relacionadas con la tabla
// `registros_parqueadero`.
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'

const TABLA = 'registros_parqueadero'

export function listarRegistrosParqueadero(empresa) {
  let query = supabase.from(TABLA).select('*').order('id', { ascending: false })
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function crearRegistroParqueadero(payload, empresa = 'ameriglobal') {
  return supabase.from(TABLA).insert([{
    ...payload,
    empresa: payload.empresa || empresa,
  }])
}

/** Inserta varios registros a la vez (usado al duplicar/copiar registros). */
export function crearRegistrosParqueadero(payloads, empresa = 'ameriglobal') {
  const formateados = (payloads || []).map(p => ({
    ...p,
    empresa: p.empresa || empresa,
  }))
  return supabase.from(TABLA).insert(formateados)
}

export function actualizarRegistroParqueadero(id, payload) {
  return supabase.from(TABLA).update(payload).eq('id', id)
}

export function eliminarRegistroParqueadero(id) {
  return supabase.from(TABLA).delete().eq('id', id)
}
