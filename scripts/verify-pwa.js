// Script para verificar que la PWA está correctamente configurada
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración PWA...\n');

let errors = 0;
let warnings = 0;

// 1. Verificar manifest.json
console.log('1️⃣ Verificando manifest.json...');
const manifestPath = path.join(__dirname, '../public/manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('  ❌ manifest.json no existe');
  errors++;
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color', 'icons'];
  requiredFields.forEach(field => {
    if (!manifest[field]) {
      console.error(`  ❌ Campo obligatorio "${field}" faltante`);
      errors++;
    } else {
      console.log(`  ✅ ${field}: "${manifest[field]}"`);
    }
  });

  // Verificar iconos obligatorios
  if (manifest.icons) {
    const has192 = manifest.icons.some(icon => icon.sizes === '192x192');
    const has512 = manifest.icons.some(icon => icon.sizes === '512x512');

    if (!has192) {
      console.error('  ❌ Falta icono 192x192');
      errors++;
    }
    if (!has512) {
      console.error('  ❌ Falta icono 512x512');
      errors++;
    }

    if (has192 && has512) {
      console.log('  ✅ Iconos obligatorios presentes (192x192 y 512x512)');
    }
  }
}

// 2. Verificar Service Worker
console.log('\n2️⃣ Verificando Service Worker...');
const swPath = path.join(__dirname, '../public/sw.js');

if (!fs.existsSync(swPath)) {
  console.error('  ❌ sw.js no existe');
  errors++;
} else {
  console.log('  ✅ sw.js existe');

  const swContent = fs.readFileSync(swPath, 'utf8');

  if (!swContent.includes('CACHE_VERSION')) {
    console.warn('  ⚠️  No se encontró CACHE_VERSION (recomendado para versionado)');
    warnings++;
  }

  if (!swContent.includes('self.addEventListener')) {
    console.error('  ❌ Service Worker mal formado (sin event listeners)');
    errors++;
  } else {
    console.log('  ✅ Service Worker correctamente estructurado');
  }
}

// 3. Verificar iconos
console.log('\n3️⃣ Verificando iconos...');
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  console.error('  ❌ Directorio /public/icons/ no existe');
  errors++;
} else {
  const requiredIcons = ['icon-192x192.svg', 'icon-512x512.svg'];
  requiredIcons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (!fs.existsSync(iconPath)) {
      console.error(`  ❌ ${icon} no existe`);
      errors++;
    } else {
      console.log(`  ✅ ${icon} existe`);
    }
  });
}

// 4. Verificar index.html
console.log('\n4️⃣ Verificando index.html...');
const indexPath = path.join(__dirname, '../index.html');

if (!fs.existsSync(indexPath)) {
  console.error('  ❌ index.html no existe');
  errors++;
} else {
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  if (!indexContent.includes('manifest.json')) {
    console.error('  ❌ index.html no vincula manifest.json');
    errors++;
  } else {
    console.log('  ✅ Manifest vinculado en index.html');
  }

  if (!indexContent.includes('serviceWorker')) {
    console.error('  ❌ Service Worker no registrado en index.html');
    errors++;
  } else {
    console.log('  ✅ Service Worker registrado en index.html');
  }

  if (!indexContent.includes('theme-color')) {
    console.warn('  ⚠️  Meta tag theme-color no encontrado (recomendado)');
    warnings++;
  } else {
    console.log('  ✅ Meta tag theme-color presente');
  }
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN:');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ ¡PWA correctamente configurada! Sin errores ni advertencias.');
  console.log('\n🚀 Puedes probar la PWA ejecutando:');
  console.log('   npm run dev');
  console.log('\n📱 Luego abre DevTools > Application > Manifest');
  process.exit(0);
} else {
  if (errors > 0) {
    console.error(`❌ ${errors} error(es) encontrado(s)`);
  }
  if (warnings > 0) {
    console.warn(`⚠️  ${warnings} advertencia(s)`);
  }

  console.log('\n🔧 Por favor, corrije los errores antes de continuar.');
  process.exit(1);
}
