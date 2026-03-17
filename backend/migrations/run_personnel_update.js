// Script para ejecutar la migración de actualización de personal desde Excel
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Iniciando migración de actualización de personal...\n');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'update_personnel_from_excel.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    // Ejecutar la migración
    console.log('Ejecutando SQL...');
    await client.query(sql);

    console.log('\n✅ Migración completada exitosamente!\n');

    // Verificar resultados
    const countResult = await client.query('SELECT COUNT(*) FROM personnel');
    console.log(`Total de personas en la base de datos: ${countResult.rows[0].count}`);

    // Verificar actualizaciones
    const updatedResult = await client.query(`
      SELECT name, cedula, phone, email, eps, arl
      FROM personnel
      WHERE id IN (8, 193, 258, 24, 30, 60, 72, 78)
      ORDER BY id
    `);

    console.log('\nPersonas actualizadas:');
    updatedResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.name}`);
      console.log(`   Cédula: ${row.cedula || 'N/A'}`);
      console.log(`   Teléfono: ${row.phone || 'N/A'}`);
      console.log(`   Email: ${row.email || 'N/A'}`);
      console.log(`   EPS: ${row.eps || 'N/A'}`);
      console.log(`   ARL: ${row.arl || 'N/A'}`);
      console.log('');
    });

    // Verificar algunas personas nuevas
    const newPeopleResult = await client.query(`
      SELECT name, cedula, role, area
      FROM personnel
      WHERE name IN (
        'William Eduardo Parra Jaimes',
        'Yanett Liliana Manzano Ojeda',
        'Claudia Emilia Bedoya Madrid'
      )
      ORDER BY name
    `);

    console.log('\nAlgunas personas nuevas agregadas:');
    newPeopleResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.name} - ${row.role} (${row.area})`);
    });

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración
runMigration()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
