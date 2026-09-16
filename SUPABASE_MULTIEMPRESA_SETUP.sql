-- =================================================================
-- AMERIGLOBAL & GLOBAL LINK — Script de Base de Datos Multi-Empresa
-- Ejecutar en: Supabase > SQL Editor
-- =================================================================
-- Este script habilita:
--  1. Columna `empresa` ('ameriglobal' / 'global_link') en todas las tablas.
--  2. Tabla `departamentos` para gestión dinámica de departamentos por empresa.
--  3. Columnas `empresas`, `permisos` y `rol` en la tabla `perfiles`.
--  4. Políticas RLS seguras y retrocompatibles.
-- =================================================================

-- ── 1. AGREGAR COLUMNA `empresa` EN TABLAS PRINCIPALES ────────────

-- 1.1 Empleados
ALTER TABLE empleados 
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE empleados SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_empleados_empresa ON empleados(empresa);

-- 1.2 Novedades
ALTER TABLE novedades 
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE novedades SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_novedades_empresa ON novedades(empresa);

-- 1.3 Vacaciones
ALTER TABLE vacaciones 
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE vacaciones SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_vacaciones_empresa ON vacaciones(empresa);

-- 1.4 Registros Parqueadero
ALTER TABLE registros_parqueadero 
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE registros_parqueadero SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_parqueadero_empresa ON registros_parqueadero(empresa);

-- 1.5 Procesos Disciplinarios (si existe la tabla)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'procesos_disciplinarios') THEN
    ALTER TABLE procesos_disciplinarios ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
    UPDATE procesos_disciplinarios SET empresa = 'ameriglobal' WHERE empresa IS NULL;
    CREATE INDEX IF NOT EXISTS idx_procesos_disciplinarios_empresa ON procesos_disciplinarios(empresa);
  END IF;
END $$;

-- 1.6 Tablas de Productividad (si existen)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'productividad') THEN
    ALTER TABLE productividad ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
    UPDATE productividad SET empresa = 'ameriglobal' WHERE empresa IS NULL;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'productividad_resumen') THEN
    ALTER TABLE productividad_resumen ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
    UPDATE productividad_resumen SET empresa = 'ameriglobal' WHERE empresa IS NULL;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cierre_meses') THEN
    ALTER TABLE cierre_meses ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
    UPDATE cierre_meses SET empresa = 'ameriglobal' WHERE empresa IS NULL;
  END IF;
END $$;


-- ── 2. TABLA DE DEPARTAMENTOS DINÁMICOS ───────────────────────────
CREATE TABLE IF NOT EXISTS departamentos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa     TEXT NOT NULL DEFAULT 'global_link',  -- 'ameriglobal' o 'global_link'
  nombre      TEXT NOT NULL,                        -- Ej: 'COBRANZA', 'VENTAS', etc.
  codigo      TEXT,                                 -- Opcional, ej: 'COB'
  color       TEXT,                                 -- Color hex para badges
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departamentos_empresa ON departamentos(empresa);
CREATE INDEX IF NOT EXISTS idx_departamentos_activo  ON departamentos(activo);

-- Trigger para updated_at automático en departamentos
DROP TRIGGER IF EXISTS trg_departamentos_updated_at ON departamentos;
CREATE TRIGGER trg_departamentos_updated_at
  BEFORE UPDATE ON departamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insertar departamentos iniciales para Global Link
INSERT INTO departamentos (empresa, nombre, activo)
SELECT 'global_link', 'COBRANZA', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM departamentos WHERE empresa = 'global_link' AND UPPER(nombre) = 'COBRANZA'
);

-- Insertar departamentos base para AmeriGlobal
INSERT INTO departamentos (empresa, nombre, activo)
SELECT 'ameriglobal', d, TRUE
FROM unnest(ARRAY['COBRANZA', 'CIERRE', 'VENTAS', 'UNDERWRITING', 'CONTABILIDAD', 'RRHH', 'GERENCIA', 'SOPORTE TI', 'SERVICIOS GENERALES']) AS d
WHERE NOT EXISTS (
  SELECT 1 FROM departamentos WHERE empresa = 'ameriglobal' AND UPPER(nombre) = UPPER(d)
);


-- ── 3. EXTENDER TABLA `perfiles` CON ROLES Y PERMISOS GRANULARES ──
ALTER TABLE perfiles 
  ADD COLUMN IF NOT EXISTS empresas TEXT[] DEFAULT ARRAY['ameriglobal']::TEXT[];

ALTER TABLE perfiles 
  ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '{"ameriglobal":["all"],"global_link":["all"]}'::jsonb;

ALTER TABLE perfiles 
  ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'operativo';

-- Asegurar que los perfiles existentes tengan acceso al menos a ameriglobal
UPDATE perfiles 
SET empresas = ARRAY['ameriglobal', 'global_link']
WHERE empresas IS NULL OR array_length(empresas, 1) IS NULL;

UPDATE perfiles 
SET permisos = '{"ameriglobal":["all"],"global_link":["all"]}'::jsonb
WHERE permisos IS NULL;


-- ── 4. RLS PARA TABLA `departamentos` ─────────────────────────────
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios activos pueden ver departamentos" ON departamentos;
CREATE POLICY "Usuarios activos pueden ver departamentos" ON departamentos
  FOR SELECT USING (public.usuario_activo());

DROP POLICY IF EXISTS "Admins pueden gestionar departamentos" ON departamentos;
CREATE POLICY "Admins pueden gestionar departamentos" ON departamentos
  FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

-- =================================================================
-- ¡Listo! El esquema de base de datos multi-empresa está configurado.
-- =================================================================
