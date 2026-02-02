const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rtvc_scheduling',
  password: process.env.DB_PASSWORD || 'Padres2023',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log('📦 Ejecutando migración 012...');

    const sql = fs.readFileSync(
      path.join(__dirname, '012_create_fleet_dispatches_view.sql'),
      'utf8'
    );

    await pool.query(sql);

    console.log('✅ Migración 012 ejecutada exitosamente');
    console.log('✅ Vista fleet_dispatches creada');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();
