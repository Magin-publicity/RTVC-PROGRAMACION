const http = require('http');

// Test: Verificar que la herencia es COMPLETA (sin filtrado)
// El Martes debe tener EXACTAMENTE las mismas asignaciones que el Lunes

const lunes = '2025-12-22';
const martes = '2025-12-23';

function getSchedule(fecha) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/schedule/daily/${fecha}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🔍 TEST: HERENCIA COMPLETA (SIN FILTRADO)');
  console.log('═══════════════════════════════════════════\n');

  const lunesData = await getSchedule(lunes);
  const martesData = await getSchedule(martes);

  console.log(`📅 LUNES ${lunes}:`);
  console.log(`   Total asignaciones: ${Object.keys(lunesData.assignments).length}`);

  console.log(`\n📅 MARTES ${martes}:`);
  console.log(`   Total asignaciones: ${Object.keys(martesData.assignments).length}`);

  // Filtrar solo reportería
  const reporteriaIds = Array.from({length: 32}, (_, i) => (94 + i).toString());

  const lunesReporteria = Object.entries(lunesData.assignments).filter(([key]) => {
    const [personnelId] = key.split('_');
    return reporteriaIds.includes(personnelId);
  });

  const martesReporteria = Object.entries(martesData.assignments).filter(([key]) => {
    const [personnelId] = key.split('_');
    return reporteriaIds.includes(personnelId);
  });

  console.log(`\n📊 ASIGNACIONES DE REPORTERÍA:`);
  console.log(`   Lunes: ${lunesReporteria.length}`);
  console.log(`   Martes: ${martesReporteria.length}`);

  // Verificar si son exactamente iguales
  const lunesKeys = lunesReporteria.map(([k]) => k).sort();
  const martesKeys = martesReporteria.map(([k]) => k).sort();

  const iguales = JSON.stringify(lunesKeys) === JSON.stringify(martesKeys);

  console.log(`\n═══════════════════════════════════════════`);
  if (iguales) {
    console.log('✅ CORRECTO: Martes tiene EXACTAMENTE las mismas');
    console.log('   asignaciones de reportería que Lunes');
    console.log('   (Herencia completa sin filtrado)');
  } else {
    console.log('❌ ERROR: Martes NO tiene las mismas asignaciones');
    console.log(`   Diferencia: ${Math.abs(lunesKeys.length - martesKeys.length)} asignaciones`);

    // Mostrar diferencias
    const soloEnLunes = lunesKeys.filter(k => !martesKeys.includes(k));
    const soloEnMartes = martesKeys.filter(k => !lunesKeys.includes(k));

    if (soloEnLunes.length > 0) {
      console.log(`\n   Solo en Lunes (${soloEnLunes.length}):`);
      soloEnLunes.slice(0, 5).forEach(k => console.log(`     - ${k}`));
      if (soloEnLunes.length > 5) console.log(`     ... y ${soloEnLunes.length - 5} más`);
    }

    if (soloEnMartes.length > 0) {
      console.log(`\n   Solo en Martes (${soloEnMartes.length}):`);
      soloEnMartes.slice(0, 5).forEach(k => console.log(`     - ${k}`));
      if (soloEnMartes.length > 5) console.log(`     ... y ${soloEnMartes.length - 5} más`);
    }
  }
  console.log('═══════════════════════════════════════════\n');
}

test().catch(console.error);
