const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432,
});

const editores = [
  { name: 'Alejandra Ruiz', direccion: 'CL40S 72H 43 Kennedy', phone: '3017830280' },
  { name: 'Alejandro Martínez', direccion: null, phone: null },
  { name: 'Alejandro Tiriat', direccion: null, phone: null },
  { name: 'Alex Perdomo', direccion: null, phone: null },
  { name: 'Alexandra Morales', direccion: 'Calle 8 sur # 25-215 Verde Oliva - La prosperidad Madrid Cundinamarca', phone: '311 2068343' },
  { name: 'Alfonso Ramírez', direccion: 'Carrera 94 # 22a 90', phone: '311 4990324' },
  { name: 'Alirio Chaparro', direccion: null, phone: null },
  { name: 'Álvaro González', direccion: 'Cr 109a 71b 16', phone: '3175429275' },
  { name: 'Andrés Cabrera', direccion: 'CL 48C SUR 11 17', phone: '301 5961417' },
  { name: 'Andrés Fraile', direccion: null, phone: null },
  { name: 'Andrés Vargas', direccion: null, phone: null },
  { name: 'Andrés Varón', direccion: null, phone: null },
  { name: 'Angélica Giraldo', direccion: null, phone: null },
  { name: 'Byron Quiñonez', direccion: null, phone: null },
  { name: 'Camilo Cely', direccion: null, phone: null },
  { name: 'Carlos Rubio', direccion: 'Calle 182 N° 10A 16', phone: '304 4445726' },
  { name: 'Carolina González', direccion: null, phone: null },
  { name: 'Claudia Vivas', direccion: null, phone: null },
  { name: 'Daniel Ramírez', direccion: null, phone: null },
  { name: 'Diego Pérez', direccion: 'Calle 50 # 80 D 82 sur', phone: '304 5943914' },
  { name: 'Diego Sanabria', direccion: 'CL 43 7 60 Chapinero', phone: '3208710258' },
  { name: 'Douglas Hurtado', direccion: 'Cr 31 #15-165 Soacha Ciudad Verde', phone: '3144412985' },
  { name: 'Edwin Salcedo', direccion: 'CL 12A # 71C-61 Alsacia', phone: '3004031232' },
  { name: 'Efraín Arismendi', direccion: null, phone: null },
  { name: 'Fabio Barbosa', direccion: null, phone: null },
  { name: 'Felipe Donoso', direccion: null, phone: null },
  { name: 'Geraldine Freneda', direccion: null, phone: null },
  { name: 'Guillermo Solarte', direccion: null, phone: null },
  { name: 'Gustavo Calderón', direccion: 'CR 69 12B 21 Kennedy', phone: '3214209941' },
  { name: 'Iván Cuervo', direccion: 'Cra 94 # 22a 90', phone: '3194760840' },
  { name: 'Jackeline Miranda', direccion: '67 No. 169 a - 65', phone: null },
  { name: 'Javier Tiriat', direccion: null, phone: null },
  { name: 'Jesús Sánchez', direccion: 'CL 5A 53F 30 Barrio San Rafael', phone: '3152218629' },
  { name: 'Johana Romero', direccion: 'Calle 137 N° 85-76', phone: '313 4897742' },
  { name: 'Leonardo Saldaña', direccion: null, phone: null },
  { name: 'Miguel Ángel Lozada', direccion: 'Calle 17c # 135-51', phone: '321 4469355' },
  { name: 'Nelson García', direccion: 'CR 37A 25 36 Teusaquillo', phone: '3208901010' },
  { name: 'Rafael Montes', direccion: 'Calle 19a. No 82-65', phone: '321 9097959' },
  { name: 'Ricardo Camargo', direccion: 'CRA 58C 152B 66', phone: '3123798400' },
  { name: 'Rosa María Rincón', direccion: 'Cl 6a bis 78c17 Kennedy', phone: '318 8022921' },
  { name: 'Sonia Marta', direccion: 'Tv. 78c #6D-27', phone: '3132510883' },
  { name: 'Stiven Rincón', direccion: 'Cr116c #64A - 11', phone: '319 3909975' },
  { name: 'Viviana Segura', direccion: 'Cr 67 57r 05 sur Madelena', phone: '311 8305094' },
  { name: 'Wilsner Vásquez', direccion: 'CR 67a 9a 46', phone: '3216952296' },
  { name: 'Yair Miranda', direccion: null, phone: null },
  { name: 'Yonathan Lugo', direccion: null, phone: null }
];

async function addEditores() {
  try {
    console.log('👥 Agregando Editores...\n');

    let added = 0;
    let skipped = 0;

    for (const editor of editores) {
      // Verificar si ya existe
      const exists = await pool.query(
        'SELECT id FROM personnel WHERE name = $1 AND area = $2',
        [editor.name, 'EDITOR']
      );

      if (exists.rows.length > 0) {
        console.log(`⚠️  Ya existe: ${editor.name}`);
        skipped++;
        continue;
      }

      // Obtener el siguiente sort_order
      const sortResult = await pool.query(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM personnel WHERE area = $1',
        ['EDITOR']
      );
      const sortOrder = sortResult.rows[0].next_order;

      // Insertar
      await pool.query(`
        INSERT INTO personnel (name, role, area, phone, direccion, tipo_personal, active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, true, $7)
      `, [editor.name, 'EDITOR', 'EDITOR', editor.phone, editor.direccion, 'LOGISTICO', sortOrder]);

      console.log(`✅ Agregado: ${editor.name}`);
      added++;
    }

    // Mostrar resumen
    const count = await pool.query(`
      SELECT COUNT(*) as total FROM personnel WHERE area = 'EDITOR'
    `);

    console.log('\n📊 Resumen:');
    console.log(`  Agregados: ${added}`);
    console.log(`  Ya existían: ${skipped}`);
    console.log(`  Total EDITORES en sistema: ${count.rows[0].total}`);

    pool.end();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
    pool.end();
    process.exit(1);
  }
}

addEditores();
