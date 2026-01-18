// Script para agregar campos de contacto y contrato al personal
const pool = require('../config/database');

async function addPersonnelFields() {
  try {
    console.log('📝 Agregando campos de contacto y contrato a la tabla personnel...');

    await pool.query(`
      ALTER TABLE personnel
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS contract_start DATE,
      ADD COLUMN IF NOT EXISTS contract_end DATE,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50)
    `);

    console.log('✅ Campos agregados exitosamente:');
    console.log('   - email (correo electrónico)');
    console.log('   - contract_start (fecha de inicio de contrato)');
    console.log('   - contract_end (fecha de fin de contrato)');
    console.log('   - phone (teléfono o celular)');

    // Verificar la estructura de la tabla
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'personnel'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura actual de la tabla personnel:');
    result.rows.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al agregar campos:', error);
    process.exit(1);
  }
}

addPersonnelFields();
