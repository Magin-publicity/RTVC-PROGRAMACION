const pool = require('../config/database');

async function checkAreas() {
  const result = await pool.query(`
    SELECT area, COUNT(*) as total
    FROM personnel
    WHERE active = true
    GROUP BY area
    HAVING COUNT(*) = 6
    ORDER BY area
  `);

  console.log('\n📊 Áreas con exactamente 6 personas:\n');
  result.rows.forEach(row => {
    console.log(`   ${row.area}: ${row.total} personas`);
  });

  console.log('\n');

  await pool.end();
}

checkAreas();
