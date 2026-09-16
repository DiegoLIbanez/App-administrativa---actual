// =============================================================
// src/components/colaboradores/ColaboradorCard.jsx
// -------------------------------------------------------------
// Tarjeta de colaborador (extraída de Colaboradores.jsx).
// =============================================================
import { AlertTriangle } from 'lucide-react'
import { CONCEPTO_COLORS } from '../../utils/parseExcel'
import { avatarColor, initials, formatProductividad, UMBRAL_ALERTA_PD } from '../../utils/colaboradores'
import './colaboradores.css'

export default function ColaboradorCard({ col, idx, maxDias, onSelect }) {
  const [bg, fg] = avatarColor(col.nombre)
  const pct = Math.round((col.diasInc / maxDias) * 100)
  const topConceptos = Object.entries(col.porConcepto)
    .sort((a, b) => b[1].episodios - a[1].episodios)
    .slice(0, 3)

  return (
    <div className="col-card" style={{
      animationDelay: `${Math.min(idx, 8) * 0.04}s`,
      background: 'var(--surface)', borderRadius: 14,
      border: '1px solid var(--border)',
      cursor: 'pointer', transition: 'box-shadow .18s, transform .18s',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}
      onClick={() => onSelect(col)}
    >
      {/* Barra de color superior según nivel de incapacidades */}
      <div style={{
        height: 3,
        background: col.diasInc > 30 ? '#DC2626' : col.diasInc > 15 ? '#F59E0B' : col.diasInc > 0 ? '#2563EB' : '#E5E7EB',
      }} />

      <div style={{ padding: '14px 16px', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          {/* Avatar con iniciales */}
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: bg, color: fg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 800,
            border: `2px solid ${fg}30`,
          }}>
            {initials(col.nombre)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {col.nombre}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📍 {col.area}
            </div>
          </div>
          {col.episodiosInc >= 2 && (
            <span style={{ flexShrink: 0, background: '#FEE2E2', color: '#991B1B', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
              <AlertTriangle size={9} /> Reinc.
            </span>
          )}
        </div>

        {/* Vehículo, procesos disciplinarios y productividad */}
        {(col.tieneVehiculo || col.procesosDisciplinarios > 0 || col.productividad != null) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, marginTop: -4 }}>
            {col.tieneVehiculo && (
              <span title="Tiene vehículo" style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#1D4ED8', fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                🏍️ Vehículo
              </span>
            )}
            {col.procesosDisciplinarios > 0 && (
              <span title={`${col.procesosDisciplinarios} proceso(s) disciplinario(s)`} style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                background: col.procesosDisciplinarios >= UMBRAL_ALERTA_PD ? '#FEE2E2' : '#FEF3C7',
                color: col.procesosDisciplinarios >= UMBRAL_ALERTA_PD ? '#991B1B' : '#92400E',
              }}>
                📋 {col.procesosDisciplinarios} proceso{col.procesosDisciplinarios !== 1 ? 's' : ''} disc.
              </span>
            )}
            {col.productividad != null && (
              <span title={`${col.productividadCfg?.label || 'Productividad'} · ${col.productividadPeriodo}`} style={{
                display: 'flex', alignItems: 'center', gap: 4, background: '#DCFCE7', color: '#166534',
                fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              }}>
                📈 {formatProductividad(col.productividad, col.productividadCfg)}
              </span>
            )}
          </div>
        )}

        {col.sinNovedades ? (
          <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: 12, background: 'var(--bg)', borderRadius: 8 }}>
            Sin novedades registradas
          </div>
        ) : (
          <>
            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
              {[
                { val: col.episodiosInc, label: 'incap.', color: '#DC2626', bg: '#FEF2F2' },
                { val: col.diasInc.toFixed(0), label: 'días inc.', color: '#D97706', bg: '#FFFBEB' },
                { val: col.novedades.length, label: 'novedades', color: '#2563EB', bg: '#EFF6FF' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center', padding: '7px 4px', background: m.bg, borderRadius: 8 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Barra de progreso días incapacidad relativa al máximo */}
            {col.diasInc > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>
                  <span>Días incapacidad</span><span>{col.diasInc.toFixed(0)}d</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999, transition: 'width .4s ease',
                    width: `${pct}%`,
                    background: pct > 60 ? '#DC2626' : pct > 30 ? '#F59E0B' : '#2563EB',
                  }} />
                </div>
              </div>
            )}

            {/* Días ausentes totales (todos los conceptos) y tasa de ausentismo */}
            {col.diasAusenteTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 8, padding: '5px 8px', marginBottom: 10 }}>
                <span>🗓️ {col.diasAusenteTotal.toFixed(0)}d ausente (sin vacaciones)</span>
                <span style={{ fontWeight: 700, color: col.tasaAusentismo > 15 ? '#DC2626' : col.tasaAusentismo > 8 ? '#D97706' : '#0369A1' }}>
                  {col.tasaAusentismo.toFixed(1)}%
                </span>
              </div>
            )}

            {/* Top conceptos */}
            {topConceptos.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {topConceptos.map(([c, d]) => {
                  const color = CONCEPTO_COLORS[c] || '#374151'
                  return (
                    <span key={c} style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                      background: color + '18', color, border: `1px solid ${color}35`,
                    }}>
                      {c} · {d.episodios}
                    </span>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}