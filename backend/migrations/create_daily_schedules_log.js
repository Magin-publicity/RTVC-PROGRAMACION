/**
 * Migración: Crear tabla daily_schedules_log para persistencia histórica
 *
 * Esta tabla almacena "fotografías" inmutables de la programación diaria.
 * Cada vez que el usuario presiona "Guardar", se crea un registro histórico
 * que incluye:
 * - Personal asignado a cada programa
 * - Horas de entrada/salida
 * - Novedades del día (incapacidades, permisos, etc.)
 *
 * Al navegar por el calendario, el sistema prioriza datos guardados sobre
 * la rotación automática o el estado actual de novedades.
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'rtvc_scheduling',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Padres2023',
});

async function migrate() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Creando tabla daily_schedules_log...');

    // Crear tabla para almacenar el log histórico de programación diaria
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_schedules_log (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        assignments_data JSONB NOT NULL,
        programs JSONB,
        novelties_snapshot JSONB,
        saved_by VARCHAR(255),
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,

        -- Índices para búsqueda rápida
        CONSTRAINT unique_date_log UNIQUE (date)
      );
    `);

    // Crear índices para optimizar consultas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_schedules_log_date
      ON daily_schedules_log(date);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_schedules_log_saved_at
      ON daily_schedules_log(saved_at);
    `);

    console.log('✅ Tabla daily_schedules_log creada exitosamente');

    // Migrar datos existentes de daily_schedules a daily_schedules_log
    console.log('🔄 Migrando datos existentes de daily_schedules...');

    await client.query(`
      INSERT INTO daily_schedules_log (date, assignments_data, programs, saved_at)
      SELECT date, assignments_data, programs_data, updated_at
      FROM daily_schedules
      WHERE assignments_data IS NOT NULL
      ON CONFLICT (date) DO NOTHING;
    `);

    const countResult = await client.query('SELECT COUNT(*) FROM daily_schedules_log');
    console.log(`✅ Migrados ${countResult.rows[0].count} registros históricos`);

    await client.query('COMMIT');

    console.log('🎉 Migración completada exitosamente');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración
migrate().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
