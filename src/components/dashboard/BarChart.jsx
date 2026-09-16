import { useMemo } from 'react'
import {
  BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'

// ── Bar chart interactivo (Recharts) ───────────────────────────────────────
export default function BarChart({ items, color = '#3B82F6', maxItems = 8, onBarClick, activeLabel }) {
  const top = useMemo(() => items.slice(0, maxItems).map(([label, count]) => ({ label, count })), [items, maxItems])
  const totalAll = useMemo(() => items.reduce((s, [, c]) => s + c, 0), [items])

  if (top.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin datos</p>
  }

  const rowH = 30
  const height = Math.max(top.length * rowH, 60)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={top} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category" dataKey="label" width={130}
          tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
          axisLine={false} tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: 'var(--card-bg)', color: 'var(--text)' }}
          itemStyle={{ color: 'var(--text)' }}
          labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
          formatter={(value) => {
            const pct = totalAll ? Math.round((value / totalAll) * 100) : 0
            return [`${value} (${pct}%)`, 'Registros']
          }}
          labelFormatter={(label) => label}
        />
        <Bar
          dataKey="count" radius={[0, 6, 6, 0]} animationDuration={500}
          cursor={onBarClick ? 'pointer' : 'default'}
          activeBar={{ fillOpacity: 0.85, stroke: color, strokeWidth: 1 }}
          onClick={onBarClick ? (entry) => onBarClick(entry.label) : undefined}
        >
          {top.map((entry) => (
            <Cell
              key={entry.label}
              fill={color}
              opacity={!activeLabel || activeLabel === entry.label ? 1 : 0.3}
            />
          ))}
          <LabelList
            dataKey="count" position="right"
            style={{ fontSize: 12, fontWeight: 700, fill: 'var(--text)' }}
          />
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  )
}
