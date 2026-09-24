// =============================================================
// src/components/empleados/EmpleadoKpis.jsx
// -------------------------------------------------------------
// Tarjetas KPI de la página Empleados (total, activos, inactivos,
// novedades recientes). Cada tarjeta activa un filtro rápido.
// =============================================================
import { User, Archive, Briefcase } from 'lucide-react'
import KpiCard, { KpiGrid } from '../ui/KpiCard'

export default function EmpleadoKpis({
  rows, novedadesPorEmpleado, depsEnUso, setFilterTab, setFilterEstado, setPage,
}) {
  const total = rows.length || 1
  const activos = rows.filter(r => r.activo !== false).length
  const inactivos = rows.filter(r => r.activo === false).length
  const hoy = new Date()
  const hace30 = new Date(hoy); hace30.setDate(hoy.getDate() - 30)
  const conNovReciente = rows.filter(r => {
    const nov = novedadesPorEmpleado[r.nombre_completo]
    if (!nov) return false
    return nov.novedades.some(n => n.fecha_inicio && new Date(n.fecha_inicio) >= hace30)
  }).length

  return (
    <KpiGrid>
      <KpiCard
        label="Total empleados" value={rows.length}
        sub={`${depsEnUso.length} área${depsEnUso.length !== 1 ? 's' : ''}`}
        icon={User}
        onClick={() => { setFilterTab(''); setFilterEstado(''); setPage(1) }}
      />
      <KpiCard
        label="Activos" value={activos} tone="success" icon={User}
        sub={`${((activos / total) * 100).toFixed(1)}% del total`}
        onClick={() => { setFilterTab('activos'); setFilterEstado(''); setPage(1) }}
      />
      <KpiCard
        label="Inactivos" value={inactivos} tone="danger" icon={Archive}
        sub={`${((inactivos / total) * 100).toFixed(1)}% del total`}
        onClick={() => { setFilterTab('inactivos'); setFilterEstado(''); setPage(1) }}
      />
      <KpiCard
        label="Nov. recientes" value={conNovReciente} tone={conNovReciente > 0 ? 'warning' : 'default'} icon={Briefcase}
        sub="últimos 30 días"
        onClick={() => { setFilterTab('con_inc'); setPage(1) }}
      />
    </KpiGrid>
  )
}
