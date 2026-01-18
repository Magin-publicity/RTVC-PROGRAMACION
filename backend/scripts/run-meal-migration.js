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
    console.log('🚀 Iniciando migración de tablas de alimentación...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../migrations/create-meal-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar la migración
    await pool.query(sql);

    console.log('✅ Migración completada exitosamente\n');

    // Verificar que las tablas se crearon
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('meal_services', 'meal_requests')
      ORDER BY table_name
    `);

    console.log('📋 Tablas creadas:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Verificar servicios insertados
    const services = await pool.query('SELECT * FROM meal_services ORDER BY id');
    console.log('\n🍽️  Servicios disponibles:');
    services.rows.forEach(service => {
      console.log(`  ${service.id}. ${service.service_name} - ${service.service_time} - ${service.description}`);
    });

    console.log('\n✨ Sistema de Gestión de Alimentación listo para usar!\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
