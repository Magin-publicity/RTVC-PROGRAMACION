// Script para establecer horarios de llamado para personal de CONTRIBUCIONES
const db = require('../config/database');

async function fixContribucionesShifts() {
  try {
    console.log('Actualizando horarios de CONTRIBUCIONES...\n');

    // Obtener todo el personal de CONTRIBUCIONES
    const result = await db.query(
      `SELECT id, name, turno
       FROM personnel
       WHERE area = 'CONTRIBUCIONES'`
    );

    const personnel = result.rows || result;

    console.log(`Encontrados ${personnel.length} personas en CONTRIBUCIONES\n`);

    // Actualizar el current_shift basado en su turno
    for (const person of personnel) {
      let callTime;

      // Asignar horario de llamado según el turno
      if (person.turno === 'mañana') {
        callTime = '13:00'; // Turno mañana entra a las 13:00
      } else if (person.turno === 'tarde') {
        callTime = '16:00'; // Turno tarde entra a las 16:00
      } else {
        callTime = '13:00'; // Por defecto 13:00
      }

      console.log(`Actualizando ${person.name}: turno=${person.turno} → current_shift=${callTime}`);

      await db.query(
        `UPDATE personnel
         SET current_shift = $1
         WHERE id = $2`,
        [callTime, person.id]
      );
    }

    console.log('\n✅ Actualización completada');

    // Verificar
    const verifyResult = await db.query(
      `SELECT name, turno, current_shift
       FROM personnel
       WHERE area = 'CONTRIBUCIONES'
       ORDER BY name`
    );

    const verified = verifyResult.rows || verifyResult;

    console.log('\n📋 Estado actualizado:');
    verified.forEach(person => {
      console.log(`  ${person.name}: ${person.turno} → ${person.current_shift}`);
    });

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

fixContribucionesShifts();
