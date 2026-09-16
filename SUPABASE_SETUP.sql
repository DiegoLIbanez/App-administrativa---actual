-- =================================================================
-- AMERIGLOBAL SAS — Script completo de base de datos
-- Ejecutar en: Supabase > SQL Editor
-- =================================================================
-- Este script crea TODAS las tablas que usa la aplicación:
--   1. empleados
--   2. novedades
--   3. vacaciones
--   4. registros_parqueadero
--
-- Es seguro volver a ejecutarlo (usa IF NOT EXISTS / OR REPLACE),
-- así que si ya tienes datos cargados no se pierden ni se duplican.
--
-- IMPORTANTE: este script NO incluye el sistema de autenticación
-- (tabla `perfiles`, RLS, login). Para eso ejecuta también el
-- archivo `supabase_auth_setup.sql` que está en la raíz del proyecto.
-- =================================================================


-- ── Función compartida: actualizar `updated_at` automáticamente ──────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- 1. EMPLEADOS
-- =================================================================
CREATE TABLE IF NOT EXISTS empleados (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_completo  TEXT NOT NULL,
  correo           TEXT,
  dependencia      TEXT,
  cargo            TEXT,
  fecha_ingreso    DATE,
  activo           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Por si la tabla ya existía sin estas columnas (proyectos antiguos)
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS cargo         TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;

CREATE INDEX IF NOT EXISTS idx_empleados_nombre      ON empleados(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_empleados_dependencia ON empleados(dependencia);
CREATE INDEX IF NOT EXISTS idx_empleados_activo      ON empleados(activo);

DROP TRIGGER IF EXISTS trg_empleados_updated_at ON empleados;
CREATE TRIGGER trg_empleados_updated_at
  BEFORE UPDATE ON empleados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =================================================================
-- 2. NOVEDADES (incapacidades, LNR, LR, vacaciones, ingresos, etc.)
-- =================================================================
CREATE TABLE IF NOT EXISTS novedades (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empleado           TEXT NOT NULL,
  concepto                  TEXT NOT NULL,   -- Incapacidad, LNR, LR, Vacaciones, Maternidad, Paternidad,
                                              -- Calamidad/Luto, Renuncia/Retiro, Ingreso, Terminación,
                                              -- Suspensión, Día Familia, Hospitalización, Embargo, Cambio de Área
  fecha_inicio              DATE,
  fecha_fin                 DATE,
  total_dias                NUMERIC,
  dependencia               TEXT,
  observacion               TEXT,
  observacion_contabilidad  TEXT,
  validacion_incapacidad    TEXT,
  radicacion_incapacidad    TEXT,
  prorroga                  TEXT,
  nomina_electronica        TEXT,
  seguridad_social          TEXT,
  periodo                   TEXT,            -- ej: "2026-06" (usado para filtros e importación por hoja de Excel)
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_novedades_nombre      ON novedades(nombre_empleado);
CREATE INDEX IF NOT EXISTS idx_novedades_concepto    ON novedades(concepto);
CREATE INDEX IF NOT EXISTS idx_novedades_periodo     ON novedades(periodo);
CREATE INDEX IF NOT EXISTS idx_novedades_fecha_inicio ON novedades(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_novedades_dependencia ON novedades(dependencia);

DROP TRIGGER IF EXISTS trg_novedades_updated_at ON novedades;
CREATE TRIGGER trg_novedades_updated_at
  BEFORE UPDATE ON novedades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =================================================================
-- 3. VACACIONES
-- =================================================================
CREATE TABLE IF NOT EXISTS vacaciones (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empleado        TEXT NOT NULL,
  dependencia            TEXT,
  fecha_ingreso          DATE,              -- fecha de ingreso del empleado (auto-llenada desde empleados)
  periodo_vacaciones     TEXT,              -- ej: "2024-2025"
  fecha_inicio           DATE,
  fecha_fin              DATE,
  total_dias             NUMERIC,
  dias_disfrutados       NUMERIC,           -- días tomados físicamente
  dias_en_dinero         NUMERIC,           -- total - disfrutados (calculado en el formulario)
  anio                   TEXT,
  mes_inicio             TEXT,
  tipo_vacacion          TEXT DEFAULT 'Vacaciones',  -- Vacaciones, Vacaciones en dinero, Vacaciones compensadas
  estado                 TEXT DEFAULT 'Pendiente',
  observacion            TEXT,
  observacion_contable   TEXT,
  aprobado_por           TEXT,
  fecha_solicitud        DATE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Por si la tabla ya existía sin estas columnas (se agregaron sobre la marcha)
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS periodo_vacaciones   TEXT;
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS dias_disfrutados     NUMERIC;
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS dias_en_dinero       NUMERIC;
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS observacion_contable TEXT;
ALTER TABLE vacaciones ADD COLUMN IF NOT EXISTS fecha_ingreso        DATE;

CREATE INDEX IF NOT EXISTS idx_vacaciones_nombre   ON vacaciones(nombre_empleado);
CREATE INDEX IF NOT EXISTS idx_vacaciones_periodo  ON vacaciones(periodo_vacaciones);
CREATE INDEX IF NOT EXISTS idx_vacaciones_estado   ON vacaciones(estado);

DROP TRIGGER IF EXISTS trg_vacaciones_updated_at ON vacaciones;
CREATE TRIGGER trg_vacaciones_updated_at
  BEFORE UPDATE ON vacaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =================================================================
-- 4. REGISTROS DE PARQUEADERO
-- =================================================================
CREATE TABLE IF NOT EXISTS registros_parqueadero (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empleado       TEXT NOT NULL,
  anio                  TEXT,
  mes                   TEXT,               -- ENERO, FEBRERO, ... (texto, no número)
  placa                 TEXT,
  cedula                TEXT,
  telefono              TEXT,
  tipo                  TEXT,               -- CARRO, MOTO
  fecha_ingreso         DATE,
  fecha_retiro          DATE,
  observacion           TEXT,
  fecha_envio_reporte   TIMESTAMPTZ,        -- se estampa solo en los registros que aún no tienen reporte enviado
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parqueadero_nombre  ON registros_parqueadero(nombre_empleado);
CREATE INDEX IF NOT EXISTS idx_parqueadero_anio_mes ON registros_parqueadero(anio, mes);
CREATE INDEX IF NOT EXISTS idx_parqueadero_placa   ON registros_parqueadero(placa);

DROP TRIGGER IF EXISTS trg_parqueadero_updated_at ON registros_parqueadero;
CREATE TRIGGER trg_parqueadero_updated_at
  BEFORE UPDATE ON registros_parqueadero
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =================================================================
-- SIGUIENTE PASO
-- =================================================================
-- Ahora ejecuta `supabase_auth_setup.sql` para crear la tabla
-- `perfiles`, activar RLS en estas 4 tablas, y configurar tu
-- primer usuario administrador.
-- =================================================================
