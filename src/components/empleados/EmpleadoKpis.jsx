// =============================================================
// src/components/empleados/EmpleadoKpis.jsx
// -------------------------------------------------------------
// Tarjetas KPI de la página Empleados (total, activos, inactivos,
// novedades recientes). Cada tarjeta activa un filtro rápido.
// =============================================================
import { User, Archive, Briefcase } from 'lucide-react'

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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
      {/* Total */}
      <div className="card" style={{ padding: '14px 16px', position: 'relative', cursor: 'pointer' }}
        onClick={() => { setFilterTab(''); setFilterEstado(''); setPage(1) }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Total empleados</div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{rows.length}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{depsEnUso.length} área{depsEnUso.length !== 1 ? 's' : ''}</div>
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56' }}>
          <User size={15} />
        </div>
      </div>
      {/* Activos */}
      <div className="card" style={{ padding: '14px 16px', position: 'relative', cursor: 'pointer' }}
        onClick={() => { setFilterTab('activos'); setFilterEstado(''); setPage(1) }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Activos</div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: '#166534' }}>{activos}</div>
        <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4 }}>{((activos / total) * 100).toFixed(1)}% del total</div>
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
          <User size={15} />
        </div>
      </div>
      {/* Inactivos */}
      <div className="card" style={{ padding: '14px 16px', position: 'relative', cursor: 'pointer' }}
        onClick={() => { setFilterTab('inactivos'); setFilterEstado(''); setPage(1) }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Inactivos</div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: '#991B1B' }}>{inactivos}</div>
        <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{((inactivos / total) * 100).toFixed(1)}% del total</div>
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991B1B' }}>
          <Archive size={15} />
        </div>
      </div>
      {/* Con novedades recientes */}
      <div className="card" style={{ padding: '14px 16px', position: 'relative', cursor: 'pointer' }}
        onClick={() => { setFilterTab('con_inc'); setPage(1) }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Nov. recientes</div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: conNovReciente > 0 ? '#92400E' : 'var(--text)' }}>{conNovReciente}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>últimos 30 días</div>
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400E' }}>
          <Briefcase size={15} />
        </div>
      </div>
    </div>
  )
}