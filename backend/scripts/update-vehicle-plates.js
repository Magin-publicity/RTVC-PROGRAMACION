const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

const plates = {
  'V-001': 'ABC-123',
  'V-002': 'DEF-456',
  'V-003': 'GHI-789',
  'V-004': 'JKL-012',
  'V-005': 'MNO-345',
  'CAM-001': 'PQR-678',
  'CAM-002': 'STU-901',
  'CAM-003': 'VWX-234',
  'CAM-004': 'YZA-567',
  'AUTO-001': 'BCD-890',
};

async function updatePlates() {
  try {
    console.log('🔧 Actualizando placas de vehículos...\n');

    for (const [code, plate] of Object.entries(plates)) {
      await pool.query(
        'UPDATE fleet_vehicles SET plate = $1 WHERE vehicle_code = $2',
        [plate, code]
      );
      console.log(`✅ ${code} → ${plate}`);
    }

    console.log('\n✅ Placas actualizadas exitosamente');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePlates();
