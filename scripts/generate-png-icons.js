// Script para generar iconos PNG para PWA
// Chrome Android requiere PNG en tamaños exactos: 192x192 y 512x512

const fs = require('fs');
const path = require('path');

// Función para crear un icono PNG simple usando SVG en base64
function generatePNGIcon(size) {
  // SVG del icono RTVC (azul con texto)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1e40af" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">RTVC</text>
</svg>`;

  return svg;
}

// Crear iconos en diferentes tamaños
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

console.log('📱 Generando iconos PNG para PWA...\n');

sizes.forEach(size => {
  const svg = generatePNGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svg, 'utf8');
  console.log(`✅ Generado: ${filename}`);
});

console.log('\n🎉 Iconos SVG generados correctamente');
console.log('\n📝 IMPORTANTE:');
console.log('   Chrome Android requiere iconos PNG reales para mostrar el botón de instalación.');
console.log('   Opciones:');
console.log('   1. Usar una herramienta online: https://realfavicongenerator.net/');
console.log('   2. Usar ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png');
console.log('   3. Usar un diseñador gráfico para crear los PNG');
console.log('\n   Tamaños requeridos: 192x192 y 512x512 en formato PNG');
