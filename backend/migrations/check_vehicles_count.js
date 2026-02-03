const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkVehicles() {
  try {
    console.log('🚐 Verificando vehículos en la base de datos...\n');

    const result = await pool.query(`
      SELECT
        id,
        vehicle_code,
        status,
        is_active,
        driver_name
      FROM fleet_vehicles
      ORDER BY vehicle_code
    `);

    console.log(`📊 Total de vehículos en DB: ${result.rows.length}\n`);

    result.rows.forEach(v => {
      console.log(`  ${v.vehicle_code.padEnd(15)} | Status: ${v.status.padEnd(12)} | Active: ${v.is_active} | Driver: ${v.driver_name || 'Sin conductor'}`);
    });

    console.log('\n📈 Resumen por status:');
    const byStatus = result.rows.reduce((acc, v) => {
      if (!acc[v.status]) acc[v.status] = 0;
      acc[v.status]++;
      return acc;
    }, {});

    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log(`\n✅ Vehículos activos: ${result.rows.filter(v => v.is_active).length}`);
    console.log(`❌ Vehículos inactivos: ${result.rows.filter(v => !v.is_active).length}`);

    pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkVehicles();
