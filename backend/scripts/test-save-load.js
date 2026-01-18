const pool = require('../config/database');

async function testSaveLoad() {
  try {
    const testDate = '2026-01-07';

    console.log('🔍 PRUEBA DE GUARDADO Y CARGA\n');

    // 1. Ver qué hay guardado AHORA
    console.log('1️⃣ Consultando datos actuales...');
    const current = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [testDate]
    );

    if (current.rows.length > 0) {
      const data = current.rows[0];
      const assignments = data.assignments_data || {};
      const programsData = data.programs_data || {};

      console.log('   ✅ Datos encontrados:');
      console.log('   - Asignaciones:', Object.keys(assignments).length);
      console.log('   - CallTimes:', Object.keys(programsData.callTimes || {}).length);
      console.log('   - Programas:', (programsData.programs || []).length);
      console.log('   - Shifts:', (programsData.shifts || []).length);

      console.log('\n   📋 Primeras 5 asignaciones guardadas:');
      Object.keys(assignments).slice(0, 5).forEach(key => {
        console.log(`      ${key} = ${assignments[key]}`);
      });

      console.log('\n   ⏰ Primeros 5 callTimes guardados:');
      const callTimes = programsData.callTimes || {};
      Object.keys(callTimes).slice(0, 5).forEach(key => {
        console.log(`      Person ${key} → ${callTimes[key]}`);
      });
    } else {
      console.log('   ❌ No hay datos guardados');
    }

    // 2. Simular un cambio: agregar una asignación de prueba
    console.log('\n2️⃣ Simulando guardado con cambio...');

    if (current.rows.length > 0) {
      const data = current.rows[0];
      const assignments = data.assignments_data || {};
      const programsData = data.programs_data || {};

      // Agregar una asignación de prueba
      assignments['999_999'] = true;

      await pool.query(
        `UPDATE daily_schedules
         SET assignments_data = $1,
             programs_data = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE date = $3`,
        [JSON.stringify(assignments), JSON.stringify(programsData), testDate]
      );

      console.log('   ✅ Guardado con asignación de prueba 999_999');
    }

    // 3. Volver a cargar y verificar
    console.log('\n3️⃣ Recargando datos...');
    const reloaded = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      [testDate]
    );

    if (reloaded.rows.length > 0) {
      const assignments = reloaded.rows[0].assignments_data || {};
      console.log('   ✅ Datos recargados:');
      console.log('   - Asignaciones:', Object.keys(assignments).length);
      console.log('   - Tiene 999_999?', assignments['999_999'] ? 'SÍ ✅' : 'NO ❌');
    }

    // 4. Limpiar la prueba
    console.log('\n4️⃣ Limpiando asignación de prueba...');
    if (current.rows.length > 0) {
      const data = current.rows[0];
      const assignments = data.assignments_data || {};
      const programsData = data.programs_data || {};

      delete assignments['999_999'];

      await pool.query(
        `UPDATE daily_schedules
         SET assignments_data = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE date = $2`,
        [JSON.stringify(assignments), testDate]
      );

      console.log('   ✅ Limpieza completada');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSaveLoad();
