// =============================================================
// API: Procesos disciplinarios
// Peticiones a Supabase relacionadas con la tabla
// `procesos_disciplinarios` y con el bucket de adjuntos (PDFs).
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'

const TABLA = 'procesos_disciplinarios'

export function listarProcesosDisciplinarios(empresa) {
  let query = supabase.from(TABLA).select('*').order('created_at', { ascending: false })
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Procesos disciplinarios de una dependencia (usado en Productividad). */
export function listarProcesosDisciplinariosPorDepartamento(departamento, empresa) {
  let query = supabase.from(TABLA).select('*').eq('departamento', departamento)
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

/** Solo el nombre del empleado (usado en Colaboradores para contar procesos). */
export function listarNombresProcesosDisciplinarios(empresa) {
  let query = supabase.from(TABLA).select('nombre_empleado, empresa')
  if (empresa) query = query.eq('empresa', empresa)
  return query
}

export function crearProcesoDisciplinario(payload, empresa = 'ameriglobal') {
  return supabase.from(TABLA).insert([{
    ...payload,
    empresa: payload.empresa || empresa,
  }])
}

export function actualizarProcesoDisciplinario(id, payload) {
  return supabase.from(TABLA).update(payload).eq('id', id)
}

export function eliminarProcesoDisciplinario(id) {
  return supabase.from(TABLA).delete().eq('id', id)
}

// ── Adjuntos (Supabase Storage) ─────────────────────────────────────────────

/** Sube un PDF al bucket de adjuntos. `bucket` viene de procesosDisciplinariosConstants. */
export function subirAdjuntoProceso(bucket, path, file) {
  return supabase.storage.from(bucket).upload(path, file, {
    contentType: 'application/pdf', upsert: false,
  })
}

export function eliminarAdjuntoProceso(bucket, path) {
  return supabase.storage.from(bucket).remove([path])
}

/** Genera una URL firmada temporal (segundos) para ver/descargar un adjunto. */
export function obtenerUrlFirmadaAdjunto(bucket, path, segundos = 300) {
  return supabase.storage.from(bucket).createSignedUrl(path, segundos)
}
