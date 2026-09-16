// =============================================================
// src/components/empleados/empleadosConstants.js
// -------------------------------------------------------------
// Constantes específicas del módulo Empleados (iconos, colores
// por área, concepto con fecha y formulario vacío).
// =============================================================

export const PAGE_SIZE = 12

export { DEPENDENCIAS_EXTENDIDAS as DEPENDENCIAS } from '../../constants'

export const DEP_ICONS = {
  'COBRANZA': '💳', 'CIERRE': '🔒', 'VENTAS': '📈', 'UNDERWRITING': '📝',
  'CONTABILIDAD': '🧾', 'RRHH': '👥', 'GERENCIA': '🏢', 'SOPORTE TI': '💻',
}

export const DEP_COLORS = {
  'COBRANZA': ['#FEF3C7', '#92400E', '#FCD34D'],
  'CIERRE': ['#FEE2E2', '#991B1B', '#FCA5A5'],
  'VENTAS': ['#DCFCE7', '#166534', '#86EFAC'],
  'UNDERWRITING': ['#EDE9FE', '#5B21B6', '#C4B5FD'],
  'CONTABILIDAD': ['#DBEAFE', '#1E40AF', '#93C5FD'],
  'RRHH': ['#FCE7F3', '#9D174D', '#F9A8D4'],
  'GERENCIA': ['#F0FDF4', '#14532D', '#6EE7B7'],
  'SOPORTE TI': ['#EFF6FF', '#1E3A8A', '#BFDBFE'],
}

export const CONCEPTOS_CON_FECHA = [
  'Incapacidad', 'Vacaciones', 'LNR', 'LR', 'Maternidad', 'Paternidad',
  'Calamidad/Luto', 'Día Familia', 'Hospitalización', 'Embargo', 'Otro',
]

export const EMPTY = {
  nombre_completo: '', correo: '', dependencia: '', activo: true,
  cargo: '', fecha_ingreso: '', fecha_retiro: '',
}