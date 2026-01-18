const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function testRoutesInitialization() {
  console.log('='.repeat(80));
  console.log('PRUEBA DE INICIALIZACIÓN DE RUTAS (FIXED VERSION)');
  console.log('='.repeat(80));

  try {
    const testDate = '2026-01-13';
    const shiftType = 'AM';
    const slotId = shiftType === 'AM' ? 1 : 8;

    console.log(`\n📅 Fecha: ${testDate}`);
    console.log(`⏰ Turno: ${shiftType} (Slot ${slotId})`);

    // Paso 1: Verificar que existe programación automatizada
    console.log('\n' + '─'.repeat(80));
    console.log('PASO 1: Verificar programación automatizada');
    console.log('─'.repeat(80));

    const scheduleResult = await pool.query(
      `SELECT assignments_data FROM daily_schedules WHERE date = $1`,
      [testDate]
    );

    if (scheduleResult.rows.length === 0) {
      console.log(`\n❌ ERROR: No hay programación automatizada para ${testDate}`);
      console.log('   Esto es lo que vería el usuario en la interfaz.');
      return;
    }

    console.log(`\n✅ Programación encontrada para ${testDate}`);

    const assignmentsData = scheduleResult.rows[0].assignments_data;

    // Paso 2: Extraer IDs del slot
    console.log('\n' + '─'.repeat(80));
    console.log('PASO 2: Extraer IDs de personal del slot correspondiente');
    console.log('─'.repeat(80));

    const personnelIds = [];
    Object.keys(assignmentsData).forEach(key => {
      const parts = key.split('_');
      if (parts.length === 2 && parseInt(parts[1]) === slotId) {
        personnelIds.push(parseInt(parts[0]));
      }
    });

    console.log(`\n✅ Encontrados ${personnelIds.length} IDs en slot ${slotId}`);
    console.log(`   IDs: ${personnelIds.slice(0, 10).join(', ')}${personnelIds.length > 10 ? '...' : ''}`);

    // Paso 3: Obtener personal técnico
    console.log('\n' + '─'.repeat(80));
    console.log('PASO 3: Obtener información de personal técnico');
    console.log('─'.repeat(80));

    const programmingResult = await pool.query(
      `SELECT id, name, role, area, tipo_personal, direccion, barrio, localidad
       FROM personnel
       WHERE id = ANY($1)
       AND tipo_personal = 'TECNICO'
       AND active = true
       ORDER BY name`,
      [personnelIds]
    );

    const technical = programmingResult.rows;

    console.log(`\n✅ Filtrados ${technical.length} personas técnicas activas`);
    console.log('\nPrimeras 10 personas:');
    technical.slice(0, 10).forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name.padEnd(30)} | ${p.area}`);
      if (p.direccion) {
        console.log(`      📍 ${p.direccion}`);
      } else {
        console.log(`      ⚠️  Sin dirección registrada`);
      }
    });

    // Paso 4: Simular inserción en daily_transport_assignments
    console.log('\n' + '─'.repeat(80));
    console.log('PASO 4: Análisis de datos a insertar');
    console.log('─'.repeat(80));

    let withAddress = 0;
    let withoutAddress = 0;

    technical.forEach(p => {
      if (p.direccion && p.direccion.trim() !== '') {
        withAddress++;
      } else {
        withoutAddress++;
      }
    });

    console.log(`\n✅ ${withAddress} personas tienen dirección registrada`);
    console.log(`⚠️  ${withoutAddress} personas NO tienen dirección registrada`);

    if (withoutAddress > 0) {
      console.log('\n📋 Personas sin dirección:');
      technical.filter(p => !p.direccion || p.direccion.trim() === '').forEach(p => {
        console.log(`   • ${p.name} (${p.area})`);
      });
    }

    // Resumen final
    console.log('\n' + '='.repeat(80));
    console.log('RESUMEN DE LA PRUEBA');
    console.log('='.repeat(80));

    console.log('\n✅ ÉXITO: La inicialización funcionaría correctamente');
    console.log(`\n📊 Estadísticas:`);
    console.log(`   • Fecha: ${testDate}`);
    console.log(`   • Turno: ${shiftType} (Slot ${slotId})`);
    console.log(`   • Personal en programación automatizada: ${personnelIds.length}`);
    console.log(`   • Personal técnico activo: ${technical.length}`);
    console.log(`   • Con dirección: ${withAddress}`);
    console.log(`   • Sin dirección: ${withoutAddress}`);

    console.log('\n💡 SIGUIENTE PASO:');
    console.log('   El usuario puede hacer clic en "Cargar personal" para el martes 13 de enero');
    console.log('   y el sistema creará automáticamente las asignaciones de transporte.');

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testRoutesInitialization();
