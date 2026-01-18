const pool = require('../database/db');

async function checkAdrianStatus() {
  try {
    const res = await pool.query(
      "SELECT id, name, area, active, is_available, unavailability_start_date, unavailability_end_date FROM personnel WHERE name ILIKE '%adrian%contreras%'"
    );

    console.log('📋 Estado de Adrian Contreras:');
    console.log(JSON.stringify(res.rows, null, 2));

    // También verificar qué devuelve la query completa de personal para 2025-12-26
    const date = '2025-12-26';
    const allPersonnel = await pool.query(`
      SELECT id, name, area, active, is_available FROM personnel
      WHERE active = true
      AND (
        is_available = true
        OR is_available IS NULL
        OR (unavailability_start_date IS NOT NULL AND unavailability_end_date IS NOT NULL
            AND NOT ($1::date BETWEEN unavailability_start_date AND unavailability_end_date))
      )
      AND area = 'CONTRIBUCIONES'
      ORDER BY area, name
    `, [date]);

    console.log(`\n✅ Personal de CONTRIBUCIONES disponible para ${date}:`);
    console.log(JSON.stringify(allPersonnel.rows, null, 2));

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkAdrianStatus();
