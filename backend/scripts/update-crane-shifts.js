// Script para actualizar turnos de Operadores de Grúa
const pool = require('../config/database');

async function updateCraneOperatorsShifts() {
  try {
    console.log('🔄 Actualizando turnos de Operadores de Grúa...\n');

    // GRUPO 1 (05:00 - 11:00): 1 operador
    await pool.query(`
      UPDATE personnel
      SET current_shift = '05:00'
      WHERE name = 'Carlos García'
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Grupo 1 actualizado: Carlos García → 05:00');

    // GRUPO 2 (09:00 - 15:00): 2 operadores
    await pool.query(`
      UPDATE personnel
      SET current_shift = '09:00'
      WHERE name IN ('John Loaiza', 'Luis Bernal')
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Grupo 2 actualizado: John Loaiza, Luis Bernal → 09:00');

    // GRUPO 3 (13:00 - 19:00): 2 operadores
    await pool.query(`
      UPDATE personnel
      SET current_shift = '13:00'
      WHERE name IN ('Raul Ramírez', 'Jefferson Pérez')
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Grupo 3 actualizado: Raul Ramírez, Jefferson Pérez → 13:00');

    // GRUPO 4 (16:00 - 22:00): 1 operador
    await pool.query(`
      UPDATE personnel
      SET current_shift = '16:00'
      WHERE name = 'Carlos López'
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Grupo 4 actualizado: Carlos López → 16:00');

    // Verificar resultados
    console.log('\n📊 Verificando cambios...\n');
    const result = await pool.query(`
      SELECT
        name,
        current_shift as turno,
        area
      FROM personnel
      WHERE name IN (
        'Carlos García',
        'John Loaiza',
        'Luis Bernal',
        'Raul Ramírez',
        'Jefferson Pérez',
        'Carlos López'
      )
      AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      ORDER BY current_shift, name
    `);

    console.log('Operadores de Grúa - Turnos actualizados:');
    console.table(result.rows);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando turnos:', error);
    process.exit(1);
  }
}

updateCraneOperatorsShifts();
