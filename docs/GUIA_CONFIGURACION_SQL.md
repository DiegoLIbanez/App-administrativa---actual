# Guía de Configuración SQL - AmeriGlobal Incapacidades

## Requisitos previos

- Tener una cuenta en [Supabase](https://app.supabase.com)
- Tener un proyecto creado en Supabase

---

## Paso 1: Configurar variables de entorno

El archivo `.env` debe tener las credenciales de Supabase:

```
VITE_SUPABASE_URL=https://iyjdmpdmjypdlndhlmkh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_zZ31vkoTww7tl3tP-1MnjA__aP-1ZpV
```

> Si creas un nuevo proyecto Supabase, reemplaza estos valores con los que aparecen en:
> Supabase > Settings > API > Project URL / anon public key

---

## Paso 2: Ejecutar scripts SQL en orden

Todos los scripts están en la carpeta `SQL\` del proyecto.

```
C:\Users\SOPORTE TI\Videos\ameriglobal-incapacidades\SQL\
│
├── 00_SCRIPT_MAESTRO_COMPLETO.sql   ← Script único con todo (opcional)
├── 01_SUPABASE_SETUP.sql            ← Tablas principales
├── 02_supabase_auth_setup.sql       ← Autenticación y RLS
├── 03_SUPABASE_MULTIEMPRESA_SETUP.sql ← Multi-empresa
└── 04_SUPABASE_ADVANCED_UPGRADE.sql ← Auditoría (opcional)
```

### Orden de ejecución obligatorio:

### 2.1 `01_SUPABASE_SETUP.sql`
Crea las tablas principales:
- `empleados`, `novedades`, `vacaciones`, `registros_parqueadero`
- Función `update_updated_at()` y triggers automáticos

**Ejecutar:** Supabase > SQL Editor > pegar contenido > **Run**

### 2.2 `02_supabase_auth_setup.sql`
Crea el sistema de autenticación:
- Tabla `perfiles` (vinculada a `auth.users`)
- Trigger `on_auth_user_created` (perfil automático al registrarse)
- Funciones `usuario_activo()` y `es_admin()`
- Políticas RLS en todas las tablas

**Ejecutar:** Supabase > SQL Editor > pegar contenido > **Run**

### 2.3 Activar el primer administrador (DESPUÉS de registrarse)
1. Abre la app en el navegador
2. Regístrate con tu correo (pestaña "Crear cuenta")
3. Ve a Supabase > SQL Editor y ejecuta:
```sql
UPDATE perfiles SET activo = true, es_admin = true
WHERE correo = 'tu_correo@empresa.com';
```
4. Recarga la app — ya eres administrador

### 2.4 `03_SUPABASE_MULTIEMPRESA_SETUP.sql`
Habilita el modo multi-empresa:
- Columna `empresa` en todas las tablas
- Tabla `departamentos` con datos iniciales
- Columnas `empresas`, `permisos`, `rol` en `perfiles`

**Ejecutar:** Supabase > SQL Editor > pegar contenido > **Run**

### 2.5 `04_SUPABASE_ADVANCED_UPGRADE.sql` (opcional)
Mejoras avanzadas:
- Tabla `audit_logs` para auditoría
- Políticas RLS adicionales

**Ejecutar:** Supabase > SQL Editor > pegar contenido > **Run**

> **Alternativa:** Puedes ejecutar `00_SCRIPT_MAESTRO_COMPLETO.sql` que contiene todo en un solo script, pero igual debes registrarte manualmente y ejecutar el UPDATE del paso 2.3 después.

---

## Paso 3: Instalar dependencias y ejecutar

```powershell
cd "C:\Users\SOPORTE TI\Videos\ameriglobal-incapacidades"
npm install
npm run dev
```

La app se abrirá en `http://localhost:5173`

---

## Notas importantes

- Los scripts son **idempotentes**: puedes ejecutarlos varias veces sin perder datos (usan `IF NOT EXISTS`)
- Si ya hay datos cargados, no se pierden al re-ejecutar
- El orden de ejecución **es obligatorio**: `01` → `02` → registrar admin → `03` → `04`
- Para crear un proyecto nuevo desde cero en Supabase, solo cambia las variables del `.env` y ejecuta todos los SQL en orden