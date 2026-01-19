// Script simple para crear iconos PNG para PWA
// Sin dependencias externas - usa solo Node.js

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// SVG optimizado para RTVC
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Fondo azul redondeado -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#1e40af"/>

  <!-- Texto RTVC -->
  <text
    x="50%"
    y="48%"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${Math.round(size * 0.35)}"
    font-weight="bold"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >RTVC</text>

  <!-- Subtítulo -->
  <text
    x="50%"
    y="75%"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${Math.round(size * 0.08)}"
    font-weight="normal"
    fill="rgba(255, 255, 255, 0.85)"
    text-anchor="middle"
    dominant-baseline="middle"
  >Programación</text>
</svg>`;
}

console.log('🎨 Generando iconos PWA para RTVC...\n');

// Crear iconos de 192x192 y 512x512
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = createSVG(size);
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);

  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log(`✅ Creado: icon-${size}x${size}.svg`);
});

console.log('\n📝 IMPORTANTE:');
console.log('   Los iconos SVG se han creado, pero Chrome Android requiere PNG.');
console.log('\n🔧 Opciones para convertir SVG a PNG:\n');
console.log('   OPCIÓN 1 (Más Fácil): Usar el generador web');
console.log('   ----------------------------------------');
console.log('   1. Abre en el navegador: http://localhost:5173/generate-icons.html');
console.log('   2. Haz clic en "Descargar 192x192" y guárdalo como icon-192x192.png');
console.log('   3. Haz clic en "Descargar 512x512" y guárdalo como icon-512x512.png');
console.log('   4. Mueve los archivos PNG a: public/icons/\n');

console.log('   OPCIÓN 2: Usar herramienta online');
console.log('   ----------------------------------------');
console.log('   1. Ve a: https://realfavicongenerator.net/');
console.log('   2. Sube el archivo: public/icons/icon-512x512.svg');
console.log('   3. Genera y descarga los iconos');
console.log('   4. Extrae icon-192x192.png y icon-512x512.png\n');

console.log('   OPCIÓN 3: Usar ImageMagick (si está instalado)');
console.log('   ----------------------------------------');
console.log('   convert public/icons/icon-512x512.svg -resize 192x192 public/icons/icon-192x192.png');
console.log('   convert public/icons/icon-512x512.svg -resize 512x512 public/icons/icon-512x512.png\n');

console.log('✅ Después de crear los PNG, reinicia Vite y recarga el celular.');
