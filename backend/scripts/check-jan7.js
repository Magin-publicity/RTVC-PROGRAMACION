const pool = require('../config/database');

async function checkJan7() {
  try {
    console.log('🔍 Verificando estructura de tabla y datos...\n');

    // Primero ver la estructura
    const structure = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'daily_schedules'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estructura de la tabla daily_schedules:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n🔍 Verificando datos para 2026-01-07...\n');

    const result = await pool.query(
      'SELECT * FROM daily_schedules WHERE date = $1',
      ['2026-01-07']
    );

    if (result.rows.length === 0) {
      console.log('❌ No hay datos guardados para 2026-01-07');
    } else {
      const data = result.rows[0];
      console.log('✅ Datos encontrados para 2026-01-07:');
      console.log('   Fecha:', data.date);
      console.log('   Datos completos:', JSON.stringify(data, null, 2).substring(0, 500));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkJan7();
