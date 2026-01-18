const pool = require('./config/database');

async function fixPersonnelSchema() {
  try {
    console.log('🔧 Actualizando esquema de la tabla personnel...');

    // 1. Eliminar la tabla personnel existente
    await pool.query('DROP TABLE IF EXISTS personnel CASCADE');
    console.log('✅ Tabla personnel eliminada');

    // 2. Crear la tabla personnel con las columnas correctas que espera seeds.sql
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
    console.log('✅ Tabla personnel creada con nuevo esquema');

    // 3. Crear índices
    await pool.query('CREATE INDEX idx_personnel_name ON personnel(name)');
    await pool.query('CREATE INDEX idx_personnel_area ON personnel(area)');
    await pool.query('CREATE INDEX idx_personnel_role ON personnel(role)');
    await pool.query('CREATE INDEX idx_personnel_active ON personnel(active)');
    console.log('✅ Índices creados');

    // 4. Actualizar la tabla novelties para que use personnel_id correctamente
    await pool.query('DROP TABLE IF EXISTS novelties CASCADE');
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
    console.log('✅ Tabla novelties recreada');

    // 5. Actualizar la tabla schedules para que use date en vez de fecha
    await pool.query('DROP TABLE IF EXISTS schedules CASCADE');
    await pool.query(`
      CREATE TABLE schedules (
        id SERIAL PRIMARY KEY,
        personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        shift_start TIME NOT NULL,
        shift_end TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla schedules recreada');

    console.log('✨ Esquema actualizado exitosamente');
    console.log('📝 Ahora puedes ejecutar seeds.sql para cargar el personal');

  } catch (error) {
    console.error('❌ Error actualizando esquema:', error);
  } finally {
    await pool.end();
  }
}

fixPersonnelSchema();
