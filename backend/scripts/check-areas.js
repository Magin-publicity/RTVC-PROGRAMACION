const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkAreas() {
  try {
    // Verificar estructura de la tabla
    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'personnel'
      ORDER BY ordinal_position
    `);

    console.log('\n=== Columnas de la tabla personnel ===');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    // Áreas disponibles
    const result = await pool.query(`
      SELECT DISTINCT area
      FROM personnel
      ORDER BY area
    `);

    console.log('\n=== Áreas disponibles ===');
    result.rows.forEach(row => {
      console.log(`  - ${row.area}`);
    });

    // Verificar si hay periodistas
    const journalists = await pool.query(`
      SELECT *
      FROM personnel
      WHERE area = 'PERIODISTAS'
      LIMIT 1
    `);
    console.log(`\n📰 Ejemplo de periodista:`, journalists.rows[0]);

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAreas();
