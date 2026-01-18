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
      SELECT id, name, direccion, barrio, localidad
      FROM personnel
      WHERE id IN (155, 158, 180)
      ORDER BY id
    `);

    console.log('Personas con direcciones no clasificadas:');
    console.log('==========================================\n');

    result.rows.forEach(p => {
      console.log(`${p.name} (ID: ${p.id})`);
      console.log(`  Dirección: ${p.direccion || '(vacío)'}`);
      console.log(`  Barrio: ${p.barrio || '(vacío)'}`);
      console.log(`  Localidad: ${p.localidad || '(vacío)'}`);
      console.log('');
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
