const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

async function createRotationTables() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Crear tabla rotation_config
    await client.query(`
      CREATE TABLE IF NOT EXISTS rotation_config (
        id SERIAL PRIMARY KEY,
        current_week INTEGER DEFAULT 1,
        week_start_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla rotation_config creada');

    // Insertar configuración inicial
    await client.query(`
      INSERT INTO rotation_config (current_week, week_start_date)
      VALUES (1, '2025-12-01')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Configuración inicial insertada');

    // Crear tabla rotation_patterns
    await client.query(`
      CREATE TABLE IF NOT EXISTS rotation_patterns (
        id SERIAL PRIMARY KEY,
        week_number INTEGER NOT NULL,
        area VARCHAR(150) NOT NULL,
        shift_start TIME NOT NULL,
        shift_end TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla rotation_patterns creada');

    // Insertar patrones de rotación por área
    const patterns = [
      // Semana 1 - Producción
      [1, 'Producción', '06:00', '14:00'],
      [1, 'Producción', '14:00', '22:00'],
      [1, 'Producción', '22:00', '06:00'],
      
      // Semana 1 - Técnica
      [1, 'Técnica', '06:00', '14:00'],
      [1, 'Técnica', '14:00', '22:00'],
      [1, 'Técnica', '22:00', '06:00'],
      
      // Semana 1 - Cámaras
      [1, 'Cámaras', '06:00', '14:00'],
      [1, 'Cámaras', '14:00', '22:00'],
      
      // Semana 2 - Producción
      [2, 'Producción', '06:00', '14:00'],
      [2, 'Producción', '14:00', '22:00'],
      [2, 'Producción', '22:00', '06:00'],
      
      // Semana 2 - Técnica
      [2, 'Técnica', '06:00', '14:00'],
      [2, 'Técnica', '14:00', '22:00'],
      [2, 'Técnica', '22:00', '06:00'],
      
      // Semana 2 - Cámaras
      [2, 'Cámaras', '06:00', '14:00'],
      [2, 'Cámaras', '14:00', '22:00'],
      
      // Semana 3 - Producción
      [3, 'Producción', '06:00', '14:00'],
      [3, 'Producción', '14:00', '22:00'],
      [3, 'Producción', '22:00', '06:00'],
      
      // Semana 3 - Técnica
      [3, 'Técnica', '06:00', '14:00'],
      [3, 'Técnica', '14:00', '22:00'],
      [3, 'Técnica', '22:00', '06:00'],
      
      // Semana 3 - Cámaras
      [3, 'Cámaras', '06:00', '14:00'],
      [3, 'Cámaras', '14:00', '22:00'],
      
      // Semana 4 - Producción
      [4, 'Producción', '06:00', '14:00'],
      [4, 'Producción', '14:00', '22:00'],
      [4, 'Producción', '22:00', '06:00'],
      
      // Semana 4 - Técnica
      [4, 'Técnica', '06:00', '14:00'],
      [4, 'Técnica', '14:00', '22:00'],
      [4, 'Técnica', '22:00', '06:00'],
      
      // Semana 4 - Cámaras
      [4, 'Cámaras', '06:00', '14:00'],
      [4, 'Cámaras', '14:00', '22:00']
    ];

    for (const [week, area, start, end] of patterns) {
      await client.query(`
        INSERT INTO rotation_patterns (week_number, area, shift_start, shift_end)
        VALUES ($1, $2, $3, $4)
      `, [week, area, start, end]);
    }
    console.log(`✅ ${patterns.length} patrones de rotación insertados`);

    await client.end();
    console.log('\n🎉 Tablas de rotación creadas exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createRotationTables();
