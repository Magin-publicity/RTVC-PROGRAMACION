// Script para copiar asignaciones de reportería entre días con rotación de grupos
const pool = require('../database/db');
const { getTurnoActual } = require('../utils/reporteriaRotation');

async function copiarAsignaciones(fechaOrigen, fechaDestino) {
  try {
    console.log(`\n📋 Copiando asignaciones de ${fechaOrigen} a ${fechaDestino}...`);

    // 1. Obtener todas las asignaciones del día origen
    const asignacionesOrigen = await pool.query(`
      SELECT e.*, p.grupo_reporteria, p.name, p.area
      FROM reporteria_espacios_salida e
      INNER JOIN personnel p ON e.personnel_id = p.id
      WHERE e.fecha = $1
        AND (e.hora_salida IS NOT NULL OR e.ubicacion IS NOT NULL)
      ORDER BY p.grupo_reporteria, p.name, e.numero_espacio
    `, [fechaOrigen]);

    console.log(`   📊 Encontradas ${asignacionesOrigen.rows.length} asignaciones en ${fechaOrigen}`);

    if (asignacionesOrigen.rows.length === 0) {
      console.log(`   ⚠️ No hay asignaciones para copiar`);
      return;
    }

    // 2. Para cada asignación, verificar si el empleado tiene el mismo turno en destino
    let copiadas = 0;
    let saltadas = 0;

    for (const asignacion of asignacionesOrigen.rows) {
      const turnoOrigen = getTurnoActual(asignacion.grupo_reporteria, fechaOrigen);
      const turnoDestino = getTurnoActual(asignacion.grupo_reporteria, fechaDestino);

      // Solo copiar si el empleado tiene el MISMO turno en ambos días
      if (turnoOrigen.turno === turnoDestino.turno) {
        // Buscar el espacio destino
        const espacioDestino = await pool.query(`
          SELECT id FROM reporteria_espacios_salida
          WHERE personnel_id = $1 AND fecha = $2 AND numero_espacio = $3
        `, [asignacion.personnel_id, fechaDestino, asignacion.numero_espacio]);

        if (espacioDestino.rows.length > 0) {
          // Copiar la asignación
          await pool.query(`
            UPDATE reporteria_espacios_salida
            SET hora_salida = $1,
                hora_llegada = $2,
                conductor = $3,
                periodista = $4,
                ubicacion = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
          `, [
            asignacion.hora_salida,
            asignacion.hora_llegada,
            asignacion.conductor,
            asignacion.periodista,
            asignacion.ubicacion,
            espacioDestino.rows[0].id
          ]);

          console.log(`   ✅ ${asignacion.name} (${turnoDestino.turno}) - Espacio ${asignacion.numero_espacio}: ${asignacion.ubicacion || asignacion.hora_salida}`);
          copiadas++;
        }
      } else {
        console.log(`   ⏭️ SALTADO ${asignacion.name}: ${turnoOrigen.turno} → ${turnoDestino.turno} (rotó de turno)`);
        saltadas++;
      }
    }

    console.log(`\n✅ Resumen:`);
    console.log(`   ${copiadas} asignaciones copiadas`);
    console.log(`   ${saltadas} asignaciones saltadas (por rotación de turno)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Uso: node copiar-asignaciones-reporteria.js FECHA_ORIGEN FECHA_DESTINO');
  console.log('Ejemplo: node copiar-asignaciones-reporteria.js 2025-12-21 2025-12-22');
  process.exit(1);
}

copiarAsignaciones(args[0], args[1]);
