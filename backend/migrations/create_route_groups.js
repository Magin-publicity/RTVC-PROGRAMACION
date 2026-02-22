// migrations/create_route_groups.js
// Tabla para almacenar grupos/plantillas de personal para rutas

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('📦 Creando tabla de grupos de rutas (plantillas)...');

    await client.query('BEGIN');

    // Tabla para grupos/plantillas de personal
    await client.query(`
      CREATE TABLE IF NOT EXISTS route_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        shift_type VARCHAR(10) NOT NULL CHECK (shift_type IN ('AM', 'PM')),
        personnel_ids INTEGER[] NOT NULL DEFAULT '{}',
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabla route_groups creada');

    // Índices para búsqueda eficiente
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_route_groups_shift_type
      ON route_groups(shift_type)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_route_groups_name
      ON route_groups(name)
    `);

    console.log('✅ Índices creados');

    await client.query('COMMIT');
    console.log('✅ Migración completada exitosamente');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
