import { Award, Medal } from 'lucide-react'
import { iniciales } from '../../utils/productividadHelpers'

export default function ProductividadPodio({ cfg, etiquetaPeriodo, top3, valorPeriodo }) {
  return (
    <div className="pr-card">
      <div className="pr-card-head">
        <span className="pr-card-title"><Award size={15} color="#0F2A47" /> Top 3 {etiquetaPeriodo}</span>
      </div>
      <div className="pr-podio">
        {top3[1] && (
          <div className="pr-podio-item pr-podio-2">
            <div className="pr-podio-avatar">{iniciales(top3[1].nombre)}</div>
            <span className="pr-podio-name">{top3[1].nombre}</span>
            <span className="pr-podio-total">{valorPeriodo(top3[1])}{cfg.esPorcentaje ? '%' : ''}</span>
            <div className="pr-podio-bar" />
          </div>
        )}
        {top3[0] && (
          <div className="pr-podio-item pr-podio-1">
            <Medal size={16} color="#F59E0B" />
            <div className="pr-podio-avatar">{iniciales(top3[0].nombre)}</div>
            <span className="pr-podio-name">{top3[0].nombre}</span>
            <span className="pr-podio-total">{valorPeriodo(top3[0])}{cfg.esPorcentaje ? '%' : ''}</span>
            <div className="pr-podio-bar" />
          </div>
        )}
        {top3[2] && (
          <div className="pr-podio-item pr-podio-3">
            <div className="pr-podio-avatar">{iniciales(top3[2].nombre)}</div>
            <span className="pr-podio-name">{top3[2].nombre}</span>
            <span className="pr-podio-total">{valorPeriodo(top3[2])}{cfg.esPorcentaje ? '%' : ''}</span>
            <div className="pr-podio-bar" />
          </div>
        )}
      </div>
    </div>
  )
}
