const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function testInit() {
  try {
    const date = '2026-01-12';
    const shiftType = 'AM';

    console.log('🔍 Probando inicialización para:', date, shiftType);

    // 1. Obtener slot
    const slotResult = await pool.query(
      `SELECT slot_id FROM programming_slots WHERE shift_type = $1`,
      [shiftType]
    );

    if (slotResult.rows.length === 0) {
      console.log('❌ No se encontró slot para', shiftType);
      await pool.end();
      return;
    }

    const slotId = slotResult.rows[0].slot_id;
    console.log('✅ Slot ID:', slotId);

    // 2. Obtener programación
    const scheduleResult = await pool.query(
      `SELECT assignments_data FROM weekly_schedules WHERE date = $1`,
      [date]
    );

    if (scheduleResult.rows.length === 0) {
      console.log('❌ No hay programación para', date);
      console.log('   Posibles fechas disponibles:');
      const datesResult = await pool.query(
        `SELECT DISTINCT date FROM weekly_schedules ORDER BY date LIMIT 5`
      );
      datesResult.rows.forEach(row => console.log('   -', row.date));
      await pool.end();
      return;
    }

    console.log('✅ Programación encontrada');

    const assignmentsData = scheduleResult.rows[0].assignments_data;

    // 3. Extraer IDs
    const personnelIds = [];
    Object.keys(assignmentsData).forEach(key => {
      const parts = key.split('_');
      if (parts.length === 2 && parseInt(parts[1]) === slotId) {
        personnelIds.push(parseInt(parts[0]));
      }
    });

    console.log('✅ Personal encontrado:', personnelIds.length, 'personas');

    if (personnelIds.length === 0) {
      console.log('❌ No hay personal asignado al turno', shiftType);
      await pool.end();
      return;
    }

    // 4. Obtener personal técnico
    const programmingResult = await pool.query(
      `SELECT id, name, role, area, direccion, barrio, localidad, tipo_personal, active
       FROM personnel
       WHERE id = ANY($1)
       AND tipo_personal = 'TECNICO'
       AND active = true
       ORDER BY name`,
      [personnelIds]
    );

    console.log('✅ Personal técnico:', programmingResult.rows.length);
    console.log('\n📋 Primeros 5:');
    programmingResult.rows.slice(0, 5).forEach(p => {
      console.log(`   - ${p.name} (${p.role})`);
      console.log(`     Dirección: ${p.direccion || 'SIN DIRECCIÓN'}`);
    });

    // 5. Contar sin dirección
    const sinDireccion = programmingResult.rows.filter(p => !p.direccion || p.direccion.trim() === '');
    console.log('\n⚠️  Sin dirección:', sinDireccion.length);
    if (sinDireccion.length > 0) {
      sinDireccion.forEach(p => console.log(`   - ${p.name}`));
    }

    await pool.end();
    console.log('\n✅ Test completado exitosamente');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

testInit();
