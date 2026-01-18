const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function addData() {
  try {
    console.log('🔄 Agregando datos de estudios y masters...\n');

    // Limpiar datos existentes
    await pool.query('DELETE FROM estudios');
    await pool.query('DELETE FROM masters');

    // Insertar Estudios 1-4
    console.log('📺 Creando estudios...');
    await pool.query(`
      INSERT INTO estudios (nombre, codigo, descripcion, estado) VALUES
      ('Estudio 1', 'E1', 'Estudio principal', 'activo'),
      ('Estudio 2', 'E2', 'Estudio secundario', 'activo'),
      ('Estudio 3', 'E3', 'Estudio terciario', 'activo'),
      ('Estudio 4', 'E4', 'Estudio cuaternario', 'activo')
    `);

    // Insertar Masters 1-4 y Redacción
    console.log('🎛️  Creando masters...');
    await pool.query(`
      INSERT INTO masters (nombre, codigo, tipo, descripcion, estado) VALUES
      ('Master 1', 'M1', 'master_principal', 'Master principal 1', 'activo'),
      ('Master 2', 'M2', 'master_principal', 'Master principal 2', 'activo'),
      ('Master 3', 'M3', 'master_secundario', 'Master secundario 3', 'activo'),
      ('Master 4', 'M4', 'master_secundario', 'Master secundario 4', 'activo'),
      ('Redacción', 'RED', 'sala_edicion', 'Sala de redacción y edición', 'activo')
    `);

    console.log('\n✅ Datos agregados exitosamente!\n');

    // Verificar datos
    const estudiosResult = await pool.query('SELECT * FROM estudios ORDER BY codigo');
    const mastersResult = await pool.query('SELECT * FROM masters ORDER BY codigo');

    console.log('📋 Estudios creados:');
    estudiosResult.rows.forEach(e => {
      console.log(`   ✓ ${e.codigo} - ${e.nombre}`);
    });

    console.log('\n📋 Masters creados:');
    mastersResult.rows.forEach(m => {
      console.log(`   ✓ ${m.codigo} - ${m.nombre} (${m.tipo})`);
    });

  } catch (error) {
    console.error('❌ Error agregando datos:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

addData();
