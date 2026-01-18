const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function runMigration() {
  console.log('='.repeat(80));
  console.log('EJECUTANDO MIGRACIÓN: MÓDULO DE GESTIÓN DE RUTAS Y REPORTERÍA');
  console.log('='.repeat(80));

  try {
    const migrationPath = path.join(__dirname, '../database/migrations/create_routes_module.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📄 Leyendo archivo de migración...');
    console.log(`   Ubicación: ${migrationPath}`);

    console.log('\n🚀 Ejecutando migración...');
    await pool.query(sql);

    console.log('\n✅ Migración completada exitosamente');

    // Verificar tablas creadas
    console.log('\n📊 Verificando tablas creadas:');
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (
        'daily_transport_assignments',
        'optimized_routes',
        'fleet_vehicles',
        'address_geocoding_cache',
        'distance_matrix_cache',
        'route_alerts',
        'routes_configuration'
      )
      ORDER BY table_name
    `);

    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verificar configuración inicial
    console.log('\n⚙️  Configuración inicial:');
    const config = await pool.query('SELECT * FROM routes_configuration ORDER BY config_key');
    config.rows.forEach(row => {
      console.log(`   ${row.config_key}: ${row.config_value}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('MIGRACIÓN COMPLETADA - El módulo de rutas está listo para usar');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ ERROR en la migración:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
