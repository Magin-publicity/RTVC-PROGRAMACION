const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function decodeSlotMapping() {
  console.log('='.repeat(80));
  console.log('DECODIFICACIÓN DE SLOTS DE PROGRAMACIÓN');
  console.log('='.repeat(80));

  try {
    // Buscar tabla que mapea slots a horarios
    const slotTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND (
        table_name LIKE '%slot%' OR
        table_name LIKE '%time%' OR
        table_name LIKE '%horario%' OR
        table_name LIKE '%turno%'
      )
      ORDER BY table_name
    `);

    console.log('\n📋 Tablas relacionadas con slots/horarios:');
    slotTables.rows.forEach(t => {
      console.log(`  • ${t.table_name}`);
    });

    // Buscar en personnel si tiene información de slots/turnos
    console.log('\n\n🔍 ESTRUCTURA DE TABLA personnel:');
    console.log('─'.repeat(80));

    const personnelCols = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'personnel'
      ORDER BY ordinal_position
    `);

    console.log('\nColumnas relevantes:');
    personnelCols.rows.forEach(col => {
      console.log(`  • ${col.column_name.padEnd(30)} | ${col.data_type}`);
    });

    // Obtener algunos registros de personnel para entender la estructura
    const personnelSample = await pool.query(`
      SELECT id, name, tipo_personal, current_shift, area
      FROM personnel
      WHERE active = true
      LIMIT 10
    `);

    console.log('\n\n📊 MUESTRA DE PERSONAL:');
    console.log('─'.repeat(80));
    personnelSample.rows.forEach(p => {
      console.log(`ID ${p.id}: ${p.name} | ${p.tipo_personal} | Turno: ${p.current_shift} | Área: ${p.area}`);
    });

    // Buscar tablas de slots/horarios
    console.log('\n\n🔍 BUSCANDO CONFIGURACIÓN DE SLOTS:');
    console.log('─'.repeat(80));

    // Intentar encontrar tabla de turnos/horarios
    const possibleTables = ['turnos', 'time_slots', 'horarios', 'slots', 'rotation_patterns'];

    for (const tableName of possibleTables) {
      try {
        const result = await pool.query(`SELECT * FROM ${tableName} LIMIT 10`);
        if (result.rows.length > 0) {
          console.log(`\n✓ Tabla ${tableName} encontrada:`);
          result.rows.forEach(row => {
            console.log(`  ${JSON.stringify(row, null, 2)}`);
          });
        }
      } catch (e) {
        // Tabla no existe, continuar
      }
    }

    // Buscar en rotation_patterns
    console.log('\n\n📋 TABLA rotation_patterns:');
    console.log('─'.repeat(80));

    const rotationCols = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'rotation_patterns'
      ORDER BY ordinal_position
    `);

    console.log('\nColumnas:');
    rotationCols.rows.forEach(col => {
      console.log(`  • ${col.column_name.padEnd(30)} | ${col.data_type}`);
    });

    const rotationData = await pool.query(`SELECT * FROM rotation_patterns LIMIT 5`);
    console.log(`\nDatos (${rotationData.rows.length} filas):`);
    rotationData.rows.forEach(row => {
      console.log(`\n  ${JSON.stringify(row, null, 2)}`);
    });

    // Analizar el patrón de los datos
    console.log('\n\n💡 ANÁLISIS DEL PATRÓN:');
    console.log('─'.repeat(80));

    const testDate = '2026-01-13';
    const scheduleData = await pool.query(`
      SELECT assignments_data FROM daily_schedules WHERE date = $1
    `, [testDate]);

    if (scheduleData.rows.length > 0) {
      const assignments = scheduleData.rows[0].assignments_data;
      const keys = Object.keys(assignments);

      // Extraer slots únicos
      const slots = new Set();
      keys.forEach(key => {
        const parts = key.split('_');
        if (parts.length === 2) {
          slots.add(parts[1]);
        }
      });

      console.log('\n✓ Slots encontrados en assignments_data:');
      const sortedSlots = Array.from(slots).sort((a, b) => parseInt(a) - parseInt(b));
      sortedSlots.forEach(slot => {
        console.log(`  • Slot ${slot}`);
      });

      // Intentar deducir qué es cada slot
      console.log('\n\n🔍 DEDUCIENDO SIGNIFICADO DE SLOTS:');
      console.log('─'.repeat(80));

      // Si existe tabla de horarios, buscar mapeo
      try {
        const horariosResult = await pool.query(`
          SELECT * FROM rotation_patterns
          ORDER BY id
          LIMIT 20
        `);

        if (horariosResult.rows.length > 0) {
          console.log('\nPatrones de rotación encontrados:');
          horariosResult.rows.forEach(r => {
            console.log(`  ${JSON.stringify(r, null, 2)}`);
          });
        }
      } catch (e) {
        console.log('  No se pudo mapear slots a horarios');
      }

      // Analizar qué IDs de personal están en slot 1 (probablemente turno AM 05:00)
      console.log('\n\n🕐 PERSONAL EN SLOT 1 (probablemente AM 05:00):');
      console.log('─'.repeat(80));

      const slot1Assignments = keys.filter(k => k.endsWith('_1'));
      const personnelIds = slot1Assignments.map(k => parseInt(k.split('_')[0]));

      if (personnelIds.length > 0) {
        const personnel = await pool.query(`
          SELECT id, name, tipo_personal, current_shift, area
          FROM personnel
          WHERE id = ANY($1)
          AND tipo_personal = 'TECNICO'
          LIMIT 10
        `, [personnelIds]);

        console.log(`\nTotal en slot 1: ${personnelIds.length} personas`);
        console.log(`Personal técnico en slot 1 (primeros 10):\n`);
        personnel.rows.forEach(p => {
          console.log(`  • ${p.name.padEnd(30)} | ${p.area} | Current shift: ${p.current_shift}`);
        });
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

decodeSlotMapping();
