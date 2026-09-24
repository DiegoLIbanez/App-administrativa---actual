// =============================================================
// src/components/ui/PageTitle.jsx
// -------------------------------------------------------------
// Título de página con el ícono en degradé de Productividad.
// Va dentro de <div className="page-header">:
//
//   <div className="page-header"> <div>
//     <PageTitle icon={Users}>Empleados</PageTitle>
//     <p>Descripción…</p>
//   </div> … </div>
// =============================================================
export default function PageTitle({ icon: Icon, children }) {
  return (
    <h1>
      {Icon && <span className="page-title-icon"><Icon size={18} /></span>}
      {children}
    </h1>
  )
}
