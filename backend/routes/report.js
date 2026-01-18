// backend/routes/report.js
const express = require('express');
const router = express.Router();
const pool = require('../database/db');


// 📊 Obtener estadísticas simples de novedades
router.get('/statistics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT type, COUNT(*) AS total
      FROM novelties
      GROUP BY type
      ORDER BY total DESC
    `);

    const totalResult = await pool.query('SELECT COUNT(*) AS total FROM novelties');

    res.json({
      total_novelties: parseInt(totalResult.rows[0].total, 10),
      details: result.rows
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});


// 📅 Reporte detallado de programación con personal asignado
router.get('/schedule-summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        s.date,
        s.program,
        s.shift_time,
        s.location,
        s.notes,
        p.name AS personnel_name,
        p.area,
        p.role
      FROM schedules s
      INNER JOIN personnel p ON s.personnel_id = p.id
    `;

    const params = [];
    if (start_date && end_date) {
      query += ` WHERE s.date BETWEEN $1 AND $2`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY s.date DESC, s.shift_time ASC`;

    const result = await pool.query(query, params);

    res.json({
      total_records: result.rowCount,
      schedule: result.rows
    });
  } catch (error) {
    console.error('❌ Error al generar reporte detallado de programación:', error);
    res.status(500).json({ error: 'Error al generar reporte detallado de programación' });
  }
});


// ✅ Exportar rutas
module.exports = router;
