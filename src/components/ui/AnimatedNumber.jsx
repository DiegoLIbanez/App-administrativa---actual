// =============================================================
// src/components/ui/AnimatedNumber.jsx
// -------------------------------------------------------------
// Número animado (cuenta ascendente/descendente) listo para
// usar dentro de tarjetas, KPIs y contadores.
// =============================================================
import { useCountUp } from '../../hooks/useCountUp'

export default function AnimatedNumber({ value, decimals = 0, prefix = '', suffix = '', duration = 650, locale = true }) {
  const display = useCountUp(value, duration)
  const rounded = decimals > 0 ? display.toFixed(decimals) : Math.round(display)
  const formatted = locale && decimals === 0
    ? Number(rounded).toLocaleString()
    : rounded
  return <>{prefix}{formatted}{suffix}</>
}