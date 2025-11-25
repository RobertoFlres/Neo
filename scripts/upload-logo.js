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

async function uploadLogo() {
  try {
    const logoPath = path.join(__dirname, '..', 'public', 'Logo.png');
    
    // Verificar que el archivo existe
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Logo.png no encontrado en la carpeta public/');
      process.exit(1);
    }

    console.log('📤 Subiendo logo a Cloudinary...');

    // Subir el logo a Cloudinary
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'newsletter',
      public_id: 'logo',
      overwrite: true,
      resource_type: 'image',
    });

    console.log('\n✅ Logo subido exitosamente!');
    console.log('\n📋 URL del logo:');
    console.log(result.secure_url);
    console.log('\n📝 Agrega esta línea a tu archivo .env.local:');
    console.log(`NEXT_PUBLIC_LOGO_URL=${result.secure_url}\n`);

  } catch (error) {
    console.error('❌ Error subiendo logo:', error.message);
    
    if (error.message.includes('Invalid credentials')) {
      console.error('\n💡 Asegúrate de tener configuradas estas variables en .env.local:');
      console.error('   - CLOUDINARY_CLOUD_NAME');
      console.error('   - CLOUDINARY_API_KEY');
      console.error('   - CLOUDINARY_API_SECRET');
    }
    
    process.exit(1);
  }
}

uploadLogo();
