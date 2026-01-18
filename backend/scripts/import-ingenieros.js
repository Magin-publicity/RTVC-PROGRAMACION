const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

function normalizar(str) {
  if (!str) return '';
  return str.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

async function importIngenieros() {
  console.log('='.repeat(80));
  console.log('IMPORTANDO INGENIEROS');
  console.log('='.repeat(80));

  try {
    const excelPath = path.join(__dirname, '../../Datos y Documentos RTVC/personal_logistico.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets['Ingenieros '];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Total registros: ${data.length}\n`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of data) {
      const nombre = row['INGENIERÍA Y EMISIÓN'];
      const direccion = row['__EMPTY_1'];
      const celular = row['__EMPTY_2'];
      const cargo = row['__EMPTY_11'];
      const email = row['__EMPTY_5'];

      // Saltar encabezado o filas vacías
      if (!nombre || nombre === 'NOMBRE' || nombre.trim() === '') {
        skipped++;
        continue;
      }

      const nombreNormalizado = normalizar(nombre);

      // Determinar área según cargo
      let area = 'INGENIEROS';
      const cargoLower = (cargo || '').toLowerCase();
      if (cargoLower.includes('almacen') || cargoLower.includes('almacén')) {
        area = 'ALMACEN';
      } else if (cargoLower.includes('emisión') || cargoLower.includes('emision')) {
        area = 'INGENIEROS EMISION';
      } else if (cargoLower.includes('master')) {
        area = 'INGENIEROS MASTER';
      }

      // Verificar si existe
      const existente = await pool.query(
        `SELECT id, tipo_personal FROM personnel
         WHERE UPPER(REPLACE(REPLACE(REPLACE(name, 'á', 'a'), 'é', 'e'), 'í', 'i')) = $1`,
        [nombreNormalizado]
      );

      if (existente.rows.length > 0) {
        // Actualizar
        const person = existente.rows[0];
        await pool.query(
          `UPDATE personnel
           SET direccion = $1, phone = $2, email = $3, updated_at = NOW()
           WHERE id = $4`,
          [direccion || null, celular || null, email || null, person.id]
        );
        console.log(`✅ Actualizado: ${nombre} (ID: ${person.id})`);
        updated++;
      } else {
        // Crear nuevo
        const result = await pool.query(
          `INSERT INTO personnel
           (name, role, area, active, tipo_personal, direccion, phone, email, created_at, updated_at)
           VALUES ($1, $2, $3, true, 'LOGISTICO', $4, $5, $6, NOW(), NOW())
           RETURNING id`,
          [nombre.trim(), cargo || 'Ingeniero', area, direccion || null, celular || null, email || null]
        );
        console.log(`➕ Creado: ${nombre} (ID: ${result.rows[0].id}) - Área: ${area}`);
        inserted++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('RESUMEN:');
    console.log(`➕ Creados: ${inserted}`);
    console.log(`✅ Actualizados: ${updated}`);
    console.log(`⏭️  Omitidos: ${skipped}`);

    // Verificar total
    const total = await pool.query(
      "SELECT COUNT(*) as total FROM personnel WHERE tipo_personal = 'LOGISTICO'"
    );
    console.log(`\n📊 Total personal LOGÍSTICO: ${total.rows[0].total}`);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    pool.end();
  }
}

importIngenieros();
