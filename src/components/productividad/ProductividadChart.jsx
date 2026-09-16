import { TrendingUp, Info } from 'lucide-react'
import { MESES, MESES_FULL } from '../../utils/productividadConstants'

export default function ProductividadChart({
  cfg, monthlyTotals, maxMensual, mejorMesIdx, mesFiltroIdx, setMesFiltro,
  anioActivo, ultimoMesVacio,
}) {
  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <span className="pr-card-title"><TrendingUp size={15} color="#0F2A47" /> {cfg.esPorcentaje ? 'Producción promedio por mes (%)' : 'Ventas totales por mes'}</span>
        <span className="pr-count">Click en un mes para filtrar la tabla</span>
      </div>
      <div className="pr-chart">
        {monthlyTotals.map((v, i) => (
          <div className="pr-chart-col" key={MESES[i]}>
            <span className="pr-chart-val">{v ? `${v}${cfg.esPorcentaje ? '%' : ''}` : ''}</span>
            <div
              className={`pr-chart-bar ${i === mejorMesIdx ? 'pr-chart-bar--best' : ''} ${v === 0 ? 'pr-chart-bar--empty' : ''} ${i === mesFiltroIdx ? 'pr-chart-bar--selected' : ''}`}
              style={{ height: `${Math.max((v / maxMensual) * 100, v === 0 ? 4 : 6)}%`, animationDelay: `${i * 0.03}s` }}
            />
            <span
              className={`pr-chart-label ${i === mesFiltroIdx ? 'pr-chart-label--active' : ''}`}
              onClick={() => setMesFiltro(String(mesFiltroIdx === i ? 'todos' : i))}
            >
              {MESES[i]}
            </span>
          </div>
        ))}
      </div>
      {ultimoMesVacio && (
        <div className="pr-chart-note">
          <Info size={12} /> {MESES_FULL[MESES.length - 1]} de {anioActivo} aparece en cero — probablemente el mes aún no se ha registrado.
        </div>
      )}
    </div>
  )
}
