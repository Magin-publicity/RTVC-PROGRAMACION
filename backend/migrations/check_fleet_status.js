const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkStatusConstraint() {
  try {
    console.log('🔍 Verificando restricción de status en fleet_vehicles...');

    const result = await pool.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'fleet_vehicles'::regclass
      AND contype = 'c'
      AND conname LIKE '%status%';
    `);

    console.log('📋 Restricciones encontradas:');
    result.rows.forEach(row => {
      console.log(`\n  Nombre: ${row.conname}`);
      console.log(`  Definición: ${row.definition}`);
    });

    pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkStatusConstraint();
