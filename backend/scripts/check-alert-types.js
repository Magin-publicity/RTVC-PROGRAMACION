const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkAlertTypes() {
  try {
    console.log('🔍 Consultando CHECK constraint de route_alerts...\n');

    // Obtener definición del CHECK constraint
    const constraintResult = await pool.query(`
      SELECT con.conname, pg_get_constraintdef(con.oid) as definition
      FROM pg_constraint con
      WHERE con.conrelid = 'route_alerts'::regclass
      AND con.contype = 'c'
    `);

    console.log('📋 CHECK Constraints encontrados:\n');
    constraintResult.rows.forEach(row => {
      console.log(`Constraint: ${row.conname}`);
      console.log(`Definición: ${row.definition}`);
      console.log('');
    });

    // También verificar estructura de la tabla
    const tableResult = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'route_alerts'
      ORDER BY ordinal_position
    `);

    console.log('📊 Estructura de la tabla route_alerts:\n');
    tableResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''})`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAlertTypes();
