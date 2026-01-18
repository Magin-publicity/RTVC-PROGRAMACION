const pool = require('../config/database');

async function checkNovelties() {
  try {
    console.log('Checking novelties table...\n');

    // Count
    const countResult = await pool.query('SELECT COUNT(*) FROM novelties');
    console.log(`Total novelties: ${countResult.rows[0].count}\n`);

    // Get all novelties
    const result = await pool.query(`
      SELECT
        n.id,
        n.personnel_id,
        n.date,
        n.start_date,
        n.end_date,
        n.type,
        n.description,
        p.name AS personnel_name,
        p.area,
        p.role
      FROM novelties n
      LEFT JOIN personnel p ON n.personnel_id = p.id
      ORDER BY COALESCE(n.start_date, n.date) DESC
      LIMIT 5
    `);

    console.log('Sample novelties:');
    console.table(result.rows);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkNovelties();
