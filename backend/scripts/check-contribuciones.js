// Script para verificar personal de CONTRIBUCIONES
const db = require('../config/database');

async function checkContribuciones() {
  try {
    console.log('Consultando personal de CONTRIBUCIONES...\n');

    const result = await db.query(
      `SELECT id, name, area, turno, current_shift, role
       FROM personnel
       WHERE area = 'CONTRIBUCIONES'
       ORDER BY name`
    );

    const personnel = result.rows || result;

    console.log(`Total: ${personnel.length} personas\n`);

    personnel.forEach(person => {
      console.log(`ID: ${person.id}`);
      console.log(`Nombre: ${person.name}`);
      console.log(`Área: ${person.area}`);
      console.log(`Rol: ${person.role || 'N/A'}`);
      console.log(`Turno: ${person.turno || 'N/A'}`);
      console.log(`Current Shift: ${person.current_shift || 'NULL'}`);
      console.log('---');
    });

    await db.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

checkContribuciones();
