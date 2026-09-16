# AmeriGlobal SAS — Gestión de Novedades 📋

Aplicación web para gestión de incapacidades y novedades de colaboradores, construida con **React + Vite + Supabase**.

## 🚀 Instalación rápida

### 1. Configura Supabase

1. Crea un proyecto en [supabase.com](https://app.supabase.com)
2. Ve a **SQL Editor** y ejecuta, **en este orden**:
   1. Todo el contenido de `SUPABASE_SETUP.sql` (crea las 4 tablas de negocio: empleados, novedades, vacaciones, registros_parqueadero)
   2. Todo el contenido de `supabase_auth_setup.sql` (crea la tabla de perfiles, activa RLS y te explica cómo volverte administrador — ver **[AUTH_SETUP.md](./AUTH_SETUP.md)** para el detalle paso a paso)
3. Ve a **Settings → API** y copia:
   - **Project URL**
   - **anon public key**

### 2. Configura variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
```

### 3. Instala y ejecuta

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### 4. Crea tu usuario administrador

La app requiere iniciar sesión. Sigue la guía
**[AUTH_SETUP.md](./AUTH_SETUP.md)** para crear tu cuenta y convertirla
en administrador con el último paso manual del script (toma ~2 minutos).

### 5. Importa el Excel

- Ve a la sección **Importar Excel**
- Arrastra el archivo `NOVEDADES_COLABORADORES_AMERIGLOBAL_SAS.xlsx`
- Selecciona las hojas que deseas importar
- Haz clic en **Importar**

## 📦 Estructura del proyecto

```
src/
├── context/
│   └── AuthContext.jsx    # Sesión, perfil y acciones de autenticación
├── pages/
│   ├── Dashboard.jsx      # Panel con estadísticas y gráficas (Incapacidad, LNR, LR)
│   ├── Novedades.jsx      # CRUD completo de novedades
│   ├── Colaboradores.jsx  # Vista por colaborador con historial y timeline
│   ├── Empleados.jsx      # CRUD de empleados, agrupado por área (activos/inactivos)
│   ├── Parqueadero.jsx    # Control mensual de vehículos y envío de reportes
│   ├── Vacaciones.jsx     # Gestión de solicitudes y días disfrutados/en dinero
│   ├── Login.jsx          # Login, registro y recuperación de contraseña
│   ├── Usuarios.jsx       # Aprobar/desactivar usuarios y dar/quitar admin
│   └── Importar.jsx       # Carga de Excel a Supabase
├── utils/
│   └── parseExcel.js      # Normalización de datos
├── supabaseClient.js      # Conexión a Supabase
├── App.jsx                # Layout, navegación y puerta de autenticación
└── App.css                # Estilos globales
```

## ✨ Funcionalidades

- **Dashboard**: estadísticas generales filtradas a Incapacidad/LNR/LR, comparativos mensuales, alertas de pendientes
- **Novedades**: tabla paginada con filtros por concepto, periodo y rango de fechas, crear/editar/eliminar registros
- **Colaboradores**: tarjetas por empleado con historial completo, timeline visual y exportación a Excel
- **Empleados**: alta/baja de empleados, detección de duplicados, agrupado por área (activos/inactivos)
- **Parqueadero**: registro mensual de vehículos, copiar registros al mes siguiente, envío de reporte sin duplicar fechas ya enviadas
- **Vacaciones**: solicitudes con periodo, días disfrutados vs. días compensados en dinero
- **Importar Excel**: carga por hojas, detección automática de periodo, inserción por lotes

## 🛠 Tecnologías

- React 19 + Vite
- Supabase (PostgreSQL + Auth + API)
- SheetJS (lectura/escritura de Excel)
- Lucide React (íconos)
