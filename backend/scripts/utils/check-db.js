const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function checkDB() {
  try {
    await client.connect();

    // Check personnel columns
    const cols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'personnel'
      ORDER BY ordinal_position
    `);

    console.log('\n=== Personnel Table Columns ===');
    cols.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });

    // Check novelties columns
    const novCols = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'novelties'
      ORDER BY ordinal_position
    `);

    console.log('\n=== Novelties Table Columns ===');
    novCols.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });

    // Count data
    const pCount = await client.query('SELECT COUNT(*) FROM personnel');
    const nCount = await client.query('SELECT COUNT(*) FROM novelties');

    console.log(`\n=== Data Count ===`);
    console.log(`Personnel: ${pCount.rows[0].count}`);
    console.log(`Novelties: ${nCount.rows[0].count}`);

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDB();
