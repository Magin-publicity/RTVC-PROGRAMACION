const pool = require('../database/db');

async function limpiarDic26() {
  try {
    console.log('🧹 Eliminando datos del 26 de diciembre...\n');

    const result = await pool.query(
      "DELETE FROM daily_schedules WHERE date = '2025-12-26'"
    );

    console.log(`✅ ${result.rowCount} registro(s) eliminado(s)`);
    console.log('\n📝 Ahora el frontend regenerará automáticamente los datos con Adrian Contreras incluido');
    console.log('   cuando accedas a la fecha 2025-12-26\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

limpiarDic26();
