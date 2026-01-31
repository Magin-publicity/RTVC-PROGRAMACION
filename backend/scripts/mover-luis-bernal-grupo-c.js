// backend/scripts/mover-luis-bernal-grupo-c.js
// Mover Luis Bernal del Grupo B al Grupo C
// Luis Bernal será el operador de grúa del Grupo C

const pool = require('../config/database');

async function moverLuisBernal() {
  try {
    console.log('🔄 MOVIENDO LUIS BERNAL AL GRUPO C\n');

    // Ver estado ANTES
    console.log('📊 Estado ANTES del cambio:');
    const antes = await pool.query(`
      SELECT name, grupo, current_shift
      FROM personnel
      WHERE name IN ('Luis Bernal', 'Jorge Jaramillo', 'Jefferson Pérez')
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      ORDER BY grupo, name
    `);
    console.table(antes.rows);

    // Mover Luis Bernal al Grupo C
    console.log('\n🔄 Ejecutando cambio...');
    await pool.query(`
      UPDATE personnel
      SET grupo = 'C'
      WHERE name = 'Luis Bernal'
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
    `);
    console.log('✅ Luis Bernal movido al Grupo C\n');

    // Ver estado DESPUÉS
    console.log('📊 Estado DESPUÉS del cambio:');
    const despues = await pool.query(`
      SELECT name, grupo, current_shift
      FROM personnel
      WHERE name IN ('Luis Bernal', 'Jorge Jaramillo', 'Jefferson Pérez')
        AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      ORDER BY grupo, name
    `);
    console.table(despues.rows);

    // Mostrar nuevos grupos B y C
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   🔵 GRUPO B - Nuevo líder: Carlos García 🏗️');
    console.log('═══════════════════════════════════════════════════════════\n');

    const grupoB = await pool.query(`
      SELECT name, current_shift
      FROM personnel
      WHERE grupo = 'B' AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      ORDER BY name
    `);

    grupoB.rows.forEach(r => {
      const esGrua = r.name === 'Carlos García';
      console.log(`${esGrua ? '🏗️ ' : '   '} ${r.name} (Turno: ${r.current_shift})`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   🟢 GRUPO C - Nuevo líder: Luis Bernal 🏗️');
    console.log('═══════════════════════════════════════════════════════════\n');

    const grupoC = await pool.query(`
      SELECT name, current_shift
      FROM personnel
      WHERE grupo = 'C' AND area = 'CAMARÓGRAFOS DE ESTUDIO'
      ORDER BY name
    `);

    grupoC.rows.forEach(r => {
      const esGrua = r.name === 'Luis Bernal' || r.name === 'Jefferson Pérez';
      console.log(`${esGrua ? '🏗️ ' : '   '} ${r.name} (Turno: ${r.current_shift})`);
    });

    console.log('\n✅ CAMBIO COMPLETADO EXITOSAMENTE\n');
    console.log('Resumen:');
    console.log('  • Luis Bernal: Grupo B → Grupo C (Operador de grúa)');
    console.log('  • Jorge Jaramillo: Se mantiene en Grupo B');
    console.log('  • Grupo B liderado por: Carlos García 🏗️');
    console.log('  • Grupo C liderado por: Luis Bernal 🏗️ y Jefferson Pérez 🏗️\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

moverLuisBernal();
