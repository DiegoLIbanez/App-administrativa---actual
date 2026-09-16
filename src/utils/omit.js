// Devuelve una copia del objeto sin las llaves indicadas.
// Se usa para armar el payload de insert/update y no enviar columnas
// generadas por la base de datos (id, created_at, updated_at).
export function omit(keys, obj) {
  const rest = { ...obj }
  for (const k of keys) delete rest[k]
  return rest
}