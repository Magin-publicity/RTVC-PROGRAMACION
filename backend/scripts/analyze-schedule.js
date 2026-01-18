const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function analyzeSchedule() {
  try {
    const date = '2026-01-12';

    console.log('📅 Analizando programación para:', date, '\n');

    // 1. Ver la estructura de daily_schedules
    const scheduleResult = await pool.query(
      `SELECT assignments_data FROM daily_schedules WHERE date = $1`,
      [date]
    );

    if (scheduleResult.rows.length === 0) {
      console.log('❌ No hay programación para esta fecha');
      await pool.end();
      return;
    }

    const assignmentsData = scheduleResult.rows[0].assignments_data;

    console.log('📊 assignments_data keys (primeros 20):');
    const keys = Object.keys(assignmentsData);
    console.log(`Total keys: ${keys.length}\n`);

    keys.slice(0, 20).forEach(key => {
      console.log(`  ${key} = ${assignmentsData[key]}`);
    });

    // 2. Contar por slot
    console.log('\n📈 Conteo por slot:');
    const slotCounts = {};
    keys.forEach(key => {
      const parts = key.split('_');
      if (parts.length === 2) {
        const slotId = parts[1];
        slotCounts[slotId] = (slotCounts[slotId] || 0) + 1;
      }
    });

    Object.keys(slotCounts).sort().forEach(slotId => {
      console.log(`  Slot ${slotId}: ${slotCounts[slotId]} personas`);
    });

    // 3. Extraer IDs del slot 1 (05:00)
    const slot1Ids = [];
    keys.forEach(key => {
      const parts = key.split('_');
      if (parts.length === 2 && parts[1] === '1') {
        slot1Ids.push(parseInt(parts[0]));
      }
    });

    console.log(`\n🔍 Personal en Slot 1 (05:00): ${slot1Ids.length} personas`);

    // 4. Consultar información del personal del slot 1
    const personnelResult = await pool.query(
      `SELECT id, name, role, area, tipo_personal
       FROM personnel
       WHERE id = ANY($1)
       ORDER BY name`,
      [slot1Ids]
    );

    console.log('\n👥 Desglose por tipo_personal:');
    const byType = {};
    personnelResult.rows.forEach(p => {
      byType[p.tipo_personal] = (byType[p.tipo_personal] || 0) + 1;
    });

    Object.keys(byType).forEach(tipo => {
      console.log(`  ${tipo}: ${byType[tipo]} personas`);
    });

    console.log('\n👥 Desglose por role:');
    const byRole = {};
    personnelResult.rows.forEach(p => {
      byRole[p.role] = (byRole[p.role] || 0) + 1;
    });

    Object.keys(byRole).forEach(role => {
      console.log(`  ${role}: ${byRole[role]} personas`);
    });

    // 5. Mostrar técnicos
    const tecnicos = personnelResult.rows.filter(p => p.tipo_personal === 'TECNICO');
    console.log(`\n🔧 Personal TECNICO (${tecnicos.length}):`);
    tecnicos.slice(0, 10).forEach(p => {
      console.log(`  - ${p.name} (${p.role})`);
    });
    if (tecnicos.length > 10) {
      console.log(`  ... y ${tecnicos.length - 10} más`);
    }

    // 6. Mostrar NO técnicos
    const noTecnicos = personnelResult.rows.filter(p => p.tipo_personal !== 'TECNICO');
    console.log(`\n📺 Personal NO TECNICO (${noTecnicos.length}):`);
    noTecnicos.forEach(p => {
      console.log(`  - ${p.name} (${p.tipo_personal} - ${p.role})`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

analyzeSchedule();
