-- =============================================================================
-- SCRIPT MAESTRO — AmeriGlobal Incapacidades
-- Ejecuta todos los scripts en el orden correcto para una instalación limpia.
-- =============================================================================
-- IMPORTANTE: Ejecuta este script UNA SOLA VEZ en orden secuencial.
-- No lo ejecutes todo de golpe; ve paso a paso por cada sección.
-- =============================================================================


-- =============================================================================
-- PASO 1: SUPABASE_SETUP (tablas principales)
-- =============================================================================
-- Crea: empleados, novedades, vacaciones, registros_parqueadero
-- Archivo: SQL\01_SUPABASE_SETUP.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

ALTER TABLE empleados ADD COLUMN IF NOT EXISTS cargo         TEXT;
ALTER TABLE empleados ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;

CREATE INDEX IF NOT EXISTS idx_empleados_nombre      ON empleados(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_empleados_dependencia ON empleados(dependencia);
CREATE INDEX IF NOT EXISTS idx_empleados_activo      ON empleados(activo);

DROP TRIGGER IF EXISTS trg_empleados_updated_at ON empleados;
CREATE TRIGGER trg_empleados_updated_at
  BEFORE UPDATE ON empleados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS novedades (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empleado           TEXT NOT NULL,
  concepto                  TEXT NOT NULL,
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
  periodo                   TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_novedades_nombre       ON novedades(nombre_empleado);
CREATE INDEX IF NOT EXISTS idx_novedades_concepto     ON novedades(concepto);
CREATE INDEX IF NOT EXISTS idx_novedades_periodo      ON novedades(periodo);
CREATE INDEX IF NOT EXISTS idx_novedades_fecha_inicio ON novedades(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_novedades_dependencia  ON novedades(dependencia);

DROP TRIGGER IF EXISTS trg_novedades_updated_at ON novedades;
CREATE TRIGGER trg_novedades_updated_at
  BEFORE UPDATE ON novedades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS vacaciones (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empleado        TEXT NOT NULL,
  dependencia            TEXT,
  fecha_ingreso          DATE,
  periodo_vacaciones     TEXT,
  fecha_inicio           DATE,
  fecha_fin              DATE,
  total_dias             NUMERIC,
  dias_disfrutados       NUMERIC,
  dias_en_dinero         NUMERIC,
  anio                   TEXT,
  mes_inicio             TEXT,
  tipo_vacacion          TEXT DEFAULT 'Vacaciones',
  estado                 TEXT DEFAULT 'Pendiente',
  observacion            TEXT,
  observacion_contable   TEXT,
  aprobado_por           TEXT,
  fecha_solicitud        DATE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS registros_parqueadero (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empleado       TEXT NOT NULL,
  anio                  TEXT,
  mes                   TEXT,
  placa                 TEXT,
  cedula                TEXT,
  telefono              TEXT,
  tipo                  TEXT,
  fecha_ingreso         DATE,
  fecha_retiro          DATE,
  observacion           TEXT,
  fecha_envio_reporte   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parqueadero_nombre   ON registros_parqueadero(nombre_empleado);
CREATE INDEX IF NOT EXISTS idx_parqueadero_anio_mes ON registros_parqueadero(anio, mes);
CREATE INDEX IF NOT EXISTS idx_parqueadero_placa    ON registros_parqueadero(placa);

DROP TRIGGER IF EXISTS trg_parqueadero_updated_at ON registros_parqueadero;
CREATE TRIGGER trg_parqueadero_updated_at
  BEFORE UPDATE ON registros_parqueadero
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- PASO 2: supabase_auth_setup (autenticación y RLS)
-- =============================================================================
-- Crea: perfiles, triggers de auth, funciones auxiliares, políticas RLS
-- Archivo: SQL\02_supabase_auth_setup.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS perfiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo  TEXT,
  correo           TEXT,
  activo           BOOLEAN NOT NULL DEFAULT FALSE,
  es_admin         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_correo ON perfiles(correo);
CREATE INDEX IF NOT EXISTS idx_perfiles_activo ON perfiles(activo);

DROP TRIGGER IF EXISTS trg_perfiles_updated_at ON perfiles;
CREATE TRIGGER trg_perfiles_updated_at
  BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles (id, correo, nombre_completo, activo, es_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    FALSE,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.usuario_activo()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT COALESCE((SELECT activo FROM perfiles WHERE id = auth.uid()), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT COALESCE((SELECT es_admin FROM perfiles WHERE id = auth.uid()), FALSE);
$$;

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver propio perfil"        ON perfiles;
DROP POLICY IF EXISTS "Admins ven todos"          ON perfiles;
DROP POLICY IF EXISTS "Admins actualizan perfiles" ON perfiles;
DROP POLICY IF EXISTS "Usuario actualiza su nombre" ON perfiles;

CREATE POLICY "Ver propio perfil" ON perfiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins ven todos" ON perfiles
  FOR SELECT USING (public.es_admin());

CREATE POLICY "Admins actualizan perfiles" ON perfiles
  FOR UPDATE USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY "Usuario actualiza su nombre" ON perfiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE empleados             ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedades              ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacaciones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_parqueadero  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso usuarios activos" ON empleados;
CREATE POLICY "Acceso usuarios activos" ON empleados
  FOR ALL USING (public.usuario_activo()) WITH CHECK (public.usuario_activo());

DROP POLICY IF EXISTS "Acceso usuarios activos" ON novedades;
CREATE POLICY "Acceso usuarios activos" ON novedades
  FOR ALL USING (public.usuario_activo()) WITH CHECK (public.usuario_activo());

DROP POLICY IF EXISTS "Acceso usuarios activos" ON vacaciones;
CREATE POLICY "Acceso usuarios activos" ON vacaciones
  FOR ALL USING (public.usuario_activo()) WITH CHECK (public.usuario_activo());

DROP POLICY IF EXISTS "Acceso usuarios activos" ON registros_parqueadero;
CREATE POLICY "Acceso usuarios activos" ON registros_parqueadero
  FOR ALL USING (public.usuario_activo()) WITH CHECK (public.usuario_activo());


-- =============================================================================
-- PASO 2.5: ACTIVAR PRIMER ADMINISTRADOR (ejecutar DESPUÉS de registrarse)
-- =============================================================================
-- Reemplaza 'tu_correo@empresa.com' con tu correo real:
--
--   UPDATE perfiles SET activo = true, es_admin = true
--   WHERE correo = 'tu_correo@empresa.com';
--
-- =============================================================================


-- =============================================================================
-- PASO 3: SUPABASE_MULTIEMPRESA_SETUP (multi-empresa)
-- =============================================================================
-- Agrega: columna empresa, tabla departamentos, roles y permisos
-- Archivo: SQL\03_SUPABASE_MULTIEMPRESA_SETUP.sql
-- =============================================================================

ALTER TABLE empleados
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE empleados SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_empleados_empresa ON empleados(empresa);

ALTER TABLE novedades
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE novedades SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_novedades_empresa ON novedades(empresa);

ALTER TABLE vacaciones
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE vacaciones SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_vacaciones_empresa ON vacaciones(empresa);

ALTER TABLE registros_parqueadero
  ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
UPDATE registros_parqueadero SET empresa = 'ameriglobal' WHERE empresa IS NULL;
CREATE INDEX IF NOT EXISTS idx_parqueadero_empresa ON registros_parqueadero(empresa);

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'procesos_disciplinarios') THEN
    ALTER TABLE procesos_disciplinarios ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';
    UPDATE procesos_disciplinarios SET empresa = 'ameriglobal' WHERE empresa IS NULL;
    CREATE INDEX IF NOT EXISTS idx_procesos_disciplinarios_empresa ON procesos_disciplinarios(empresa);
  END IF;
END $$;

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

CREATE TABLE IF NOT EXISTS departamentos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa     TEXT NOT NULL DEFAULT 'global_link',
  nombre      TEXT NOT NULL,
  codigo      TEXT,
  color       TEXT,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departamentos_empresa ON departamentos(empresa);
CREATE INDEX IF NOT EXISTS idx_departamentos_activo  ON departamentos(activo);

DROP TRIGGER IF EXISTS trg_departamentos_updated_at ON departamentos;
CREATE TRIGGER trg_departamentos_updated_at
  BEFORE UPDATE ON departamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO departamentos (empresa, nombre, activo)
SELECT 'global_link', 'COBRANZA', TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM departamentos WHERE empresa = 'global_link' AND UPPER(nombre) = 'COBRANZA'
);

INSERT INTO departamentos (empresa, nombre, activo)
SELECT 'ameriglobal', d, TRUE
FROM unnest(ARRAY['COBRANZA', 'CIERRE', 'VENTAS', 'UNDERWRITING', 'CONTABILIDAD', 'RRHH', 'GERENCIA', 'SOPORTE TI', 'SERVICIOS GENERALES']) AS d
WHERE NOT EXISTS (
  SELECT 1 FROM departamentos WHERE empresa = 'ameriglobal' AND UPPER(nombre) = UPPER(d)
);

ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS empresas TEXT[] DEFAULT ARRAY['ameriglobal']::TEXT[];

ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '{"ameriglobal":["all"],"global_link":["all"]}'::jsonb;

ALTER TABLE perfiles
  ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'operativo';

UPDATE perfiles
SET empresas = ARRAY['ameriglobal', 'global_link']
WHERE empresas IS NULL OR array_length(empresas, 1) IS NULL;

UPDATE perfiles
SET permisos = '{"ameriglobal":["all"],"global_link":["all"]}'::jsonb
WHERE permisos IS NULL;

ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios activos pueden ver departamentos" ON departamentos;
CREATE POLICY "Usuarios activos pueden ver departamentos" ON departamentos
  FOR SELECT USING (public.usuario_activo());

DROP POLICY IF EXISTS "Admins pueden gestionar departamentos" ON departamentos;
CREATE POLICY "Admins pueden gestionar departamentos" ON departamentos
  FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());


-- =============================================================================
-- PASO 4: SUPABASE_ADVANCED_UPGRADE (auditoría - opcional)
-- =============================================================================
-- Crea: audit_logs, políticas RLS adicionales
-- Archivo: SQL\04_SUPABASE_ADVANCED_UPGRADE.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    correo_usuario TEXT,
    accion TEXT NOT NULL,
    tabla TEXT NOT NULL,
    registro_id TEXT,
    empresa TEXT NOT NULL DEFAULT 'ameriglobal',
    detalles JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_empresa ON public.audit_logs(empresa);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabla ON public.audit_logs(tabla);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura audit_logs autenticados" ON public.audit_logs;
CREATE POLICY "Lectura audit_logs autenticados" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Insercion audit_logs autenticados" ON public.audit_logs;
CREATE POLICY "Insercion audit_logs autenticados" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura departamentos autenticados" ON public.departamentos;
CREATE POLICY "Lectura departamentos autenticados" ON public.departamentos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Escritura departamentos autenticados" ON public.departamentos;
CREATE POLICY "Escritura departamentos autenticados" ON public.departamentos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);