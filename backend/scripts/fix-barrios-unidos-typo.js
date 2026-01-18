const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function fixBarriosUnidosTypo() {
  const client = await pool.connect();

  try {
    console.log('🔧 Corrigiendo typo "Barrios Unido" → "Barrios Unidos"...\n');

    await client.query('BEGIN');

    // Actualizar en personnel
    const result = await client.query(
      `UPDATE personnel
       SET localidad = 'Barrios Unidos'
       WHERE localidad = 'Barrios Unido'`
    );

    console.log(`✅ Actualizado ${result.rowCount} registro(s) en personnel`);

    await client.query('COMMIT');
    console.log('✅ Corrección completada');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixBarriosUnidosTypo().catch(err => {
  console.error(err);
  process.exit(1);
});
