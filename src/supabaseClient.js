import { createClient } from '@supabase/supabase-js'

// 🔧 CONFIGURA TUS CREDENCIALES DE SUPABASE AQUÍ
// Ve a: https://app.supabase.com → tu proyecto → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://TU_URL.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
