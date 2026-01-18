const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

async function checkPrograms() {
  const fecha = '2026-01-09';

  console.log('Programas activos para', fecha);
  console.log('='.repeat(70));

  const programs = await pool.query(`
    SELECT pa.*, p.nombre, e.nombre as estudio, m.nombre as master
    FROM program_assignments pa
    LEFT JOIN programas p ON pa.program_id = p.id
    LEFT JOIN estudios e ON pa.studio_id = e.id
    LEFT JOIN masters m ON pa.master_id = m.id
    WHERE pa.fecha = $1
    ORDER BY pa.hora_inicio
  `, [fecha]);

  console.log('Total programas:', programs.rows.length);
  programs.rows.forEach(r => {
    console.log(`  ${r.hora_inicio}-${r.hora_fin}: ${r.nombre} (Estudio: ${r.estudio || 'N/A'}, Master: ${r.master || 'N/A'})`);
  });

  pool.end();
}

checkPrograms().catch(console.error);
