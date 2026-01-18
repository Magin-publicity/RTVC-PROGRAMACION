const pool = require('../database/db');

async function findAdrian() {
  try {
    const res = await pool.query(
      "SELECT id, name, area FROM personnel WHERE name ILIKE '%adrian%contreras%'"
    );
    console.log('Adrian Contreras:');
    console.log(res.rows);

    // También ver TODOS en CONTRIBUCIONES
    const contrib = await pool.query(
      "SELECT id, name, area FROM personnel WHERE area = 'CONTRIBUCIONES' ORDER BY name"
    );
    console.log('\nTodo el personal de CONTRIBUCIONES:');
    console.log(contrib.rows);

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

findAdrian();
