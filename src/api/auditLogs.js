// =============================================================
// src/api/auditLogs.js
// -------------------------------------------------------------
// Capa API para listar y registrar logs de auditoría en Supabase.
// =============================================================
import { supabase } from '../supabaseClient'

/**
 * Registra una entrada en la tabla audit_logs
 */
export async function registrarAuditLog({
  usuario_id,
  correo_usuario,
  accion,
  tabla,
  registro_id,
  empresa,
  detalles = {},
}) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([
        {
          usuario_id: usuario_id || null,
          correo_usuario: correo_usuario || 'Desconocido',
          accion: (accion || 'ACCION').toUpperCase(),
          tabla: tabla || 'sistema',
          registro_id: registro_id ? String(registro_id) : null,
          empresa: empresa || 'ameriglobal',
          detalles,
        },
      ])
      .select()

    if (error) {
      console.warn('No se pudo registrar log de auditoría (tabla puede no existir aún):', error.message)
    }
    return { data, error }
  } catch (err) {
    console.warn('Excepción registrando audit log:', err)
    return { data: null, error: err }
  }
}

/**
 * Listar los registros de auditoría filtrados por empresa y rango de fecha
 */
export async function listarAuditLogs(empresa, { limite = 100 } = {}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limite)

  if (empresa) {
    query = query.eq('empresa', empresa)
  }

  const { data, error } = await query
  return { data: data || [], error }
}
