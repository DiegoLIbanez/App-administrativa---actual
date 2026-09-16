import { Calendar, Trophy } from 'lucide-react'

export default function ProductividadKPIs({
  cfg, etiquetaPeriodo, totalGeneral, datos, promedioEquipo,
  rankedByPeriodo, valorPeriodo, mejorMesIdx, monthlyTotals, MESES,
}) {
  return (
    <div className="pr-kpis">
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">{cfg.esPorcentaje ? 'Promedio' : 'Total'} {etiquetaPeriodo}</span>
        <span className="pr-kpi-value">{totalGeneral.toLocaleString('es-CO')}{cfg.esPorcentaje ? '%' : ''}</span>
        <span className="pr-kpi-sub"><Calendar size={12} /> {datos.length} personas</span>
      </div>
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">Promedio por persona</span>
        <span className="pr-kpi-value">{promedioEquipo.toFixed(1)}{cfg.esPorcentaje ? '%' : ''}</span>
        <span className="pr-kpi-sub">{cfg.unidadPlural} {etiquetaPeriodo}</span>
      </div>
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">Mejor {cfg.personaLabelLower}</span>
        <span className="pr-kpi-value" style={{ fontSize: 15, lineHeight: 1.3 }}>{rankedByPeriodo[0]?.nombre.split(' ').slice(0, 2).join(' ') || '—'}</span>
        <span className="pr-kpi-sub"><Trophy size={12} color="#F59E0B" /> {rankedByPeriodo[0] ? valorPeriodo(rankedByPeriodo[0]) : 0}{cfg.esPorcentaje ? '%' : ''} {cfg.unidadPlural}</span>
      </div>
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">Mejor mes del equipo</span>
        <span className="pr-kpi-value">{mejorMesIdx >= 0 ? MESES[mejorMesIdx] : '—'}</span>
        <span className="pr-kpi-sub">{mejorMesIdx >= 0 ? `${monthlyTotals[mejorMesIdx]}${cfg.esPorcentaje ? '%' : ''} ${cfg.unidadPlural} en total` : 'sin datos'}</span>
      </div>
    </div>
  )
}
