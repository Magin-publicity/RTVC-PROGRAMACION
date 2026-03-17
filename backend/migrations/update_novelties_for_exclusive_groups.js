// backend/migrations/update_novelties_for_exclusive_groups.js
// Migración para agregar campos de rango de fechas y programa a la tabla novelties

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rtvc_scheduling',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando migración: Actualizar tabla novelties para grupos exclusivos...');

    await client.query('BEGIN');

    // Verificar si las columnas ya existen
    const checkColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'novelties'
      AND column_name IN ('start_date', 'end_date', 'program_id', 'program_name', 'exclusive_type')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);

    // Agregar start_date si no existe
    if (!existingColumns.includes('start_date')) {
      console.log('  ➕ Agregando campo start_date...');
      await client.query(`
        ALTER TABLE novelties
        ADD COLUMN start_date DATE
      `);
      // Copiar datos de date a start_date para registros existentes
      await client.query(`
        UPDATE novelties SET start_date = date WHERE start_date IS NULL
      `);
      console.log('  ✅ Campo start_date agregado');
    } else {
      console.log('  ⏭️  Campo start_date ya existe');
    }

    // Agregar end_date si no existe
    if (!existingColumns.includes('end_date')) {
      console.log('  ➕ Agregando campo end_date...');
      await client.query(`
        ALTER TABLE novelties
        ADD COLUMN end_date DATE
      `);
      // Copiar datos de date a end_date para registros existentes
      await client.query(`
        UPDATE novelties SET end_date = date WHERE end_date IS NULL
      `);
      console.log('  ✅ Campo end_date agregado');
    } else {
      console.log('  ⏭️  Campo end_date ya existe');
    }

    // Agregar program_id si no existe
    if (!existingColumns.includes('program_id')) {
      console.log('  ➕ Agregando campo program_id...');
      await client.query(`
        ALTER TABLE novelties
        ADD COLUMN program_id VARCHAR(100)
      `);
      console.log('  ✅ Campo program_id agregado');
    } else {
      console.log('  ⏭️  Campo program_id ya existe');
    }

    // Agregar program_name si no existe
    if (!existingColumns.includes('program_name')) {
      console.log('  ➕ Agregando campo program_name...');
      await client.query(`
        ALTER TABLE novelties
        ADD COLUMN program_name VARCHAR(255)
      `);
      console.log('  ✅ Campo program_name agregado');
    } else {
      console.log('  ⏭️  Campo program_name ya existe');
    }

    // Agregar exclusive_type si no existe
    if (!existingColumns.includes('exclusive_type')) {
      console.log('  ➕ Agregando campo exclusive_type...');
      await client.query(`
        ALTER TABLE novelties
        ADD COLUMN exclusive_type VARCHAR(50)
      `);
      console.log('  ✅ Campo exclusive_type agregado');
    } else {
      console.log('  ⏭️  Campo exclusive_type ya existe');
    }

    // Agregar comentarios a las columnas
    await client.query(`
      COMMENT ON COLUMN novelties.start_date IS 'Fecha de inicio de la novedad';
      COMMENT ON COLUMN novelties.end_date IS 'Fecha de fin de la novedad';
      COMMENT ON COLUMN novelties.program_id IS 'ID del programa exclusivo asociado';
      COMMENT ON COLUMN novelties.program_name IS 'Nombre del programa exclusivo';
      COMMENT ON COLUMN novelties.exclusive_type IS 'Tipo de grupo exclusivo (MOVIL, PUESTO_FIJO, MASTER)';
    `);

    // Crear índice para búsquedas por programa
    console.log('  ➕ Creando índice para program_id...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_novelties_program_id ON novelties(program_id)
    `);
    console.log('  ✅ Índice creado');

    await client.query('COMMIT');

    console.log('✅ Migración completada exitosamente');
    console.log('\nCampos agregados a la tabla novelties:');
    console.log('  - start_date (DATE)');
    console.log('  - end_date (DATE)');
    console.log('  - program_id (VARCHAR 100)');
    console.log('  - program_name (VARCHAR 255)');
    console.log('  - exclusive_type (VARCHAR 50)');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('\n✨ Proceso completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = migrate;
