import { useState, useMemo, useCallback } from 'react'
import {
  TrendingUp, AlertTriangle,
  Loader2, RefreshCw, ChevronLeft, ChevronRight, Layers,
} from 'lucide-react'
import {
  DEPTOS, MESES, MESES_FULL,
  CIERRE_CFG, ANIO_ACTUAL,
} from '../utils/productividadConstants'
import PersonaModal from '../components/productividad/PersonaModal'
import DetalleModal from '../components/productividad/DetalleModal'
import ProcesosDisciplinariosModal from '../components/productividad/ProcesosDisciplinariosModal'
import ModalGestionDepartamentos from '../components/usuarios/ModalGestionDepartamentos'
import ProductividadKPIs from '../components/productividad/ProductividadKPIs'
import ProductividadPodio from '../components/productividad/ProductividadPodio'
import ProductividadChart from '../components/productividad/ProductividadChart'
import ProductividadTable from '../components/productividad/ProductividadTable'
import '../components/productividad/productividad.css'

import CierreView from '../components/productividad/CierreView'
import { useProductividadDatos } from '../hooks/useProductividadDatos'
import { useCompany } from '../context/CompanyContext'
import { useAuth } from '../context/AuthContext'

export default function Productividad() {
  const { currentCompany, departamentos } = useCompany()
  const { isAdmin } = useAuth()
  const [showGestionDep, setShowGestionDep] = useState(false)

  // Configuración de departamentos dinámicos sincronizados con la empresa
  const deptosConfig = useMemo(() => {
    if (currentCompany === 'global_link') {
      const res = {}
      const listaDeps = departamentos && departamentos.length > 0 ? departamentos : ['COBRANZA']
      listaDeps.forEach(depName => {
        const key = depName.toLowerCase().replace(/\s+/g, '-')
        res[key] = {
          id: key,
          tabLabel: depName,
          departamento: depName,
          dependenciaEmpleados: depName.toUpperCase(),
          personaLabel: 'Colaborador(a)',
          personaLabelLower: 'colaborador(a)',
          unidadPlural: 'registros',
          esPorcentaje: false,
        }
      })
      return res
    }

    // Para AmeriGlobal: únicamente Ventas y UW-BS (Cierre se renderiza como su propia pestaña)
    return DEPTOS
  }, [currentCompany, departamentos])

  const keysDisponibles = useMemo(() => Object.keys(deptosConfig), [deptosConfig])
  const [deptoActivoState, setDeptoActivoState] = useState('ventas')

  // Asegurar que deptoActivo pertenezca a los departamentos de la empresa activa
  const deptoActivo = useMemo(() => {
    if (currentCompany === 'global_link') {
      return keysDisponibles.includes(deptoActivoState) ? deptoActivoState : (keysDisponibles[0] || 'cobranza')
    }
    return deptoActivoState
  }, [currentCompany, keysDisponibles, deptoActivoState])

  const setDeptoActivo = setDeptoActivoState
  const esCierre = currentCompany !== 'global_link' && deptoActivo === 'cierre'
  const cfg = deptosConfig[deptoActivo] || (currentCompany === 'global_link' ? Object.values(deptosConfig)[0] : CIERRE_CFG)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCargo, setFiltroCargo] = useState('todos')
  const [mesFiltro, setMesFiltro] = useState('todos') // 'todos' o índice de MESES (0=Ene ... 11=Dic) como string
  const [ordenCol, setOrdenCol] = useState('total')
  const [ordenDir, setOrdenDir] = useState('desc')
  const [anioActivo, setAnioActivo] = useState(ANIO_ACTUAL)

  const [modal, setModal] = useState(null) // { esNuevo, inicial } | null
  const [detalle, setDetalle] = useState(null) // persona (datosCrudos item) | null
  const [verProcesos, setVerProcesos] = useState(null) // persona (datosCrudos item) | null

  const {
    datosCrudos, cargando, refrescando, errorCarga,
    guardando, errorGuardado, setErrorGuardado, eliminandoNombre,
    cargarDatos, guardarPersona, eliminarPersona,
  } = useProductividadDatos({ cfg, deptoActivo, esCierre, modal, setModal, setAnioActivo, currentCompany })


  const cambiarDepto = (id) => {
    if (id === deptoActivo) return
    setDeptoActivo(id)
    setBusqueda('')
    setFiltroCargo('todos')
    setMesFiltro('todos')
    setOrdenCol('total')
    setOrdenDir('desc')
  }

  // Vista aplanada del año activo: cada persona con su arreglo de 12 meses de ese año.
  // Para departamentos de porcentaje (esPorcentaje), el total de cada persona se calcula
  // como el promedio de los meses que sí tienen dato (no la suma cruda de porcentajes).
  const datos = useMemo(() => datosCrudos.map(p => {
    const meses = p.mesesPorAnio[anioActivo] || Array(MESES.length).fill(0)
    let total
    if (cfg.esPorcentaje) {
      const conDato = meses.filter(v => v > 0)
      total = conDato.length ? Math.round((conDato.reduce((s, v) => s + v, 0) / conDato.length) * 10) / 10 : 0
    } else {
      total = meses.reduce((s, v) => s + v, 0)
    }
    return { ...p, meses, total }
  }), [datosCrudos, anioActivo, cfg.esPorcentaje])

  const mesFiltroIdx = mesFiltro === 'todos' ? -1 : Number(mesFiltro)
  const valorPeriodo = useCallback((v) => (mesFiltroIdx >= 0 ? v.meses[mesFiltroIdx] : v.total), [mesFiltroIdx])

  const cargosUnicos = useMemo(
    () => Array.from(new Set(datos.map(v => v.cargo).filter(Boolean))),
    [datos]
  )

  const monthlyTotals = useMemo(
    () => MESES.map((_, i) => {
      if (!cfg.esPorcentaje) return datos.reduce((s, v) => s + v.meses[i], 0)
      const conDato = datos.filter(v => v.meses[i] > 0)
      return conDato.length ? Math.round((conDato.reduce((s, v) => s + v.meses[i], 0) / conDato.length) * 10) / 10 : 0
    }),
    [datos, cfg.esPorcentaje]
  )
  const maxMensual = Math.max(...monthlyTotals, 1)
  const mesesConDatos = monthlyTotals.map((v, i) => ({ v, i })).filter(m => m.v > 0)
  const mejorMesIdx = mesesConDatos.length
    ? mesesConDatos.reduce((a, b) => (b.v > a.v ? b : a)).i
    : -1

  const totalGeneral = (() => {
    if (!cfg.esPorcentaje) return datos.reduce((s, v) => s + valorPeriodo(v), 0)
    const conDato = datos.filter(v => valorPeriodo(v) > 0)
    return conDato.length ? Math.round((conDato.reduce((s, v) => s + valorPeriodo(v), 0) / conDato.length) * 10) / 10 : 0
  })()
  const promedioEquipo = cfg.esPorcentaje ? totalGeneral : (datos.length ? totalGeneral / datos.length : 0)
  const rankedByPeriodo = useMemo(
    () => [...datos].sort((a, b) => valorPeriodo(b) - valorPeriodo(a)),
    [datos, valorPeriodo]
  )
  const top3 = rankedByPeriodo.slice(0, 3)
  const ultimoMesVacio = monthlyTotals[monthlyTotals.length - 1] === 0

  const etiquetaPeriodo = mesFiltroIdx >= 0 ? `${MESES_FULL[mesFiltroIdx]} ${anioActivo}` : `de ${anioActivo}`

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    let list = datos.map(v => ({
      ...v,
      rank: rankedByPeriodo.findIndex(r => r.nombre === v.nombre) + 1,
    }))
    if (q) list = list.filter(v => v.nombre.toLowerCase().includes(q))
    if (filtroCargo !== 'todos') list = list.filter(v => v.cargo === filtroCargo)
    const dir = ordenDir === 'asc' ? 1 : -1
    list.sort((a, b) => {
      if (ordenCol === 'nombre') return a.nombre.localeCompare(b.nombre) * dir
      if (ordenCol === 'cargo') return a.cargo.localeCompare(b.cargo) * dir
      return (valorPeriodo(a) - valorPeriodo(b)) * dir
    })
    return list
  }, [busqueda, filtroCargo, ordenCol, ordenDir, rankedByPeriodo, datos, valorPeriodo])

  const toggleOrden = (col) => {
    if (ordenCol === col) {
      setOrdenDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrdenCol(col)
      setOrdenDir('desc')
    }
  }

  const abrirEditar = (v) => {
    const persona = datosCrudos.find(p => p.nombre === v.nombre)
    setErrorGuardado(null)
    setDetalle(null)
    setModal({
      esNuevo: false,
      persona,
      inicial: {
        nombre: v.nombre, cargo: v.cargo, ingreso: v.ingreso,
        anio: anioActivo,
        meses: [...v.meses],
      },
    })
  }
  const abrirVer = (v) => {
    const persona = datosCrudos.find(p => p.nombre === v.nombre)
    setDetalle(persona)
  }

  if (cargando) {
    return (
      <div className="pr-wrap">
        <div className="pr-state">
          <Loader2 size={26} />
          <span className="pr-state-title">Cargando productividad de {cfg.tabLabel}…</span>
        </div>
      </div>
    )
  }

  if (errorCarga) {
    return (
      <div className="pr-wrap">
        <div className="pr-state pr-state-error">
          <AlertTriangle size={26} />
          <span className="pr-state-title">No se pudieron cargar los datos</span>
          <span className="pr-state-sub">{errorCarga}</span>
          <button className="pr-btn pr-btn--primary" onClick={() => cargarDatos()}>Reintentar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="pr-wrap">
      {modal && (
        <PersonaModal
          inicial={modal.inicial}
          cfg={cfg}
          persona={modal.persona}
          guardando={guardando}
          errorGuardado={errorGuardado}
          onGuardar={guardarPersona}
          onCerrar={() => { if (!guardando) { setModal(null); setErrorGuardado(null) } }}
        />
      )}
      {detalle && (
        <DetalleModal
          persona={detalle}
          anio={anioActivo}
          cfg={cfg}
          onCerrar={() => setDetalle(null)}
          onEditar={() => abrirEditar({ ...detalle, meses: detalle.mesesPorAnio[anioActivo] || Array(MESES.length).fill(0) })}
        />
      )}
      {verProcesos && (
        <ProcesosDisciplinariosModal persona={verProcesos} onCerrar={() => setVerProcesos(null)} />
      )}
      {showGestionDep && (
        <ModalGestionDepartamentos onClose={() => setShowGestionDep(false)} />
      )}

      {/* Encabezado + pestañas de departamento */}
      <div className="pr-head">
        <div>
          <div className="pr-title">
            <div className="pr-title-icon"><TrendingUp size={17} /></div>
            Productividad
          </div>
          <div className="pr-subtitle">
            Consolidado Enero — Diciembre · Sincronizado con empleados activos de {cfg.tabLabel}
            <button
              className={`pr-refresh ${refrescando ? 'pr-refresh--spin' : ''}`}
              onClick={() => cargarDatos({ silencioso: true })}
              disabled={refrescando}
              title="Recargar datos"
            >
              <RefreshCw size={12} /> {refrescando ? 'Actualizando…' : 'Actualizar'}
            </button>
            {isAdmin && (
              <button
                className="btn btn-ghost"
                onClick={() => setShowGestionDep(true)}
                style={{ marginLeft: 8, padding: '2px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                title="Administrar departamentos"
              >
                <Layers size={13} /> Departamentos
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="pr-year-switch">
            <button onClick={() => setAnioActivo(a => a - 1)} title="Año anterior"><ChevronLeft size={14} /></button>
            <span>{anioActivo}</span>
            <button onClick={() => setAnioActivo(a => a + 1)} title="Año siguiente"><ChevronRight size={14} /></button>
          </div>
          <div className="pr-tabs">
            {Object.values(deptosConfig).map(d => (
              <button
                key={d.id}
                className={`pr-tab ${deptoActivo === d.id ? 'pr-tab--active' : ''}`}
                onClick={() => cambiarDepto(d.id)}
              >
                {d.tabLabel}
              </button>
            ))}
            {currentCompany !== 'global_link' && (
              <button
                className={`pr-tab ${deptoActivo === 'cierre' ? 'pr-tab--active' : ''}`}
                onClick={() => cambiarDepto('cierre')}
              >
                {CIERRE_CFG.tabLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {esCierre ? (
        <CierreView anioActivo={anioActivo} />
      ) : (
      <>
      {/* KPIs */}
      <ProductividadKPIs
        cfg={cfg} etiquetaPeriodo={etiquetaPeriodo} totalGeneral={totalGeneral}
        datos={datos} promedioEquipo={promedioEquipo}
        rankedByPeriodo={rankedByPeriodo} valorPeriodo={valorPeriodo}
        mejorMesIdx={mejorMesIdx} monthlyTotals={monthlyTotals} MESES={MESES}
      />

      {/* Podio top 3 */}
      <ProductividadPodio cfg={cfg} etiquetaPeriodo={etiquetaPeriodo} top3={top3} valorPeriodo={valorPeriodo} />

      {/* Gráfico mensual del equipo */}
      <ProductividadChart
        cfg={cfg} monthlyTotals={monthlyTotals} maxMensual={maxMensual}
        mejorMesIdx={mejorMesIdx} mesFiltroIdx={mesFiltroIdx} setMesFiltro={setMesFiltro}
        anioActivo={anioActivo} ultimoMesVacio={ultimoMesVacio}
      />

      {/* Tabla de productividad */}
      <ProductividadTable
        cfg={cfg} datos={datos} filas={filas} datosCrudos={datosCrudos}
        anioActivo={anioActivo} mesFiltroIdx={mesFiltroIdx} valorPeriodo={valorPeriodo}
        busqueda={busqueda} setBusqueda={setBusqueda}
        filtroCargo={filtroCargo} setFiltroCargo={setFiltroCargo} cargosUnicos={cargosUnicos}
        mesFiltro={mesFiltro} setMesFiltro={setMesFiltro}
        ordenCol={ordenCol} ordenDir={ordenDir} toggleOrden={toggleOrden}
        eliminandoNombre={eliminandoNombre}
        abrirVer={abrirVer} abrirEditar={abrirEditar} eliminarPersona={eliminarPersona} setVerProcesos={setVerProcesos}
      />
      </>
      )}
    </div>
  )
}
