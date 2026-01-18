const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function checkPersonnel() {
  const names = [
    'Carlos Wilches',
    'Ramiro Balaguera',
    'Victor Vargas',
    'Cesar Morales',
    'Brayan Munera',
    'Jhonatan Andres Ramirez'
  ];

  for (const name of names) {
    const result = await pool.query(
      'SELECT id, name, area, active FROM personnel WHERE name = $1',
      [name]
    );

    if (result.rows.length > 0) {
      console.log(`✅ ${name}: ID=${result.rows[0].id}, Area=${result.rows[0].area}, Active=${result.rows[0].active}`);
    } else {
      console.log(`❌ ${name}: NO EXISTE EN LA BD`);
    }
  }

  await pool.end();
}

checkPersonnel();
