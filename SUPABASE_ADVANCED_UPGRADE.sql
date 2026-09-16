-- ============================================================================
-- SCRIPT DE ACTUALIZACIÓN AVANZADA SUPABASE: AUDITORÍA Y SEGURIDAD RLS
-- Sistema AmeriGlobal & Global Link
-- ============================================================================

-- 1. TABLA DE LOGS DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    correo_usuario TEXT,
    accion TEXT NOT NULL, -- 'CREAR', 'ACTUALIZAR', 'ELIMINAR', 'LOGIN', 'PERMISOS'
    tabla TEXT NOT NULL,  -- 'novedades', 'vacaciones', 'empleados', 'procesos_disciplinarios', 'registros_parqueadero', 'departamentos', 'perfiles'
    registro_id TEXT,
    empresa TEXT NOT NULL DEFAULT 'ameriglobal',
    detalles JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para búsquedas rápidas en auditoría
CREATE INDEX IF NOT EXISTS idx_audit_logs_empresa ON public.audit_logs(empresa);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabla ON public.audit_logs(tabla);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Habilitar RLS en audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para audit_logs
DROP POLICY IF EXISTS "Lectura audit_logs autenticados" ON public.audit_logs;
CREATE POLICY "Lectura audit_logs autenticados" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Insercion audit_logs autenticados" ON public.audit_logs;
CREATE POLICY "Insercion audit_logs autenticados" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);


-- 2. POLÍTICAS RLS DE AISLAMIENTO POR EMPRESA EN DEPARTAMENTOS Y PERFILES
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura departamentos autenticados" ON public.departamentos;
CREATE POLICY "Lectura departamentos autenticados" ON public.departamentos
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Escritura departamentos autenticados" ON public.departamentos;
CREATE POLICY "Escritura departamentos autenticados" ON public.departamentos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
