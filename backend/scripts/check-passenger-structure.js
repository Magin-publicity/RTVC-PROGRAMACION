const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function check() {
  try {
    const result = await pool.query(`
      SELECT id, route_number, passengers
      FROM optimized_routes
      WHERE date = '2026-01-12' AND shift_type = 'AM'
      ORDER BY route_number
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const route = result.rows[0];
      console.log('Ruta:', route.route_number);
      console.log('Pasajeros:', JSON.stringify(route.passengers, null, 2));

      if (route.passengers && route.passengers.length > 0) {
        console.log('\nCampos del primer pasajero:');
        console.log(Object.keys(route.passengers[0]));
      }
    } else {
      console.log('No hay rutas para 2026-01-12 AM');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
