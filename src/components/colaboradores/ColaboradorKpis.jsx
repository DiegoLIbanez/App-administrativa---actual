// =============================================================
// src/components/colaboradores/ColaboradorKpis.jsx
// -------------------------------------------------------------
// Tarjetas KPI globales de Colaboradores (extraído de la página).
// Algunas activan el filtro de estado correspondiente.
// =============================================================
import './colaboradores.css'

const KPIS = [
  { label: 'Total colaboradores', icon: '👥', color: '#2563EB', bg: '#EFF6FF', sub: 'registrados', key: 'total', val: k => k.total },
  { label: 'Con novedades', icon: '📋', color: '#7C3AED', bg: '#F5F3FF', sub: 'tienen historial', val: k => k.conNovedades, filtro: 'con_novedades' },
  { label: 'Reincidentes', icon: '⚠️', color: '#DC2626', bg: '#FEF2F2', sub: '≥2 incapacidades', val: k => k.reincidentes, filtro: 'reincidente' },
  { label: 'Días incapacidad', icon: '🏥', color: '#D97706', bg: '#FFFBEB', sub: 'días acumulados', val: k => k.totalDiasInc.toFixed(0) },
  { label: 'Tasa ausentismo', icon: '📊', color: '#0369A1', bg: '#E0F2FE', sub: 'promedio', val: k => `${k.tasaAusentismoProm.toFixed(1)}%` },
  { label: 'Procesos disciplinarios', icon: '📋', color: '#991B1B', bg: '#FEF2F2', sub: k => `${k.totalProcesosDisciplinarios} proceso${k.totalProcesosDisciplinarios !== 1 ? 's' : ''} en total`, val: k => k.conProcesosDisciplinarios, filtro: 'con_pd' },
]

export default function ColaboradorKpis({ kpis, filterEstado, setFilterEstado, setPage }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
      {KPIS.map(k => {
        const onClick = k.filtro
          ? () => { setFilterEstado(filterEstado === k.filtro ? '' : k.filtro); setPage(1) }
          : undefined
        const activo = k.filtro && filterEstado === k.filtro
        return (
          <div key={k.label} className={`col-kpi${onClick ? '' : ' no-hover'}`} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px 18px',
            border: '1px solid var(--border)', cursor: onClick ? 'pointer' : 'default',
            transition: 'box-shadow .18s, transform .18s',
            outline: activo ? `2px solid ${k.color}` : 'none',
            outlineOffset: activo ? 2 : 0,
          }}
            onClick={onClick}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: k.bg, color: k.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 10,
            }}>{k.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: 4 }}>{String(k.val(kpis))}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{k.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', opacity: .8, marginTop: 2 }}>{typeof k.sub === 'function' ? k.sub(kpis) : k.sub}</div>
          </div>
        )
      })}
    </div>
  )
}