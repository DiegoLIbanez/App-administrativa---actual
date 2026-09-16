import { useMemo } from 'react'
import {
  BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts'

// ── Tendencia mensual (Recharts BarChart, barras animadas con tooltip) ─────
export default function TendenciaChart({ tendencia }) {
  const primary = '#DC2626'
  const items = useMemo(() => tendencia.map(([mes, val], i) => {
    const prevVal = i > 0 ? tendencia[i - 1][1] : null
    const delta = (prevVal != null && prevVal !== 0) ? Math.round(((val - prevVal) / prevVal) * 100) : null
    return { mes, val, delta, label: `${mes.substring(5)}/${mes.substring(2, 4)}` }
  }), [tendencia])

  return (
    <ResponsiveContainer width="100%" height={180}>
      <RBarChart data={items} margin={{ top: 20, right: 12, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="tendenciaBarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primary} stopOpacity={0.95} />
            <stop offset="100%" stopColor={primary} stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload
            return (
              <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 10px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: 'var(--text)',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2, color: 'var(--text)' }}>Mes {label}</div>
                <div style={{ color: 'var(--text)' }}>{p.val} novedades</div>
                {p.delta !== null && (
                  <div style={{ fontWeight: 600, marginTop: 2, color: p.delta > 0 ? '#DC2626' : p.delta < 0 ? '#16A34A' : 'var(--text-muted)' }}>
                    {p.delta > 0 ? '▲' : p.delta < 0 ? '▼' : '='} {Math.abs(p.delta)}% vs mes anterior
                  </div>
                )}
              </div>
            )
          }}
        />
        <Bar
          dataKey="val" radius={[6, 6, 0, 0]} fill="url(#tendenciaBarFill)"
          animationDuration={700} animationEasing="ease-out"
          activeBar={{ fillOpacity: 1, stroke: primary, strokeWidth: 1 }}
        >
          <LabelList
            dataKey="val" position="top"
            style={{ fontSize: 11, fontWeight: 700, fill: 'var(--text)' }}
          />
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  )
}
