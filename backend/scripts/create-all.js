const { Client } = require('pg');

async function createDatabase() {
  // First connect to postgres default database
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'Padres2023',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL...');
    
    // Check if database exists
    const checkDB = await client.query(
      "SELECT 1 FROM pg_database WHERE datname='rtvc_scheduling'"
    );
    
    if (checkDB.rowCount === 0) {
      console.log('Creating database rtvc_scheduling...');
      await client.query('CREATE DATABASE rtvc_scheduling');
      console.log('✅ Database created!');
    } else {
      console.log('✅ Database already exists');
    }
    
    await client.end();
    
    // Now connect to the new database and create tables
    const dbClient = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'rtvc_scheduling',
      password: 'Padres2023',
      port: 5432,
    });
    
    await dbClient.connect();
    console.log('Connected to rtvc_scheduling database...');
    
    // Create tables
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS personnel (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        area VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table personnel created');

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        shift_time VARCHAR(100) NOT NULL,
        program VARCHAR(255),
        location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(personnel_id, date)
      );
    `);
    console.log('✅ Table schedules created');

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS novelties (
        id SERIAL PRIMARY KEY,
        personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table novelties created');
    
    await dbClient.end();
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();
