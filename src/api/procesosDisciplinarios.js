// =============================================================
// API: Procesos disciplinarios
// Peticiones a Supabase relacionadas con la tabla
// `procesos_disciplinarios` y con el bucket de adjuntos (PDFs).
// Soporta filtrado y asignación por empresa ('ameriglobal' / 'global_link').
// =============================================================
import { supabase } from '../supabaseClient'
import { resolverIdsRelacionales } from './idResolvers'

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

export async function crearProcesoDisciplinario(payload, empresa = 'ameriglobal') {
  const empresaFinal = payload.empresa || empresa
  // Aquí el campo de texto se llama 'departamento' (no 'dependencia' como en
  // otras tablas), pero resuelve contra la misma tabla `departamentos`.
  const { empleado_id, departamento_id, empresa_id } = await resolverIdsRelacionales({
    nombre_empleado: payload.nombre_empleado,
    empresa: empresaFinal,
    dependencia: payload.departamento,
  })
  return supabase.from(TABLA).insert([{
    ...payload,
    empresa: empresaFinal,
    empleado_id,
    departamento_id,
    empresa_id,
  }])
}

export async function actualizarProcesoDisciplinario(id, payload) {
  const dataToUpdate = { ...payload }

  if (payload.nombre_empleado || payload.departamento || payload.empresa) {
    let { nombre_empleado, departamento, empresa } = payload
    if (!nombre_empleado || !departamento || !empresa) {
      const { data: actual } = await supabase
        .from(TABLA)
        .select('nombre_empleado, departamento, empresa')
        .eq('id', id)
        .maybeSingle()
      nombre_empleado = nombre_empleado || actual?.nombre_empleado
      departamento = departamento || actual?.departamento
      empresa = empresa || actual?.empresa
    }
    const { empleado_id, departamento_id, empresa_id } = await resolverIdsRelacionales({
      nombre_empleado, empresa, dependencia: departamento,
    })
    dataToUpdate.empleado_id = empleado_id
    dataToUpdate.departamento_id = departamento_id
    dataToUpdate.empresa_id = empresa_id
  }

  return supabase.from(TABLA).update(dataToUpdate).eq('id', id)
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
