const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

const newPersonnel = [
  // ARCHIVO
  {
    name: 'Kelly García Torres',
    area: 'ARCHIVO',
    phone: '321 4387841',
    email: 'Kgarcia1284@gmail.com',
    direccion: 'Diagonal 32 H sur #12K 05',
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'Marta Contreras',
    area: 'ARCHIVO',
    phone: '313 3243240',
    email: null,
    direccion: 'Kra 23 #46A-15 sur El Tunal',
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'Yuly Beatriz Fernández Rincón',
    area: 'ARCHIVO',
    phone: '317 6215680',
    email: 'fernandes.yuli@gmail.com',
    direccion: 'Calle 1h#32a-17 apto 301',
    tipo_personal: 'LOGISTICO'
  },
  // GRAFICADOR
  {
    name: 'Libardo Daza Garzón',
    area: 'GRAFICADOR',
    phone: '313 3181858',
    email: 'libdaz@gmail.com',
    direccion: '1H 38A 54',
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'Héctor Rojas',
    area: 'GRAFICADOR',
    phone: '301 7860213',
    email: null,
    direccion: null,
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'Jorge Ignacio Nárvaez',
    area: 'GRAFICADOR',
    phone: '319 4578647',
    email: 'nachonet70@gmail.com',
    direccion: 'cr98b # 69-49 s c105',
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'Stefanía Ramírez',
    area: 'GRAFICADOR',
    phone: '320 5106056',
    email: null,
    direccion: null,
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'Francisco Valencia',
    area: 'GRAFICADOR',
    phone: '316 8884375',
    email: null,
    direccion: null,
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'César Mesa',
    area: 'GRAFICADOR',
    phone: '318 8093595',
    email: null,
    direccion: null,
    tipo_personal: 'LOGISTICO'
  },
  {
    name: 'Carlos Alberto Quiroz Rubio',
    area: 'GRAFICADOR',
    phone: '310 3140584',
    email: 'carlosquiroz.r55@gmail.com',
    direccion: 'Calle 38 C Sur # 73 a 23',
    tipo_personal: 'LOGISTICO'
  }
];

async function addPersonnel() {
  try {
    console.log('👥 Agregando nuevo personal de Archivo y Graficador...\n');

    for (const person of newPersonnel) {
      // Verificar si ya existe
      const exists = await pool.query(
        'SELECT id FROM personnel WHERE name = $1 AND area = $2',
        [person.name, person.area]
      );

      if (exists.rows.length > 0) {
        console.log(`⚠️  Ya existe: ${person.name} (${person.area})`);
        continue;
      }

      // Obtener el siguiente sort_order para el área
      const sortResult = await pool.query(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM personnel WHERE area = $1',
        [person.area]
      );
      const sortOrder = sortResult.rows[0].next_order;

      // Insertar - role = area para personal logístico
      await pool.query(`
        INSERT INTO personnel (name, role, area, phone, email, direccion, tipo_personal, active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
      `, [person.name, person.area, person.area, person.phone, person.email, person.direccion, person.tipo_personal, sortOrder]);

      console.log(`✅ Agregado: ${person.name} (${person.area})`);
    }

    // Mostrar resumen
    const summary = await pool.query(`
      SELECT area, COUNT(*) as total
      FROM personnel
      WHERE area IN ('ARCHIVO', 'GRAFICADOR')
      GROUP BY area
      ORDER BY area
    `);

    console.log('\n📊 Resumen:');
    summary.rows.forEach(r => {
      console.log(`  ${r.area}: ${r.total} personas`);
    });

    pool.end();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
    pool.end();
    process.exit(1);
  }
}

addPersonnel();
