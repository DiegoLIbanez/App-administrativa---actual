import { PAGE_SIZE } from '../../utils/parqueaderoConstants'
import VehicleCard from './VehicleCard'
import Paginacion from '../ui/Paginacion'

export default function ParqueaderoCards({
  paged, filtered, page, totalPages, setPage,
  setViewRow, openEdit, setDeleteId, setHistorial,
}) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, paddingTop: 4 }}>
        {paged.map((row, idx) => (
          <VehicleCard key={row.id} row={row} idx={idx}
            onView={setViewRow} onEdit={openEdit}
            onDelete={setDeleteId} onHistorial={setHistorial} />
        ))}
      </div>
      <Paginacion style={{ marginTop: 16 }} total={filtered.length} page={page} totalPages={totalPages} onChange={setPage} info={`Mostrando ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length}`} />
    </>
  )
}
