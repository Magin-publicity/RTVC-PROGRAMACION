const pool = require('../config/database');

async function migrateNovelties() {
  try {
    console.log('🔄 Iniciando migración de novedades con rango de fechas...');

    // Agregar columnas start_date y end_date
    await pool.query(`
      ALTER TABLE novelties
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS end_date DATE
    `);
    console.log('✅ Columnas start_date y end_date agregadas');

    // Migrar datos existentes
    await pool.query(`
      UPDATE novelties
      SET start_date = date, end_date = date
      WHERE start_date IS NULL
    `);
    console.log('✅ Datos existentes migrados');

    // Hacer start_date NOT NULL
    await pool.query(`
      ALTER TABLE novelties
      ALTER COLUMN start_date SET NOT NULL
    `);
    console.log('✅ start_date configurada como NOT NULL');

    // Agregar constraint para validar que end_date >= start_date
    await pool.query(`
      ALTER TABLE novelties
      DROP CONSTRAINT IF EXISTS chk_date_range
    `);

    await pool.query(`
      ALTER TABLE novelties
      ADD CONSTRAINT chk_date_range CHECK (end_date >= start_date)
    `);
    console.log('✅ Constraint de validación agregada');

    // Crear índice para mejor rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_novelties_date_range
      ON novelties(start_date, end_date)
    `);
    console.log('✅ Índice de fecha creado');

    console.log('\n🎉 Migración completada exitosamente!');
    console.log('\n📋 Ahora puedes crear novedades con rango de fechas:');
    console.log('   - start_date: fecha de inicio (ej. 2025-12-07)');
    console.log('   - end_date: fecha de fin (ej. 2025-12-14)');
    console.log('   - La novedad se aplicará a todos los días en ese rango\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

migrateNovelties();
