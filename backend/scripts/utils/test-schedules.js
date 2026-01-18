const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function test() {
  await client.connect();
  
  const result = await client.query(`
    SELECT s.*, p.name, p.area, p.role
    FROM schedules s
    JOIN personnel p ON s.personnel_id = p.id
    WHERE s.date = '2025-12-04'
    ORDER BY p.name
  `);
  
  console.log('Schedules for Dec 4, 2025:');
  result.rows.forEach(r => {
    console.log(`  ${r.name} (${r.area}) - ${r.shift_time} - ${r.program}`);
  });
  
  await client.end();
}

test().catch(console.error);
