// Script para ejecutar la migración de tablas de asignaciones
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
    console.log('🔄 Ejecutando migración de tablas de asignaciones...');

    const migrationPath = path.join(__dirname, '../database/migrations/create-assignment-tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(migrationSQL);

    console.log('✅ Migración completada exitosamente');
    console.log('📋 Tablas creadas:');
    console.log('   - asignaciones_reporteria');
    console.log('   - asignaciones_realizadores');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();
