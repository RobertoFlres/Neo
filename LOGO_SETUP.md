# Configuración del Logo para Newsletters

## Problema

El logo no aparece en los emails enviados porque los clientes de correo necesitan URLs públicas absolutas para mostrar imágenes. El archivo local `/Logo.png` no es accesible desde los emails.

## Solución

Sube el logo a Cloudinary y configura la URL en las variables de entorno.

## Pasos

### 1. Asegúrate de tener configurado Cloudinary

Verifica que tengas estas variables en tu archivo `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
CLOUDINARY_UPLOAD_PRESET=tu-upload-preset
```

### 2. Sube el logo a Cloudinary

Ejecuta el script de subida:

```bash
npm run upload-logo
```

Este script:
- Busca `Logo.png` en la carpeta `public/`
- Lo sube a Cloudinary en la carpeta `newsletter/` con el nombre `logo`
- Te muestra la URL segura que necesitas

### 3. Configura la URL del logo

Copia la URL que te muestra el script y agréga esta línea a tu archivo `.env.local`:

```env
NEXT_PUBLIC_LOGO_URL=https://res.cloudinary.com/tu-cloud-name/image/upload/v1234567890/newsletter/logo.png
```

### 4. Reinicia el servidor de desarrollo

Si tienes el servidor corriendo, reinícialo para que cargue la nueva variable de entorno:

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

## Verificación

Después de configurar esto:
1. El logo aparecerá correctamente en los emails enviados
2. El preview en el dashboard seguirá usando el logo local (`/logo.png`) que funciona bien en el navegador

## Notas

- La URL de Cloudinary es pública y permanente
- Si actualizas el logo, puedes ejecutar `npm run upload-logo` de nuevo (sobrescribirá el anterior)
- El logo se guarda en Cloudinary con el nombre `logo` en la carpeta `newsletter/`
