import { useState } from 'react'
import * as novedadesApi from '../api/novedades'
import * as vacacionesApi from '../api/vacaciones'
import {
  normalizarConceptoImportado, parseFechaImportada, normalizarNombre, levenshtein,
} from '../utils/novedadesImport'

const clean = v => { const t = (v || '').toString().trim(); return (!t || t.toUpperCase() === 'N/A') ? null : t }

// Hook que encapsula toda la importación masiva desde Excel: parseo de filas,
// armado de la vista previa (sin tocar la base de datos), y la confirmación
// que sí inserta los registros. Aísla esta lógica de la página para que
// Novedades.jsx solo se preocupe de mostrar el resultado.
//
// Flujo en dos pasos: primero se PARSEA el archivo y se arma una vista
// previa; solo cuando el usuario confirma desde el modal se insertan los
// registros de verdad.
//
// Orden de columnas esperado (sin encabezado, o con encabezado que se
// detecta y se salta automáticamente):
// 1 Nombre | 2 Concepto | 3 Fecha inicio | 4 Fecha fin | 5 Total días |
// 6 Validación incapacidad | 7-8 (sin usar) | 9 Dependencia | 10 Observación |
// 11 Observación contabilidad | 12 Nómina electrónica | 13 Seguridad social
export function useImportacionExcel({ empleadosIndex, load }) {
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importConfirming, setImportConfirming] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)

  const parsearFilaImport = (row) => {
    const nombre = (row[0] || '').toString().trim()
    const conceptoRaw = (row[1] || '').toString().trim()
    if (!nombre || !conceptoRaw) {
      return { omitir: true, motivoOmision: 'Falta nombre o concepto', filaOriginal: row }
    }

    // Validar que el empleado exista en Empleados antes de seguir. Se compara
    // normalizado (sin tildes/mayúsculas/espacios extra) para no fallar por
    // diferencias menores de digitación.
    const nombreNormalizado = normalizarNombre(nombre)
    const nombreEnBD = empleadosIndex.get(nombreNormalizado)
    if (!nombreEnBD) {
      let sugerencia = null
      let mejorDistancia = Infinity
      for (const [norm, original] of empleadosIndex) {
        const dist = levenshtein(nombreNormalizado, norm)
        if (dist < mejorDistancia) { mejorDistancia = dist; sugerencia = original }
      }
      const umbral = nombreNormalizado.length <= 8 ? 1 : 3
      const motivo = (sugerencia && mejorDistancia <= umbral)
        ? `"${nombre}" no existe en Empleados (¿quisiste decir "${sugerencia}"?)`
        : `"${nombre}" no existe en el directorio de Empleados`
      return { omitir: true, motivoOmision: motivo, filaOriginal: row }
    }

    const fecha_inicio = parseFechaImportada(row[2])
    let fecha_fin = parseFechaImportada(row[3])
    const { concepto, medioDia, observacionExtra } = normalizarConceptoImportado(conceptoRaw)
    if (medioDia && !fecha_fin) fecha_fin = fecha_inicio

    let total_dias = null
    if (medioDia) {
      total_dias = 0.5
    } else {
      const totalRaw = (row[4] || '').toString().trim()
      if (totalRaw) {
        const n = parseFloat(totalRaw.replace(',', '.'))
        total_dias = isNaN(n) ? null : n
      } else if (fecha_inicio && fecha_fin) {
        total_dias = Math.round((new Date(fecha_fin) - new Date(fecha_inicio)) / 86400000) + 1
      }
    }

    const dependencia = (row[8] || '').toString().trim().toUpperCase() || null
    let observacion = (row[9] || '').toString().trim()
    if (observacionExtra) observacion = observacion ? `${observacion} — ${observacionExtra}` : observacionExtra

    const periodo = fecha_inicio ? `${fecha_inicio.slice(0, 4)}-${parseInt(fecha_inicio.slice(5, 7), 10)}` : null

    const payload = {
      nombre_empleado: nombreEnBD,
      concepto,
      fecha_inicio,
      fecha_fin: fecha_fin || null,
      total_dias,
      dependencia,
      observacion: observacion || null,
      observacion_contabilidad: clean(row[10]),
      validacion_incapacidad: clean(row[5]),
      radicacion_incapacidad: null,
      prorroga: null,
      nomina_electronica: clean(row[11]),
      seguridad_social: clean(row[12]),
      periodo,
      jornada: medioDia ? 'Medio día' : null,
    }

    const advertencias = []
    if (concepto === 'Otros') advertencias.push(`Concepto no reconocido: "${conceptoRaw}" → se guardará como "Otros"`)
    if (!fecha_inicio) advertencias.push('Sin fecha de inicio válida')

    return { omitir: false, conceptoOriginal: conceptoRaw, payload, advertencias }
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      // xlsx se importa aquí (dinámico): la librería solo se descarga cuando
      // el usuario va a importar un archivo, no en la carga de la página.
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      let raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

      // Si la primera fila parece un encabezado, se salta
      if (raw.length) {
        const first0 = (raw[0][0] || '').toString().trim().toLowerCase()
        const first1 = (raw[0][1] || '').toString().trim().toLowerCase()
        if (['nombre', 'empleado', 'nombre completo', 'nombre_empleado', 'colaborador'].includes(first0) || first1 === 'concepto') {
          raw = raw.slice(1)
        }
      }
      // Quitar filas completamente vacías (todas las celdas en blanco)
      raw = raw.filter(row => row.some(v => (v || '').toString().trim() !== ''))

      const filas = raw.map(parsearFilaImport)
      if (!filas.length) {
        setImportResult({ error: 'El archivo no tiene filas con datos para importar.' })
      } else {
        setImportPreview(filas)
      }
    } catch (err) {
      setImportResult({ error: err.message || 'Error al leer el archivo.' })
    } finally {
      setImporting(false)
      setFileInputKey(k => k + 1)
    }
  }

  // Se ejecuta solo cuando el usuario confirma desde el modal de vista previa
  const confirmarImportacion = async () => {
    if (!importPreview) return
    setImportConfirming(true)
    let creadas = 0, errores = 0
    const otrosDetectados = []
    try {
      for (const fila of importPreview) {
        if (fila.omitir) continue
        const { payload, conceptoOriginal } = fila
        if (payload.concepto === 'Otros') otrosDetectados.push(conceptoOriginal)

        const { error } = await novedadesApi.crearNovedad(payload)
        if (error) { errores++; continue }
        creadas++

        // Igual que en el guardado manual: si el concepto es "Vacaciones",
        // se refleja también en la pestaña de Vacaciones.
        if (payload.concepto === 'Vacaciones' && payload.fecha_inicio) {
          const { data: existentes } = await vacacionesApi.buscarVacacionPorEmpleadoYFecha(
            payload.nombre_empleado, payload.fecha_inicio
          )
          const vacacionPayload = {
            nombre_empleado: payload.nombre_empleado, dependencia: payload.dependencia,
            fecha_inicio: payload.fecha_inicio, fecha_fin: payload.fecha_fin,
            total_dias: payload.total_dias, tipo_vacacion: 'Vacaciones', estado: 'Pendiente',
            observacion_contable: payload.observacion,
          }
          if (existentes && existentes.length > 0) {
            await vacacionesApi.actualizarVacacion(existentes[0].id, vacacionPayload)
          } else {
            await vacacionesApi.crearVacacion(vacacionPayload)
          }
        }
      }
      const omitidas = importPreview.filter(f => f.omitir).length
      setImportResult({ creadas, omitidas, errores, otros: otrosDetectados })
      setImportPreview(null)
      await load()
    } catch (err) {
      setImportResult({ error: err.message || 'Error al importar.' })
    } finally {
      setImportConfirming(false)
    }
  }

  const cancelarImportacion = () => setImportPreview(null)

  return {
    importing,
    importResult, setImportResult,
    importPreview,
    importConfirming,
    fileInputKey,
    handleImportFile,
    confirmarImportacion,
    cancelarImportacion,
  }
}
