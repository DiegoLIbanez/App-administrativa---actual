// =============================================================
// src/components/empleados/AreaDistribution.jsx
// -------------------------------------------------------------
// Barras de distribución de empleados por área (clic para filtrar).
// =============================================================
export default function AreaDistribution({ conteoPorArea, rows, maxArea, filterDep, setFilterDep, setPage }) {
  if (conteoPorArea.length === 0) return null
  const total = rows.length || 1

  return (
    <div className="card" style={{ marginBottom: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700 }}>Distribución por área</h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Clic en área para filtrar</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {conteoPorArea.map(([area, cant]) => {
          const isActive = filterDep === area
          return (
            <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderRadius: 6, padding: '3px 6px', background: isActive ? 'var(--primary-light)' : 'transparent', transition: 'background .15s' }}
              onClick={() => { setFilterDep(isActive ? '' : area); setPage(1) }}>
              <div style={{ width: 120, fontSize: 12, color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 700 : 400 }}>{area}</div>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 6, height: 8, position: 'relative' }}>
                <div style={{ width: `${(cant / maxArea) * 100}%`, height: '100%', background: isActive ? 'var(--primary)' : 'var(--primary)', borderRadius: 6, opacity: isActive ? 1 : 0.55, transition: 'opacity .15s' }} />
              </div>
              <div style={{ width: 24, fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{cant}</div>
              <div style={{ width: 36, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{((cant / total) * 100).toFixed(0)}%</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}