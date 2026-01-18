const pool = require('../config/database');

async function checkPersonnelStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla personnel...\n');

    // Ver estructura de la tabla
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'personnel'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas de la tabla personnel:');
    console.table(structure.rows);

    // Ver un ejemplo de datos
    const sample = await pool.query('SELECT * FROM personnel LIMIT 3');
    console.log('\n📊 Ejemplo de datos (primeras 3 personas):');
    console.table(sample.rows);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPersonnelStructure();
