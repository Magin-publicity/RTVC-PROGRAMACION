const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function loadSeeds() {
  try {
    console.log('📥 Cargando datos desde seeds.sql...');

    // Read the seeds.sql file
    const seedsPath = path.join(__dirname, 'database', 'seeds.sql');
    const seedsSQL = fs.readFileSync(seedsPath, 'utf8');

    // Execute the SQL file
    await pool.query(seedsSQL);

    console.log('✅ Datos cargados exitosamente');

    // Check how many personnel were inserted
    const result = await pool.query('SELECT COUNT(*) FROM personnel');
    console.log(`📊 Total de personal en la base de datos: ${result.rows[0].count}`);

    // Show sample of areas
    const areas = await pool.query('SELECT DISTINCT area FROM personnel ORDER BY area');
    console.log(`📋 Áreas encontradas: ${areas.rows.map(r => r.area).join(', ')}`);

  } catch (error) {
    console.error('❌ Error cargando seeds:', error);
  } finally {
    await pool.end();
  }
}

loadSeeds();
