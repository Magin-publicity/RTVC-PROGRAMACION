// backend/migrations/add_personnel_info_fields.js
// Migración para agregar campos fecha_nacimiento, arl, eps a la tabla personnel

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
    console.log('🔄 Iniciando migración: Agregar campos de información del personal...');

    await client.query('BEGIN');

    // Verificar si las columnas ya existen
    const checkColumns = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'personnel'
      AND column_name IN ('cedula', 'fecha_nacimiento', 'arl', 'eps')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);

    // Agregar cedula si no existe
    if (!existingColumns.includes('cedula')) {
      console.log('  ➕ Agregando campo cedula...');
      await client.query(`
        ALTER TABLE personnel
        ADD COLUMN cedula VARCHAR(50)
      `);
      console.log('  ✅ Campo cedula agregado');
    } else {
      console.log('  ⏭️  Campo cedula ya existe');
    }

    // Agregar fecha_nacimiento si no existe
    if (!existingColumns.includes('fecha_nacimiento')) {
      console.log('  ➕ Agregando campo fecha_nacimiento...');
      await client.query(`
        ALTER TABLE personnel
        ADD COLUMN fecha_nacimiento DATE
      `);
      console.log('  ✅ Campo fecha_nacimiento agregado');
    } else {
      console.log('  ⏭️  Campo fecha_nacimiento ya existe');
    }

    // Agregar arl si no existe
    if (!existingColumns.includes('arl')) {
      console.log('  ➕ Agregando campo arl...');
      await client.query(`
        ALTER TABLE personnel
        ADD COLUMN arl VARCHAR(255)
      `);
      console.log('  ✅ Campo arl agregado');
    } else {
      console.log('  ⏭️  Campo arl ya existe');
    }

    // Agregar eps si no existe
    if (!existingColumns.includes('eps')) {
      console.log('  ➕ Agregando campo eps...');
      await client.query(`
        ALTER TABLE personnel
        ADD COLUMN eps VARCHAR(255)
      `);
      console.log('  ✅ Campo eps agregado');
    } else {
      console.log('  ⏭️  Campo eps ya existe');
    }

    // Agregar comentarios a las columnas
    await client.query(`
      COMMENT ON COLUMN personnel.cedula IS 'Cédula o documento de identidad';
      COMMENT ON COLUMN personnel.fecha_nacimiento IS 'Fecha de nacimiento del personal';
      COMMENT ON COLUMN personnel.arl IS 'Aseguradora de Riesgos Laborales';
      COMMENT ON COLUMN personnel.eps IS 'Entidad Promotora de Salud';
    `);

    await client.query('COMMIT');

    console.log('✅ Migración completada exitosamente');
    console.log('\nCampos agregados a la tabla personnel:');
    console.log('  - cedula (VARCHAR 50)');
    console.log('  - fecha_nacimiento (DATE)');
    console.log('  - arl (VARCHAR 255)');
    console.log('  - eps (VARCHAR 255)');

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
