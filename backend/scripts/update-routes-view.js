// Script para actualizar vista v_daily_routes con columnas de vehículo
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function updateRoutesView() {
  const client = await pool.connect();

  try {
    console.log('🔧 Actualizando vista v_daily_routes...\n');

    // Eliminar vista anterior
    await client.query('DROP VIEW IF EXISTS v_daily_routes CASCADE');

    // Crear vista actualizada con información de vehículos
    await client.query(`
      CREATE OR REPLACE VIEW v_daily_routes AS
      SELECT
        r.id as route_id,
        r.date,
        r.shift_type,
        r.route_number,
        r.zone,
        r.vehicle_plate,
        r.driver_name,
        r.driver_phone,
        r.vehicle_type,
        r.total_distance_km,
        r.estimated_duration_minutes,
        r.passenger_count,
        r.status,
        r.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'name', t.personnel_name,
              'address', t.direccion,
              'pickup_order', t.pickup_order,
              'program_title', t.program_title
            ) ORDER BY t.pickup_order
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as passengers,
        r.passenger_count as total_passengers
      FROM optimized_routes r
      LEFT JOIN daily_transport_assignments t ON r.id = t.route_id
      GROUP BY
        r.id, r.date, r.shift_type, r.route_number, r.zone,
        r.vehicle_plate, r.driver_name, r.driver_phone, r.vehicle_type,
        r.total_distance_km, r.estimated_duration_minutes,
        r.passenger_count, r.status, r.created_at
    `);

    console.log('✅ Vista v_daily_routes actualizada exitosamente!');
    console.log('\n📋 Ahora la vista incluye:');
    console.log('   - vehicle_plate (placa del vehículo asignado)');
    console.log('   - driver_name (nombre del conductor)');
    console.log('   - driver_phone (teléfono del conductor)');
    console.log('   - vehicle_type (tipo de vehículo)');

  } catch (error) {
    console.error('❌ Error actualizando vista:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateRoutesView()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
