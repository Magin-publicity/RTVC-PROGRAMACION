const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

const vehicles = [
  { code: 'V-001', type: 'Van', capacity: 12, plate: 'ABC-123', driver: 'Carlos Rodríguez', phone: '3001234567' },
  { code: 'V-002', type: 'Van', capacity: 12, plate: 'DEF-456', driver: 'Luis Martínez', phone: '3009876543' },
  { code: 'V-003', type: 'Van', capacity: 12, plate: 'GHI-789', driver: 'Pedro Sánchez', phone: '3005551234' },
  { code: 'V-004', type: 'Van', capacity: 12, plate: 'JKL-012', driver: 'Miguel Torres', phone: '3007778888' },
  { code: 'V-005', type: 'Van', capacity: 12, plate: 'MNO-345', driver: 'Andrés López', phone: '3004445555' },
  { code: 'CAM-001', type: 'Camioneta', capacity: 5, plate: 'PQR-678', driver: 'Jorge Ramírez', phone: '3002223333' },
  { code: 'CAM-002', type: 'Camioneta', capacity: 5, plate: 'STU-901', driver: 'Ricardo Gómez', phone: '3006667777' },
  { code: 'CAM-003', type: 'Camioneta', capacity: 5, plate: 'VWX-234', driver: 'Fernando Díaz', phone: '3008889999' },
  { code: 'CAM-004', type: 'Camioneta', capacity: 5, plate: 'YZA-567', driver: 'Alberto Ruiz', phone: '3003334444' },
  { code: 'AUTO-001', type: 'Automóvil', capacity: 4, plate: 'BCD-890', driver: 'Santiago Castro', phone: '3001112222' },
];

async function seedVehicles() {
  try {
    console.log('🚗 Insertando vehículos en fleet_vehicles...\n');

    for (const v of vehicles) {
      const result = await pool.query(
        `INSERT INTO fleet_vehicles (vehicle_code, vehicle_type, capacity, driver_name, driver_phone, status, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (vehicle_code) DO NOTHING
         RETURNING id`,
        [v.code, v.type, v.capacity, v.driver, v.phone, 'AVAILABLE', true]
      );

      if (result.rows.length > 0) {
        console.log(`✅ ${v.code} - ${v.type} (${v.plate}) - ${v.driver}`);
      }
    }

    console.log(`\n✅ ${vehicles.length} vehículos insertados exitosamente`);
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedVehicles();
