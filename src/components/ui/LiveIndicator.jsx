// =============================================================
// src/components/ui/LiveIndicator.jsx
// -------------------------------------------------------------
// Botón que muestra hace cuánto se actualizaron los datos y
// permite refrescar manualmente. Compartido entre páginas.
// =============================================================
import { useState, useEffect } from 'react'
import './ui.css'

export default function LiveIndicator({ lastUpdated, refreshing, onRefreshNow }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const secs = lastUpdated ? Math.floor((now - lastUpdated.getTime()) / 1000) : null
  const label = secs === null
    ? 'cargando…'
    : refreshing
      ? 'actualizando…'
      : secs < 5 ? 'justo ahora'
        : secs < 60 ? `hace ${secs}s`
          : `hace ${Math.floor(secs / 60)} min`

  return (
    <button
      onClick={onRefreshNow}
      title="Clic para actualizar ahora"
      style={{
        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)',
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20,
        padding: '5px 12px', cursor: 'pointer', flexShrink: 0,
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: refreshing ? '#F59E0B' : '#22C55E',
        ...(refreshing ? {} : { animation: 'uiPulse 1.8s ease-in-out infinite' }),
      }} />
      Actualizado {label}
    </button>
  )
}