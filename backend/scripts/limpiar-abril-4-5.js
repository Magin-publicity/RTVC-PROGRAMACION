const pool = require('../config/database');

async function limpiarAbril4y5() {
  try {
    console.log('🔄 Limpiando datos del fin de semana 4-5 de abril 2026...\n');

    const result = await pool.query(
      `DELETE FROM daily_schedules WHERE date IN ($1, $2)`,
      ['2026-04-04', '2026-04-05']
    );

    console.log(`✅ Datos eliminados. Filas afectadas: ${result.rowCount}`);
    console.log('\n📋 Ahora recarga la página y el fin de semana se regenerará correctamente');
    console.log('   ✅ Contribuciones usará la rotación de 3 semanas (2 trabajan, 1 descansa)');

    pool.end();
  } catch (error) {
    console.error('Error:', error);
    pool.end();
  }
}

limpiarAbril4y5();
