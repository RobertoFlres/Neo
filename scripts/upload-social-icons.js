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

async function uploadSocialIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const results = {};

  console.log('🚀 Subiendo iconos de redes sociales a Cloudinary...\n');

  // Subir Instagram icon
  const instaPath = path.join(publicDir, 'insta.png');
  if (fs.existsSync(instaPath)) {
    try {
      console.log('📤 Subiendo insta.png...');
      const instaResult = await cloudinary.uploader.upload(instaPath, {
        folder: 'newsletter',
        public_id: 'insta',
        overwrite: true,
        resource_type: 'image',
      });
      results.instagramUrl = instaResult.secure_url;
      console.log('✅ insta.png subido exitosamente!');
    } catch (error) {
      console.error('❌ Error subiendo insta.png:', error.message);
    }
  } else {
    console.error('❌ insta.png no encontrado en public/');
  }

  // Subir LinkedIn icon
  const linkPath = path.join(publicDir, 'link.png');
  if (fs.existsSync(linkPath)) {
    try {
      console.log('📤 Subiendo link.png...');
      const linkResult = await cloudinary.uploader.upload(linkPath, {
        folder: 'newsletter',
        public_id: 'link',
        overwrite: true,
        resource_type: 'image',
      });
      results.linkedinUrl = linkResult.secure_url;
      console.log('✅ link.png subido exitosamente!');
    } catch (error) {
      console.error('❌ Error subiendo link.png:', error.message);
    }
  } else {
    console.error('❌ link.png no encontrado en public/');
  }

  console.log('\n📋 URLs generadas:');
  console.log('═'.repeat(60));
  
  if (results.instagramUrl) {
    console.log('\n✅ Instagram Icon URL:');
    console.log(results.instagramUrl);
  }

  if (results.linkedinUrl) {
    console.log('\n✅ LinkedIn Icon URL:');
    console.log(results.linkedinUrl);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('\n📝 Agrega estas URLs a tu archivo config.js en la sección social:');
  if (results.instagramUrl || results.linkedinUrl) {
    console.log('\n  social: {');
    if (results.instagramUrl) {
      console.log(`    instagramIconUrl: "${results.instagramUrl}",`);
    }
    if (results.linkedinUrl) {
      console.log(`    linkedinIconUrl: "${results.linkedinUrl}",`);
    }
    console.log('  },\n');
  }

  return results;
}

uploadSocialIcons().catch(error => {
  console.error('❌ Error:', error.message);
  if (error.message.includes('Invalid credentials')) {
    console.error('\n💡 Asegúrate de tener configuradas estas variables en .env.local:');
    console.error('   - CLOUDINARY_CLOUD_NAME');
    console.error('   - CLOUDINARY_API_KEY');
    console.error('   - CLOUDINARY_API_SECRET');
  }
  process.exit(1);
});




