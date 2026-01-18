const pool = require('../config/database');

async function testPersistence() {
  try {
    const testDate = '2026-01-07';

    console.log('📋 PASO 1: Ver datos actuales en BD');
    const current = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      [testDate]
    );

    if (current.rows.length === 0) {
      console.log('❌ No hay datos para 2026-01-07');
      process.exit(1);
    }

    const currentAssignments = current.rows[0].assignments_data;
    console.log('   Total asignaciones:', Object.keys(currentAssignments).length);
    console.log('   Primera asignación:', Object.keys(currentAssignments)[0], '=', currentAssignments[Object.keys(currentAssignments)[0]]);

    console.log('\n🔧 PASO 2: Agregar UNA asignación de prueba (999_999 = true)');
    const testAssignments = { ...currentAssignments, '999_999': true };

    await pool.query(
      `UPDATE daily_schedules
       SET assignments_data = $1, updated_at = CURRENT_TIMESTAMP
       WHERE date = $2`,
      [JSON.stringify(testAssignments), testDate]
    );
    console.log('   ✅ Guardado en BD');

    console.log('\n📋 PASO 3: Verificar que se guardó');
    const saved = await pool.query(
      'SELECT assignments_data FROM daily_schedules WHERE date = $1',
      [testDate]
    );

    const savedAssignments = saved.rows[0].assignments_data;
    console.log('   Total asignaciones:', Object.keys(savedAssignments).length);
    console.log('   ¿Tiene 999_999?', savedAssignments['999_999'] === true ? '✅ SÍ' : '❌ NO');

    console.log('\n🌐 PASO 4: Consultar API GET');
    const http = require('http');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/schedule/daily/2026-01-07',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const response = JSON.parse(data);
        console.log('   Total asignaciones en API:', Object.keys(response.assignments).length);
        console.log('   ¿API tiene 999_999?', response.assignments['999_999'] === true ? '✅ SÍ' : '❌ NO');

        if (response.assignments['999_999'] === true) {
          console.log('\n✅✅✅ ÉXITO: El cambio persiste desde BD hasta API');
        } else {
          console.log('\n❌❌❌ ERROR: El cambio NO llega a la API');
          console.log('Primeras 10 asignaciones de API:', Object.keys(response.assignments).slice(0, 10));
        }

        pool.end();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error consultando API:', error);
      pool.end();
    });

    req.end();

  } catch (error) {
    console.error('❌ Error:', error);
    pool.end();
  }
}

testPersistence();
