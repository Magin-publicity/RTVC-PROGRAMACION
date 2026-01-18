// Script para configurar rotación semanal de CONTRIBUCIONES
const db = require('../config/database');

async function fixContribucionesRotation() {
  try {
    console.log('Configurando rotación semanal para CONTRIBUCIONES...\n');

    // Obtener todo el personal de CONTRIBUCIONES
    const result = await db.query(
      `SELECT id, name, turno, current_shift
       FROM personnel
       WHERE area = 'CONTRIBUCIONES'`
    );

    const personnel = result.rows || result;

    console.log(`Encontrados ${personnel.length} personas en CONTRIBUCIONES\n`);

    // Limpiar turnos fijos - establecer current_shift a NULL
    for (const person of personnel) {
      console.log(`Limpiando turno fijo de ${person.name}`);
      console.log(`  Antes: turno="${person.turno}", current_shift="${person.current_shift}"`);

      await db.query(
        `UPDATE personnel
         SET current_shift = NULL,
             turno = NULL
         WHERE id = $1`,
        [person.id]
      );

      console.log(`  ✅ Actualizado: sin turno fijo\n`);
    }

    console.log('✅ Limpieza completada\n');

    // Verificar
    const verifyResult = await db.query(
      `SELECT name, turno, current_shift
       FROM personnel
       WHERE area = 'CONTRIBUCIONES'
       ORDER BY name`
    );

    const verified = verifyResult.rows || verifyResult;

    console.log('📋 Estado final:');
    verified.forEach(person => {
      console.log(`  ${person.name}:`);
      console.log(`    turno: ${person.turno || 'NULL'}`);
      console.log(`    current_shift: ${person.current_shift || 'NULL'}`);
    });

    console.log('\n📌 Configuración de rotación:');
    console.log('  Turno 1: 05:00 - 11:00');
    console.log('  Turno 2: 11:00 - 17:00');
    console.log('  Turno 3: 17:00 - 22:00');
    console.log('  Sistema: Rotación semanal (como el resto del personal)');

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

fixContribucionesRotation();
