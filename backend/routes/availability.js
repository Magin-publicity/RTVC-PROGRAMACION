const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener disponibilidad de un empleado
router.get('/:personnelId', async (req, res) => {
  try {
    const { personnelId } = req.params;

    const result = await pool.query(
      'SELECT is_available, unavailability_reason, unavailability_start_date, unavailability_end_date, notes FROM personnel WHERE id = $1',
      [personnelId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

// Marcar empleado como no disponible
router.post('/:personnelId/unavailable', async (req, res) => {
  try {
    const { personnelId } = req.params;
    const { reason, start_date, end_date, notes } = req.body;

    // Actualizar personal
    await pool.query(
      `UPDATE personnel
       SET is_available = false,
           unavailability_reason = $1,
           unavailability_start_date = $2,
           unavailability_end_date = $3,
           notes = $4
       WHERE id = $5`,
      [reason, start_date, end_date, notes, personnelId]
    );

    // Guardar en historial
    await pool.query(
      `INSERT INTO availability_history (personnel_id, is_available, reason, start_date, end_date, notes)
       VALUES ($1, false, $2, $3, $4, $5)`,
      [personnelId, reason, start_date, end_date, notes]
    );

    res.json({ message: 'Empleado marcado como no disponible' });
  } catch (error) {
    console.error('Error marking unavailable:', error);
    res.status(500).json({ error: 'Error al marcar como no disponible' });
  }
});

// Marcar empleado como disponible
router.post('/:personnelId/available', async (req, res) => {
  try {
    const { personnelId } = req.params;

    // Actualizar personal
    await pool.query(
      `UPDATE personnel
       SET is_available = true,
           unavailability_reason = NULL,
           unavailability_start_date = NULL,
           unavailability_end_date = NULL,
           notes = NULL
       WHERE id = $1`,
      [personnelId]
    );

    // Guardar en historial
    await pool.query(
      `INSERT INTO availability_history (personnel_id, is_available, reason, start_date, end_date)
       VALUES ($1, true, 'Regreso a disponibilidad', CURRENT_DATE, CURRENT_DATE)`,
      [personnelId]
    );

    res.json({ message: 'Empleado marcado como disponible' });
  } catch (error) {
    console.error('Error marking available:', error);
    res.status(500).json({ error: 'Error al marcar como disponible' });
  }
});

// Obtener historial de disponibilidad
router.get('/:personnelId/history', async (req, res) => {
  try {
    const { personnelId } = req.params;

    const result = await pool.query(
      `SELECT * FROM availability_history
       WHERE personnel_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [personnelId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting availability history:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Obtener personal no disponible en una fecha específica
router.get('/unavailable/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(
      `SELECT id, name, area, unavailability_reason, unavailability_start_date, unavailability_end_date
       FROM personnel
       WHERE active = true
       AND is_available = false
       AND $1::date BETWEEN unavailability_start_date AND unavailability_end_date
       ORDER BY area, name`,
      [date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting unavailable personnel:', error);
    res.status(500).json({ error: 'Error al obtener personal no disponible' });
  }
});

module.exports = router;
