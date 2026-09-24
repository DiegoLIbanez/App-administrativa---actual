import { Calendar, Trophy, Target, Percent, Users } from 'lucide-react'
import { colorPct } from '../../utils/productividadHelpers'

export default function ProductividadKPIs({
  cfg, etiquetaPeriodo, totalGeneral, datos, promedioEquipo, resumenPeriodo,
  rankedByPeriodo, valorPeriodo, statsPeriodo, mejorMesIdx, monthlyTotals, MESES,
}) {
  const mejor = rankedByPeriodo[0]
  const nombreMejor = mejor?.nombre.split(' ').slice(0, 2).join(' ') || '—'

  // Departamentos con Clientes Asignados / Resueltos (Ventas, UW-BS)
  if (cfg.usaClientes) {
    const { asignados, resueltos, pct } = resumenPeriodo
    const sMejor = mejor ? statsPeriodo(mejor) : null
    return (
      <div className="pr-kpis">
        <div className="pr-kpi">
          <div className="pr-kpi-accent" />
          <span className="pr-kpi-label">Clientes asignados {etiquetaPeriodo}</span>
          <span className="pr-kpi-value">{asignados.toLocaleString('es-CO')}</span>
          <span className="pr-kpi-sub"><Calendar size={12} /> {datos.length} personas</span>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-accent" />
          <span className="pr-kpi-label">Clientes resueltos {etiquetaPeriodo}</span>
          <span className="pr-kpi-value">{resueltos.toLocaleString('es-CO')}</span>
          <span className="pr-kpi-sub"><Target size={12} color="var(--secondary-dark)" /> de {asignados.toLocaleString('es-CO')} asignados</span>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-accent" />
          <span className="pr-kpi-label">% de resolución</span>
          <span className="pr-kpi-value" style={{ color: asignados > 0 ? colorPct(pct) : undefined }}>{pct}%</span>
          <span className="pr-kpi-sub"><Percent size={12} /> resueltos ÷ asignados</span>
        </div>
        <div className="pr-kpi">
          <div className="pr-kpi-accent" />
          <span className="pr-kpi-label">Mejor {cfg.personaLabelLower}</span>
          <span className="pr-kpi-value" style={{ fontSize: 15, lineHeight: 1.3 }}>{sMejor && sMejor.resu > 0 ? nombreMejor : '—'}</span>
          <span className="pr-kpi-sub">
            <Trophy size={12} color="#F59E0B" /> {sMejor ? `${sMejor.resu} resueltos de ${sMejor.asig} (${sMejor.pct}%)` : 'sin datos'}
          </span>
        </div>
      </div>
    )
  }

  // Departamentos de un solo valor (Global Link)
  return (
    <div className="pr-kpis">
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">Total {etiquetaPeriodo}</span>
        <span className="pr-kpi-value">{totalGeneral.toLocaleString('es-CO')}</span>
        <span className="pr-kpi-sub"><Users size={12} /> {datos.length} personas</span>
      </div>
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">Promedio por persona</span>
        <span className="pr-kpi-value">{promedioEquipo.toFixed(1)}</span>
        <span className="pr-kpi-sub">{cfg.unidadPlural} {etiquetaPeriodo}</span>
      </div>
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">Mejor {cfg.personaLabelLower}</span>
        <span className="pr-kpi-value" style={{ fontSize: 15, lineHeight: 1.3 }}>{nombreMejor}</span>
        <span className="pr-kpi-sub"><Trophy size={12} color="#F59E0B" /> {mejor ? valorPeriodo(mejor) : 0} {cfg.unidadPlural}</span>
      </div>
      <div className="pr-kpi">
        <div className="pr-kpi-accent" />
        <span className="pr-kpi-label">Mejor mes del equipo</span>
        <span className="pr-kpi-value">{mejorMesIdx >= 0 ? MESES[mejorMesIdx] : '—'}</span>
        <span className="pr-kpi-sub">{mejorMesIdx >= 0 ? `${monthlyTotals[mejorMesIdx]} ${cfg.unidadPlural} en total` : 'sin datos'}</span>
      </div>
    </div>
  )
}
