// =============================================================
// API: Resolvers de IDs relacionales
// -------------------------------------------------------------
// La app sigue guardando 'empresa' (código de texto), 'dependencia'/
// 'departamento' y 'nombre_empleado' (texto) como hasta ahora — estas
// funciones simplemente buscan el id relacional correspondiente
// (empresa_id / departamento_id / empleado_id) para guardarlo AL LADO
// del texto, sin reemplazarlo. Si no encuentran coincidencia, devuelven
// null y el registro se guarda igual que antes.
// =============================================================
import { supabase } from '../supabaseClient'

// Cache simple en memoria: las empresas casi nunca cambian,
// no vale la pena consultarlas en cada insert/update.
const cacheEmpresaId = new Map()

/** Busca el id de `empresas` a partir de su código ('ameriglobal' | 'global_link'). */
export async function resolverEmpresaId(codigoEmpresa) {
  if (!codigoEmpresa) return null
  if (cacheEmpresaId.has(codigoEmpresa)) return cacheEmpresaId.get(codigoEmpresa)

  const { data, error } = await supabase
    .from('empresas')
    .select('id')
    .eq('codigo', codigoEmpresa)
    .maybeSingle()

  if (error || !data) return null
  cacheEmpresaId.set(codigoEmpresa, data.id)
  return data.id
}

/**
 * Busca el id de `departamentos` a partir del nombre de dependencia (texto)
 * y el código de empresa. Coincidencia insensible a mayúsculas (ilike).
 * Si el departamento aún no existe como fila en la tabla `departamentos`,
 * devuelve null — no crea nada automáticamente.
 */
export async function resolverDepartamentoId(nombreDependencia, codigoEmpresa) {
  if (!nombreDependencia || !codigoEmpresa) return null

  const nombreBuscado = ALIAS_DEPARTAMENTOS[normalizar(nombreDependencia)] || nombreDependencia.trim()

  const { data, error } = await supabase
    .from('departamentos')
    .select('id')
    .eq('empresa', codigoEmpresa)
    .ilike('nombre', nombreBuscado)
    .maybeSingle()

  if (error || !data) return null
  return data.id
}

/**
 * Busca el id de `empleados` a partir del nombre completo (texto) y el
 * código de empresa. Es la misma pareja (nombre + empresa) que ya usan
 * hoy los formularios para elegir empleado.
 */
export async function resolverEmpleadoId(nombreEmpleado, codigoEmpresa) {
  if (!nombreEmpleado || !codigoEmpresa) return null

  const { data, error } = await supabase
    .from('empleados')
    .select('id')
    .eq('empresa', codigoEmpresa)
    .ilike('nombre_completo', nombreEmpleado.trim())
    .maybeSingle()

  if (error || !data) return null
  return data.id
}

/**
 * Resuelve empresa_id, departamento_id y (opcionalmente) empleado_id en
 * paralelo. Pensado para usarse justo antes de un insert/update de UN
 * registro, junto con los campos de texto que la app ya guarda hoy
 * (empresa, dependencia/departamento, nombre_empleado). Si no se pasa
 * nombre_empleado, empleado_id vuelve null.
 */
export async function resolverIdsRelacionales({ empresa, dependencia, nombre_empleado }) {
  const [empresa_id, departamento_id, empleado_id] = await Promise.all([
    resolverEmpresaId(empresa),
    resolverDepartamentoId(dependencia, empresa),
    nombre_empleado ? resolverEmpleadoId(nombre_empleado, empresa) : Promise.resolve(null),
  ])
  return { empresa_id, departamento_id, empleado_id }
}

function normalizar(texto) {
  return (texto || '').trim().toLowerCase()
}

// Alias conocidos: nombres de departamento que aparecen en datos importados
// (sobre todo en Productividad) pero no coinciden textualmente con el
// nombre real guardado en la tabla `departamentos`. Se resuelven al mismo
// departamento antes de buscar el id — el texto original de la fila NO se
// modifica, solo se usa esta forma normalizada para encontrar el id.
const ALIAS_DEPARTAMENTOS = {
  'uw-bs': 'underwriting',
  'uw - bs': 'underwriting',
  'cobranzas': 'cobranza',
}

function normalizarDependencia(texto) {
  const base = normalizar(texto)
  return ALIAS_DEPARTAMENTOS[base] || base
}

/**
 * Versión "en lote" de resolverIdsRelacionales, pensada para upserts masivos
 * (importaciones de Excel, guardado de productividad) donde resolver fila
 * por fila sería demasiado lento. Trae UNA sola vez los empleados,
 * departamentos y empresas involucrados y resuelve todo en memoria.
 *
 * @param {Array<object>} filas - cada fila debe traer nombre_empleado y,
 *   opcionalmente, el campo de departamento/dependencia y empresa.
 * @param {string} empresaDefault - empresa a usar si una fila no trae la suya.
 * @param {string|null} campoDependencia - nombre del campo que trae el
 *   departamento en cada fila ('dependencia' o 'departamento'). Si es null,
 *   no se resuelve departamento_id (útil para tablas que no tienen esa
 *   columna, como cierre_meses).
 */
export async function resolverIdsEnLote(filas, empresaDefault, campoDependencia = null) {
  const filasConEmpresa = (filas || []).map(f => ({ ...f, empresa: f.empresa || empresaDefault }))
  const empresasInvolucradas = [...new Set(filasConEmpresa.map(f => f.empresa).filter(Boolean))]
  if (empresasInvolucradas.length === 0) return filasConEmpresa

  const consultas = [
    supabase.from('empleados').select('id, nombre_completo, empresa').in('empresa', empresasInvolucradas),
    supabase.from('empresas').select('id, codigo').in('codigo', empresasInvolucradas),
  ]
  if (campoDependencia) {
    consultas.push(
      supabase.from('departamentos').select('id, nombre, empresa').in('empresa', empresasInvolucradas)
    )
  }
  const [empleadosRes, empresasRes, departamentosRes] = await Promise.all(consultas)

  const mapaEmpleados = new Map(
    (empleadosRes.data || []).map(e => [`${e.empresa}::${normalizar(e.nombre_completo)}`, e.id])
  )
  const mapaEmpresas = new Map((empresasRes.data || []).map(e => [e.codigo, e.id]))
  const mapaDepartamentos = campoDependencia
    ? new Map((departamentosRes?.data || []).map(d => [`${d.empresa}::${normalizar(d.nombre)}`, d.id]))
    : null

  return filasConEmpresa.map(f => {
    const conIds = {
      ...f,
      empleado_id: mapaEmpleados.get(`${f.empresa}::${normalizar(f.nombre_empleado)}`) || null,
      empresa_id: mapaEmpresas.get(f.empresa) || null,
    }
    if (campoDependencia) {
      conIds.departamento_id = mapaDepartamentos.get(`${f.empresa}::${normalizarDependencia(f[campoDependencia])}`) || null
    }
    return conIds
  })
}
