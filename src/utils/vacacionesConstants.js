import { hoyISO } from './fecha'
import { MESES_MAYUSCULA as MESES, ANIOS, DEPENDENCIAS } from '../constants'

export { MESES, ANIOS, DEPENDENCIAS }

export const PAGE_SIZE = 15

export const ESTADOS = ['Pendiente', 'Aprobada', 'En curso', 'Finalizada', 'Cancelada']

export const ESTADO_STYLES = {
  'Pendiente': { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  'Aprobada': { bg: '#DCFCE7', color: '#166534', border: '#86EFAC' },
  'En curso': { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
  'Finalizada': { bg: '#F3F4F6', color: '#374151', border: '#D1D5DB' },
  'Cancelada': { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
}

export const EMPTY = {
  nombre_empleado: '', dependencia: '',
  periodo_vacaciones: '',
  fecha_inicio: '', fecha_fin: '', total_dias: '',
  dias_disfrutados: '', dias_en_dinero: '',
  anio: '', mes_inicio: '',
  tipo_vacacion: 'Vacaciones', estado: 'Pendiente',
  observacion: '', observacion_contable: '', aprobado_por: '',
  fecha_solicitud: hoyISO(),
  fecha_ingreso: '',
}

export const TIPOS_VACACION = ['Vacaciones', 'Vacaciones en dinero', 'Vacaciones compensadas']

export const TIPO_STYLES = {
  'Vacaciones': { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  'Vacaciones en dinero': { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  'Vacaciones compensadas': { bg: '#F3E8FF', color: '#6B21A8', border: '#E9D5FF' },
}
