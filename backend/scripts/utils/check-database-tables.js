const pool = require('../config/database');

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas de la base de datos...\n');

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 Tablas en la base de datos:');
    console.table(tables.rows);

    // Ver ejemplo de personnel_rotation si existe
    const hasRotation = tables.rows.find(t => t.table_name.includes('rotation'));
    if (hasRotation) {
      console.log(`\n📊 Datos de ${hasRotation.table_name}:`);
      const data = await pool.query(`SELECT * FROM ${hasRotation.table_name} LIMIT 5`);
      console.table(data.rows);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
