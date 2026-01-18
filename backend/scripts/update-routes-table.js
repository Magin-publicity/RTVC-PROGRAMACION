// Script para agregar columnas de vehículo/conductor a optimized_routes
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function updateRoutesTable() {
  const client = await pool.connect();

  try {
    console.log('🔧 Actualizando tabla optimized_routes...\n');

    // Agregar columnas para información de vehículo directamente en la ruta
    await client.query(`
      ALTER TABLE optimized_routes
      ADD COLUMN IF NOT EXISTS vehicle_plate VARCHAR(20),
      ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50)
    `);

    // Verificar si existe passenger_count (puede no existir en tablas antiguas)
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'optimized_routes'
      AND column_name = 'passenger_count'
    `);

    if (columnCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE optimized_routes
        ADD COLUMN passenger_count INTEGER DEFAULT 0
      `);
      console.log('   - passenger_count (número de pasajeros)');
    }

    console.log('✅ Columnas agregadas a optimized_routes:');
    console.log('   - vehicle_plate (placa del vehículo)');
    console.log('   - driver_name (nombre del conductor)');
    console.log('   - driver_phone (teléfono del conductor)');
    console.log('   - vehicle_type (tipo de vehículo: Van, Duster, etc.)');

    console.log('\n✅ Tabla actualizada exitosamente!');
    console.log('\n📋 Ahora puedes:');
    console.log('   1. Generar rutas SIN necesidad de vehículos asignados');
    console.log('   2. Asignar vehículos/conductores DESPUÉS cuando transporte te los dé');
    console.log('   3. Tener registro completo de qué vehículo cubrió cada ruta');

  } catch (error) {
    console.error('❌ Error actualizando tabla:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateRoutesTable()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
