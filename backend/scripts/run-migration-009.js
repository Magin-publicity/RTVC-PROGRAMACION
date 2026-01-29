// Script para ejecutar migración 009_update_travel_events_dates
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('📦 Ejecutando migración 009_update_travel_events_dates...');

    const migrationPath = path.join(__dirname, '../migrations/009_update_travel_events_dates.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migración 009_update_travel_events_dates ejecutada exitosamente');
    console.log('');
    console.log('Cambios aplicados:');
    console.log('  - Columna "date" renombrada a "start_date" y "end_date"');
    console.log('  - Índices actualizados');
    console.log('  - Vista travel_events_with_details recreada');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error);
    process.exit(1);
  }
}

runMigration();
