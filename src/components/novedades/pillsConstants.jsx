import { normalizarConcepto } from '../../utils/parseExcel'

// ── Pills de estado ─────────────────────────────────────────────────────────
// Constantes y funciones "no-componente" compartidas por el módulo de Novedades.
// Se mantienen fuera de Pills.jsx para no romper el fast-refresh de React
// (regla react-refresh/only-export-components).

export const PILL_BASE = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
  whiteSpace: 'nowrap', letterSpacing: '0.02em'
}
export const PILL_STYLES = {
  ok: { ...PILL_BASE, background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' },
  si: { ...PILL_BASE, background: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD' },
  no: { ...PILL_BASE, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' },
  na: { ...PILL_BASE, background: 'var(--bg)', color: '#374151', border: '1px solid #D1D5DB' },
  validar: { ...PILL_BASE, background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' },
  empty: { ...PILL_BASE, background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB' },
  other: { ...PILL_BASE, background: '#EDE9FE', color: '#5B21B6', border: '1px solid #C4B5FD' },
}

export function statusPill(val) {
  if (!val || val.trim() === '') return <span style={PILL_STYLES.empty}>—</span>
  const v = val.toLowerCase().trim()
  if (v === 'ok') return <span style={PILL_STYLES.ok}>✓ OK</span>
  if (v.startsWith('ok-')) {
    const nombre = val.substring(3)
    return <span style={PILL_STYLES.ok}>✓ OK — <span style={{ fontStyle: 'italic' }}>{nombre}</span></span>
  }
  if (v === 'sí' || v === 'si') return <span style={PILL_STYLES.si}>● Sí</span>
  if (v === 'no') return <span style={PILL_STYLES.no}>✗ No</span>
  if (v === 'n/a') return <span style={PILL_STYLES.na}>N/A</span>
  if (v === 'validar') return <span style={PILL_STYLES.validar}>⚠ Validar</span>
  return <span style={PILL_STYLES.other}>{val}</span>
}

// ── Pill editable (clic cicla entre opciones) ───────────────────────────────
export const CICLOS = {
  validacion_incapacidad: ['', 'OK', 'Validar', 'N/A'],
  prorroga: ['', 'Sí', 'Validar', 'N/A'],
  radicacion_incapacidad: ['', 'OK', 'Validar', 'N/A'],
  observacion_contabilidad: ['', 'OK-DIANA', 'OK-ANDRES', 'OK-ALEJANDRO', 'VALIDAR'],
  nomina_electronica: ['', 'OK-DIANA', 'OK-ANDRES', 'OK-ALEJANDRO', 'VALIDAR'],
  seguridad_social: ['', 'OK-DIANA', 'OK-ANDRES', 'OK-ALEJANDRO', 'VALIDAR'],
}

// ── Indicador de campos faltantes ───────────────────────────────────────────
export function camposFaltantes(row) {
  const campos = []
  if (normalizarConcepto(row.concepto) === 'Incapacidad') {
    if (!(row.radicacion_incapacidad || '').trim()) campos.push('Sin radicación')
    if (!(row.nomina_electronica || '').trim()) campos.push('Sin nómina e.')
    if (!(row.seguridad_social || '').trim()) campos.push('Sin seg. social')
    const v = (row.validacion_incapacidad || '').toLowerCase().trim()
    if (v === '' || v === 'validar') campos.push('Pendiente validar')
  }
  return campos
}