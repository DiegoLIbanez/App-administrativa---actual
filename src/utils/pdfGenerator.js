// =============================================================
// src/utils/pdfGenerator.js
// -------------------------------------------------------------
// Utilidad para generar e imprimir documentos PDF corporativos:
// 1. Comprobante Oficial de Solicitud de Vacaciones
// 2. Citación a Descargos / Acta Disciplinaria
// 3. Ficha Consolidada 360° del Colaborador
// =============================================================

function abrirVentanaImpresion(htmlContent, tituloDocumento) {
  const win = window.open('', '_blank', 'width=900,height=1000')
  if (!win) return alert('Por favor habilita las ventanas emergentes en tu navegador para generar el PDF.')

  win.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${tituloDocumento}</title>
      <style>
        @page { size: A4; margin: 18mm 15mm 20mm 15mm; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1E293B;
          margin: 0; padding: 0;
          background: #fff;
          font-size: 13px;
          line-height: 1.5;
        }
        .header-table {
          width: 100%;
          border-bottom: 2px solid #2563EB;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .logo-box {
          font-size: 22px;
          font-weight: 900;
          color: #2563EB;
          letter-spacing: -0.5px;
        }
        .doc-title {
          text-align: right;
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          text-transform: uppercase;
        }
        .section-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 18px;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 4px;
        }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .label { font-size: 10px; color: #64748B; font-weight: 700; text-transform: uppercase; }
        .value { font-size: 13px; font-weight: 600; color: #0F172A; margin-top: 2px; }
        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 50px;
          padding-top: 20px;
        }
        .signature-line {
          border-top: 1.5px dashed #94A3B8;
          text-align: center;
          padding-top: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
        }
        .footer-text {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #94A3B8;
          border-top: 1px solid #E2E8F0;
          padding-top: 10px;
        }
        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          background: #DBEAFE;
          color: #1D4ED8;
        }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background:#EFF6FF; border:1px solid #BFDBFE; padding:10px 16px; margin-bottom:20px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; color:#1E40AF;">📄 Documento listo para guardar como PDF o imprimir</span>
        <button onclick="window.print()" style="background:#2563EB; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;">
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>
      ${htmlContent}
      <script>
        setTimeout(() => { window.print(); }, 500);
      </script>
    </body>
    </html>
  `)
  win.document.close()
}

/**
 * 1. Genera PDF de Solicitud de Vacaciones
 */
export function generarPdfSolicitudVacaciones(vac, empresaNombre = 'AmeriGlobal') {
  const html = `
    <table class="header-table">
      <tr>
        <td class="logo-box">🏢 ${empresaNombre}</td>
        <td class="doc-title">
          Comprobante de Vacaciones<br>
          <span style="font-size:11px; color:#64748B; font-weight:600;">Ref: VAC-${vac.id ? String(vac.id).slice(0, 8) : '001'}</span>
        </td>
      </tr>
    </table>

    <div class="section-box">
      <div class="section-title">Información del Colaborador</div>
      <div class="grid-2">
        <div>
          <div class="label">Nombre Completo</div>
          <div class="value">${vac.nombre_empleado || '—'}</div>
        </div>
        <div>
          <div class="label">Área / Dependencia</div>
          <div class="value">${vac.dependencia || '—'}</div>
        </div>
      </div>
    </div>

    <div class="section-box">
      <div class="section-title">Detalles del Período de Vacaciones</div>
      <div class="grid-3" style="margin-bottom:12px;">
        <div>
          <div class="label">Tipo de Vacación</div>
          <div class="value"><span class="badge">${vac.tipo_vacacion || 'Vacaciones'}</span></div>
        </div>
        <div>
          <div class="label">Estado</div>
          <div class="value">${vac.estado || 'Pendiente'}</div>
        </div>
        <div>
          <div class="label">Total Días</div>
          <div class="value">${vac.total_dias || '—'} días</div>
        </div>
      </div>
      <div class="grid-3">
        <div>
          <div class="label">Fecha de Inicio</div>
          <div class="value">${vac.fecha_inicio || '—'}</div>
        </div>
        <div>
          <div class="label">Fecha de Finalización</div>
          <div class="value">${vac.fecha_fin || '—'}</div>
        </div>
        <div>
          <div class="label">Período de Vacaciones</div>
          <div class="value">${vac.periodo_vacaciones || '—'}</div>
        </div>
      </div>
    </div>

    <div class="section-box">
      <div class="section-title">Observaciones y Aprobación</div>
      <div style="margin-bottom:8px;">
        <div class="label">Aprobado Por</div>
        <div class="value">${vac.aprobado_por || 'Gestión Humana'}</div>
      </div>
      <div>
        <div class="label">Observaciones Contables / Adicionales</div>
        <div class="value">${vac.observacion_contable || vac.observacion || 'Sin observaciones registradas.'}</div>
      </div>
    </div>

    <div class="signatures-grid">
      <div class="signature-line">
        Firma del Colaborador(a)<br>
        <span style="font-size:10px; font-weight:400; color:#64748B;">C.C. _______________________</span>
      </div>
      <div class="signature-line">
        Firma Aprobado Gestión Humana<br>
        <span style="font-size:10px; font-weight:400; color:#64748B;">${empresaNombre}</span>
      </div>
    </div>

    <div class="footer-text">
      Documento generado automáticamente por el sistema de gestión ${empresaNombre} · ${new Date().toLocaleDateString('es-CO')}
    </div>
  `
  abrirVentanaImpresion(html, `Solicitud_Vacaciones_${vac.nombre_empleado || 'Empleado'}`)
}

/**
 * 2. Genera PDF de Citación o Acta de Proceso Disciplinario
 */
export function generarPdfProcesoDisciplinario(proc, empresaNombre = 'AmeriGlobal') {
  const html = `
    <table class="header-table">
      <tr>
        <td class="logo-box">⚖️ ${empresaNombre}</td>
        <td class="doc-title">
          Citación a Descargos / Registro Disciplinario<br>
          <span style="font-size:11px; color:#64748B; font-weight:600;">Ref: PD-${proc.id ? String(proc.id).slice(0, 8) : '001'}</span>
        </td>
      </tr>
    </table>

    <div class="section-box">
      <div class="section-title">Datos del Colaborador</div>
      <div class="grid-2">
        <div>
          <div class="label">Colaborador(a)</div>
          <div class="value">${proc.nombre_empleado || '—'}</div>
        </div>
        <div>
          <div class="label">Departamento / Área</div>
          <div class="value">${proc.departamento || '—'}</div>
        </div>
      </div>
    </div>

    <div class="section-box">
      <div class="section-title">Concepto y Fechas</div>
      <div class="grid-3" style="margin-bottom:10px;">
        <div>
          <div class="label">Concepto Disciplinario</div>
          <div class="value"><span class="badge" style="background:#FEE2E2; color:#991B1B;">${proc.concepto || '—'}</span></div>
        </div>
        <div>
          <div class="label">Fecha Evento / Inicio</div>
          <div class="value">${proc.fecha_inicio || proc.fecha || '—'}</div>
        </div>
        <div>
          <div class="label">Fecha Fin (Si aplica)</div>
          <div class="value">${proc.fecha_fin || '—'}</div>
        </div>
      </div>
      ${proc.hora ? `
      <div>
        <div class="label">Hora de Registro</div>
        <div class="value">${proc.hora}</div>
      </div>
      ` : ''}
    </div>

    <div class="section-box">
      <div class="section-title">Detalle del Proceso y Observaciones</div>
      <div>
        <div class="value" style="font-weight:400; white-space:pre-wrap;">${proc.observacion || 'Sin observaciones descriptivas registradas.'}</div>
      </div>
    </div>

    <div class="signatures-grid">
      <div class="signature-line">
        Firma del Colaborador(a)<br>
        <span style="font-size:10px; font-weight:400; color:#64748B;">Notificado(a)</span>
      </div>
      <div class="signature-line">
        Firma Gestión Humana / Comité<br>
        <span style="font-size:10px; font-weight:400; color:#64748B;">${empresaNombre}</span>
      </div>
    </div>

    <div class="footer-text">
      Documento confidencial · Sistema de Gestión Humana ${empresaNombre} · ${new Date().toLocaleDateString('es-CO')}
    </div>
  `
  abrirVentanaImpresion(html, `Proceso_Disciplinario_${proc.nombre_empleado || 'Empleado'}`)
}
