// Valores canónicos que usa el select de Novedades — deben coincidir exactamente
const CONCEPTOS_CANONICOS = [
  'Incapacidad','Vacaciones','LNR','LR','Maternidad','Paternidad',
  'Calamidad/Luto','Renuncia/Retiro','Ingreso','Terminación',
  'Día Familia','Hospitalización','Embargo','Suspensión','Otro'
]

export function normalizarConcepto(concepto) {
  if (!concepto) return 'Otro'
  const raw = concepto.toString().trim()
  // Si ya es un valor canónico, devolverlo directo (sin transformar)
  if (CONCEPTOS_CANONICOS.includes(raw)) return raw
  const c = raw.toLowerCase()
  if (c.includes('incapacidad') || c === 'inc') return 'Incapacidad'
  if (c.includes('vacacion')) return 'Vacaciones'
  if (c.includes('lnr') || c.includes('licencia no remunerada')) return 'LNR'
  if (c.includes('licencia remunerada') || c === 'lr' || c === 'lrn' || c === '1/2 lr') return 'LR'
  if (c.includes('maternidad')) return 'Maternidad'
  if (c.includes('paternidad')) return 'Paternidad'
  if (c.includes('luto') || c.includes('calamidad')) return 'Calamidad/Luto'
  if (c.includes('renuncia') || c.includes('retiro') || c === 'ret') return 'Renuncia/Retiro'
  if (c.includes('ingreso') || c === 'ing') return 'Ingreso'
  if (c.includes('terminacion') || c.includes('terminación') || c.includes('despido')) return 'Terminación'
  if (c.includes('familia')) return 'Día Familia'
  if (c.includes('hospitaliz')) return 'Hospitalización'
  if (c.includes('embargo')) return 'Embargo'
  if (c.includes('suspension') || c.includes('suspensión')) return 'Suspensión'
  // Concepto no mapeado: en vez de esconderlo bajo "Otro", devolvemos el
  // texto original (con mayúscula inicial) para que se vea en el dashboard.
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function parsearFecha(val) {
  if (!val || val === 'NaT' || val === 'nan' || val === 'NaN') return null
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  if (d.getFullYear() < 2000 || d.getFullYear() > 2030) return null
  return d.toISOString().split('T')[0]
}

export const CONCEPTO_COLORS = {
  'Incapacidad':     '#DC2626',
  'Vacaciones':      '#2563EB',
  'LNR':             '#D97706',
  'LR':              '#059669',
  'Maternidad':      '#7C3AED',
  'Paternidad':      '#0891B2',
  'Calamidad/Luto':  '#6B7280',
  'Renuncia/Retiro': '#9F1239',
  'Ingreso':         '#15803D',
  'Terminación':     '#92400E',
  'Día Familia':     '#0E7490',
  'Hospitalización': '#BE123C',
  'Embargo':         '#854D0E',
  'Suspensión':      '#B45309',
  'Otro':            '#374151',
}
