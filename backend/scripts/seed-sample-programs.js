// Script para crear programas de ejemplo
const pool = require('../config/database');

async function seedSamplePrograms() {
  try {
    console.log('📺 Creando programas de ejemplo...\n');

    // Primero, verificar si hay estudios y masters
    const estudiosResult = await pool.query('SELECT id FROM estudios LIMIT 1');
    const mastersResult = await pool.query('SELECT id FROM masters LIMIT 1');

    const estudioId = estudiosResult.rows.length > 0 ? estudiosResult.rows[0].id : null;
    const masterId = mastersResult.rows.length > 0 ? mastersResult.rows[0].id : null;

    // Crear programas de ejemplo
    const programas = [
      {
        nombre: 'El Calentao',
        descripcion: 'Programa matinal de entretenimiento y noticias',
        horario_inicio: '05:00:00',
        horario_fin: '08:00:00',
        dias_semana: JSON.stringify(['lunes', 'martes', 'miércoles', 'jueves', 'viernes']),
        tipo: 'magazine'
      },
      {
        nombre: 'Noticiero CM&',
        descripcion: 'Noticiero del mediodía',
        horario_inicio: '12:00:00',
        horario_fin: '13:00:00',
        dias_semana: JSON.stringify(['lunes', 'martes', 'miércoles', 'jueves', 'viernes']),
        tipo: 'noticiero'
      },
      {
        nombre: 'Señal Colombia Noticias',
        descripcion: 'Noticiero de la tarde',
        horario_inicio: '18:00:00',
        horario_fin: '19:00:00',
        dias_semana: JSON.stringify(['lunes', 'martes', 'miércoles', 'jueves', 'viernes']),
        tipo: 'noticiero'
      },
      {
        nombre: 'Franja Especial',
        descripcion: 'Programación especial',
        horario_inicio: '14:00:00',
        horario_fin: '16:00:00',
        dias_semana: JSON.stringify(['lunes', 'martes', 'miércoles', 'jueves', 'viernes']),
        tipo: 'especial'
      }
    ];

    for (const programa of programas) {
      const result = await pool.query(`
        INSERT INTO programas
          (nombre, descripcion, id_estudio, id_master, horario_inicio, horario_fin, dias_semana, tipo, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo')
        RETURNING id, nombre
      `, [
        programa.nombre,
        programa.descripcion,
        estudioId,
        masterId,
        programa.horario_inicio,
        programa.horario_fin,
        programa.dias_semana,
        programa.tipo
      ]);

      console.log(`✅ Creado: ${result.rows[0].nombre} (ID: ${result.rows[0].id})`);
    }

    console.log('\n✅ Programas de ejemplo creados exitosamente');

    // Mostrar todos los programas
    const allPrograms = await pool.query('SELECT id, nombre, horario_inicio, horario_fin FROM programas ORDER BY horario_inicio');
    console.log('\n📋 Programas en el sistema:');
    allPrograms.rows.forEach(p => {
      console.log(`   ${p.id}. ${p.nombre} (${p.horario_inicio.slice(0, 5)} - ${p.horario_fin.slice(0, 5)})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedSamplePrograms();
