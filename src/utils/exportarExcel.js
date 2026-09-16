import logoUrl from '../assets/logo-ameriglobal.png'

// ─── Paleta de marca ────────────────────────────────────────────────────────
// Tomada del logo (tinta negra sobre fondo claro): negro carbón + un acento
// dorado sutil para las líneas divisorias, y un crema muy suave para las
// franjas alternas de las filas (más elegante que el gris típico).
const NEGRO       = 'FF1A1A1A'
const BLANCO      = 'FFFFFFFF'
const DORADO      = 'FFB08D57'
const CREMA       = 'FFF6F2EA'
const GRIS_BORDE  = 'FFE0D9CB'
const GRIS_TEXTO  = 'FF6B6B6B'

// ─── Logo ───────────────────────────────────────────────────────────────────
// Se carga una sola vez (fetch del asset empaquetado por Vite) y se reutiliza
// el buffer para todas las hojas/exports de la sesión.
let logoPromise = null
function obtenerLogo() {
  if (!logoPromise) logoPromise = fetch(logoUrl).then(r => r.arrayBuffer())
  return logoPromise
}

// ─── Libro ──────────────────────────────────────────────────────────────────
// ExcelJS se importa aquí (dinámico): la librería (~500 KB) solo se descarga
// cuando el usuario exporta, no en la carga de la página.
export async function crearLibro() {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'AmeriGlobal SAS'
  wb.created = new Date()
  return wb
}

function estilizarEncabezado(cell) {
  cell.font = { bold: true, color: { argb: BLANCO }, size: 11 }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NEGRO } }
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  cell.border = {
    top: { style: 'thin', color: { argb: GRIS_BORDE } },
    bottom: { style: 'thin', color: { argb: GRIS_BORDE } },
    left: { style: 'thin', color: { argb: GRIS_BORDE } },
    right: { style: 'thin', color: { argb: GRIS_BORDE } },
  }
}

function estilizarCelda(cell, banda) {
  cell.border = {
    top: { style: 'hair', color: { argb: GRIS_BORDE } },
    bottom: { style: 'hair', color: { argb: GRIS_BORDE } },
    left: { style: 'hair', color: { argb: GRIS_BORDE } },
    right: { style: 'hair', color: { argb: GRIS_BORDE } },
  }
  cell.alignment = { vertical: 'middle' }
  if (banda) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREMA } }
}

// ─── Hoja ───────────────────────────────────────────────────────────────────
// Crea una hoja a partir de un array de objetos (mismas columnas/orden que
// las llaves del primer objeto). anchosColumnas es un array de números (wch)
// en el mismo orden que las columnas.
//
// marca=true (default): agrega una franja superior con el logo, el nombre de
// la empresa y el título de la hoja, y el encabezado de columnas queda en la
// fila 6. Úsalo para reportes que solo se van a leer/imprimir.
//
// marca=false: el encabezado de columnas queda en la fila 1 tal cual antes
// (sin filas extra), solo con estilo de color/bordes. Úsalo para exports que
// el usuario puede volver a IMPORTAR (el lector de importación asume que los
// datos empiezan en la fila 1 o 2, así que no se le puede correr la fila).
export async function crearHoja(wb, nombreHoja, datos, { anchosColumnas, titulo, marca = true } = {}) {
  const ws = wb.addWorksheet(nombreHoja.slice(0, 31))
  const columnas = datos.length ? Object.keys(datos[0]) : []
  const nCols = Math.max(columnas.length, 1)

  ws.columns = columnas.map((_, i) => ({ width: (anchosColumnas && anchosColumnas[i]) || 18 }))

  let filaEncabezado = 1
  if (marca) {
    filaEncabezado = 6

    ws.mergeCells(1, 1, 4, 2)
    try {
      const buffer = await obtenerLogo()
      const imgId = wb.addImage({ buffer, extension: 'png' })
      ws.addImage(imgId, { tl: { col: 0.15, row: 0.15 }, ext: { width: 66, height: 60 } })
    } catch { /* si el logo no carga, seguimos sin bloquear la descarga */ }

    const anchoTitulo = Math.max(nCols, 4)
    ws.mergeCells(1, 3, 2, anchoTitulo)
    const celTitulo = ws.getCell(1, 3)
    celTitulo.value = 'AMERIGLOBAL SAS'
    celTitulo.font = { bold: true, size: 14, color: { argb: NEGRO } }
    celTitulo.alignment = { vertical: 'bottom' }

    ws.mergeCells(3, 3, 4, anchoTitulo)
    const celSub = ws.getCell(3, 3)
    celSub.value = titulo || nombreHoja
    celSub.font = { italic: true, size: 11, color: { argb: GRIS_TEXTO } }
    celSub.alignment = { vertical: 'top' }

    for (let c = 1; c <= anchoTitulo; c++) {
      ws.getCell(5, c).border = { bottom: { style: 'medium', color: { argb: DORADO } } }
    }
    ws.getRow(1).height = 20
    ws.getRow(2).height = 16
    ws.getRow(3).height = 14
    ws.getRow(4).height = 14
  }

  const headerRow = ws.getRow(filaEncabezado)
  columnas.forEach((key, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = key
    estilizarEncabezado(cell)
  })
  headerRow.height = 22

  datos.forEach((fila, idx) => {
    const row = ws.getRow(filaEncabezado + 1 + idx)
    columnas.forEach((key, i) => {
      const cell = row.getCell(i + 1)
      cell.value = fila[key] ?? ''
      estilizarCelda(cell, idx % 2 === 1)
    })
  })

  if (columnas.length) {
    ws.autoFilter = { from: { row: filaEncabezado, column: 1 }, to: { row: filaEncabezado, column: columnas.length } }
  }
  ws.views = [{ state: 'frozen', ySplit: filaEncabezado }]

  return ws
}

// ─── Descarga ───────────────────────────────────────────────────────────────
// Genera el archivo en base64 y lo descarga vía data URI en vez de
// Blob + URL.createObjectURL: algunos navegadores con configuración de
// privacidad estricta (Brave, Chrome con "Bloquear descargas automáticas"
// activo) bloquean silenciosamente las descargas por blob: URL. El data URI
// no tiene ese problema.
export async function descargarWorkbook(wb, nombreArchivo) {
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const a = document.createElement('a')
      a.href = reader.result
      a.download = nombreArchivo
      document.body.appendChild(a)
      a.click()
      setTimeout(() => { document.body.removeChild(a); resolve() }, 200)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ─── Export de una sola hoja ────────────────────────────────────────────────
// Cubre el caso común: un array de datos → un archivo .xlsx de una sola hoja,
// con el diseño de marca (logo, colores, bordes) ya aplicado.
// Para reportes multi-hoja (Dashboard, Informe) arma el libro a mano con
// crearLibro + crearHoja (una vez por hoja) y llama a descargarWorkbook al
// final.
export async function exportarExcel(datos, { nombreHoja = 'Hoja1', nombreArchivo, anchosColumnas, titulo, marca = true } = {}) {
  const wb = await crearLibro()
  await crearHoja(wb, nombreHoja, datos, { anchosColumnas, titulo, marca })
  await descargarWorkbook(wb, nombreArchivo)
}
