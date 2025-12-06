# NextAuth.js Setup Instructions

## Variables de Entorno Requeridas

Agrega la siguiente variable de entorno a tu archivo `.env.local` o `.env`:

```env
NEXTAUTH_SECRET=tu_secret_key_aqui
NEXTAUTH_URL=http://localhost:3000
```

### Generar NEXTAUTH_SECRET

Puedes generar un secret seguro usando uno de estos métodos:

1. **Usando OpenSSL:**
   ```bash
   openssl rand -base64 32
   ```

2. **Usando Node.js:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. **Online:** Visita https://generate-secret.vercel.app/32

### Para Producción (Vercel)

En Vercel, agrega estas variables de entorno en la configuración del proyecto:
- `NEXTAUTH_SECRET`: El secret generado
- `NEXTAUTH_URL`: Tu URL de producción (ej: https://tu-dominio.vercel.app)

## Migración de Base de Datos

Después de actualizar el esquema, ejecuta la migración:

```bash
npm run db:push
```

O si prefieres generar una migración:

```bash
npm run db:generate
npm run db:migrate
```

## Notas Importantes

1. **Usuarios**: Los usuarios se crean a través del sistema de registro (`/register`) o por managers desde el panel de administración.

2. **Contraseñas**: Las contraseñas se almacenan hasheadas usando bcrypt con salt rounds de 10.

3. **Sesiones**: NextAuth usa JWT para las sesiones, por lo que no se almacenan en la base de datos. Las sesiones duran 30 días por defecto.
   - **Optimización de Cookies**: El JWT está optimizado para mantener el tamaño de la cookie por debajo de 4096 bytes
   - Solo se almacenan `id` y `role` en el token JWT para minimizar el tamaño
   - Los datos adicionales (name, email) se obtienen desde la base de datos cuando se necesitan
   - Las cookies están configuradas para funcionar correctamente en Chrome y otros navegadores

4. **OAuth**: Si en el futuro quieres agregar proveedores OAuth (Google, GitHub, etc.), necesitarás:
   - Instalar el adapter de Drizzle: `@auth/drizzle-adapter`
   - Descomentar y configurar el adapter en `src/lib/auth.ts`
   - Agregar las tablas necesarias al esquema (accounts, sessions, verification_tokens)

5. **Debug Mode**: El modo debug está habilitado solo en desarrollo (`NODE_ENV === "development"`). Los logs de autenticación solo aparecen en desarrollo.

6. **Optimización de Cookies**: 
   - Las cookies de sesión están optimizadas para mantener un tamaño mínimo
   - En desarrollo, las cookies usan `secure: false` para funcionar en localhost
   - En producción, las cookies usan `secure: true` y configuraciones de dominio apropiadas
   - Si encuentras el error "Session cookie exceeds 4096 bytes", verifica que no estés almacenando datos innecesarios en el JWT

7. **Compatibilidad con Navegadores**:
   - Las cookies están configuradas para funcionar correctamente en Chrome, Firefox, Safari y Edge
   - Si tienes problemas en Chrome, limpia las cookies de localhost:3000 en DevTools > Application > Cookies
   - O usa una ventana de incógnito para probar

