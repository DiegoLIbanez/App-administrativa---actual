import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

// ── Donut de distribución por concepto (Recharts, clic para filtrar) ───────
export default function ConceptoDonut({ data, colors, activeConcepto, onSliceClick }) {
  const items = useMemo(() => data.map(([concepto, cantidad]) => ({
    name: concepto,
    value: cantidad,
    color: colors[concepto]?.color || '#374151',
  })), [data, colors])

  const total = items.reduce((s, i) => s + i.value, 0)

  if (items.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin datos</p>

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart margin={{ top: 16, right: 36, bottom: 16, left: 36 }}>
          <Pie
            data={items}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="75%"
            paddingAngle={2}
            animationDuration={500}
            cursor={onSliceClick ? 'pointer' : 'default'}
            onClick={onSliceClick ? (entry) => onSliceClick(entry.name) : undefined}
            label={({ cx, cy, midAngle, outerRadius, value, name }) => {
              const RADIAN = Math.PI / 180
              const r = outerRadius + 16
              const x = cx + r * Math.cos(-midAngle * RADIAN)
              const y = cy + r * Math.sin(-midAngle * RADIAN)
              const pct = total ? Math.round((value / total) * 100) : 0
              return (
                <text
                  x={x} y={y} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central"
                  style={{ fontSize: 12, fontWeight: 700, fill: 'var(--text)' }}
                  opacity={!activeConcepto || activeConcepto === name ? 1 : 0.35}
                >
                  {value} ({pct}%)
                </text>
              )
            }}
            labelLine={{ stroke: 'var(--border)' }}
          >
            {items.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                opacity={!activeConcepto || activeConcepto === entry.name ? 1 : 0.3}
                stroke="var(--card-bg)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} (${total ? Math.round(value / total * 100) : 0}%)`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
            itemStyle={{ color: 'var(--text)' }}
            labelStyle={{ color: 'var(--text)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Total al centro del donut */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{total}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>total</div>
      </div>
      {/* Leyenda clickeable */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
        {items.map(entry => (
          <div
            key={entry.name}
            onClick={() => onSliceClick && onSliceClick(entry.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: onSliceClick ? 'pointer' : 'default',
              opacity: !activeConcepto || activeConcepto === entry.name ? 1 : 0.4,
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
