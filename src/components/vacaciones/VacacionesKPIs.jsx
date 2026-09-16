export default function VacacionesKPIs({ stats, hayFiltros }) {
  const kpis = [
    { label: 'Total registros', val: stats.total, icon: '📋', color: '#2563EB', bg: '#EFF6FF', sub: hayFiltros ? 'filtrados' : 'registros' },
    { label: 'Pendientes', val: stats.pendientes, icon: '⏳', color: '#D97706', bg: '#FFFBEB', sub: 'por aprobar' },
    { label: 'Aprobadas', val: stats.aprobadas, icon: '✅', color: '#166534', bg: '#F0FDF4', sub: 'autorizadas' },
    { label: 'En curso', val: stats.enCurso, icon: '🏖️', color: '#1E40AF', bg: '#DBEAFE', sub: 'actualmente' },
    { label: 'Días hábiles', val: stats.diasTotales, icon: '📅', color: '#7C3AED', bg: '#F5F3FF', sub: 'acumulados' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
      {kpis.map(k => (
        <div key={k.label} className={`vac-kpi${k.label === 'Días hábiles' ? ' no-hover' : ''}`} style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px 18px',
          border: '1px solid var(--border)',
          cursor: k.label !== 'Días hábiles' ? 'pointer' : 'default',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: k.bg, color: k.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 10,
          }}>{k.icon}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.val.toLocaleString()}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{k.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', opacity: .8, marginTop: 2 }}>{k.sub}</div>
        </div>
      ))}
    </div>
  )
}
