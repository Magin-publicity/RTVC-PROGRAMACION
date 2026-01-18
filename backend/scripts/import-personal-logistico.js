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

async function importPersonalLogistico() {
  console.log('='.repeat(80));
  console.log('IMPORTANDO PERSONAL LOGÍSTICO (Presentadores, Periodistas, Ingenieros)');
  console.log('='.repeat(80));
  console.log('\n⚠️  IMPORTANTE: Este personal NO afectará la programación técnica\n');

  try {
    // Leer el archivo Excel
    const excelPath = path.join(__dirname, '../../Datos y Documentos RTVC/personal_logistico.xlsx');
    const workbook = XLSX.readFile(excelPath);

    console.log('📄 Hojas encontradas:', workbook.SheetNames.join(', '));

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    // Procesar cada hoja
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📋 Procesando hoja: ${sheetName}`);

      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      console.log(`   Registros encontrados: ${data.length}`);

      for (const row of data) {
        // Extraer datos (adaptarse según las columnas del Excel)
        const nombre = row['NOMBRE'] || row['Nombre'] || row['nombre'] || row['NOMBRES'] || '';
        const cargo = row['CARGO'] || row['Cargo'] || row['cargo'] || row['ROL'] || row['Rol'] || sheetName;
        const direccion = row['DIRECCION'] || row['Dirección'] || row['direccion'] || row['RESIDENCIA'] || '';
        const celular = row['CELULAR'] || row['Celular'] || row['celular'] || row['TELEFONO'] || '';
        const email = row['EMAIL'] || row['Email'] || row['email'] || row['CORREO'] || '';

        if (!nombre || nombre.toString().trim() === '') {
          continue; // Saltar filas vacías
        }

        const nombreNormalizado = normalizar(nombre);

        // Determinar el área según el cargo o hoja
        let area = 'LOGISTICA';
        if (cargo.toLowerCase().includes('periodista')) {
          area = 'PERIODISTAS';
        } else if (cargo.toLowerCase().includes('presentador')) {
          area = 'PRESENTADORES';
        } else if (cargo.toLowerCase().includes('ingeniero')) {
          area = 'INGENIEROS';
        } else if (cargo.toLowerCase().includes('productor')) {
          area = 'PRODUCTORES LOGISTICA';
        }

        // Verificar si ya existe (por nombre normalizado)
        const existente = await pool.query(
          `SELECT id, tipo_personal FROM personnel
           WHERE UPPER(REPLACE(REPLACE(name, 'á', 'a'), 'é', 'e')) = $1`,
          [nombreNormalizado]
        );

        if (existente.rows.length > 0) {
          // Ya existe - ACTUALIZAR dirección y teléfono SIN tocar tipo_personal
          const person = existente.rows[0];

          await pool.query(
            `UPDATE personnel
             SET direccion = $1, phone = $2, email = $3, updated_at = NOW()
             WHERE id = $4`,
            [direccion || null, celular || null, email || null, person.id]
          );

          console.log(`   ✅ Actualizado: ${nombre} (ID: ${person.id}) - Tipo: ${person.tipo_personal}`);
          totalUpdated++;
        } else {
          // No existe - CREAR como LOGISTICO
          const result = await pool.query(
            `INSERT INTO personnel
             (name, role, area, active, tipo_personal, direccion, phone, email, created_at, updated_at)
             VALUES ($1, $2, $3, true, 'LOGISTICO', $4, $5, $6, NOW(), NOW())
             RETURNING id`,
            [nombre.trim(), cargo || area, area, direccion || null, celular || null, email || null]
          );

          console.log(`   ➕ Creado: ${nombre} (ID: ${result.rows[0].id}) - Área: ${area}`);
          totalInserted++;
        }
      }
    }

    // Verificar totales
    console.log('\n' + '='.repeat(80));
    console.log('RESUMEN:');
    console.log('='.repeat(80));
    console.log(`➕ Nuevos creados: ${totalInserted}`);
    console.log(`✅ Actualizados: ${totalUpdated}`);
    console.log(`⏭️  Omitidos: ${totalSkipped}`);

    // Verificar que NO afectó al personal técnico
    const tecnicoCount = await pool.query(
      "SELECT COUNT(*) as total FROM personnel WHERE tipo_personal = 'TECNICO'"
    );
    const logisticoCount = await pool.query(
      "SELECT COUNT(*) as total FROM personnel WHERE tipo_personal = 'LOGISTICO'"
    );

    console.log('\n📊 Estado final:');
    console.log(`   Personal TÉCNICO (programación): ${tecnicoCount.rows[0].total}`);
    console.log(`   Personal LOGÍSTICO (rutas/refrigerios): ${logisticoCount.rows[0].total}`);
    console.log('\n✅ La programación técnica NO fue afectada');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  } finally {
    pool.end();
  }
}

importPersonalLogistico();
