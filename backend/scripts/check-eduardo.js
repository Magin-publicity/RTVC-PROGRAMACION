const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

pool.query("SELECT id, name, area, role FROM personnel WHERE name LIKE '%Eduardo%' ORDER BY id")
  .then(res => {
    console.log('Eduardos en la BD:');
    res.rows.forEach(r => {
      console.log(`ID: ${r.id}, Nombre: ${r.name}, Área: ${r.area}, Rol: ${r.role}`);
    });
    pool.end();
  });
