import AnimatedNumber from '../ui/AnimatedNumber'

// ── Stat card ─────────────────────────────────────────────────────────────────
// icon: componente lucide opcional (chip de color a la izquierda, como en las
// tarjetas KPI de referencia). trend: número opcional (%) con flecha ▲/▼.
export default function StatCard({ label, value, sub, color, accent, onClick, active, decimals = 0, suffix = '', delay = 0, title, icon: Icon, trend }) {
  const glow = color || '#3B82F6'
  const isNumeric = typeof value === 'number'
  const hasTrend = trend !== null && trend !== undefined

  return (
    <div
      className={`stat-card db-stat-card-hover db-anim-card${accent ? ' accent' : ''}`}
      onClick={onClick}
      title={title}
      style={{
        cursor: onClick ? 'pointer' : (title ? 'help' : 'default'),
        outline: active ? `2px solid ${glow}` : 'none',
        outlineOffset: active ? 2 : 0,
        animationDelay: `${delay}ms`,
        ['--glow']: glow,
      }}
    >
      <div className="stat-card-top">
        {Icon && <div className="stat-icon-chip"><Icon size={17} /></div>}
        {hasTrend && (
          <span className={`stat-trend ${trend >= 0 ? 'stat-trend--up' : 'stat-trend--down'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>
        {isNumeric ? <AnimatedNumber value={value} decimals={decimals} suffix={suffix} /> : value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}
