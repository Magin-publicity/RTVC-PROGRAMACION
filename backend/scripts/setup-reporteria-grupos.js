const pool = require('../config/database');

async function setupGruposReporteria() {
  try {
    console.log('🔄 Configurando sistema de grupos de reportería...\n');

    // 1. Agregar columna grupo_reporteria
    console.log('1️⃣ Agregando columna grupo_reporteria...');
    await pool.query(`
      ALTER TABLE personnel ADD COLUMN IF NOT EXISTS grupo_reporteria VARCHAR(10)
    `);
    await pool.query(`
      COMMENT ON COLUMN personnel.grupo_reporteria IS 'Grupo fijo de reportería: GRUPO_A (08:00-13:00) o GRUPO_B (13:00-20:00)'
    `);

    // 2. Asignar GRUPO A - Camarógrafos (primeros 9)
    console.log('2️⃣ Asignando camarógrafos a GRUPO_A (08:00-13:00)...');
    const resultGrupoACamaras = await pool.query(`
      WITH camarografos_ordenados AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
        FROM personnel
        WHERE area = 'CAMARÓGRAFOS DE REPORTERÍA' AND active = true
      )
      UPDATE personnel
      SET grupo_reporteria = 'GRUPO_A',
          turno = 'MAÑANA'
      WHERE id IN (
        SELECT id FROM camarografos_ordenados WHERE rn <= 9
      )
      RETURNING id, name
    `);
    console.log(`   ✅ ${resultGrupoACamaras.rowCount} camarógrafos asignados a GRUPO_A`);

    // 3. Asignar GRUPO B - Camarógrafos (siguientes 9)
    console.log('3️⃣ Asignando camarógrafos a GRUPO_B (13:00-20:00)...');
    const resultGrupoBCamaras = await pool.query(`
      WITH camarografos_ordenados AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
        FROM personnel
        WHERE area = 'CAMARÓGRAFOS DE REPORTERÍA' AND active = true
      )
      UPDATE personnel
      SET grupo_reporteria = 'GRUPO_B',
          turno = 'TARDE'
      WHERE id IN (
        SELECT id FROM camarografos_ordenados WHERE rn > 9 AND rn <= 18
      )
      RETURNING id, name
    `);
    console.log(`   ✅ ${resultGrupoBCamaras.rowCount} camarógrafos asignados a GRUPO_B`);

    // 4. Asignar GRUPO A - Asistentes (primeros 4)
    console.log('4️⃣ Asignando asistentes a GRUPO_A (08:00-13:00)...');
    const resultGrupoAAsistentes = await pool.query(`
      WITH asistentes_ordenados AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
        FROM personnel
        WHERE area = 'ASISTENTES DE REPORTERÍA' AND active = true
      )
      UPDATE personnel
      SET grupo_reporteria = 'GRUPO_A',
          turno = 'MAÑANA'
      WHERE id IN (
        SELECT id FROM asistentes_ordenados WHERE rn <= 4
      )
      RETURNING id, name
    `);
    console.log(`   ✅ ${resultGrupoAAsistentes.rowCount} asistentes asignados a GRUPO_A`);

    // 5. Asignar GRUPO B - Asistentes (siguientes 4)
    console.log('5️⃣ Asignando asistentes a GRUPO_B (13:00-20:00)...');
    const resultGrupoBAsistentes = await pool.query(`
      WITH asistentes_ordenados AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
        FROM personnel
        WHERE area = 'ASISTENTES DE REPORTERÍA' AND active = true
      )
      UPDATE personnel
      SET grupo_reporteria = 'GRUPO_B',
          turno = 'TARDE'
      WHERE id IN (
        SELECT id FROM asistentes_ordenados WHERE rn > 4 AND rn <= 8
      )
      RETURNING id, name
    `);
    console.log(`   ✅ ${resultGrupoBAsistentes.rowCount} asistentes asignados a GRUPO_B`);

    // 6. Crear tabla de espacios de salida
    console.log('6️⃣ Creando tabla de espacios de salida predefinidos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reporteria_espacios_salida (
        id SERIAL PRIMARY KEY,
        personnel_id INTEGER REFERENCES personnel(id) ON DELETE CASCADE,
        numero_espacio INTEGER CHECK (numero_espacio IN (1, 2, 3)),
        fecha DATE NOT NULL,
        hora_salida TIME,
        hora_llegada TIME,
        conductor VARCHAR(255),
        periodista VARCHAR(255),
        ubicacion VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(personnel_id, fecha, numero_espacio)
      )
    `);

    await pool.query(`
      COMMENT ON TABLE reporteria_espacios_salida IS 'Espacios de salida predefinidos (3 por empleado por día) para evitar duplicados'
    `);
    await pool.query(`
      COMMENT ON COLUMN reporteria_espacios_salida.numero_espacio IS 'Número del espacio de salida: 1, 2 o 3'
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_espacios_fecha ON reporteria_espacios_salida(fecha)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_espacios_personnel ON reporteria_espacios_salida(personnel_id)
    `);

    console.log('   ✅ Tabla reporteria_espacios_salida creada');

    // 7. Verificar asignaciones
    console.log('\n7️⃣ Verificando asignaciones de grupos...\n');
    const verification = await pool.query(`
      SELECT
        area,
        grupo_reporteria,
        turno,
        COUNT(*) as cantidad
      FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
      GROUP BY area, grupo_reporteria, turno
      ORDER BY area, grupo_reporteria
    `);

    console.table(verification.rows);

    // Mostrar el personal asignado a cada grupo
    console.log('\n📋 GRUPO A (08:00-13:00):');
    const grupoA = await pool.query(`
      SELECT area, name
      FROM personnel
      WHERE grupo_reporteria = 'GRUPO_A'
        AND area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
      ORDER BY area, name
    `);
    grupoA.rows.forEach(p => console.log(`   ${p.area}: ${p.name}`));

    console.log('\n📋 GRUPO B (13:00-20:00):');
    const grupoB = await pool.query(`
      SELECT area, name
      FROM personnel
      WHERE grupo_reporteria = 'GRUPO_B'
        AND area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
      ORDER BY area, name
    `);
    grupoB.rows.forEach(p => console.log(`   ${p.area}: ${p.name}`));

    console.log('\n✅ Sistema de grupos de reportería configurado exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando grupos:', error);
    process.exit(1);
  }
}

setupGruposReporteria();
