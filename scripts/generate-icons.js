// scripts/generate-icons.js
// Script para generar iconos PWA en diferentes tamaños desde una imagen base

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const INPUT_IMAGE = path.join(__dirname, '../public/logo-source.png'); // Coloca aquí tu logo original
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generando iconos PWA...\n');

  // Verificar que existe la imagen de entrada
  if (!fs.existsSync(INPUT_IMAGE)) {
    console.error(`❌ Error: No se encontró el archivo ${INPUT_IMAGE}`);
    console.log('\n📝 Instrucciones:');
    console.log('1. Coloca tu logo en public/logo-source.png');
    console.log('2. El logo debe ser cuadrado (512x512px recomendado)');
    console.log('3. Fondo sólido con el color institucional (#1e40af)');
    console.log('4. Ejecuta de nuevo: node scripts/generate-icons.js\n');
    process.exit(1);
  }

  try {
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      await sharp(INPUT_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 30, g: 64, b: 175, alpha: 1 } // #1e40af
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generado: icon-${size}x${size}.png`);
    }

    console.log('\n🎉 ¡Todos los iconos fueron generados exitosamente!');
    console.log(`📁 Ubicación: ${OUTPUT_DIR}\n`);
  } catch (error) {
    console.error('❌ Error generando iconos:', error.message);
    process.exit(1);
  }
}

generateIcons();
