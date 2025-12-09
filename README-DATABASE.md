# Database Setup Guide

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:** 
- **NO** hardcodees contraseñas en el código
- Usa variables de entorno para todas las credenciales
- El archivo `.env.local` está en `.gitignore` y no se sube al repositorio

### 2. Actualizar Esquema de Base de Datos

Ejecuta el siguiente comando para sincronizar el esquema con la base de datos:

```bash
npm run db:push
```

Este comando:
- Crea todas las tablas necesarias
- Agrega columnas faltantes
- Mantiene la estructura actualizada

### 3. Verificar Estado de la Base de Datos

Para verificar que todo esté correcto:

```bash
npm run db:setup
```

Este script:
- Verifica la conexión a la base de datos
- Verifica que todas las tablas existan
- Verifica que las columnas requeridas estén presentes

### 4. Crear Usuario Manager

**IMPORTANTE:** El usuario manager debe crearse directamente en la base de datos Neon usando tu cliente de base de datos (psql, Drizzle Studio, o la consola de Neon).

Para crear un usuario manager, ejecuta este SQL en tu base de datos:

```sql
INSERT INTO users (name, email, password, role, approved, created_at, updated_at)
VALUES (
  'Admin',
  'admin@venom.fit',
  '$2a$10$...', -- Hash bcrypt de tu contraseña
  'manager',
  true, -- Los managers siempre están aprobados
  NOW(),
  NOW()
);
```

**Nota:** Asegúrate de hashear la contraseña con bcrypt antes de insertarla. Puedes usar el script incluido:

```bash
npm run db:hash-password
```

O usar Node.js directamente:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tu-contraseña', 10).then(hash => console.log(hash));"
```

Después de crear el manager:
- Inicia sesión en `/login` con el email y contraseña configurados
- Serás redirigido automáticamente a `/manager` dashboard
- Desde ahí podrás:
  - Crear otros usuarios (clientes) - estos se crean automáticamente aprobados
  - Aprobar/rechazar usuarios que se registraron por su cuenta
  - Gestionar WODs, clases y horarios

### 5. Sistema de Aprobación de Usuarios

**Flujo de Registro:**
1. Un cliente se registra en `/register`
2. Su cuenta se crea con `approved: false`
3. Recibe un mensaje indicando que debe esperar aprobación
4. El manager ve al usuario en la sección "Usuarios Pendientes de Aprobación"
5. El manager puede aprobar o rechazar el usuario
6. Si se aprueba, el cliente puede iniciar sesión
7. Si se rechaza, todas sus reservas (si las hay) son canceladas automáticamente

**Notas Importantes:**
- Los usuarios creados por el manager se crean automáticamente aprobados
- Los managers siempre están aprobados
- Si un usuario es eliminado o rechazado, todas sus reservas se cancelan automáticamente
- Los clientes no pueden iniciar sesión ni crear reservas hasta ser aprobados
- Los clientes con suscripción expirada no pueden iniciar sesión y son redirigidos automáticamente al login con un mensaje de notificación

## Estructura de Tablas

El sistema utiliza las siguientes tablas:

- **users**: Usuarios del sistema (clientes y managers)
  - Campo `approved`: Indica si el usuario está aprobado (los managers siempre están aprobados)
  - Los clientes nuevos se crean con `approved: false` y requieren aprobación del manager
  - Los usuarios creados por el manager se crean con `approved: true`
- **profiles**: Información extendida de usuarios
- **personal_records**: Récords personales de usuarios
- **reservations**: Reservas de clases (se eliminan automáticamente si el usuario es rechazado o eliminado)
- **schedules**: Horarios semanales de clases (tabla principal para gestión de horarios)
- **class_slots**: Tabla legacy (mantenida para compatibilidad, será eliminada)
- **workout_of_day**: Workout del día (WOD)
- **class_attendees**: Asignación de usuarios a clases específicas
- **password_reset_tokens**: Tokens para restablecimiento de contraseña (expiran después de 1 hora)

## Scripts Disponibles

- `npm run db:push` - Sincroniza el esquema con la base de datos
- `npm run db:setup` - Verifica la conexión y el esquema de la base de datos
- `npm run db:verify` - Verifica la conexión y datos
- `npm run db:studio` - Abre Drizzle Studio para ver la base de datos

## Seguridad

✅ **Buenas Prácticas:**
- Todas las contraseñas se hashean con bcrypt antes de guardarse
- Las credenciales se leen de variables de entorno
- No hay contraseñas hardcodeadas en el código

❌ **Evitar:**
- Hardcodear contraseñas en el código
- Subir `.env.local` al repositorio
- Usar contraseñas débiles
