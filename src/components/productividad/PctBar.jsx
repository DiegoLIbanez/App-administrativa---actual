import { colorPct } from '../../utils/productividadHelpers'

export default function PctBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  const color = colorPct(v)
  return (
    <div className="ci-pct-cell">
      <div className="ci-pct-bar" style={{ width: `${v}%`, background: color }} />
      <span className="ci-pct-text" style={{ color }}>{Number(value) || 0}%</span>
    </div>
  )
}
