// scripts/seed-test-data.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rtvc_scheduling',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function seedTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Crear datos de prueba para novedades
    const personnel = await client.query('SELECT id FROM personnel LIMIT 5');
    
    for (const person of personnel.rows) {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 7));
      
      const types = ['VIAJE', 'PERMISO', 'DISPONIBLE', 'REDACCION'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      await client.query(
        'INSERT INTO novelties (personnel_id, date, type, description) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [person.id, date.toISOString().split('T')[0], type, `Novedad de prueba para ${type}`]
      );
    }
    
    await client.query('COMMIT');
    console.log('✅ Datos de prueba creados exitosamente');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear datos de prueba:', e);
  } finally {
    client.release();
    pool.end();
  }
}

seedTestData();