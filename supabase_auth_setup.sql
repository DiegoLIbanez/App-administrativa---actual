-- =============================================================
-- AMERIGLOBAL SAS — Sistema de autenticación
-- Ejecutar en: Supabase > SQL Editor (proyecto del .env)
-- =============================================================
-- Qué hace este script:
--  1. Crea la tabla `perfiles` (1 fila por usuario de auth.users).
--  2. Crea un trigger que, cuando alguien se registra (auth.users),
--     le crea automáticamente un perfil con activo = FALSE
--     (autoregistro + aprobación del administrador).
--  3. Activa RLS y políticas en `perfiles`.
--  4. Activa RLS en TODAS las tablas de negocio (empleados, novedades,
--     vacaciones, registros_parqueadero) para que solo usuarios
--     autenticados Y activos puedan leer/escribir. Hoy estas tablas
--     son de acceso público con la anon key — esto cierra ese hueco.
-- =============================================================

-- ── 1. Tabla de perfiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo  TEXT,
  correo           TEXT,
  activo           BOOLEAN NOT NULL DEFAULT FALSE,  -- pendiente de aprobación hasta que un admin lo active
  es_admin         BOOLEAN NOT NULL DEFAULT FALSE,  -- puede aprobar/gestionar usuarios en la pantalla "Usuarios"
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perfiles_correo  ON perfiles(correo);
CREATE INDEX IF NOT EXISTS idx_perfiles_activo  ON perfiles(activo);

-- updated_at automático (reutiliza la función si ya existe del setup de empleados)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_perfiles_updated_at ON perfiles;
CREATE TRIGGER trg_perfiles_updated_at
  BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 2. Trigger: crear perfil automáticamente al registrarse ────────────
-- El perfil nace con activo = FALSE. El usuario solo podrá usar la app
-- cuando un administrador lo active desde la pantalla "Usuarios".
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

-- ── 3. Funciones auxiliares (SECURITY DEFINER: evitan recursión de RLS) ─
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

-- ── 4. RLS sobre `perfiles` ──────────────────────────────────────────────
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver propio perfil"        ON perfiles;
DROP POLICY IF EXISTS "Admins ven todos"          ON perfiles;
DROP POLICY IF EXISTS "Admins actualizan perfiles" ON perfiles;
DROP POLICY IF EXISTS "Usuario actualiza su nombre" ON perfiles;

-- Cualquier usuario autenticado puede ver su propio perfil
-- (necesario para saber si está activo, aunque aún no lo esté)
CREATE POLICY "Ver propio perfil" ON perfiles
  FOR SELECT USING (auth.uid() = id);

-- Los admins pueden ver todos los perfiles (pantalla "Usuarios")
CREATE POLICY "Admins ven todos" ON perfiles
  FOR SELECT USING (public.es_admin());

-- Solo los admins pueden activar/desactivar o dar/quitar rol admin
CREATE POLICY "Admins actualizan perfiles" ON perfiles
  FOR UPDATE USING (public.es_admin()) WITH CHECK (public.es_admin());

-- Un usuario puede editar su propio nombre (no activo/es_admin, eso lo
-- controla la policy de arriba que exige ser admin)
CREATE POLICY "Usuario actualiza su nombre" ON perfiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- No exponemos policy de INSERT/DELETE: el trigger crea el perfil con
-- privilegios de owner (SECURITY DEFINER) y no necesita pasar por RLS.

-- ── 5. RLS sobre las tablas de negocio ───────────────────────────────────
-- Regla: solo usuarios autenticados y con activo = TRUE pueden
-- leer/insertar/actualizar/eliminar. Todos los usuarios activos tienen
-- el mismo nivel de acceso (no hay roles de negocio, solo el flag
-- "es_admin" que es exclusivo para gestionar usuarios).

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

-- =============================================================
-- 6. ÚLTIMO PASO MANUAL — Conviértete en el primer administrador
-- =============================================================
-- 1) Crea tu cuenta normalmente desde la app (pestaña "Crear cuenta").
-- 2) Ejecuta esto reemplazando el correo por el tuyo:
--
--    UPDATE perfiles SET activo = true, es_admin = true
--    WHERE correo = 'tu_correo@empresa.com';
--
-- A partir de ahí podrás entrar a la app y aprobar a los demás
-- usuarios desde la pantalla "Usuarios".
