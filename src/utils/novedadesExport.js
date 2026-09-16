import { exportarExcel } from './exportarExcel'
import { hoyISO } from './fecha'

// Anchos de las columnas del formato de importación (13 columnas).
export const ANCHOS_IMPORT_COLS = [26, 22, 13, 13, 10, 16, 11, 11, 14, 26, 18, 16, 15]

// yyyy-mm-dd → dd/mm/yyyy (mismo formato que usa la plantilla de importación)
function aFechaDDMMYYYY(iso) {
  if (!iso) return ''
  const m = iso.toString().match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

// Mapeo a las 13 columnas del formato de importación (compartido entre
// el export filtrado y el export "para importar" con todo).
export function filaAFormatoImportacion(r) {
  return {
    'Nombre': r.nombre_empleado,
    // Si es medio día, se antepone "1/2" para que el importador lo
    // reconozca de nuevo al mismo concepto base (igual que en el archivo
    // de origen).
    'Concepto': r.jornada === 'Medio día' ? `1/2 ${r.concepto}` : r.concepto,
    'Fecha inicio': aFechaDDMMYYYY(r.fecha_inicio),
    'Fecha fin': aFechaDDMMYYYY(r.fecha_fin),
    'Total días': r.total_dias,
    'Validación incapacidad': r.validacion_incapacidad || '',
    '(sin usar)': '',
    '(sin usar) ': '',
    'Dependencia': r.dependencia,
    'Observación': r.observacion,
    'Observación contabilidad': r.observacion_contabilidad || '',
    'Nómina electrónica': r.nomina_electronica || '',
    'Seguridad social': r.seguridad_social || '',
  }
}

// Exporta un conjunto de novedades en el formato de importación.
export function exportarNovedadesExcel(filas, label) {
  exportarExcel(filas.map(filaAFormatoImportacion), {
    nombreHoja: 'Novedades',
    nombreArchivo: `AmeriGlobal_Novedades_${label}.xlsx`,
    anchosColumnas: ANCHOS_IMPORT_COLS,
    marca: false, // se puede volver a importar: el encabezado debe quedar en la fila 1
  })
}

// Exporta TODOS los registros (sin importar filtros activos), pensado para
// editar en bloque en Excel y volver a subirlo con "Importar Excel".
export function exportarNovedadesParaImportar(filas) {
  exportarExcel(filas.map(filaAFormatoImportacion), {
    nombreHoja: 'Novedades',
    nombreArchivo: `AmeriGlobal_Novedades_ParaImportar_${hoyISO()}.xlsx`,
    anchosColumnas: ANCHOS_IMPORT_COLS,
    marca: false, // este archivo se vuelve a subir con "Importar Excel": encabezado en fila 1
  })
}