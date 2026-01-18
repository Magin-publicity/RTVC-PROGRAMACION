const pool = require('../database/db');

async function checkTableStructure() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'asignaciones_reporteria'
      ORDER BY ordinal_position
    `);

    console.log('📋 Estructura de asignaciones_reporteria:');
    res.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkTableStructure();
