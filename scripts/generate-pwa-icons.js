// Script para generar iconos PWA desde SVG
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// SVG template
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1e40af" rx="${size * 0.15}"/>
  <text x="${size / 2}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.55}" font-weight="bold" fill="white" text-anchor="middle">R</text>
</svg>`;

console.log('📱 Generando iconos PWA...\n');

// Crear directorio si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generar SVGs temporales para cada tamaño
SIZES.forEach(size => {
  const svgContent = createSVG(size);
  const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.svg`);

  fs.writeFileSync(outputPath, svgContent);
  console.log(`✅ Generado: icon-${size}x${size}.svg`);
});

console.log('\n🎉 ¡Iconos SVG generados exitosamente!');
console.log(`📁 Ubicación: ${OUTPUT_DIR}\n`);
console.log('💡 Nota: Para producción, convierte estos SVG a PNG usando:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/imageGenerator');
console.log('   - O instala sharp: npm install sharp y ejecuta generate-icons.js\n');
