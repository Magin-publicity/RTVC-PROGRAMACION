const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET - Obtener todos los masters
router.get('/', async (req, res) => {
  try {
    const { estado, tipo } = req.query;

    let query = 'SELECT * FROM masters WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (estado) {
      query += ` AND estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (tipo) {
      query += ` AND tipo = $${paramCount}`;
      params.push(tipo);
      paramCount++;
    }

    query += ' ORDER BY codigo ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener masters:', error);
    res.status(500).json({ error: 'Error al obtener masters' });
  }
});

// GET - Obtener un master por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM masters WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Master no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener master:', error);
    res.status(500).json({ error: 'Error al obtener master' });
  }
});

// POST - Crear un nuevo master
router.post('/', async (req, res) => {
  try {
    const { nombre, codigo, tipo, descripcion, estado } = req.body;

    // Validaciones
    if (!nombre || !codigo) {
      return res.status(400).json({ error: 'Nombre y código son requeridos' });
    }

    // Validar tipo si se proporciona
    const validTipos = ['master_principal', 'master_secundario', 'sala_edicion'];
    if (tipo && !validTipos.includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido. Debe ser: master_principal, master_secundario o sala_edicion'
      });
    }

    // Verificar que el código no exista
    const existingMaster = await pool.query('SELECT id FROM masters WHERE codigo = $1', [codigo]);
    if (existingMaster.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un master con ese código' });
    }

    const result = await pool.query(
      `INSERT INTO masters (nombre, codigo, tipo, descripcion, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, codigo, tipo || null, descripcion || null, estado || 'activo']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear master:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe un master con ese código' });
    } else {
      res.status(500).json({ error: 'Error al crear master' });
    }
  }
});

// PUT - Actualizar un master
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, tipo, descripcion, estado } = req.body;

    // Verificar que el master existe
    const existingMaster = await pool.query('SELECT id FROM masters WHERE id = $1', [id]);
    if (existingMaster.rows.length === 0) {
      return res.status(404).json({ error: 'Master no encontrado' });
    }

    // Validar tipo si se proporciona
    const validTipos = ['master_principal', 'master_secundario', 'sala_edicion'];
    if (tipo && !validTipos.includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido. Debe ser: master_principal, master_secundario o sala_edicion'
      });
    }

    // Si se está cambiando el código, verificar que no exista otro con el mismo código
    if (codigo) {
      const duplicateCode = await pool.query(
        'SELECT id FROM masters WHERE codigo = $1 AND id != $2',
        [codigo, id]
      );
      if (duplicateCode.rows.length > 0) {
        return res.status(409).json({ error: 'Ya existe otro master con ese código' });
      }
    }

    const result = await pool.query(
      `UPDATE masters
       SET nombre = COALESCE($1, nombre),
           codigo = COALESCE($2, codigo),
           tipo = COALESCE($3, tipo),
           descripcion = COALESCE($4, descripcion),
           estado = COALESCE($5, estado),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [nombre, codigo, tipo, descripcion, estado, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar master:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe un master con ese código' });
    } else {
      res.status(500).json({ error: 'Error al actualizar master' });
    }
  }
});

// DELETE - Eliminar un master
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay programas asignados a este master
    const programsCheck = await pool.query(
      'SELECT COUNT(*) FROM programas WHERE id_master = $1',
      [id]
    );

    if (parseInt(programsCheck.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar el master porque tiene programas asignados'
      });
    }

    const result = await pool.query('DELETE FROM masters WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Master no encontrado' });
    }

    res.json({ message: 'Master eliminado exitosamente', master: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar master:', error);
    res.status(500).json({ error: 'Error al eliminar master' });
  }
});

// GET - Obtener programas de un master
router.get('/:id/programas', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, e.nombre as estudio_nombre, m.nombre as master_nombre
       FROM programas p
       LEFT JOIN estudios e ON p.id_estudio = e.id
       LEFT JOIN masters m ON p.id_master = m.id
       WHERE p.id_master = $1
       ORDER BY p.horario_inicio ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener programas del master:', error);
    res.status(500).json({ error: 'Error al obtener programas del master' });
  }
});

// GET - Obtener disponibilidad de un master en una fecha
router.get('/:id/disponibilidad/:fecha', async (req, res) => {
  try {
    const { id, fecha } = req.params;

    // Obtener información del master
    const masterResult = await pool.query('SELECT * FROM masters WHERE id = $1', [id]);
    if (masterResult.rows.length === 0) {
      return res.status(404).json({ error: 'Master no encontrado' });
    }

    // Obtener asignaciones del día
    const assignmentsResult = await pool.query(
      `SELECT pa.*, pe.name as personal_nombre, pr.nombre as programa_nombre
       FROM personal_asignado pa
       LEFT JOIN personnel pe ON pa.id_personal = pe.id
       LEFT JOIN programas pr ON pa.id_programa = pr.id
       WHERE pa.id_master = $1 AND pa.fecha = $2
       ORDER BY pa.hora_inicio ASC`,
      [id, fecha]
    );

    res.json({
      master: masterResult.rows[0],
      asignaciones: assignmentsResult.rows
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

module.exports = router;
