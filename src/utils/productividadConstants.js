// Este componente gestiona la productividad por departamento. Cada pestaña
// (Ventas, UW-BS...) usa las mismas tablas de Supabase, filtrando por su
// propio valor de "departamento", y su propia dependencia en Empleados.
import { MESES_CORTO as MESES, MESES_FULL } from '../constants'

export { MESES, MESES_FULL }

export const METRICA = 'Producción'

export const DEPTOS = {
  ventas: {
    id: 'ventas',
    tabLabel: 'Ventas',
    departamento: 'Ventas',           // valor guardado en productividad / productividad_resumen
    dependenciaEmpleados: 'VENTAS',   // valor guardado en empleados.dependencia
    personaLabel: 'Vendedor(a)',
    personaLabelLower: 'vendedor(a)',
    unidadPlural: 'ventas',
    esPorcentaje: false,
  },
  'uw-bs': {
    id: 'uw-bs',
    tabLabel: 'UW - BS',
    departamento: 'UW - BS',
    dependenciaEmpleados: 'UNDERWRITING',
    personaLabel: 'Analista',
    personaLabelLower: 'analista',
    unidadPlural: 'de producción',
    esPorcentaje: true,
  },
}

export const DEPARTAMENTOS_FUTUROS = [
  { id: 'cobranzas', label: 'Cobranzas' },
]

// ── Config del departamento "Cierre" ─────────────────────────────────────
// A diferencia de Ventas/UW-BS (1 valor por persona/mes), Cierre maneja 6
// métricas por persona en cada mes de cierre. Vive en su propia tabla de
// Supabase: "cierre_meses" (una fila por persona + mes + año). Los procesos
// disciplinarios se traen de "procesos_disciplinarios" filtrando por
// dependenciaEmpleados, igual que hacen Ventas y UW-BS.
export const CIERRE_CFG = {
  id: 'cierre',
  tabLabel: 'Cierre',
  departamento: 'Cierre',
  dependenciaEmpleados: 'CIERRE', // valor esperado en empleados.dependencia
  personaLabel: 'Analista de Cierre',
}

// Cada fila de métrica: key = columna en la tabla cierre_meses, tipo controla formato.
export const CIERRE_METRICAS = [
  { key: 'new_offers_units', label: 'New Offers % Closed (units)', tipo: 'pct' },
  { key: 'new_offers_dollars', label: 'New Offers Closed % (dollars)', tipo: 'pct' },
  { key: 'renewal_units', label: 'Renewal/Revived Offers Closed % (units)', tipo: 'pct', espacioAntes: true },
  { key: 'renewal_dollars', label: 'Renewal/Revived Offers Closed % (dollars)', tipo: 'pct' },
  { key: 'total_units', label: 'Total Closed (units)', tipo: 'num', espacioAntes: true },
  { key: 'total_dollars', label: 'Total Closed (dollars)', tipo: 'moneda' },
]

export const ANIO_ACTUAL = new Date().getFullYear()

// Normaliza nombres para cruzar "empleados" con "procesos_disciplinarios"
// sin que falle por mayúsculas/espacios extra (igual que en ProcesosDisciplinarios.jsx)
export const normalizeNombre = (s) => (s || '').trim().toLowerCase()

// Íconos/colores por concepto de proceso disciplinario (mismos que ProcesosDisciplinarios.jsx)
export const CONCEPTO_ICONS = {
  'Falta Reglamento Interno': '📕',
  'Disciplina (Llegadas tarde)': '⏰',
  'Productividad': '📉',
  'Citación a Descargos': '📨',
}
