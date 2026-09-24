import { ClipboardList, Hourglass, CheckCircle2, Plane, CalendarDays } from 'lucide-react'
import KpiCard, { KpiGrid } from '../ui/KpiCard'

export default function VacacionesKPIs({ stats, hayFiltros }) {
  const kpis = [
    { label: 'Total registros', val: stats.total, icon: ClipboardList, tone: 'info', sub: hayFiltros ? 'filtrados' : 'registros' },
    { label: 'Pendientes', val: stats.pendientes, icon: Hourglass, tone: 'warning', sub: 'por aprobar' },
    { label: 'Aprobadas', val: stats.aprobadas, icon: CheckCircle2, tone: 'success', sub: 'autorizadas' },
    { label: 'En curso', val: stats.enCurso, icon: Plane, tone: 'info', sub: 'actualmente' },
    { label: 'Días hábiles', val: stats.diasTotales, icon: CalendarDays, tone: 'purple', sub: 'acumulados' },
  ]
  return (
    <KpiGrid min={150}>
      {kpis.map(k => (
        <KpiCard key={k.label} label={k.label} value={k.val.toLocaleString()} sub={k.sub} icon={k.icon} tone={k.tone} />
      ))}
    </KpiGrid>
  )
}
