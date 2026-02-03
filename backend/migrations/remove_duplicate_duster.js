const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function removeDuplicate() {
  try {
    console.log('🔧 Desactivando vehículo duplicado DUSTER - 01...');

    // Desactivar "DUSTER - 01" (el que tiene guion)
    const result = await pool.query(`
      UPDATE fleet_vehicles
      SET is_active = false
      WHERE vehicle_code = 'DUSTER - 01'
      RETURNING *
    `);

    if (result.rows.length > 0) {
      console.log('✅ Vehículo desactivado:', result.rows[0].vehicle_code);
      console.log('   Conductor:', result.rows[0].driver_name);
    } else {
      console.log('⚠️ No se encontró el vehículo DUSTER - 01');
    }

    // Verificar conteo final
    const count = await pool.query(`
      SELECT COUNT(*) as total
      FROM fleet_vehicles
      WHERE is_active = true
    `);

    console.log(`\n📊 Total de vehículos activos ahora: ${count.rows[0].total}`);

    pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeDuplicate();
