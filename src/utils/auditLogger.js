// =============================================================
// src/utils/auditLogger.js
// -------------------------------------------------------------
// Helper para invocar auditLogs.js autodetectando la sesión activa.
// =============================================================
import { supabase } from '../supabaseClient'
import { registrarAuditLog } from '../api/auditLogs'

/**
 * Graba un registro de auditoría utilizando el usuario conectado
 */
export async function logAccion(accion, tabla, registroId, empresa, detalles = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const correo = user?.email || 'Sistema'
    const uid = user?.id || null

    await registrarAuditLog({
      usuario_id: uid,
      correo_usuario: correo,
      accion,
      tabla,
      registro_id: registroId,
      empresa,
      detalles,
    })
  } catch (err) {
    console.warn('Error silencioso en logAccion:', err)
  }
}
