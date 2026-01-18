// Script para ejecutar la migración de dirección, barrio y localidad
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
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando migración: agregar dirección, barrio y localidad...');

    const migrationPath = path.join(__dirname, '../database/migrations/add_direccion_barrio_localidad.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await client.query(migrationSQL);

    console.log('✅ Migración completada exitosamente');
    console.log('📋 Se agregaron las siguientes columnas a la tabla personnel:');
    console.log('   - direccion (VARCHAR 500)');
    console.log('   - barrio (VARCHAR 150)');
    console.log('   - localidad (VARCHAR 150)');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
