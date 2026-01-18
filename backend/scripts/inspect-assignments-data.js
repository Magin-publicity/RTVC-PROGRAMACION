const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function inspectAssignmentsData() {
  console.log('='.repeat(80));
  console.log('INSPECCIÓN DE assignments_data PARA MARTES 13 DE ENERO');
  console.log('='.repeat(80));

  try {
    const testDate = '2026-01-13';

    const result = await pool.query(`
      SELECT date, assignments_data, programs_data
      FROM daily_schedules
      WHERE date = $1
    `, [testDate]);

    if (result.rows.length === 0) {
      console.log(`\n⚠️  No hay datos para ${testDate}`);
      return;
    }

    const row = result.rows[0];
    const assignmentsData = row.assignments_data;

    console.log(`\n📅 Fecha: ${row.date}`);
    console.log('\n📋 ESTRUCTURA DE assignments_data:');
    console.log('─'.repeat(80));

    // Mostrar estructura completa del JSON
    console.log('\nJSON completo (formateado):');
    console.log(JSON.stringify(assignmentsData, null, 2));

    // Analizar la estructura
    console.log('\n\n🔍 ANÁLISIS DE LA ESTRUCTURA:');
    console.log('─'.repeat(80));

    if (Array.isArray(assignmentsData)) {
      console.log(`\n✓ Es un array con ${assignmentsData.length} elementos`);

      if (assignmentsData.length > 0) {
        console.log('\nPrimer elemento:');
        console.log(JSON.stringify(assignmentsData[0], null, 2));
      }
    } else if (typeof assignmentsData === 'object') {
      console.log('\n✓ Es un objeto con las siguientes claves:');
      Object.keys(assignmentsData).forEach(key => {
        const value = assignmentsData[key];
        if (Array.isArray(value)) {
          console.log(`  • ${key}: Array con ${value.length} elementos`);
          if (value.length > 0) {
            console.log(`    Ejemplo de elemento:`);
            console.log(`    ${JSON.stringify(value[0], null, 2).split('\n').join('\n    ')}`);
          }
        } else if (typeof value === 'object') {
          console.log(`  • ${key}: Objeto con claves: ${Object.keys(value).join(', ')}`);
        } else {
          console.log(`  • ${key}: ${typeof value} = ${value}`);
        }
      });
    }

    // Buscar información de turno AM (05:00)
    console.log('\n\n🔍 BUSCANDO PERSONAL DEL TURNO AM (05:00):');
    console.log('─'.repeat(80));

    // Estrategia 1: Si es un array, buscar por hora_inicio
    if (Array.isArray(assignmentsData)) {
      const amPersonnel = assignmentsData.filter(p => {
        return p.hora_inicio === '05:00:00' || p.hora_inicio === '05:00';
      });

      console.log(`\n✓ Personal con hora_inicio 05:00: ${amPersonnel.length} personas`);

      if (amPersonnel.length > 0) {
        console.log('\nPrimeras 3 personas:');
        amPersonnel.slice(0, 3).forEach((p, idx) => {
          console.log(`\n  ${idx + 1}. ${p.nombre || p.name || p.personnel_name || 'Sin nombre'}`);
          console.log(`     Claves disponibles: ${Object.keys(p).join(', ')}`);
        });
      }
    }
    // Estrategia 2: Si es un objeto con claves por turno
    else if (typeof assignmentsData === 'object') {
      const possibleKeys = ['AM', 'am', 'turno_am', 'shift_am', '05:00'];

      for (const key of possibleKeys) {
        if (assignmentsData[key]) {
          console.log(`\n✓ Encontrada clave '${key}' con datos`);
          const data = assignmentsData[key];

          if (Array.isArray(data)) {
            console.log(`   Array con ${data.length} elementos`);
            if (data.length > 0) {
              console.log('\n   Primeras 3 personas:');
              data.slice(0, 3).forEach((p, idx) => {
                console.log(`\n     ${idx + 1}. ${p.nombre || p.name || p.personnel_name || 'Sin nombre'}`);
                console.log(`        Claves: ${Object.keys(p).join(', ')}`);
              });
            }
          }
        }
      }
    }

    console.log('\n\n💡 RECOMENDACIÓN PARA LA QUERY:');
    console.log('─'.repeat(80));
    console.log('\nBasado en la estructura encontrada, la query debería ser algo como:');
    console.log('\nSELECT ...');
    console.log('FROM daily_schedules');
    console.log('WHERE date = $1');
    console.log('-- Y luego extraer del JSON según la estructura encontrada');

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

inspectAssignmentsData();
