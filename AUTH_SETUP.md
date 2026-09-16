# 🔐 Sistema de autenticación — Guía de configuración

Este proyecto ya tiene el código del login integrado. Lo único que falta es
configurarlo en tu proyecto de Supabase (una sola vez).

**Cómo funciona:**
- Cualquiera puede crear una cuenta desde la pantalla "Crear cuenta".
- La cuenta nace **pendiente de aprobación** (no puede usar la app todavía).
- Un administrador la aprueba desde la pantalla **Usuarios** dentro de la app.
- No hay "roles de negocio": todos los usuarios activos tienen el mismo
  acceso a Vacaciones, Novedades, Empleados, etc. El único distintivo es
  "Administrador", que solo sirve para aprobar/desactivar cuentas.

---

## 1. Ejecuta el script SQL

1. Entra a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. Ve a **SQL Editor** → **New query**
3. Copia y pega **todo** el contenido de `supabase_auth_setup.sql`
4. Haz clic en **Run**

Esto crea la tabla `perfiles`, los triggers, las funciones y activa **RLS**
(Row Level Security) tanto en `perfiles` como en las tablas de negocio
(`empleados`, `novedades`, `vacaciones`, `registros_parqueadero`).

> ⚠️ **Importante:** hoy esas tablas son de acceso público con la `anon key`
> (cualquiera que tenga la URL puede leer/escribir sin loguearse). Este
> script cierra ese hueco: a partir de ahora solo usuarios **autenticados y
> aprobados** podrán usarlas.

## 2. Revisa la configuración de correo (opcional pero recomendado)

En **Authentication → Providers → Email**:

- **"Confirm email" activado** (por defecto en Supabase): el usuario debe
  confirmar su correo antes de poder iniciar sesión. Es lo más seguro.
- **"Confirm email" desactivado**: el usuario queda con sesión activa
  inmediatamente después de registrarse, pero como su cuenta sigue
  `activo = false`, la app le mostrará igual la pantalla "Cuenta pendiente
  de aprobación". Útil si no quieres depender del envío de correos durante
  las pruebas iniciales.

En **Authentication → URL Configuration**, agrega la URL donde corre tu app
(ej: `http://localhost:5173` en desarrollo, o tu dominio en producción) en
**Site URL** y en **Redirect URLs**. Esto es necesario para que el enlace de
"olvidé mi contraseña" regrese correctamente a la app.

## 3. Crea tu cuenta y conviértete en administrador

1. Corre la app (`npm install && npm run dev`) y entra a la pestaña
   **Crear cuenta**. Regístrate con tu correo real.
2. Si activaste la confirmación de correo, confirma desde tu bandeja.
3. En Supabase, ve otra vez a **SQL Editor** y ejecuta (reemplazando el
   correo):

   ```sql
   UPDATE perfiles SET activo = true, es_admin = true
   WHERE correo = 'tu_correo@empresa.com';
   ```

4. Vuelve a la app e inicia sesión. Ya tienes acceso completo y verás la
   pestaña **Usuarios** en el menú lateral.

## 4. Aprueba a los demás usuarios

A partir de ahora, cada vez que alguien se registre, aparecerá en
**Usuarios → Pendientes**. Desde ahí puedes:

- **Aprobar** su acceso (botón verde) o **Desactivar** una cuenta existente.
- **Hacer admin** a alguien de confianza para que también pueda aprobar
  usuarios (no puedes quitarte el rol de admin a ti mismo, para evitar
  quedar bloqueado).

## 5. Recuperación de contraseña

El enlace "¿Olvidaste tu contraseña?" envía un correo con un link de
recuperación (usa la plantilla por defecto de Supabase, configurable en
**Authentication → Email Templates → Reset password**). Al hacer clic, el
usuario vuelve a la app y ve un formulario para definir una nueva
contraseña.

---

### Resumen de archivos nuevos

| Archivo | Qué hace |
|---|---|
| `supabase_auth_setup.sql` | Tabla `perfiles`, triggers, funciones y políticas RLS |
| `src/context/AuthContext.jsx` | Maneja la sesión, el perfil y las acciones (login/signup/logout/recuperar) |
| `src/pages/Login.jsx` | Pantallas de login, registro, recuperar contraseña, "cuenta pendiente" |
| `src/pages/Usuarios.jsx` | Panel de administración para aprobar usuarios y dar/quitar admin |
| `src/App.jsx` | Ahora decide qué mostrar según el estado de la sesión, y agrega el menú de cuenta + botón de cerrar sesión en el sidebar |
