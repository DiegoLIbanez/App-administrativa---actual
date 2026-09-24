import { TrendingUp, Info } from 'lucide-react'
import { MESES, MESES_FULL } from '../../utils/productividadConstants'

export default function ProductividadChart({
  cfg, monthlyTotals, monthlyAsignados, monthlyPct, maxMensual, mejorMesIdx, mesFiltroIdx, setMesFiltro,
  anioActivo, ultimoMesVacio,
}) {
  const alturaBarra = (v) => `${Math.max((v / maxMensual) * 100, v === 0 ? 4 : 6)}%`
  const alternarMes = (i) => setMesFiltro(String(mesFiltroIdx === i ? 'todos' : i))

  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <span className="pr-card-title">
          <TrendingUp size={16} /> {cfg.usaClientes ? 'Clientes asignados vs. resueltos por mes' : 'Ventas totales por mes'}
        </span>
        <span className="pr-count">Click en un mes para filtrar la tabla</span>
      </div>

      {cfg.usaClientes && (
        <div className="pr-legend">
          <span className="pr-legend-item"><i className="pr-legend-dot pr-legend-dot--asig" /> Asignados</span>
          <span className="pr-legend-item"><i className="pr-legend-dot pr-legend-dot--res" /> Resueltos</span>
          <span className="pr-legend-item pr-legend-item--pct">% de resolución sobre cada mes</span>
        </div>
      )}

      <div className={`pr-chart ${cfg.usaClientes ? 'pr-chart--clientes' : ''}`}>
        {monthlyTotals.map((v, i) => (
          <div className="pr-chart-col" key={MESES[i]}>
            {cfg.usaClientes ? (
              <>
                <span className="pr-chart-val">{monthlyAsignados[i] ? `${monthlyPct[i]}%` : ''}</span>
                <div className="pr-chart-pair">
                  <div
                    className={`pr-chart-bar pr-chart-bar--asig ${monthlyAsignados[i] === 0 ? 'pr-chart-bar--empty' : ''} ${i === mesFiltroIdx ? 'pr-chart-bar--selected' : ''}`}
                    style={{ height: alturaBarra(monthlyAsignados[i]), animationDelay: `${i * 0.03}s` }}
                    title={`${MESES_FULL[i]}: ${monthlyAsignados[i]} asignados`}
                  />
                  <div
                    className={`pr-chart-bar ${i === mejorMesIdx ? 'pr-chart-bar--best' : ''} ${v === 0 ? 'pr-chart-bar--empty' : ''} ${i === mesFiltroIdx ? 'pr-chart-bar--selected' : ''}`}
                    style={{ height: alturaBarra(v), animationDelay: `${i * 0.03}s` }}
                    title={`${MESES_FULL[i]}: ${v} resueltos`}
                  />
                </div>
              </>
            ) : (
              <>
                <span className="pr-chart-val">{v ? v : ''}</span>
                <div
                  className={`pr-chart-bar ${i === mejorMesIdx ? 'pr-chart-bar--best' : ''} ${v === 0 ? 'pr-chart-bar--empty' : ''} ${i === mesFiltroIdx ? 'pr-chart-bar--selected' : ''}`}
                  style={{ height: alturaBarra(v), animationDelay: `${i * 0.03}s` }}
                />
              </>
            )}
            <span
              className={`pr-chart-label ${i === mesFiltroIdx ? 'pr-chart-label--active' : ''}`}
              onClick={() => alternarMes(i)}
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
