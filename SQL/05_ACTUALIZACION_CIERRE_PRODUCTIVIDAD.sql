-- =============================================================================
-- SQL 05: ACTUALIZACION PRODUCTIVIDAD DE CIERRE
-- =============================================================================
-- Este script actualiza o crea la estructura de la tabla `cierre_meses`
-- para soportar las nuevas métricas del departamento de Cierre:
-- 1. Cierres Asignados
-- 2. Cierres Cerrados
-- 3. Porcentaje de Cierres
-- 4. Total Plata ($)
-- 5. Plata Prestada ($)
-- 6. Porcentaje de Plata
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cierre_meses (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_empleado     TEXT NOT NULL,
  anio                INTEGER NOT NULL,
  mes                 TEXT NOT NULL,
  empresa             TEXT DEFAULT 'ameriglobal',
  
  -- Nuevas columnas descriptivas
  cierres_asignados   NUMERIC DEFAULT 0,
  cierres_cerrados    NUMERIC DEFAULT 0,
  porcentaje_cierres  NUMERIC DEFAULT 0,
  total_plata         NUMERIC DEFAULT 0,
  plata_prestada      NUMERIC DEFAULT 0,
  porcentaje_plata    NUMERIC DEFAULT 0,

  -- Columnas existentes para retrocompatibilidad
  new_offers_units    NUMERIC DEFAULT 0,
  new_offers_dollars  NUMERIC DEFAULT 0,
  renewal_units       NUMERIC DEFAULT 0,
  renewal_dollars     NUMERIC DEFAULT 0,
  total_units         NUMERIC DEFAULT 0,
  total_dollars       NUMERIC DEFAULT 0,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_cierre_meses UNIQUE (nombre_empleado, anio, mes)
);

-- Agregar columnas si la tabla ya existía previamente
ALTER TABLE public.cierre_meses ADD COLUMN IF NOT EXISTS cierres_asignados NUMERIC DEFAULT 0;
ALTER TABLE public.cierre_meses ADD COLUMN IF NOT EXISTS cierres_cerrados NUMERIC DEFAULT 0;
ALTER TABLE public.cierre_meses ADD COLUMN IF NOT EXISTS porcentaje_cierres NUMERIC DEFAULT 0;
ALTER TABLE public.cierre_meses ADD COLUMN IF NOT EXISTS total_plata NUMERIC DEFAULT 0;
ALTER TABLE public.cierre_meses ADD COLUMN IF NOT EXISTS plata_prestada NUMERIC DEFAULT 0;
ALTER TABLE public.cierre_meses ADD COLUMN IF NOT EXISTS porcentaje_plata NUMERIC DEFAULT 0;
ALTER TABLE public.cierre_meses ADD COLUMN IF NOT EXISTS empresa TEXT DEFAULT 'ameriglobal';

-- Migrar datos históricos de columnas previas si las nuevas están en 0
UPDATE public.cierre_meses
SET
  cierres_asignados = COALESCE(cierres_asignados, new_offers_units, 0),
  cierres_cerrados = COALESCE(cierres_cerrados, new_offers_dollars, 0),
  porcentaje_cierres = COALESCE(porcentaje_cierres, renewal_units, 0),
  total_plata = COALESCE(total_plata, renewal_dollars, 0),
  plata_prestada = COALESCE(plata_prestada, total_units, 0),
  porcentaje_plata = COALESCE(porcentaje_plata, total_dollars, 0)
WHERE cierres_asignados = 0 AND total_plata = 0;

-- Habilitar RLS si aplica
ALTER TABLE public.cierre_meses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'cierre_meses' AND policyname = 'Permitir todo en cierre_meses'
  ) THEN
    CREATE POLICY "Permitir todo en cierre_meses" ON public.cierre_meses
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
