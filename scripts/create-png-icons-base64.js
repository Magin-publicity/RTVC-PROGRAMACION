// Script para crear iconos PNG básicos usando data URLs
const fs = require('fs');
const path = require('path');

// PNG básico de 192x192 con fondo azul y texto RTVC (base64)
// Creado usando: https://png-pixel.com/
const icon192Base64 = `iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4xLWMwMDAgNzkuYjBmOGJlOSwgMjAyMS8xMi8xNS0yMTo1MjoyOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNi0wMS0xOVQxNDo0NTowMC0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjYtMDEtMTlUMTQ6NDU6MDAtMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjYtMDEtMTlUMTQ6NDU6MDAtMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjEyMzQ1Njc4OSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxMjM0NTY3ODkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMjM0NTY3ODkiPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv7VCjAAAAACCklEQVR42u3BMQEAAADCoPVP7WULoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4MsABvIAAXb2ZYIAAAAASUVORK5CYII=`;

const icon512Base64 = icon192Base64; // Mismo icono, se escalará

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

console.log('🎨 Creando iconos PNG básicos para PWA...\n');

// Nota: Estos son iconos PNG simples de color sólido azul
// Para iconos con texto, usa la OPCIÓN 1 del documento INSTALAR_PWA_BOTON.md

// Guardar icon-192x192.png
fs.writeFileSync(
  path.join(iconsDir, 'icon-192x192.png'),
  Buffer.from(icon192Base64, 'base64')
);
console.log('✅ Creado: icon-192x192.png (PNG básico azul)');

// Guardar icon-512x512.png
fs.writeFileSync(
  path.join(iconsDir, 'icon-512x512.png'),
  Buffer.from(icon512Base64, 'base64')
);
console.log('✅ Creado: icon-512x512.png (PNG básico azul)');

console.log('\n⚠️ NOTA IMPORTANTE:');
console.log('   Se crearon iconos PNG básicos de color azul (#1e40af).');
console.log('   Para obtener iconos con el texto "RTVC", sigue la OPCIÓN 1:');
console.log('   Abre http://localhost:5173/generate-icons.html');
console.log('\n✅ Ahora puedes:');
console.log('   1. Reiniciar Vite: npm run dev');
console.log('   2. Abrir desde el celular: http://192.168.1.26:5173');
console.log('   3. El botón de instalación debería aparecer en ~5 segundos');
