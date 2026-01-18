const pool = require('./config/database');

async function fixAllTables() {
  try {
    console.log('🔧 Recreando todas las tablas con el esquema correcto...');

    // 1. Eliminar tablas existentes
    await pool.query('DROP TABLE IF EXISTS novelties CASCADE');
    await pool.query('DROP TABLE IF EXISTS schedules CASCADE');
    await pool.query('DROP TABLE IF EXISTS personnel CASCADE');
    console.log('✅ Tablas eliminadas');

    // 2. Crear tabla personnel (coincide con seeds.sql)
    await pool.query(`
      CREATE TABLE personnel (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(150) NOT NULL,
        area VARCHAR(150) NOT NULL,
        current_shift VARCHAR(10),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla personnel creada');

    // 3. Crear índices para personnel
    await pool.query('CREATE INDEX idx_personnel_name ON personnel(name)');
    await pool.query('CREATE INDEX idx_personnel_area ON personnel(area)');
    await pool.query('CREATE INDEX idx_personnel_role ON personnel(role)');
    await pool.query('CREATE INDEX idx_personnel_active ON personnel(active)');
    console.log('✅ Índices de personnel creados');

    // 4. Crear tabla schedules (coincide con seeds.sql)
    await pool.query(`
      CREATE TABLE schedules (
        id SERIAL PRIMARY KEY,
        personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        program VARCHAR(255),
        shift_time VARCHAR(50),
        location VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla schedules creada');

    // 5. Crear tabla novelties (coincide con seeds.sql)
    await pool.query(`
      CREATE TABLE novelties (
        id SERIAL PRIMARY KEY,
        personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(personnel_id, date)
      )
    `);
    console.log('✅ Tabla novelties creada');

    // 6. Crear rotation_config si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rotation_config (
        id SERIAL PRIMARY KEY,
        current_week INTEGER DEFAULT 1,
        week_start_date DATE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      INSERT INTO rotation_config (current_week, week_start_date)
      VALUES (1, CURRENT_DATE)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Tabla rotation_config verificada');

    // 7. Crear rotation_patterns si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rotation_patterns (
        id SERIAL PRIMARY KEY,
        week_number INTEGER NOT NULL,
        area VARCHAR(150) NOT NULL,
        shift_type VARCHAR(50) NOT NULL,
        shift_start TIME NOT NULL,
        shift_end TIME NOT NULL,
        UNIQUE(week_number, area, shift_type)
      )
    `);
    console.log('✅ Tabla rotation_patterns verificada');

    console.log('✨ Todas las tablas recreadas exitosamente');
    console.log('📝 Ahora puedes ejecutar load-seeds.js para cargar el personal');

  } catch (error) {
    console.error('❌ Error recreando tablas:', error);
  } finally {
    await pool.end();
  }
}

fixAllTables();