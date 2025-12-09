# Configuración de Resend para Recuperación de Contraseña

Este proyecto utiliza [Resend](https://resend.com) para enviar correos electrónicos de recuperación de contraseña.

## Pasos para Configurar Resend

### 1. Crear una Cuenta en Resend

1. Visita [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita (incluye 3,000 emails/mes)
3. Verifica tu correo electrónico

### 2. Obtener tu API Key

1. Una vez dentro del dashboard de Resend, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Give it a descriptive name (e.g., "Venom Fitness Production")
4. Copia la API key (comienza con `re_`)
5. **Importante**: Guarda esta key de forma segura, solo se muestra una vez

### 3. Configurar el Dominio (Opcional pero Recomendado)

Para producción, deberías verificar tu dominio:

1. Ve a **Domains** en el dashboard de Resend
2. Haz clic en **Add Domain**
3. Ingresa tu dominio (ej: `yourdomain.com`)
4. Agrega los registros DNS que Resend te proporciona
5. Espera a que se verifique (puede tomar unos minutos)

**Nota**: Para desarrollo, puedes usar el dominio por defecto de Resend sin verificación.

### 4. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Resend Configuration
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=Venom Elite Fitness <noreply@yourdomain.com>
```

**Para Desarrollo Local:**
Si no tienes un dominio verificado, puedes usar:
```env
RESEND_FROM_EMAIL=Kraken Elite Fitness <onboarding@resend.dev>
```

**Para Producción (Vercel):**
1. Ve a tu proyecto en Vercel
2. Ve a **Settings** > **Environment Variables**
3. Agrega:
   - `RESEND_API_KEY`: Tu API key de Resend
   - `RESEND_FROM_EMAIL`: Your verified email (e.g., `Venom Elite Fitness <noreply@yourdomain.com>`)

### 5. Verificar la Configuración

Una vez configurado, la funcionalidad de "Olvidé mi contraseña" debería funcionar:

1. Ve a la página de login
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa un correo electrónico registrado
4. Revisa el correo (puede estar en spam)
5. Haz clic en el enlace para restablecer tu contraseña

## Funcionalidad Implementada

### Endpoints API

- **POST `/api/auth/forgot-password`**: Solicita un reset de contraseña
  - Body: `{ "email": "user@example.com" }`
  - Genera un token único y envía un correo con el enlace de reset

- **POST `/api/auth/reset-password`**: Restablece la contraseña con un token
  - Body: `{ "token": "abc123...", "newPassword": "newpass123" }`
  - Valida el token y actualiza la contraseña

- **POST `/api/auth/verify-reset-token`**: Verifica si un token es válido
  - Body: `{ "token": "abc123..." }`
  - Retorna si el token es válido y no ha expirado

### Páginas

- **`/reset-password?token=...`**: Página para ingresar la nueva contraseña
  - Valida el token automáticamente
  - Muestra error si el token es inválido o expiró
  - Permite establecer una nueva contraseña

### Seguridad

- Los tokens expiran después de 1 hora
- Los tokens solo pueden usarse una vez
- Los tokens antiguos se invalidan cuando se solicita uno nuevo
- Las contraseñas se hashean con bcrypt antes de guardarse
- No se revela si un email existe en el sistema (previene enumeración de emails)

## Troubleshooting

### Error: "Missing API key"
- Verifica que `RESEND_API_KEY` esté en tu `.env.local`
- Reinicia el servidor de desarrollo después de agregar la variable

### Error: "Email not sent"
- Verifica que `RESEND_FROM_EMAIL` esté configurado correctamente
- Para desarrollo, usa `onboarding@resend.dev`
- Para producción, usa un dominio verificado

### El correo no llega
- Revisa la carpeta de spam
- Verifica que el email esté registrado en el sistema
- Revisa los logs del servidor para errores
- Verifica en el dashboard de Resend que el email se haya enviado

### Token inválido o expirado
- Los tokens expiran después de 1 hora
- Cada token solo puede usarse una vez
- Solicita un nuevo token si el anterior expiró

## Alternativas a Resend

Si prefieres usar otro servicio de email, puedes modificar `src/lib/email.ts` para usar:

- **Nodemailer** (SMTP)
- **SendGrid**
- **AWS SES**
- **Mailgun**

Solo necesitas adaptar la función `sendPasswordResetEmail` para usar la API del servicio elegido.

