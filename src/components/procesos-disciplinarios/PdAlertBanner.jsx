// =============================================================
// src/components/procesos-disciplinarios/PdAlertBanner.jsx
// -------------------------------------------------------------
// Banner de alerta: empleados con UMBRAL_ALERTA o más procesos.
// =============================================================
import { AlertTriangle } from 'lucide-react'
import { ALERT, UMBRAL_ALERTA, normalizeNombre } from '../../utils/procesosDisciplinariosConstants'
import './procesos-disciplinarios.css'

export default function PdAlertBanner({
  empleadosEnAlerta, bannerExpandido, setBannerExpandido, onVerTodos, onSelectEmpleado,
}) {
  return (
    <div className="pd-alert-banner" style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: ALERT.bg, border: `1.5px solid ${ALERT.border}`, borderRadius: 10,
      padding: '12px 16px', marginBottom: 14,
    }}>
      <AlertTriangle size={18} color={ALERT.solid} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: ALERT.text }}>
            {empleadosEnAlerta.length} empleado{empleadosEnAlerta.length !== 1 ? 's' : ''} con {UMBRAL_ALERTA} o más procesos disciplinarios
          </p>
          <button className="btn btn-ghost btn-sm"
            onClick={onVerTodos}
            style={{ fontSize: 11.5, color: ALERT.text }}>
            Ver todos en la tabla →
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {(bannerExpandido ? empleadosEnAlerta : empleadosEnAlerta.slice(0, 5)).map(({ count, display }) => (
            <span key={display}
              className="pd-chip"
              onClick={() => onSelectEmpleado(normalizeNombre(display))}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--surface)', border: `1px solid ${ALERT.border}`, borderRadius: 999,
                padding: '3px 10px', fontSize: 12, fontWeight: 600, color: ALERT.text,
              }}>
              {display} <span style={{ background: ALERT.solid, color: '#fff', borderRadius: 999, padding: '0 6px', fontSize: 11 }}>{count}</span>
            </span>
          ))}
          {empleadosEnAlerta.length > 5 && (
            <button onClick={() => setBannerExpandido(v => !v)}
              style={{
                background: 'none', border: `1px dashed ${ALERT.border}`, borderRadius: 999,
                padding: '3px 10px', fontSize: 12, fontWeight: 600, color: ALERT.text, cursor: 'pointer',
              }}>
              {bannerExpandido ? '– Ver menos' : `+${empleadosEnAlerta.length - 5} más`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}