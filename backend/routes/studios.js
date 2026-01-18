const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET - Obtener todos los estudios
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;

    let query = 'SELECT * FROM estudios';
    let params = [];

    if (estado) {
      query += ' WHERE estado = $1';
      params.push(estado);
    }

    query += ' ORDER BY codigo ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener estudios:', error);
    res.status(500).json({ error: 'Error al obtener estudios' });
  }
});

// GET - Obtener un estudio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM estudios WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estudio:', error);
    res.status(500).json({ error: 'Error al obtener estudio' });
  }
});

// POST - Crear un nuevo estudio
router.post('/', async (req, res) => {
  try {
    const { nombre, codigo, descripcion, capacidad, estado } = req.body;

    // Validaciones
    if (!nombre || !codigo) {
      return res.status(400).json({ error: 'Nombre y código son requeridos' });
    }

    // Verificar que el código no exista
    const existingStudio = await pool.query('SELECT id FROM estudios WHERE codigo = $1', [codigo]);
    if (existingStudio.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un estudio con ese código' });
    }

    const result = await pool.query(
      `INSERT INTO estudios (nombre, codigo, descripcion, capacidad, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, codigo, descripcion || null, capacidad || null, estado || 'activo']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear estudio:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Ya existe un estudio con ese código' });
    } else {
      res.status(500).json({ error: 'Error al crear estudio' });
    }
  }
});

// PUT - Actualizar un estudio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, descripcion, capacidad, estado } = req.body;

    // Verificar que el estudio existe
    const existingStudio = await pool.query('SELECT id FROM estudios WHERE id = $1', [id]);
    if (existingStudio.rows.length === 0) {
      return res.status(404).json({ error: 'Estudio no encontrado' });
    }

    // Si se está cambiando el código, verificar que no exista otro con el mismo código
    if (codigo) {
      const duplicateCode = await pool.query(
        'SELECT id FROM estudios WHERE codigo = $1 AND id != $2',
        [codigo, id]
      );
      if (duplicateCode.rows.length > 0) {
        return res.status(409).json({ error: 'Ya existe otro estudio con ese código' });
      }
    }

    const result = await pool.query(
      `UPDATE estudios
       SET nombre = COALESCE($1, nombre),
           codigo = COALESCE($2, codigo),
           descripcion = COALESCE($3, descripcion),
           capacidad = COALESCE($4, capacidad),
           estado = COALESCE($5, estado),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [nombre, codigo, descripcion, capacidad, estado, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar estudio:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe un estudio con ese código' });
    } else {
      res.status(500).json({ error: 'Error al actualizar estudio' });
    }
  }
});

// DELETE - Eliminar un estudio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay programas asignados a este estudio
    const programsCheck = await pool.query(
      'SELECT COUNT(*) FROM programas WHERE id_estudio = $1',
      [id]
    );

    if (parseInt(programsCheck.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar el estudio porque tiene programas asignados'
      });
    }

    const result = await pool.query('DELETE FROM estudios WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudio no encontrado' });
    }

    res.json({ message: 'Estudio eliminado exitosamente', estudio: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar estudio:', error);
    res.status(500).json({ error: 'Error al eliminar estudio' });
  }
});

// GET - Obtener programas de un estudio
router.get('/:id/programas', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, e.nombre as estudio_nombre, m.nombre as master_nombre
       FROM programas p
       LEFT JOIN estudios e ON p.id_estudio = e.id
       LEFT JOIN masters m ON p.id_master = m.id
       WHERE p.id_estudio = $1
       ORDER BY p.horario_inicio ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener programas del estudio:', error);
    res.status(500).json({ error: 'Error al obtener programas del estudio' });
  }
});

// GET - Obtener disponibilidad de un estudio en una fecha
router.get('/:id/disponibilidad/:fecha', async (req, res) => {
  try {
    const { id, fecha } = req.params;

    // Obtener información del estudio
    const studioResult = await pool.query('SELECT * FROM estudios WHERE id = $1', [id]);
    if (studioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Estudio no encontrado' });
    }

    // Obtener asignaciones del día
    const assignmentsResult = await pool.query(
      `SELECT pa.*, pe.name as personal_nombre, pr.nombre as programa_nombre
       FROM personal_asignado pa
       LEFT JOIN personnel pe ON pa.id_personal = pe.id
       LEFT JOIN programas pr ON pa.id_programa = pr.id
       WHERE pa.id_estudio = $1 AND pa.fecha = $2
       ORDER BY pa.hora_inicio ASC`,
      [id, fecha]
    );

    res.json({
      estudio: studioResult.rows[0],
      asignaciones: assignmentsResult.rows
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

module.exports = router;
