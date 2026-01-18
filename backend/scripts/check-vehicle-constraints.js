const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function check() {
  try {
    const result = await pool.query(`
      SELECT con.conname, pg_get_constraintdef(con.oid) as definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'fleet_vehicles'
    `);

    console.log('Restricciones en fleet_vehicles:');
    console.log('='.repeat(60));
    result.rows.forEach(row => {
      console.log(`\n${row.conname}:`);
      console.log(`  ${row.definition}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
