const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function insertSampleData() {
  try {
    await client.connect();
    console.log('Connected to database...');

    // Insert personnel
    console.log('\nInserting personnel...');
    const personnel = await client.query(`
      INSERT INTO personnel (name, area, role, email, phone, status)
      VALUES
        ('Luis Fajardo', 'PRODUCCIÓN', 'Productor de Emisión', 'luis.fajardo@rtvc.gov.co', '3001234567', 'active'),
        ('Rocio Ruiz', 'PRODUCCIÓN', 'Productor de Emisión', 'rocio.ruiz@rtvc.gov.co', '3007654321', 'active'),
        ('Marilú Durán', 'PRODUCCIÓN', 'Productor de Emisión', 'marilu.duran@rtvc.gov.co', '3009876543', 'active'),
        ('Laura Ávila', 'PRODUCCIÓN', 'Asistente de producción', 'laura.avila@rtvc.gov.co', '3005551234', 'active'),
        ('Isabella Rojas', 'PRODUCCIÓN', 'Asistente de producción', 'isabella.rojas@rtvc.gov.co', '3005555678', 'active'),
        ('Alejandro La Torre', 'DIRECTORES DE CÁMARA', 'Director de Cámaras', 'alejandro.latorre@rtvc.gov.co', '3006661234', 'active'),
        ('Eduardo Contreras', 'DIRECTORES DE CÁMARA', 'Director de Cámaras', 'eduardo.contreras@rtvc.gov.co', '3006665678', 'active'),
        ('David Córdoba', 'VTR', 'Operador de VTR', 'david.cordoba@rtvc.gov.co', '3007771234', 'active'),
        ('Alfredo Méndez', 'VTR', 'Operador de VTR', 'alfredo.mendez@rtvc.gov.co', '3007775678', 'active'),
        ('Sofía Fajardo', 'OPERADOR DE VMIX', 'Operador de Vmix', 'sofia.fajardo@rtvc.gov.co', '3008881234', 'active')
      RETURNING id, name
    `);
    console.log(`✅ Inserted ${personnel.rowCount} personnel`);

    // Insert sample novelties
    console.log('\nInserting novelties...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const novelties = await client.query(`
      INSERT INTO novelties (personnel_id, date, type, description, status)
      VALUES
        (1, $1, 'Permiso', 'Permiso médico por cita odontológica', 'pending'),
        (2, $1, 'Vacaciones', 'Vacaciones programadas del 5 al 10', 'approved'),
        (3, $2, 'Incapacidad', 'Incapacidad por gripe', 'approved'),
        (4, $1, 'Cambio de turno', 'Cambio de turno solicitado', 'pending'),
        (5, $2, 'Llegada tarde', 'Llegada tarde por tráfico', 'resolved')
      RETURNING id, type
    `, [todayStr, yesterdayStr]);
    console.log(`✅ Inserted ${novelties.rowCount} novelties`);

    // Insert sample schedules
    console.log('\nInserting schedules...');
    const schedules = await client.query(`
      INSERT INTO schedules (personnel_id, date, shift_time, program, location, notes)
      VALUES
        (1, $1, '08:00 AM - 04:00 PM', 'Noticias Mañana', 'Estudio 1', 'Producción principal'),
        (2, $1, '08:00 AM - 04:00 PM', 'Noticias Mañana', 'Estudio 1', 'Producción de respaldo'),
        (3, $1, '05:00 AM - 01:00 PM', 'Buenos Días', 'Estudio 2', 'Programa matutino'),
        (6, $1, '05:00 AM - 01:00 PM', 'Buenos Días', 'Estudio 2', 'Dirección de cámaras'),
        (8, $1, '08:00 AM - 04:00 PM', 'Noticias Mañana', 'Control VTR', 'Operación de VTR'),
        (10, $1, '05:00 AM - 01:00 PM', 'Buenos Días', 'Control Master', 'Operación Vmix')
      RETURNING id
    `, [todayStr]);
    console.log(`✅ Inserted ${schedules.rowCount} schedules`);

    // Verify
    const pCount = await client.query('SELECT COUNT(*) FROM personnel');
    const nCount = await client.query('SELECT COUNT(*) FROM novelties');
    const sCount = await client.query('SELECT COUNT(*) FROM schedules');

    console.log(`\n=== Database Summary ===`);
    console.log(`Personnel: ${pCount.rows[0].count}`);
    console.log(`Novelties: ${nCount.rows[0].count}`);
    console.log(`Schedules: ${sCount.rows[0].count}`);

    await client.end();
    console.log('\n🎉 Sample data inserted successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

insertSampleData();
