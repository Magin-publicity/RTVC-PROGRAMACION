const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function seedData() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar si ya hay datos
    const checkPersonnel = await client.query('SELECT COUNT(*) FROM personnel');
    if (parseInt(checkPersonnel.rows[0].count) > 0) {
      console.log('\n⚠️  Ya existen datos. Limpiando tablas...');
      await client.query('TRUNCATE TABLE novelties, schedules, personnel RESTART IDENTITY CASCADE');
    }

    // Insertar personal
    console.log('\n📝 Insertando personal...');
    const personnelResult = await client.query(`
      INSERT INTO personnel (name, area, role, email, phone, status) VALUES
      ('Juan Pérez', 'Producción', 'Director', 'juan.perez@rtvc.gov.co', '3001234567', 'active'),
      ('María García', 'Técnica', 'Técnico de Audio', 'maria.garcia@rtvc.gov.co', '3007654321', 'active'),
      ('Carlos López', 'Producción', 'Productor', 'carlos.lopez@rtvc.gov.co', '3009876543', 'active'),
      ('Ana Martínez', 'Cámaras', 'Camarógrafo', 'ana.martinez@rtvc.gov.co', '3005551234', 'active'),
      ('Pedro Rodríguez', 'Técnica', 'Técnico de Luces', 'pedro.rodriguez@rtvc.gov.co', '3005559876', 'active'),
      ('Laura Sánchez', 'Producción', 'Asistente', 'laura.sanchez@rtvc.gov.co', '3005554321', 'active'),
      ('Diego Torres', 'Cámaras', 'Camarógrafo', 'diego.torres@rtvc.gov.co', '3005558765', 'active'),
      ('Sofia Ramírez', 'Técnica', 'Técnico de Video', 'sofia.ramirez@rtvc.gov.co', '3005552468', 'active')
      RETURNING id, name;
    `);
    console.log(`✅ ${personnelResult.rowCount} personas insertadas`);
    personnelResult.rows.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));

    // Obtener IDs del personal para las novedades
    const ids = personnelResult.rows.map(r => r.id);

    // Insertar novedades
    console.log('\n📝 Insertando novedades...');
    const noveltyResult = await client.query(`
      INSERT INTO novelties (personnel_id, type, date, description, status) VALUES
      ($1, 'Ausencia', '2025-12-05', 'Permiso médico por cita odontológica', 'pending'),
      ($2, 'Cambio de Turno', '2025-12-04', 'Solicita cambio de turno con compañero', 'approved'),
      ($3, 'Incapacidad', '2025-12-03', 'Incapacidad médica por 3 días', 'pending'),
      ($4, 'Vacaciones', '2025-12-10', 'Vacaciones programadas del 10 al 15 de diciembre', 'approved'),
      ($5, 'Hora Extra', '2025-12-04', 'Horas extras trabajadas en producción especial', 'pending'),
      ($6, 'Ausencia', '2025-12-04', 'Cita médica familiar', 'approved'),
      ($7, 'Cambio de Turno', '2025-12-06', 'Solicitud de cambio por motivos personales', 'pending')
      RETURNING id, type, date;
    `, [ids[0], ids[1], ids[2], ids[3], ids[4], ids[5], ids[6]]);
    console.log(`✅ ${noveltyResult.rowCount} novedades insertadas`);
    noveltyResult.rows.forEach(n => console.log(`   - ${n.type} (${n.date})`));

    // Insertar horarios para hoy y los próximos días
    console.log('\n📝 Insertando horarios...');
    const today = new Date();
    const schedules = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      schedules.push([ids[0], dateStr, '06:00 - 14:00', 'Noticias Mañana', 'Estudio 1', 'Turno mañana']);
      schedules.push([ids[1], dateStr, '14:00 - 22:00', 'Noticias Tarde', 'Estudio 1', 'Turno tarde']);
      schedules.push([ids[2], dateStr, '06:00 - 14:00', 'Producción General', 'Estudio 2', 'Turno mañana']);
      schedules.push([ids[3], dateStr, '14:00 - 22:00', 'Entretenimiento', 'Estudio 2', 'Turno tarde']);
      schedules.push([ids[4], dateStr, '22:00 - 06:00', 'Noticias Noche', 'Estudio 1', 'Turno noche']);
      schedules.push([ids[5], dateStr, '06:00 - 14:00', 'Cultura', 'Estudio 3', 'Turno mañana']);
      schedules.push([ids[6], dateStr, '14:00 - 22:00', 'Deportes', 'Estudio 3', 'Turno tarde']);
      if (ids[7]) {
        schedules.push([ids[7], dateStr, '22:00 - 06:00', 'Programación Nocturna', 'Estudio 2', 'Turno noche']);
      }
    }
    
    let insertedCount = 0;
    for (const schedule of schedules) {
      try {
        await client.query(`
          INSERT INTO schedules (personnel_id, date, shift_time, program, location, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, schedule);
        insertedCount++;
      } catch (err) {
        // Ignorar duplicados
      }
    }
    console.log(`✅ ${insertedCount} horarios insertados`);

    console.log('\n🎉 Datos de prueba insertados exitosamente!');
    
    // Mostrar resumen
    const summary = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM personnel) as total_personnel,
        (SELECT COUNT(*) FROM novelties) as total_novelties,
        (SELECT COUNT(*) FROM schedules) as total_schedules
    `);
    console.log('\n📊 Resumen de datos:');
    console.log(`   - Personal: ${summary.rows[0].total_personnel}`);
    console.log(`   - Novedades: ${summary.rows[0].total_novelties}`);
    console.log(`   - Horarios: ${summary.rows[0].total_schedules}`);

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();
