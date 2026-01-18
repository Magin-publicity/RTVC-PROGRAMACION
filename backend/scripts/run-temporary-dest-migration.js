const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../migrations/006_add_temporary_destinations.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔧 Ejecutando migración 006_add_temporary_destinations...');

    await pool.query(sql);

    console.log('✅ Migración completada exitosamente');
    console.log('✅ Columnas de destino temporal agregadas a daily_transport_assignments');
    console.log('✅ Tabla "emergency_addresses" creada');

    await pool.end();
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

runMigration();
