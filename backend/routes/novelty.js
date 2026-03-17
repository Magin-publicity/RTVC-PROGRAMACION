// routes/novelty.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener todas las novedades
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        n.id,
        n.personnel_id,
        n.date,
        n.start_date,
        n.end_date,
        n.type,
        n.description,
        n.program_id,
        n.program_name,
        n.exclusive_type,
        p.name AS personnel_name,
        p.area,
        p.role
      FROM novelties n
      LEFT JOIN personnel p ON n.personnel_id = p.id
      ORDER BY COALESCE(n.start_date, n.date) DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener novedades:', error);
    res.status(500).json({ error: 'Error al obtener novedades' });
  }
});

// Obtener novedades de una fecha específica
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;

    console.log(`📅 Consultando novedades para ${date}...`);

    const result = await pool.query(`
      SELECT
        n.id,
        n.personnel_id,
        n.date,
        n.start_date,
        n.end_date,
        n.type AS novelty_type,
        n.type,
        n.description,
        n.program_id,
        n.program_name,
        n.exclusive_type,
        p.name AS personnel_name,
        p.area,
        p.role
      FROM novelties n
      LEFT JOIN personnel p ON n.personnel_id = p.id
      WHERE $1 BETWEEN COALESCE(n.start_date, n.date) AND COALESCE(n.end_date, n.date)
      ORDER BY p.name
    `, [date]);

    console.log(`   ✅ ${result.rows.length} novedades encontradas`);

    res.json({
      date,
      novelties: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error al obtener novedades por fecha:', error);
    res.status(500).json({ error: 'Error al obtener novedades por fecha' });
  }
});

// Obtener novedades por program_id
router.get('/program/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const result = await pool.query(`
      SELECT
        n.id,
        n.personnel_id,
        n.date,
        n.start_date,
        n.end_date,
        n.type,
        n.description,
        n.program_id,
        n.program_name,
        n.exclusive_type,
        p.name AS personnel_name,
        p.area,
        p.role
      FROM novelties n
      LEFT JOIN personnel p ON n.personnel_id = p.id
      WHERE n.program_id = $1
      ORDER BY p.name
    `, [programId]);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener novedades por programa:', error);
    res.status(500).json({ error: 'Error al obtener novedades por programa' });
  }
});

// Eliminar novedades por program_id
router.delete('/program/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const result = await pool.query('DELETE FROM novelties WHERE program_id = $1 RETURNING *', [programId]);
    res.json({
      message: `🗑️ ${result.rows.length} novedades eliminadas del programa`,
      deleted: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error al eliminar novedades por programa:', error);
    res.status(500).json({ error: 'Error al eliminar novedades por programa' });
  }
});

// Crear una nueva novedad
router.post('/', async (req, res) => {
  const { personnel_id, date, start_date, end_date, type, description, program_id, program_name, exclusive_type } = req.body;
  try {
    // Si se proporciona start_date y end_date, usarlos; si no, usar date para compatibilidad
    const useStartDate = start_date || date;
    const useEndDate = end_date || date || start_date;
    const useDate = date || start_date;

    if (!useStartDate) {
      return res.status(400).json({ error: 'Se requiere start_date o date' });
    }

    const result = await pool.query(
      'INSERT INTO novelties (personnel_id, date, start_date, end_date, type, description, program_id, program_name, exclusive_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [personnel_id, useDate, useStartDate, useEndDate, type, description, program_id || null, program_name || null, exclusive_type || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear novedad:', error);
    res.status(500).json({ error: 'Error al crear novedad' });
  }
});

// Actualizar novedad por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { personnel_id, date, start_date, end_date, type, description } = req.body;
  try {
    // Si se proporciona start_date y end_date, usarlos; si no, usar date para compatibilidad
    const useStartDate = start_date || date;
    const useEndDate = end_date || date || start_date;
    const useDate = date || start_date;

    if (!useStartDate) {
      return res.status(400).json({ error: 'Se requiere start_date o date' });
    }

    const result = await pool.query(
      `UPDATE novelties
       SET personnel_id = $1,
           date = $2,
           start_date = $3,
           end_date = $4,
           type = $5,
           description = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [personnel_id, useDate, useStartDate, useEndDate, type, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Novedad no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar novedad:', error);
    res.status(500).json({ error: 'Error al actualizar novedad' });
  }
});

// Eliminar novedad por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM novelties WHERE id = $1', [id]);
    res.json({ message: '🗑️ Novedad eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar novedad:', error);
    res.status(500).json({ error: 'Error al eliminar novedad' });
  }
});

module.exports = router;
