# Configuración de Variables de Entorno

## Variables Requeridas para Resend

Para que el sistema de envío de newsletters funcione correctamente con Resend, necesitas configurar las siguientes variables de entorno:

### API Key de Resend (REQUERIDA)
```bash
RESEND_API_KEY="re_xxxxxxxxxxxxx"
```

### Opción 1: Email completo (Opcional - Prioridad más alta)
Si quieres usar un email diferente al configurado por defecto:
```bash
RESEND_FROM_EMAIL="neo@startupchihuahua.org"
```

### Opción 2: Solo el dominio (Opcional)
Si quieres usar un dominio diferente al configurado por defecto:
```bash
RESEND_DOMAIN="startupchihuahua.org"
```

El sistema construirá automáticamente el email como `neo@startupchihuahua.org`

## Configuración Automática

**Por defecto, el sistema usará `neo@startupchihuahua.org`** basado en la configuración en `config.js`.

Solo necesitas configurar variables de entorno si quieres usar un dominio/email diferente.

## Configuración en Resend

1. Ve a tu dashboard de Resend: https://resend.com/domains
2. Agrega y verifica tu dominio personalizado: `startupchihuahua.org`
3. Una vez verificado, el sistema usará automáticamente `neo@startupchihuahua.org`
4. Asegúrate de tener `RESEND_API_KEY` configurada en tu archivo `.env`

## Verificación

Después de configurar, reinicia tu servidor y verifica en los logs que aparezca:
```
📧 Sending email from: neo@startupchihuahua.org to: ...
```

Si el dominio está correctamente configurado en Resend, podrás enviar a todos tus suscriptores sin problemas.

