// Script para ejecutar migración 008_create_travel_events
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('📦 Ejecutando migración 008_create_travel_events...');

    const migrationPath = path.join(__dirname, '../migrations/008_create_travel_events.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migración 008_create_travel_events ejecutada exitosamente');
    console.log('');
    console.log('Tablas creadas:');
    console.log('  - travel_events');
    console.log('  - travel_event_personnel');
    console.log('  - travel_event_equipment');
    console.log('  - travel_event_reliefs');
    console.log('  - travel_events_with_details (vista)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error);
    process.exit(1);
  }
}

runMigration();
