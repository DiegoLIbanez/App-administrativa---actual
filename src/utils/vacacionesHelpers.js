import { diasHabilesEntre } from './diasHabiles'

export function calcDias(inicio, fin) {
  if (!inicio || !fin) return ''
  const d1 = new Date(inicio), d2 = new Date(fin)
  if (isNaN(d1) || isNaN(d2) || d2 < d1) return ''
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
}

export function formatFecha(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// Antigüedad del empleado desde la fecha de ingreso, ej: "2 años, 3 meses"
export function calcAntiguedad(fechaIngreso) {
  if (!fechaIngreso) return null
  const ingreso = new Date(fechaIngreso + 'T00:00:00')
  if (isNaN(ingreso)) return null
  const hoy = new Date()
  if (ingreso > hoy) return null

  let years = hoy.getFullYear() - ingreso.getFullYear()
  let months = hoy.getMonth() - ingreso.getMonth()
  if (hoy.getDate() < ingreso.getDate()) months--
  if (months < 0) { years--; months += 12 }

  if (years === 0 && months === 0) return 'Menos de 1 mes'
  const yStr = years === 1 ? '1 año' : `${years} años`
  const mStr = months === 1 ? '1 mes' : `${months} meses`
  if (years === 0) return mStr
  if (months === 0) return yStr
  return `${yStr}, ${mStr}`
}

// Días hábiles tomados por un empleado en un año dado (no cuenta "Vacaciones en dinero").
// excludeId permite no contar el propio registro que se está editando.
export function diasAcumuladosAnio(rows, nombreEmpleado, anio, excludeId = null) {
  if (!nombreEmpleado) return 0
  const nombreNorm = nombreEmpleado.trim().toLowerCase()
  return rows
    .filter(r =>
      r.id !== excludeId &&
      r.nombre_empleado?.trim().toLowerCase() === nombreNorm &&
      r.tipo_vacacion !== 'Vacaciones en dinero' &&
      (r.fecha_inicio || '').startsWith(String(anio))
    )
    .reduce((acc, r) => {
      const habiles = (r.fecha_inicio && r.fecha_fin)
        ? diasHabilesEntre(r.fecha_inicio, r.fecha_fin)
        : (parseFloat(r.total_dias) || 0)
      return acc + (habiles || 0)
    }, 0)
}
