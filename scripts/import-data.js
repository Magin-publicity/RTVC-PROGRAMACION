// scripts/import-data.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rtvc_scheduling',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function importFromCSV(filename) {
  const filePath = path.join(__dirname, '../data', filename);
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split('\n').slice(1); // Skip header
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [name, area, role, shift, email, phone] = line.split(',');
      
      await client.query(
        'INSERT INTO personnel (name, area, role, current_shift, email, phone) VALUES ($1, $2, $3, $4, $5, $6)',
        [name.trim(), area.trim(), role.trim(), shift.trim(), email.trim(), phone.trim()]
      );
    }
    
    await client.query('COMMIT');
    console.log('✅ Datos importados exitosamente');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Error al importar datos:', e);
  } finally {
    client.release();
    pool.end();
  }
}

// Ejecutar
importFromCSV('personnel.csv');