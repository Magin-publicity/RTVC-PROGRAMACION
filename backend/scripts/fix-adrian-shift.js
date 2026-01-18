// Script para corregir el turno de Adrián Contreras
const db = require('../config/database');

async function fixAdrianShift() {
  try {
    console.log('Buscando a Adrián Contreras...');

    // Primero ver todos los registros para debuguear
    const allResult = await db.query(`SELECT id, name FROM personnel LIMIT 10`);
    console.log('Tipo de resultado:', typeof allResult);
    console.log('Es array?:', Array.isArray(allResult));
    console.log('Resultado completo:', allResult);

    // Buscar a Adrián - ajustar según estructura
    const result = await db.query(
      `SELECT id, name, area, turno, current_shift
       FROM personnel
       WHERE name ILIKE '%adrian%'`
    );

    console.log('Resultado búsqueda Adrian:', result);
    const personnel = Array.isArray(result) ? result : (result.rows || result);

    console.log('Personnel procesado:', personnel);

    if (!personnel || personnel.length === 0) {
      console.log('❌ No se encontró a Adrián Contreras');
      await db.end();
      return;
    }

    console.log('✅ Encontrado:', personnel[0]);
    console.log('');
    console.log('Turno actual:', personnel[0].turno);
    console.log('Current shift actual:', personnel[0].current_shift);
    console.log('');

    // Actualizar current_shift a NULL o vacío
    console.log('Actualizando current_shift a NULL...');
    await db.query(
      `UPDATE personnel
       SET current_shift = NULL
       WHERE id = $1`,
      [personnel[0].id]
    );

    // Verificar actualización
    const updateResult = await db.query(
      `SELECT id, name, current_shift
       FROM personnel
       WHERE id = $1`,
      [personnel[0].id]
    );
    const updated = updateResult.rows || updateResult;

    console.log('✅ Actualizado exitosamente');
    console.log('Current shift nuevo:', updated[0].current_shift);

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

fixAdrianShift();
