const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración de grupos de reportería...\n');

    const sqlPath = path.join(__dirname, '../database/migrations/create-reporteria-grupos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir por punto y coma y ejecutar cada statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('SELECT') && statement.includes('STRING_AGG')) {
        // Este es el query de verificación final
        const result = await pool.query(statement);
        console.log('\n📊 Verificación de grupos asignados:');
        console.table(result.rows);
      } else {
        await pool.query(statement);
      }
    }

    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
}

runMigration();
