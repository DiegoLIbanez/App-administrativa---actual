import { MESES_FULL } from './productividadConstants'

export function fmtMoneda(v) {
  const n = Number(v) || 0
  return `$ ${n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Escala de color de desempeño para las métricas en % (semáforo simple)
export function colorPct(v) {
  if (v >= 80) return '#16A34A'
  if (v >= 50) return '#F59E0B'
  return 'var(--text)'
}

// ¿Esta persona todavía no había ingresado en el mes/año dado?
// Se usa para no confundir "no ingresó todavía" con "mal desempeño".
export function noHabiaIngresado(empleado, mes, anio) {
  if (!empleado.ingreso) return false
  const ingresoDate = new Date(empleado.ingreso + 'T00:00:00')
  if (Number.isNaN(ingresoDate.getTime())) return false
  const mesIdx = MESES_FULL.indexOf(mes)
  if (mesIdx < 0) return false
  const inicioMes = new Date(anio, mesIdx, 1)
  const inicioMesIngreso = new Date(ingresoDate.getFullYear(), ingresoDate.getMonth(), 1)
  return inicioMes < inicioMesIngreso
}

export function iniciales(nombre) {
  return nombre.trim().split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export function fmtFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
