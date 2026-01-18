const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkPersonnelTypes() {
  try {
    console.log('📊 Consultando tipos de personal en la base de datos...\n');

    // Consultar tipos de personal
    const typesResult = await pool.query(
      `SELECT DISTINCT tipo_personal, COUNT(*) as count
       FROM personnel
       WHERE active = true
       GROUP BY tipo_personal
       ORDER BY tipo_personal`
    );

    console.log('Tipos de personal:');
    typesResult.rows.forEach(row => {
      console.log(`  - ${row.tipo_personal}: ${row.count} personas`);
    });

    console.log('\n');

    // Consultar algunos ejemplos de personal logístico
    const logisticResult = await pool.query(
      `SELECT name, area, direccion, localidad, barrio
       FROM personnel
       WHERE active = true AND tipo_personal = 'LOGISTICO'
       LIMIT 10`
    );

    console.log('Ejemplos de Personal Logístico:');
    logisticResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.area || 'Sin área'}) - ${row.localidad || row.barrio || 'Sin localidad'}`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkPersonnelTypes();
