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
    const migrationPath = path.join(__dirname, '../migrations/005_create_press_dispatch.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔧 Ejecutando migración 005_create_press_dispatch...');

    await pool.query(sql);

    console.log('✅ Migración completada exitosamente');
    console.log('✅ Tabla "fleet_availability" creada');
    console.log('✅ Tabla "press_dispatches" creada');

    await pool.end();
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

runMigration();
