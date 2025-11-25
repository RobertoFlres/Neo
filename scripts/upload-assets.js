const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local si existe
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  console.warn('⚠️ No se pudo cargar .env.local, usando variables de entorno del sistema');
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadAsset(filePath, publicId, folder = 'newsletter') {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ${path.basename(filePath)} no encontrado`);
      return null;
    }

    console.log(`📤 Subiendo ${path.basename(filePath)} a Cloudinary...`);

    // Subir el archivo a Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image', // PNG es imagen
    });

    console.log(`✅ ${path.basename(filePath)} subido exitosamente!`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error subiendo ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

async function uploadNewsletterAssets() {
  const publicDir = path.join(__dirname, '..', 'public');
  const results = {};

  console.log('🚀 Iniciando subida de assets del newsletter...\n');

  // Subir logo nuevo (PNG)
  const logoUrl = await uploadAsset(
    path.join(publicDir, 'logonuevo2.png'),
    'logonuevo2',
    'newsletter'
  );
  if (logoUrl) results.logoUrl = logoUrl;

  // Subir fondo (PNG)
  const fondoUrl = await uploadAsset(
    path.join(publicDir, 'Fondo2.png'),
    'fondo2',
    'newsletter'
  );
  if (fondoUrl) results.fondoUrl = fondoUrl;

  console.log('\n📋 URLs generadas:');
  console.log('═'.repeat(60));
  
  if (results.logoUrl) {
    console.log('\n✅ Logo URL:');
    console.log(results.logoUrl);
    console.log('\n📝 Usa esta URL en el código:');
    console.log(`const logoUrl = "${results.logoUrl}";`);
  }

  if (results.fondoUrl) {
    console.log('\n✅ Fondo URL:');
    console.log(results.fondoUrl);
    console.log('\n📝 Usa esta URL en el código:');
    console.log(`const fondoUrl = "${results.fondoUrl}";`);
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  return results;
}

uploadNewsletterAssets();
