const pool = require('../database/db');

// Script para copiar assignments de lunes a martes-viernes

async function copiarLunesASemana() {
  try {
    console.log('\n🔄 Copiando asignaciones del lunes 12 de enero a Tue-Fri...\n');

    // 1. Obtener datos del lunes
    const lunesResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      ['2026-01-12']
    );

    if (lunesResult.rows.length === 0) {
      console.error('❌ No se encontró programación para el lunes 12');
      await pool.end();
      return;
    }

    const lunesData = lunesResult.rows[0];
    console.log(`📊 Lunes 12 de enero:`);
    console.log(`   Asignaciones: ${Object.keys(lunesData.assignments_data).length}`);
    console.log(`   Programas: ${lunesData.programs_data.programs.length}\n`);

    // 2. Copiar a martes, miércoles, jueves, viernes
    const fechas = [
      '2026-01-13', // Martes
      '2026-01-14', // Miércoles
      '2026-01-15', // Jueves
      '2026-01-16'  // Viernes
    ];

    for (const fecha of fechas) {
      // Actualizar con assignments y programs del lunes
      await pool.query(
        `UPDATE daily_schedules
         SET assignments_data = $1,
             programs_data = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE date = $3`,
        [
          JSON.stringify(lunesData.assignments_data),
          JSON.stringify(lunesData.programs_data),
          fecha
        ]
      );

      console.log(`✅ ${fecha} actualizado (${Object.keys(lunesData.assignments_data).length} asignaciones)`);
    }

    console.log('\n✅ Semana completa actualizada\n');

    // 3. Verificar
    console.log('📊 Verificación:\n');
    for (const fecha of ['2026-01-12', ...fechas]) {
      const result = await pool.query(
        'SELECT assignments_data FROM daily_schedules WHERE date = $1',
        [fecha]
      );
      const count = Object.keys(result.rows[0].assignments_data).length;
      console.log(`   ${fecha}: ${count} asignaciones`);
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

copiarLunesASemana();
