import { hoyISO } from './fecha'
import { exportarExcel as exportarExcelUtil } from './exportarExcel'
import { supabase } from '../supabaseClient'

const filaExcel = (r, envioFallback = '') => ({
  'Nombre Completo': r.nombre_empleado,
  'Año': r.anio || '',
  'Mes': r.mes || '',
  'Placa': r.placa || '',
  'Cédula': r.cedula || '',
  'Teléfono': r.telefono || '',
  'Tipo': r.tipo || '',
  'Fecha Ingreso': r.fecha_ingreso || '',
  'Fecha Retiro': r.fecha_retiro || '',
  'Observación': r.observacion || '',
  'Envío de Reporte': r.fecha_envio_reporte ? r.fecha_envio_reporte.split('T')[0] : envioFallback,
})

export function exportarExcelParqueadero(rows, filterMes, filterAnio) {
  exportarExcelUtil(rows.map(r => filaExcel(r)), {
    nombreHoja: 'Parqueadero',
    nombreArchivo: `Parqueadero${filterAnio ? '_' + filterAnio : ''}${filterMes ? '_' + filterMes : ''}.xlsx`,
  })
}

// Marca como enviados (fecha_envio_reporte) los registros que aún no lo estaban,
// y descarga el Excel del período con esa fecha ya reflejada.
export async function enviarReporte(rows, filterMes, filterAnio, onDone) {
  const hoy = hoyISO()
  const horaCompleta = new Date().toISOString()
  const sinEnviar = rows.filter(r => !r.fecha_envio_reporte).map(r => r.id).filter(Boolean)
  if (sinEnviar.length > 0) {
    await supabase.from('registros_parqueadero').update({ fecha_envio_reporte: horaCompleta }).in('id', sinEnviar)
  }
  exportarExcelUtil(rows.map(r => filaExcel(r, hoy)), {
    nombreHoja: 'Parqueadero',
    nombreArchivo: `Reporte_Parqueadero${filterAnio ? '_' + filterAnio : ''}${filterMes ? '_' + filterMes : ''}_${hoy}.xlsx`,
  })
  if (onDone) onDone()
}
